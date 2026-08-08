import { AiJsonParseError, parseJobDescription } from '../../lib/ai'
import { fetchJobDescription } from '../../lib/jdFetch'
import { UnsafeUrlError } from '../../lib/urlSafety'

type RequestBody = {
  source: 'url' | 'paste'
  url?: string
  jdText?: string
  company?: string
  roleTitle?: string
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context
  const body = (await request.json()) as RequestBody

  if (body.source !== 'url' && body.source !== 'paste') {
    return Response.json({ error: 'source must be "url" or "paste"' }, { status: 400 })
  }
  if (body.source === 'url' && !body.url) {
    return Response.json({ error: 'url is required when source is "url"' }, { status: 400 })
  }
  if (body.source === 'paste' && !body.jdText) {
    return Response.json({ error: 'jdText is required when source is "paste"' }, { status: 400 })
  }

  let rawText = ''
  let usedBrowserRendering = false

  if (body.source === 'url' && body.url) {
    let result: Awaited<ReturnType<typeof fetchJobDescription>>
    try {
      result = await fetchJobDescription(body.url, env.BROWSER)
    } catch (e) {
      if (e instanceof UnsafeUrlError) {
        return Response.json({ error: e.message }, { status: 400 })
      }
      throw e
    }
    rawText = result.text
    usedBrowserRendering = result.usedBrowserRendering

    if (!rawText) {
      return Response.json(
        {
          error: 'Could not extract content from that URL. Try pasting the job description text instead.',
        },
        { status: 422 },
      )
    }
  } else {
    rawText = body.jdText ?? ''
  }

  let parsed: Awaited<ReturnType<typeof parseJobDescription>>
  try {
    parsed = await parseJobDescription(env.AI, {
      rawText,
      hintCompany: body.company ?? '',
      hintRoleTitle: body.roleTitle ?? '',
      sourceUrl: body.source === 'url' ? body.url : undefined,
    })
  } catch (e) {
    if (e instanceof AiJsonParseError) {
      return Response.json(
        {
          error:
            body.source === 'url'
              ? "Couldn't parse a job description from that page — it may require login or block automated access. Try pasting the job description text instead."
              : "Couldn't parse a job description from that text. Try double-checking it's the full job description.",
        },
        { status: 422 },
      )
    }
    throw e
  }

  return Response.json({
    ...parsed,
    rawText,
    source: body.source,
    usedBrowserRendering,
  })
}
