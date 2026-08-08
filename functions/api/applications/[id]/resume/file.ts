import { getResumeForApplication } from '../../../../lib/db'

// Serves the resume PDF for both inline iframe viewing (ResumeViewer) and the download link.
// Iframe-embedded PDF viewers (Chrome's built-in PDF.js) need Content-Length up front and
// commonly issue Range requests for progressive rendering — without those, the file downloads
// fine (a plain fetch/save doesn't care) but renders blank inside an <iframe>, which is exactly
// what was happening before this handled Range requests and set Content-Length/Accept-Ranges.
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env, params, data } = context
  const applicationId = params.id as string
  const ownerEmail = data.userEmail as string

  const resume = await getResumeForApplication(env.DB, applicationId, ownerEmail)
  if (!resume) {
    return Response.json({ error: 'not found' }, { status: 404 })
  }

  const rangeHeader = request.headers.get('Range')
  const object = await env.RESUMES.get(resume.r2_object_key, rangeHeader ? { range: request.headers } : undefined)
  if (!object) {
    return Response.json({ error: 'file not found in storage' }, { status: 404 })
  }

  const headers = new Headers({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename="${resume.file_name}"`,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'private, max-age=3600',
    ETag: object.httpEtag,
  })

  // Only treat this as a partial response if the client actually asked for a range — local R2
  // dev emulation reports `object.range` covering the whole object even on unranged gets, which
  // would otherwise turn every plain request into an (harmless but semantically wrong) 206.
  if (rangeHeader && object.range) {
    const range = object.range
    const start = 'offset' in range && range.offset !== undefined ? range.offset : object.size - (range as { suffix: number }).suffix
    const length = 'length' in range && range.length !== undefined ? range.length : object.size - start
    headers.set('Content-Range', `bytes ${start}-${start + length - 1}/${object.size}`)
    headers.set('Content-Length', String(length))
    return new Response(object.body, { status: 206, headers })
  }

  headers.set('Content-Length', String(object.size))
  return new Response(object.body, { status: 200, headers })
}
