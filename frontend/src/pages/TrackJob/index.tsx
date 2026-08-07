import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopAppBar from '../../components/TopAppBar'
import JdInput, { type JdInputValue } from './JdInput'
import JdReview from './JdReview'
import ResumeUpload from './ResumeUpload'
import Confirm from './Confirm'
import type { ParsedJd, ResumeDraft } from '../../lib/types'
import { crawlJd, createApplication, uploadResume } from '../../lib/api'

type Step = 'input' | 'jdReview' | 'resume' | 'confirm'

const EMPTY_INPUT: JdInputValue = { source: 'paste', url: '', company: '', roleTitle: '', jdText: '' }
const EMPTY_RESUME: ResumeDraft = { file: null, skills: [], workExperience: [] }

export default function TrackJob() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('input')
  const [input, setInput] = useState<JdInputValue>(EMPTY_INPUT)
  const [jd, setJd] = useState<ParsedJd | null>(null)
  const [jdFullText, setJdFullText] = useState('')
  const [resume, setResume] = useState<ResumeDraft>(EMPTY_RESUME)
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleParse = async () => {
    setParsing(true)
    setParseError(null)
    try {
      const result = await crawlJd({
        source: input.source,
        url: input.source === 'url' ? input.url : undefined,
        jdText: input.source === 'paste' ? input.jdText : undefined,
        company: input.company,
        roleTitle: input.roleTitle,
      })
      setJd({
        company: result.company,
        roleTitle: result.roleTitle,
        summary: result.summary,
        requirements: result.requirements,
        matchConfidence: result.matchConfidence,
      })
      setJdFullText(result.rawText)
      setStep('jdReview')
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'Failed to parse the job description.')
    } finally {
      setParsing(false)
    }
  }

  const handleSave = async () => {
    if (!jd) return
    setSaving(true)
    setSaveError(null)
    try {
      const { id } = await createApplication({
        company: jd.company,
        roleTitle: jd.roleTitle,
        jdSummary: jd.summary,
        jdFullText,
        jdUrl: input.source === 'url' ? input.url : null,
        requirements: jd.requirements,
      })
      if (resume.file) {
        await uploadResume(id, resume.file)
      }
      navigate(`/applications/${id}`)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save the application.')
      setSaving(false)
    }
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-sm antialiased">
      <TopAppBar showBack />
      <main className="flex-grow w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-lg pb-32">
        {step === 'input' && (
          <JdInput value={input} onChange={setInput} onSubmit={handleParse} submitting={parsing} error={parseError} />
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
          <Confirm
            jd={jd}
            resume={resume}
            onBack={() => setStep('resume')}
            onSave={handleSave}
            saving={saving}
            error={saveError}
          />
        )}
      </main>
    </div>
  )
}
