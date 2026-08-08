import type { Application, ParsedJd, WorkExperienceEntry } from './types'
import type { ApplicationStatus } from './status'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: init?.body instanceof FormData ? init.headers : { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(body.error ?? `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function listApplications(query?: string): Promise<Application[]> {
  const qs = query ? `?q=${encodeURIComponent(query)}` : ''
  return request<Application[]>(`/applications${qs}`)
}

export type ApplicationDetailResponse = {
  id: string
  company: string
  roleTitle: string
  status: ApplicationStatus
  jdSummary: string
  jdFullText: string
  jdUrl: string | null
  requirements: string[]
  appliedDate: string
  resume: { fileName: string; fileSizeBytes: number; skills: string[]; workExperience: WorkExperienceEntry[] } | null
  nudges: string[]
}

export function getApplication(id: string): Promise<ApplicationDetailResponse> {
  return request<ApplicationDetailResponse>(`/applications/${id}`)
}

export function updateApplicationStatus(id: string, status: ApplicationStatus): Promise<{ id: string; status: string }> {
  return request(`/applications/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
}

export type CrawlJdRequest = {
  source: 'url' | 'paste'
  url?: string
  jdText?: string
  company?: string
  roleTitle?: string
}

export type CrawlJdResponse = ParsedJd & { rawText: string; source: 'url' | 'paste'; usedBrowserRendering: boolean }

export function crawlJd(body: CrawlJdRequest): Promise<CrawlJdResponse> {
  return request<CrawlJdResponse>('/jd/crawl', { method: 'POST', body: JSON.stringify(body) })
}

export type CreateApplicationRequest = {
  company: string
  roleTitle: string
  jdSummary: string
  jdFullText: string
  jdUrl?: string | null
  requirements: string[]
}

export function createApplication(body: CreateApplicationRequest): Promise<{ id: string }> {
  return request('/applications', { method: 'POST', body: JSON.stringify(body) })
}

export type ExtractResumeResponse = { skills: string[]; workExperience: WorkExperienceEntry[] }

export function extractResume(file: File): Promise<ExtractResumeResponse> {
  const formData = new FormData()
  formData.append('resume', file)
  return request('/resume/extract', { method: 'POST', body: formData })
}

export type UploadResumeResponse = {
  resume: { fileName: string; fileSizeBytes: number; skills: string[]; workExperience: WorkExperienceEntry[] }
  nudges: string[]
}

export function uploadResume(
  applicationId: string,
  file: File,
  reviewed: { skills: string[]; workExperience: WorkExperienceEntry[] },
): Promise<UploadResumeResponse> {
  const formData = new FormData()
  formData.append('resume', file)
  formData.append('skills', JSON.stringify(reviewed.skills))
  formData.append('workExperience', JSON.stringify(reviewed.workExperience))
  return request(`/applications/${applicationId}/resume`, { method: 'POST', body: formData })
}

export function resumeFileUrl(applicationId: string): string {
  return `/api/applications/${applicationId}/resume/file`
}
