import { parseJobDescription } from '../../lib/ai'
import { fetchJobDescription } from '../../lib/jdFetch'

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
    const result = await fetchJobDescription(body.url, env.BROWSER)
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

  const parsed = await parseJobDescription(env.AI, {
    rawText,
    hintCompany: body.company ?? '',
    hintRoleTitle: body.roleTitle ?? '',
    sourceUrl: body.source === 'url' ? body.url : undefined,
  })

  return Response.json({
    ...parsed,
    rawText,
    source: body.source,
    usedBrowserRendering,
  })
}
