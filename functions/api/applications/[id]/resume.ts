import { extractResumeFields, generateNudges, sanitizeWorkExperience } from '../../../lib/ai'
import { getApplication, newId } from '../../../lib/db'
import { extractPdfText } from '../../../lib/pdf'

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context
  const applicationId = params.id as string

  const application = await getApplication(env.DB, applicationId)
  if (!application) {
    return Response.json({ error: 'not found' }, { status: 404 })
  }

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
  const r2Key = `resumes/${applicationId}/${newId()}-${file.name}`
  await env.RESUMES.put(r2Key, bytes, { httpMetadata: { contentType: 'application/pdf' } })

  const rawText = await extractPdfText(bytes)

  // The Track Job wizard extracts via /api/resume/extract up front and lets the user review/
  // edit the result before saving — when those (possibly edited) fields are submitted here, we
  // persist them as-is rather than silently re-running extraction and discarding the edits.
  // Falls back to extracting fresh only if the client didn't send reviewed fields.
  const skillsRaw = formData.get('skills')
  const workExperienceRaw = formData.get('workExperience')
  let skills: string[]
  let workExperience: ReturnType<typeof sanitizeWorkExperience>
  if (typeof skillsRaw === 'string' && typeof workExperienceRaw === 'string') {
    skills = (JSON.parse(skillsRaw) as unknown[]).filter((s): s is string => typeof s === 'string')
    workExperience = sanitizeWorkExperience(JSON.parse(workExperienceRaw))
  } else {
    const extracted = await extractResumeFields(env.AI, rawText)
    skills = extracted.skills
    workExperience = extracted.workExperience
  }

  const resumeId = newId()
  const now = new Date().toISOString()
  await env.DB.prepare(
    `INSERT INTO resumes (id, application_id, r2_object_key, file_name, file_size_bytes, skills, work_experience, raw_text, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(application_id) DO UPDATE SET
       r2_object_key = excluded.r2_object_key,
       file_name = excluded.file_name,
       file_size_bytes = excluded.file_size_bytes,
       skills = excluded.skills,
       work_experience = excluded.work_experience,
       raw_text = excluded.raw_text,
       created_at = excluded.created_at`,
  )
    .bind(
      resumeId,
      applicationId,
      r2Key,
      file.name,
      bytes.byteLength,
      JSON.stringify(skills),
      JSON.stringify(workExperience),
      rawText,
      now,
    )
    .run()

  const nudgePoints = await generateNudges(env.AI, {
    jdSummary: application.jd_summary,
    requirements: JSON.parse(application.requirements) as string[],
    skills,
    workExperience,
  })

  const nudgeId = newId()
  await env.DB.prepare(
    `INSERT INTO nudges (id, application_id, points, created_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(application_id) DO UPDATE SET points = excluded.points, created_at = excluded.created_at`,
  )
    .bind(nudgeId, applicationId, JSON.stringify(nudgePoints), now)
    .run()

  return Response.json({
    resume: { fileName: file.name, fileSizeBytes: bytes.byteLength, skills, workExperience },
    nudges: nudgePoints,
  })
}
