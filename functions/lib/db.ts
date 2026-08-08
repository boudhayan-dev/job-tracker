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
          notes: resume.notes,
        }
      : null,
    nudges: nudge ? (JSON.parse(nudge.points) as string[]) : [],
  }
}

// Scoped by owner_email so one trusted user can never read (or 404-probe the existence of)
// another's application — the row simply doesn't come back if it isn't theirs. Soft-deleted
// rows are excluded too, so a deleted job's detail page 404s just like it doesn't exist.
export async function getApplication(db: D1Database, id: string, ownerEmail: string): Promise<ApplicationRow | null> {
  const row = await db
    .prepare('SELECT * FROM applications WHERE id = ? AND owner_email = ? AND is_deleted = 0')
    .bind(id, ownerEmail)
    .first<ApplicationRow>()
  return row ?? null
}

// Joins through applications to enforce the same per-owner scoping on the resume, since
// resumes carry no owner_email of their own — ownership is inherited from the parent application.
export async function getResumeForApplication(
  db: D1Database,
  applicationId: string,
  ownerEmail: string,
): Promise<ResumeRow | null> {
  const row = await db
    .prepare(
      `SELECT resumes.* FROM resumes
       JOIN applications ON applications.id = resumes.application_id
       WHERE resumes.application_id = ? AND applications.owner_email = ? AND applications.is_deleted = 0`,
    )
    .bind(applicationId, ownerEmail)
    .first<ResumeRow>()
  return row ?? null
}

export async function getNudgesForApplication(
  db: D1Database,
  applicationId: string,
  ownerEmail: string,
): Promise<NudgeRow | null> {
  const row = await db
    .prepare(
      `SELECT nudges.* FROM nudges
       JOIN applications ON applications.id = nudges.application_id
       WHERE nudges.application_id = ? AND applications.owner_email = ? AND applications.is_deleted = 0`,
    )
    .bind(applicationId, ownerEmail)
    .first<NudgeRow>()
  return row ?? null
}
