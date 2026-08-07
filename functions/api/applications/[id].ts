import { getApplication, getNudgesForApplication, getResumeForApplication, toApplicationDetail } from '../../lib/db'
import type { ApplicationStatus } from '../../lib/types'

const VALID_STATUSES: ApplicationStatus[] = ['applied', 'in_progress', 'interviewing', 'offer', 'rejected']

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, params } = context
  const id = params.id as string

  const application = await getApplication(env.DB, id)
  if (!application) {
    return Response.json({ error: 'not found' }, { status: 404 })
  }

  const [resume, nudge] = await Promise.all([
    getResumeForApplication(env.DB, id),
    getNudgesForApplication(env.DB, id),
  ])

  return Response.json(toApplicationDetail(application, resume, nudge))
}

type PatchBody = { status: ApplicationStatus }

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context
  const id = params.id as string
  const body = (await request.json()) as PatchBody

  if (!VALID_STATUSES.includes(body.status)) {
    return Response.json({ error: `status must be one of ${VALID_STATUSES.join(', ')}` }, { status: 400 })
  }

  const existing = await getApplication(env.DB, id)
  if (!existing) {
    return Response.json({ error: 'not found' }, { status: 404 })
  }

  await env.DB.prepare('UPDATE applications SET status = ?, updated_at = ? WHERE id = ?')
    .bind(body.status, new Date().toISOString(), id)
    .run()

  return Response.json({ id, status: body.status })
}
