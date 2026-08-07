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

async function verifyAccessJwt(token: string, teamDomain: string, aud: string): Promise<boolean> {
  const [headerPart, payloadPart, signaturePart] = token.split('.')
  if (!headerPart || !payloadPart || !signaturePart) return false

  const header = decodeJwtPart<AccessJwtHeader>(headerPart)
  const payload = decodeJwtPart<AccessJwtPayload>(payloadPart)

  if (payload.exp * 1000 < Date.now()) return false
  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud]
  if (!audiences.includes(aud)) return false

  const keys = await getJwks(teamDomain)
  const jwk = keys.find((k) => (k as JsonWebKey & { kid?: string }).kid === header.kid)
  if (!jwk) return false

  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  )

  const signedData = new TextEncoder().encode(`${headerPart}.${payloadPart}`)
  const signature = base64UrlDecode(signaturePart)
  return crypto.subtle.verify('RSASSA-PKCS1-v1_5', cryptoKey, signature, signedData)
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, next } = context
  const teamDomain = env.ACCESS_TEAM_DOMAIN
  const aud = env.ACCESS_AUD

  if (!teamDomain || !aud) {
    return next()
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
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const valid = await verifyAccessJwt(token, teamDomain, aud)
    if (!valid) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return next()
}
