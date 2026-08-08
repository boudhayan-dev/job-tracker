import type { ParsedJd, WorkExperienceEntry } from './types'

const MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast'

// Runs a Workers AI chat completion and parses the response as JSON, tolerating
// markdown code-fence wrapping that instruction-tuned models sometimes add.
async function runJson<T>(ai: Ai, systemPrompt: string, userPrompt: string): Promise<T> {
  const result = await ai.run(MODEL, {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
  } as unknown as Parameters<Ai['run']>[1])

  const text =
    typeof result === 'object' && result !== null && 'response' in result
      ? String((result as { response: unknown }).response)
      : String(result)

  const jsonText = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '')
  return JSON.parse(jsonText) as T
}

export async function parseJobDescription(
  ai: Ai,
  input: { rawText: string; hintCompany: string; hintRoleTitle: string; sourceUrl?: string },
): Promise<ParsedJd> {
  const systemPrompt = `You extract structured data from job descriptions. Respond with ONLY a JSON object matching:
{"company": string, "roleTitle": string, "summary": string (2-4 sentences), "requirements": string[] (5-8 short skill/requirement tags), "matchConfidence": number (0-100, how confident you are in this extraction)}`

  const userPrompt = [
    input.hintCompany && `Known company (use unless the text clearly says otherwise): ${input.hintCompany}`,
    input.hintRoleTitle && `Known role title (use unless the text clearly says otherwise): ${input.hintRoleTitle}`,
    input.sourceUrl && `Source URL: ${input.sourceUrl}`,
    `Job description text:\n${input.rawText.slice(0, 12000)}`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const parsed = await runJson<ParsedJd>(ai, systemPrompt, userPrompt)

  return {
    company: parsed.company || input.hintCompany || '',
    roleTitle: parsed.roleTitle || input.hintRoleTitle || '',
    summary: parsed.summary || '',
    requirements: Array.isArray(parsed.requirements) ? parsed.requirements.slice(0, 8) : [],
    matchConfidence:
      typeof parsed.matchConfidence === 'number' ? Math.max(0, Math.min(100, parsed.matchConfidence)) : 70,
  }
}

// LLM JSON output can't be trusted to match the requested shape exactly (a missing `bullets`
// on one entry has previously crashed generateNudges and any caller doing `.map`/`.flatMap` on
// it) — normalize defensively regardless of where the entries came from (AI or client-submitted).
export function sanitizeWorkExperience(entries: unknown): WorkExperienceEntry[] {
  if (!Array.isArray(entries)) return []
  return entries.map((entry) => {
    const e = (entry ?? {}) as Partial<WorkExperienceEntry>
    return {
      company: typeof e.company === 'string' ? e.company : '',
      title: typeof e.title === 'string' ? e.title : '',
      bullets: Array.isArray(e.bullets) ? e.bullets.filter((b): b is string => typeof b === 'string') : [],
    }
  })
}

export async function extractResumeFields(
  ai: Ai,
  resumeText: string,
): Promise<{ skills: string[]; workExperience: WorkExperienceEntry[] }> {
  const systemPrompt = `You extract structured data from resumes. Respond with ONLY a JSON object matching:
{"skills": string[] (flat list of named skills/technologies mentioned), "workExperience": {"company": string, "title": string, "bullets": string[]}[]}
Only include skills and experience that vary between resume versions — skip education and personal details.`

  const parsed = await runJson<{ skills: string[]; workExperience: WorkExperienceEntry[] }>(
    ai,
    systemPrompt,
    `Resume text:\n${resumeText.slice(0, 16000)}`,
  )

  return {
    skills: Array.isArray(parsed.skills) ? parsed.skills.filter((s): s is string => typeof s === 'string') : [],
    workExperience: sanitizeWorkExperience(parsed.workExperience),
  }
}

export async function generateNudges(
  ai: Ai,
  input: { jdSummary: string; requirements: string[]; skills: string[]; workExperience: WorkExperienceEntry[] },
): Promise<string[]> {
  const systemPrompt = `You help a job candidate prep for a recruiter call. Respond with ONLY a JSON object matching:
{"nudges": string[]} — 3 to 5 short, punchy talking points that connect the candidate's claimed skills/experience to
what this specific job asks for. Each nudge is one sentence, specific (name real skills/companies from the input),
and phrased as something the candidate can say or remember, not generic advice.`

  const userPrompt = [
    `Job requirements: ${input.requirements.join(', ')}`,
    `Job summary: ${input.jdSummary}`,
    `Candidate's skills on this resume: ${input.skills.join(', ')}`,
    `Candidate's work experience bullets:\n${input.workExperience
      .flatMap((w) => w.bullets.map((b) => `- (${w.company} — ${w.title}) ${b}`))
      .join('\n')}`,
  ].join('\n\n')

  const parsed = await runJson<{ nudges: string[] }>(ai, systemPrompt, userPrompt)
  return Array.isArray(parsed.nudges) ? parsed.nudges.slice(0, 5) : []
}
