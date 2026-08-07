export type ResumeExperience = {
  title: string
  company: string
  dateRange: string
  bullets: string[]
}

export type MockResume = {
  fileName: string
  pdfUrl: string | null // set once R2-backed resume storage exists (task: wire frontend to real API)
  name: string
  headline: string
  contact: string[]
  summary: string
  experience: ResumeExperience[]
  skillGroups: { label: string; items: string }[]
}

// Placeholder — replaced by the real resume record (R2 file + extracted text) once the backend exists.
export function getMockResume(_applicationId: string): MockResume {
  return {
    fileName: 'Resume_Vercel_Senior_Edge_Architect.pdf',
    pdfUrl: null,
    name: 'Alex Mercer',
    headline: 'Senior Edge Architect | San Francisco, CA',
    contact: ['alex.mercer@example.com', 'github.com/alexmercer-edge', 'linkedin.com/in/alexmercer'],
    summary:
      'Accomplished Senior Edge Architect with over 10 years of experience designing and implementing globally distributed, low-latency compute architectures. Proven track record of spearheading serverless initiatives, optimizing edge routing protocols, and migrating monolithic applications to highly resilient edge-native frameworks. Passionate about developer experience and infrastructure as code.',
    experience: [
      {
        title: 'Principal Infrastructure Engineer',
        company: 'TechNova Cloud Solutions, Seattle, WA',
        dateRange: '2021 – Present',
        bullets: [
          'Architected and deployed a multi-region edge computing platform, reducing TTFB (Time to First Byte) by 45% for enterprise clients.',
          'Led a team of 8 engineers in migrating legacy microservices to a serverless edge architecture using WebAssembly and Rust.',
          'Implemented robust CI/CD pipelines incorporating automated edge deployment testing, improving deployment frequency by 3x.',
        ],
      },
      {
        title: 'Senior Backend Developer',
        company: 'GlobalStream Inc., San Francisco, CA',
        dateRange: '2017 – 2021',
        bullets: [
          'Designed highly available APIs handling over 50M requests daily with 99.99% uptime.',
          'Spearheaded the integration of a CDN-level caching strategy, cutting origin server costs by 30%.',
          'Mentored junior developers and established best practices for scalable Node.js application design.',
        ],
      },
    ],
    skillGroups: [
      { label: 'Languages', items: 'TypeScript, Rust, Go, Python, SQL' },
      { label: 'Technologies', items: 'Edge Computing, WebAssembly, Kubernetes, Serverless, GraphQL' },
      { label: 'Platforms', items: 'Vercel, AWS, Cloudflare Workers, GCP' },
      { label: 'Tools', items: 'Terraform, Docker, Git, CI/CD Actions' },
    ],
  }
}
