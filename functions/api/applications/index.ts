import type { ApplicationRow } from '../../lib/types'
import { newId, toApplicationSummary } from '../../lib/db'

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context
  const q = new URL(request.url).searchParams.get('q')?.trim()

  const query = q
    ? env.DB.prepare(
        'SELECT * FROM applications WHERE company LIKE ?1 OR role_title LIKE ?1 ORDER BY applied_date DESC',
      ).bind(`%${q}%`)
    : env.DB.prepare('SELECT * FROM applications ORDER BY applied_date DESC')

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
  const { request, env } = context
  const body = (await request.json()) as CreateBody

  if (!body.company || !body.roleTitle) {
    return Response.json({ error: 'company and roleTitle are required' }, { status: 400 })
  }

  const id = newId()
  const now = new Date().toISOString()

  await env.DB.prepare(
    `INSERT INTO applications (id, company, role_title, jd_summary, jd_full_text, jd_url, requirements, status, applied_date, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'applied', ?, ?, ?)`,
  )
    .bind(
      id,
      body.company,
      body.roleTitle,
      body.jdSummary ?? '',
      body.jdFullText ?? '',
      body.jdUrl ?? null,
      JSON.stringify(body.requirements ?? []),
      body.appliedDate ?? now,
      now,
      now,
    )
    .run()

  return Response.json({ id }, { status: 201 })
}
