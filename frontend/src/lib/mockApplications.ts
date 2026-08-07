import type { Application } from './types'

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString()

// Placeholder data — replaced by real /api/applications calls once the backend exists.
export const MOCK_APPLICATIONS: Application[] = [
  { id: '1', company: 'Acme Corp', roleTitle: 'Senior Frontend Engineer', status: 'interviewing', appliedDate: daysAgo(2) },
  { id: '2', company: 'Global Synergy', roleTitle: 'Product Designer', status: 'in_progress', appliedDate: daysAgo(4) },
  { id: '3', company: 'Nexus Tech', roleTitle: 'UX Researcher', status: 'applied', appliedDate: daysAgo(7) },
  { id: '4', company: 'Apex Financial', roleTitle: 'Lead Developer', status: 'offer', appliedDate: daysAgo(14) },
  { id: '5', company: 'Vanguard UI', roleTitle: 'Design Systems Engineer', status: 'interviewing', appliedDate: daysAgo(21) },
]
