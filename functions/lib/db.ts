import type { ApplicationRow, NudgeRow, ResumeRow } from './types'

export function newId(): string {
  return crypto.randomUUID()
}

export function toApplicationSummary(row: ApplicationRow) {
  return {
    id: row.id,
    company: row.company,
    roleTitle: row.role_title,
    status: row.status,
    appliedDate: row.applied_date,
  }
}

export function toApplicationDetail(
  application: ApplicationRow,
  resume: ResumeRow | null,
  nudge: NudgeRow | null,
) {
  return {
    id: application.id,
    company: application.company,
    roleTitle: application.role_title,
    status: application.status,
    jdSummary: application.jd_summary,
    jdFullText: application.jd_full_text,
    jdUrl: application.jd_url,
    requirements: JSON.parse(application.requirements) as string[],
    appliedDate: application.applied_date,
    resume: resume
      ? {
          fileName: resume.file_name,
          fileSizeBytes: resume.file_size_bytes,
          skills: JSON.parse(resume.skills) as string[],
          workExperience: JSON.parse(resume.work_experience) as unknown[],
        }
      : null,
    nudges: nudge ? (JSON.parse(nudge.points) as string[]) : [],
  }
}

export async function getApplication(db: D1Database, id: string): Promise<ApplicationRow | null> {
  const row = await db.prepare('SELECT * FROM applications WHERE id = ?').bind(id).first<ApplicationRow>()
  return row ?? null
}

export async function getResumeForApplication(db: D1Database, applicationId: string): Promise<ResumeRow | null> {
  const row = await db
    .prepare('SELECT * FROM resumes WHERE application_id = ?')
    .bind(applicationId)
    .first<ResumeRow>()
  return row ?? null
}

export async function getNudgesForApplication(db: D1Database, applicationId: string): Promise<NudgeRow | null> {
  const row = await db
    .prepare('SELECT * FROM nudges WHERE application_id = ?')
    .bind(applicationId)
    .first<NudgeRow>()
  return row ?? null
}
