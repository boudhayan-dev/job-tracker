import { getResumeForApplication } from '../../../../lib/db'

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, params } = context
  const applicationId = params.id as string

  const resume = await getResumeForApplication(env.DB, applicationId)
  if (!resume) {
    return Response.json({ error: 'not found' }, { status: 404 })
  }

  const object = await env.RESUMES.get(resume.r2_object_key)
  if (!object) {
    return Response.json({ error: 'file not found in storage' }, { status: 404 })
  }

  return new Response(object.body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${resume.file_name}"`,
    },
  })
}
