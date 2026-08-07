import { useState } from 'react'
import Button from '../../components/Button'

export type JdInputValue = {
  source: 'url' | 'paste'
  url: string
  company: string
  roleTitle: string
  jdText: string
}

type Props = {
  value: JdInputValue
  onChange: (value: JdInputValue) => void
  onSubmit: () => void
  submitting: boolean
}

export default function JdInput({ value, onChange, onSubmit, submitting }: Props) {
  const [error, setError] = useState<string | null>(null)

  const canSubmit = value.source === 'url' ? value.url.trim().length > 0 : value.jdText.trim().length > 0

  const handleSubmit = () => {
    if (!canSubmit) {
      setError(value.source === 'url' ? 'Paste a job posting URL first.' : 'Paste the job description text first.')
      return
    }
    setError(null)
    onSubmit()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-lg space-y-md">
        <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
          Track New Job
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Paste a link to the posting, or paste the job description text directly.
        </p>
        <div className="inline-flex bg-surface-container-low p-1 rounded-lg border border-outline-variant w-full md:w-auto mt-md">
          <button
            type="button"
            onClick={() => onChange({ ...value, source: 'url' })}
            className={`flex-1 md:flex-none px-xl py-sm font-label-md text-label-md rounded-md transition-colors flex items-center justify-center gap-2 ${
              value.source === 'url'
                ? 'bg-surface border border-outline-variant shadow-sm text-primary font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">link</span>
            URL Import
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...value, source: 'paste' })}
            className={`flex-1 md:flex-none px-xl py-sm font-label-md text-label-md rounded-md transition-colors flex items-center justify-center gap-2 ${
              value.source === 'paste'
                ? 'bg-surface border border-outline-variant shadow-sm text-primary font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">content_paste</span>
            Manual Paste
          </button>
        </div>
      </div>

      <div className="bg-surface border border-outline-variant rounded-xl shadow-sm p-md md:p-lg">
        <div className="space-y-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface-variant block" htmlFor="company">
                Company Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">apartment</span>
                </span>
                <input
                  id="company"
                  placeholder="e.g. Acme Corp"
                  type="text"
                  value={value.company}
                  onChange={(e) => onChange({ ...value, company: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2 bg-surface-bright border border-outline-variant rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors shadow-sm"
                />
              </div>
            </div>
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface-variant block" htmlFor="role">
                Role Title
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">work</span>
                </span>
                <input
                  id="role"
                  placeholder="e.g. Senior Designer"
                  type="text"
                  value={value.roleTitle}
                  onChange={(e) => onChange({ ...value, roleTitle: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2 bg-surface-bright border border-outline-variant rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors shadow-sm"
                />
              </div>
            </div>
          </div>

          <hr className="border-t border-surface-container-high my-sm" />

          {value.source === 'url' ? (
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface-variant block" htmlFor="url">
                Job Posting URL
              </label>
              <input
                id="url"
                placeholder="https://..."
                type="url"
                value={value.url}
                onChange={(e) => onChange({ ...value, url: e.target.value })}
                className="block w-full p-3 bg-surface-bright border border-outline-variant rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors shadow-sm"
              />
              <p className="font-body-sm text-body-sm text-on-surface-variant text-[12px] mt-1">
                Some sites block crawling — if the import doesn't look right, switch to Manual Paste.
              </p>
            </div>
          ) : (
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface-variant block" htmlFor="jd">
                Job Description
              </label>
              <textarea
                id="jd"
                rows={8}
                placeholder="Paste the full job description here..."
                value={value.jdText}
                onChange={(e) => onChange({ ...value, jdText: e.target.value })}
                className="block w-full p-3 bg-surface-bright border border-outline-variant rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors shadow-sm resize-none"
              />
            </div>
          )}

          {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}

          <div className="pt-sm">
            <Button onClick={handleSubmit} disabled={submitting} className="w-full font-headline-md text-headline-md h-12">
              <span className="material-symbols-outlined">auto_awesome</span>
              {submitting ? 'Parsing…' : 'Parse JD with AI'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
