import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopAppBar from '../../components/TopAppBar'
import JdInput, { type JdInputValue } from './JdInput'
import JdReview from './JdReview'
import ResumeUpload from './ResumeUpload'
import Confirm from './Confirm'
import type { ParsedJd, ResumeDraft } from '../../lib/types'

type Step = 'input' | 'jdReview' | 'resume' | 'confirm'

const EMPTY_INPUT: JdInputValue = { source: 'paste', url: '', company: '', roleTitle: '', jdText: '' }
const EMPTY_RESUME: ResumeDraft = { file: null, skills: [], workExperience: [] }

// Stub until the JD crawl/parse Pages Function exists — splits the pasted text into
// naive "requirement" tags so the review step has something to edit.
function stubParseJd(input: JdInputValue): ParsedJd {
  const words = input.jdText
    .split(/[,.\n]/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && w.length < 40)
    .slice(0, 4)

  return {
    company: input.company,
    roleTitle: input.roleTitle,
    summary: input.jdText.slice(0, 280) || (input.url ? `Imported from ${input.url}` : ''),
    requirements: words,
    matchConfidence: 98,
  }
}

export default function TrackJob() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('input')
  const [input, setInput] = useState<JdInputValue>(EMPTY_INPUT)
  const [jd, setJd] = useState<ParsedJd | null>(null)
  const [resume, setResume] = useState<ResumeDraft>(EMPTY_RESUME)
  const [parsing, setParsing] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleParse = async () => {
    setParsing(true)
    // Placeholder delay — real implementation calls POST /api/jd/crawl or passes jdText straight to the LLM.
    await new Promise((r) => setTimeout(r, 400))
    setJd(stubParseJd(input))
    setParsing(false)
    setStep('jdReview')
  }

  const handleSave = async () => {
    setSaving(true)
    // Placeholder — real implementation POSTs to /api/applications and redirects to the new record.
    await new Promise((r) => setTimeout(r, 400))
    setSaving(false)
    navigate('/')
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-sm antialiased">
      <TopAppBar showBack />
      <main className="flex-grow w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-lg pb-32">
        {step === 'input' && (
          <JdInput value={input} onChange={setInput} onSubmit={handleParse} submitting={parsing} />
        )}
        {step === 'jdReview' && jd && (
          <JdReview
            value={jd}
            source={input.source}
            onChange={setJd}
            onBack={() => setStep('input')}
            onContinue={() => setStep('resume')}
          />
        )}
        {step === 'resume' && (
          <ResumeUpload
            value={resume}
            onChange={setResume}
            onBack={() => setStep('jdReview')}
            onContinue={() => setStep('confirm')}
          />
        )}
        {step === 'confirm' && jd && (
          <Confirm jd={jd} resume={resume} onBack={() => setStep('resume')} onSave={handleSave} saving={saving} />
        )}
      </main>
    </div>
  )
}
