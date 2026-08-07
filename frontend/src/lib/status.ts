export type ApplicationStatus = 'applied' | 'in_progress' | 'interviewing' | 'offer' | 'rejected'

export const STATUS_ORDER: ApplicationStatus[] = [
  'applied',
  'in_progress',
  'interviewing',
  'offer',
  'rejected',
]

export const STATUS_META: Record<ApplicationStatus, { label: string; chipClass: string; dotClass: string }> = {
  applied: {
    label: 'Applied',
    chipClass: 'bg-surface-container-high text-on-surface',
    dotClass: 'bg-outline',
  },
  in_progress: {
    label: 'In Progress',
    chipClass: 'bg-secondary-container text-on-secondary-container',
    dotClass: 'bg-on-secondary-container',
  },
  interviewing: {
    label: 'Interviewing',
    chipClass: 'bg-primary-container text-on-primary-container',
    dotClass: 'bg-on-primary-container',
  },
  offer: {
    label: 'Offer',
    chipClass: 'bg-tertiary-fixed text-on-tertiary-fixed',
    dotClass: 'bg-on-tertiary-fixed',
  },
  rejected: {
    label: 'Rejected',
    chipClass: 'bg-error-container text-on-error-container',
    dotClass: 'bg-on-error-container',
  },
}
