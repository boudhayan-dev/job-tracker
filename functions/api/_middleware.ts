// Validates the Cloudflare Access JWT on every /api/* request in deployed environments.
// Access sits in front of the whole Pages project and injects a signed JWT once the visitor
// has authenticated — this middleware just verifies that JWT before letting the request through.
// Locally (ACCESS_TEAM_DOMAIN/ACCESS_AUD unset) it's a no-op, since there's no Access gate on
// `wrangler pages dev`.

type AccessJwtHeader = { kid: string; alg: string }
type AccessJwtPayload = { aud: string[] | string; exp: number; email?: string }

let cachedJwks: { keys: JsonWebKey[]; fetchedAt: number } | null = null
const JWKS_TTL_MS = 60 * 60 * 1000

function base64UrlDecode(input: string): Uint8Array {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=')
  const binary = atob(padded)
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

function decodeJwtPart<T>(part: string): T {
  return JSON.parse(new TextDecoder().decode(base64UrlDecode(part))) as T
}

async function getJwks(teamDomain: string): Promise<JsonWebKey[]> {
  if (cachedJwks && Date.now() - cachedJwks.fetchedAt < JWKS_TTL_MS) {
    return cachedJwks.keys
  }
  const res = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`)
  if (!res.ok) throw new Error('Failed to fetch Access JWKS')
  const { keys } = (await res.json()) as { keys: JsonWebKey[] }
  cachedJwks = { keys, fetchedAt: Date.now() }
  return keys
}

// Returns the verified token's email on success, null on any failure — the caller turns a
// null into a 401 rather than this function throwing, so every failure mode (bad signature,
// expired, wrong audience, missing email claim) is handled uniformly.
async function verifyAccessJwt(token: string, teamDomain: string, aud: string): Promise<string | null> {
  const [headerPart, payloadPart, signaturePart] = token.split('.')
  if (!headerPart || !payloadPart || !signaturePart) return null

  const header = decodeJwtPart<AccessJwtHeader>(headerPart)
  const payload = decodeJwtPart<AccessJwtPayload>(payloadPart)

  if (payload.exp * 1000 < Date.now()) return null
  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud]
  if (!audiences.includes(aud)) return null
  if (!payload.email) return null

  const keys = await getJwks(teamDomain)
  const jwk = keys.find((k) => (k as JsonWebKey & { kid?: string }).kid === header.kid)
  if (!jwk) return null

  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  )

  const signedData = new TextEncoder().encode(`${headerPart}.${payloadPart}`)
  const signature = base64UrlDecode(signaturePart)
  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', cryptoKey, signature, signedData)
  return valid ? payload.email : null
}

// No Access gate locally (ACCESS_TEAM_DOMAIN/ACCESS_AUD unset) — every application row still
// needs an owner_email, so local dev is treated as a single fixed "user".
const LOCAL_DEV_EMAIL = 'local-dev@localhost'

// Every response from here carries per-user data (or an auth decision that could change the
// next second, e.g. right after logout) — none of it may be cached by the browser's plain HTTP
// cache. Without this, a fetch() issued by already-running client JS can silently replay a
// stale cached response after logout, since a hard reload only reliably busts cache for the
// page's own initial resources, not for later dynamic fetch() calls. Only sets the header when
// the handler hasn't already set its own (the resume file route intentionally allows short-lived
// private caching for PDF viewing performance).
async function withNoStoreDefault(response: Response): Promise<Response> {
  if (response.headers.has('Cache-Control')) return response
  const headers = new Headers(response.headers)
  headers.set('Cache-Control', 'no-store')
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, next, data } = context
  const teamDomain = env.ACCESS_TEAM_DOMAIN
  const aud = env.ACCESS_AUD

  if (!teamDomain || !aud) {
    data.userEmail = LOCAL_DEV_EMAIL
    return withNoStoreDefault(await next())
  }

  const token =
    request.headers.get('Cf-Access-Jwt-Assertion') ??
    request.headers
      .get('Cookie')
      ?.split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('CF_Authorization='))
      ?.slice('CF_Authorization='.length)

  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
  }

  try {
    const email = await verifyAccessJwt(token, teamDomain, aud)
    if (!email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
    }
    data.userEmail = email
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
  }

  return withNoStoreDefault(await next())
}
