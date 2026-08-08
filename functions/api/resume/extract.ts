import { extractResumeFields } from '../../lib/ai'
import { extractPdfText } from '../../lib/pdf'

// Preview-only: extracts skills/work-experience from an uploaded PDF for the Track Job
// wizard's review step, before an application row exists to attach it to. Nothing is
// persisted here — R2/D1 writes happen later, at save time, via
// POST /api/applications/:id/resume, using whatever the user reviewed/edited from this result.
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return Response.json({ error: 'expected multipart/form-data with a "resume" file field' }, { status: 400 })
  }
  const file = formData.get('resume')
  if (!(file instanceof File)) {
    return Response.json({ error: 'resume file is required (multipart field "resume")' }, { status: 400 })
  }
  if (file.type !== 'application/pdf') {
    return Response.json({ error: 'resume must be a PDF' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const rawText = await extractPdfText(bytes)
  const { skills, workExperience } = await extractResumeFields(env.AI, rawText)

  return Response.json({ skills, workExperience })
}
