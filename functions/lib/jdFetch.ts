const THIN_TEXT_THRESHOLD = 400
const STRIP_TAGS = ['script', 'style', 'nav', 'footer', 'header', 'svg', 'noscript']

class TextCollector {
  chunks: string[] = []
  text(text: { text: string }) {
    if (text.text.trim()) this.chunks.push(text.text)
  }
}

// Strips boilerplate and collects visible text via HTMLRewriter — no DOM/npm dependency needed.
async function fetchPlain(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
    },
  })
  if (!res.ok) return ''
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
export async function fetchJobDescription(url: string, browser: BrowserRun | undefined): Promise<JdFetchResult> {
  let text = ''
  try {
    text = await fetchPlain(url)
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
    const rendered = await fetchViaBrowserRendering(url, browser)
    if (rendered.length > text.length) {
      return { text: rendered, usedBrowserRendering: true }
    }
  } catch {
    // fall through to whatever the plain fetch got, even if thin
  }

  return { text, usedBrowserRendering: false }
}
