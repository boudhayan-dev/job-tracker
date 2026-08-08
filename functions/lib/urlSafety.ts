// Blocks the JD-crawl fetch (and its Browser Rendering fallback) from being used as an SSRF
// primitive against internal/private network targets. Deliberately conservative: reject first,
// only allow public http(s) hosts through.

const BLOCKED_HOSTNAMES = new Set(['localhost', 'metadata.google.internal'])
const BLOCKED_HOSTNAME_SUFFIXES = ['.localhost', '.local', '.internal']

function isBlockedIpv4(host: string): boolean {
  const match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (!match) return false
  const [a, b] = [Number(match[1]), Number(match[2])]
  if ([a, b, Number(match[3]), Number(match[4])].some((n) => n > 255)) return true // malformed → reject

  if (a === 127) return true // loopback
  if (a === 10) return true // RFC1918
  if (a === 172 && b >= 16 && b <= 31) return true // RFC1918
  if (a === 192 && b === 168) return true // RFC1918
  if (a === 169 && b === 254) return true // link-local, incl. cloud metadata (169.254.169.254)
  if (a === 100 && b >= 64 && b <= 127) return true // carrier-grade NAT
  if (a === 0) return true // "this network"
  return false
}

function isBlockedIpv6(host: string): boolean {
  const h = host.replace(/^\[|\]$/g, '').toLowerCase()
  if (h === '::1') return true // loopback
  if (h === '::') return true
  if (/^fe[89ab][0-9a-f]:/.test(h)) return true // fe80::/10 link-local
  if (/^f[cd][0-9a-f]{2}:/.test(h)) return true // fc00::/7 unique local
  if (h.startsWith('::ffff:')) {
    const mapped = h.slice('::ffff:'.length)
    if (isBlockedIpv4(mapped)) return true
  }
  return false
}

export class UnsafeUrlError extends Error {}

// Throws UnsafeUrlError if the URL isn't a plain public http(s) target. Returns the parsed URL
// (use this, not the original string, to avoid re-parsing differently downstream).
export function assertSafeUrl(input: string): URL {
  let url: URL
  try {
    url = new URL(input)
  } catch {
    throw new UnsafeUrlError('Not a valid URL.')
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new UnsafeUrlError('Only http/https URLs are allowed.')
  }

  const hostname = url.hostname.toLowerCase()
  if (BLOCKED_HOSTNAMES.has(hostname) || BLOCKED_HOSTNAME_SUFFIXES.some((s) => hostname.endsWith(s))) {
    throw new UnsafeUrlError('That host is not allowed.')
  }
  if (isBlockedIpv4(hostname) || isBlockedIpv6(hostname)) {
    throw new UnsafeUrlError('That host is not allowed.')
  }

  return url
}
