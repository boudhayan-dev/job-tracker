import type { ApplicationStatus } from './status'

export type Application = {
  id: string
  company: string
  roleTitle: string
  status: ApplicationStatus
  appliedDate: string
  companyLogoUrl?: string
}
