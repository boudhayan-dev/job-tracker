import type { ApplicationRow } from '../../lib/types'
import { newId, toApplicationSummary } from '../../lib/db'

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env, data } = context
  const ownerEmail = data.userEmail as string
  const q = new URL(request.url).searchParams.get('q')?.trim()

  const query = q
    ? env.DB.prepare(
        'SELECT * FROM applications WHERE owner_email = ?1 AND is_deleted = 0 AND (company LIKE ?2 OR role_title LIKE ?2) ORDER BY applied_date DESC',
      ).bind(ownerEmail, `%${q}%`)
    : env.DB.prepare('SELECT * FROM applications WHERE owner_email = ?1 AND is_deleted = 0 ORDER BY applied_date DESC').bind(
        ownerEmail,
      )

  const { results } = await query.all<ApplicationRow>()
  return Response.json(results.map(toApplicationSummary))
}

type CreateBody = {
  company: string
  roleTitle: string
  jdSummary?: string
  jdFullText?: string
  jdUrl?: string | null
  requirements?: string[]
  appliedDate?: string
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env, data } = context
  const ownerEmail = data.userEmail as string
  const body = (await request.json()) as CreateBody
  const company = body.company?.trim()
  const roleTitle = body.roleTitle?.trim()

  if (!company || !roleTitle) {
    return Response.json({ error: 'company and roleTitle are required' }, { status: 400 })
  }

  const id = newId()
  const now = new Date().toISOString()

  await env.DB.prepare(
    `INSERT INTO applications (id, company, role_title, jd_summary, jd_full_text, jd_url, requirements, status, applied_date, owner_email, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'applied', ?, ?, ?, ?)`,
  )
    .bind(
      id,
      company,
      roleTitle,
      body.jdSummary ?? '',
      body.jdFullText ?? '',
      body.jdUrl ?? null,
      JSON.stringify(body.requirements ?? []),
      body.appliedDate ?? now,
      ownerEmail,
      now,
      now,
    )
    .run()

  return Response.json({ id }, { status: 201 })
}
