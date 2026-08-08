export type ApplicationStatus = 'applied' | 'in_progress' | 'interviewing' | 'offer' | 'rejected'

export const STATUS_ORDER: ApplicationStatus[] = [
  'applied',
  'in_progress',
  'interviewing',
  'offer',
  'rejected',
]

// Deliberately off the design-system token palette here: the tokens for in_progress/offer
// (secondary-container, tertiary-fixed) render as near-identical pale blues, making the whole
// pipeline look like "grey, purple, and three shades of almost-white." Standard Tailwind hues
// give each stage a genuinely distinct color at a glance.
export const STATUS_META: Record<ApplicationStatus, { label: string; chipClass: string; dotClass: string }> = {
  applied: {
    label: 'Applied',
    chipClass: 'bg-slate-200 text-slate-700',
    dotClass: 'bg-slate-500',
  },
  in_progress: {
    label: 'In Progress',
    chipClass: 'bg-amber-100 text-amber-800',
    dotClass: 'bg-amber-500',
  },
  interviewing: {
    label: 'Interviewing',
    chipClass: 'bg-primary-container text-on-primary-container',
    dotClass: 'bg-on-primary-container',
  },
  offer: {
    label: 'Offer',
    chipClass: 'bg-green-100 text-green-800',
    dotClass: 'bg-green-500',
  },
  rejected: {
    label: 'Rejected',
    chipClass: 'bg-red-100 text-red-700',
    dotClass: 'bg-red-500',
  },
}
