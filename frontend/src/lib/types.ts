import type { ApplicationStatus } from './status'

export type Application = {
  id: string
  company: string
  roleTitle: string
  status: ApplicationStatus
  appliedDate: string
  companyLogoUrl?: string
}

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

export type ResumeDraft = {
  file: File | null
  skills: string[]
  workExperience: WorkExperienceEntry[]
  notes: string
}
