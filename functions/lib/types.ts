export type ApplicationStatus = 'applied' | 'in_progress' | 'interviewing' | 'offer' | 'rejected'

export type ParsedJd = {
  company: string
  roleTitle: string
  summary: string
  requirements: string[]
  matchConfidence: number
}

export type WorkExperienceEntry = {
  company: string
  title: string
  bullets: string[]
}

export type ApplicationRow = {
  id: string
  company: string
  role_title: string
  jd_summary: string
  jd_full_text: string
  jd_url: string | null
  requirements: string
  status: ApplicationStatus
  applied_date: string
  created_at: string
  updated_at: string
}

export type ResumeRow = {
  id: string
  application_id: string
  r2_object_key: string
  file_name: string
  file_size_bytes: number
  skills: string
  work_experience: string
  raw_text: string
  created_at: string
}

export type NudgeRow = {
  id: string
  application_id: string
  points: string
  created_at: string
}
