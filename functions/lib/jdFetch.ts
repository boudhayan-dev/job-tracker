import { assertSafeUrl } from './urlSafety'

const THIN_TEXT_THRESHOLD = 400
const STRIP_TAGS = ['script', 'style', 'nav', 'footer', 'header', 'svg', 'noscript']
const MAX_REDIRECTS = 5

class TextCollector {
  chunks: string[] = []
  text(text: { text: string }) {
    if (text.text.trim()) this.chunks.push(text.text)
  }
}

// Strips boilerplate and collects visible text via HTMLRewriter — no DOM/npm dependency needed.
// Follows redirects manually (rather than letting fetch() auto-follow) so each hop gets
// re-validated — a same-origin-looking URL could still redirect to an internal target.
async function fetchPlain(startUrl: URL): Promise<string> {
  let url = startUrl
  let res: Response | undefined
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    res = await fetch(url, {
      redirect: 'manual',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    })
    if (res.status < 300 || res.status >= 400 || !res.headers.get('location')) break
    url = assertSafeUrl(new URL(res.headers.get('location')!, url).toString())
  }
  if (!res || !res.ok) return ''
  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('html')) return ''

  const html = await res.text()
  const collector = new TextCollector()
  let rewriter = new HTMLRewriter()
  for (const tag of STRIP_TAGS) {
    rewriter = rewriter.on(tag, {
      element: (el) => {
        el.remove()
      },
    })
  }
  rewriter = rewriter.on('body *', collector)
  await rewriter.transform(new Response(html)).text()
  return collector.chunks.join(' ').replace(/\s+/g, ' ').trim()
}

async function fetchViaBrowserRendering(url: string, browser: BrowserRun): Promise<string> {
  const res = await browser.quickAction('markdown', { url })
  if (!res.ok) return ''
  const data = (await res.json()) as { success: boolean; result?: string }
  return data.success && data.result ? data.result : ''
}

export type JdFetchResult = { text: string; usedBrowserRendering: boolean }

// Plain fetch first (fast, free, works for most server-rendered postings). Falls back to
// Browser Rendering for JS-heavy pages or bot-walled sites (LinkedIn especially) — only
// when the BROWSER binding is configured, so this degrades gracefully in local dev.
//
// Validates the URL up front (scheme + not a private/loopback/link-local target — see
// urlSafety.ts) and re-validates every redirect hop in fetchPlain, so this can't be used as
// an SSRF primitive against internal network targets. Throws UnsafeUrlError for the caller
// to turn into a 400 — this is a rejection, not something to silently swallow.
export async function fetchJobDescription(url: string, browser: BrowserRun | undefined): Promise<JdFetchResult> {
  const safeUrl = assertSafeUrl(url)

  let text = ''
  try {
    text = await fetchPlain(safeUrl)
  } catch {
    text = ''
  }

  if (text.length >= THIN_TEXT_THRESHOLD) {
    return { text, usedBrowserRendering: false }
  }

  if (!browser) {
    return { text, usedBrowserRendering: false }
  }

  try {
    const rendered = await fetchViaBrowserRendering(safeUrl.toString(), browser)
    if (rendered.length > text.length) {
      return { text: rendered, usedBrowserRendering: true }
    }
  } catch {
    // fall through to whatever the plain fetch got, even if thin
  }

  return { text, usedBrowserRendering: false }
}
