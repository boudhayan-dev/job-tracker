import type { ApplicationStatus } from './status'

export type ApplicationDetail = {
  id: string
  company: string
  roleTitle: string
  status: ApplicationStatus
  jdSummary: string
  skills: string[]
  resumeBullets: string[]
  nudges: string[]
  resumeFileName: string
  resumeFileSizeLabel: string
}

// Placeholder — replaced by GET /api/applications/:id once the backend exists.
export function getMockDetail(id: string): ApplicationDetail {
  return {
    id,
    company: 'Vercel',
    roleTitle: 'Senior Edge Architect',
    status: 'interviewing',
    jdSummary:
      'Looking for a senior architect to lead the next generation of their Edge Network infrastructure. Requires deep expertise in serverless paradigms, Rust/Wasm, and high-availability global systems. Focus is on developer experience and raw performance.',
    skills: ['Edge Computing', 'Next.js', 'TypeScript', 'Rust', 'WebAssembly'],
    resumeBullets: [
      'Architected and deployed a globally distributed edge caching layer using Cloudflare Workers, reducing TTFB by 150ms for EU users.',
      'Mentored a team of 5 engineers in Rust to build highly performant serverless functions deployed to Vercel Edge Network.',
    ],
    nudges: [
      'Expert in Cloudflare Workers — JD emphasizes edge compute latency reduction.',
      'Led Next.js migration at Acme Corp — mention the 40% performance gain.',
      'Culture fit: they value "shipping fast" — focus on the 2-week MVP turnaround.',
    ],
    resumeFileName: 'Original Resume',
    resumeFileSizeLabel: 'PDF • 2.4 MB',
  }
}
