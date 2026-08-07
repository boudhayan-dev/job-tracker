export type Identity = {
  name: string | null
  email: string | null
  photoUrl: string | null
}

// Cloudflare Access exposes the logged-in user at this same-origin endpoint once the app
// sits behind an Access application (see ARCHITECTURE.md). It 404s locally / when there's
// no Access gate in front — that's expected and handled as "no identity" below.
//
// CAVEAT: Access reliably returns `email` and, if the "Name" claim is enabled on the Access
// policy, `name`. A profile photo is NOT a standard Access field — Google's `picture` OIDC
// claim only shows up here if the Access application is explicitly configured to pass
// custom IdP claims through. We read a few plausible field names defensively, but until
// there's a real deployed Access app to inspect, treat the photo as "best effort" — the
// initials fallback in TopAppBar is the one guaranteed to always work.
type AccessIdentityResponse = {
  name?: string
  email?: string
  picture?: string
  avatar?: string
  photo?: string
  idp?: { id?: string; type?: string }
  custom?: Record<string, unknown>
}

let cached: Promise<Identity> | null = null

function extractPhotoUrl(data: AccessIdentityResponse): string | null {
  if (typeof data.picture === 'string') return data.picture
  if (typeof data.avatar === 'string') return data.avatar
  if (typeof data.photo === 'string') return data.photo
  const custom = data.custom
  if (custom && typeof custom.picture === 'string') return custom.picture
  return null
}

export function getIdentity(): Promise<Identity> {
  if (!cached) {
    cached = fetch('/cdn-cgi/access/get-identity', { credentials: 'include' })
      .then((res) => (res.ok ? (res.json() as Promise<AccessIdentityResponse>) : null))
      .then((data) =>
        data
          ? { name: data.name ?? null, email: data.email ?? null, photoUrl: extractPhotoUrl(data) }
          : { name: null, email: null, photoUrl: null },
      )
      .catch(() => ({ name: null, email: null, photoUrl: null }))
  }
  return cached
}
