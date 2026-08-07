import { useState } from 'react'
import Stepper from '../../components/Stepper'
import Button from '../../components/Button'
import type { ParsedJd } from '../../lib/types'

type Props = {
  value: ParsedJd
  source: 'url' | 'paste'
  onChange: (value: ParsedJd) => void
  onBack: () => void
  onContinue: () => void
}

export default function JdReview({ value, source, onChange, onBack, onContinue }: Props) {
  const [newTag, setNewTag] = useState('')

  const addTag = () => {
    const tag = newTag.trim()
    if (!tag || value.requirements.includes(tag)) return
    onChange({ ...value, requirements: [...value.requirements, tag] })
    setNewTag('')
  }

  const removeTag = (tag: string) => {
    onChange({ ...value, requirements: value.requirements.filter((t) => t !== tag) })
  }

  return (
    <div>
      <Stepper activeIndex={0} />

      <div className="max-w-2xl mx-auto mb-lg text-center">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-sm">
          Review Parsed Details
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          We've extracted the key information{source === 'url' ? ' from your link' : ' from the text you pasted'}.
          Verify and adjust before continuing.
        </p>
      </div>

      <div className="max-w-2xl mx-auto bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="px-md py-sm border-b border-outline-variant bg-surface-bright flex items-center justify-between flex-wrap gap-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-sm">document_scanner</span>
            <span className="font-mono-sm text-mono-sm text-on-surface-variant uppercase tracking-wider">
              Source: {source === 'url' ? 'URL Import' : 'Manual Paste'}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-secondary-container px-3 py-1 rounded-full">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="font-label-md text-label-md text-on-secondary-container">
              {value.matchConfidence}% Match Confidence
            </span>
          </div>
        </div>

        <div className="p-lg md:p-xl flex flex-col gap-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <div className="flex flex-col gap-sm">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="review-company">
                Company
              </label>
              <input
                id="review-company"
                type="text"
                value={value.company}
                onChange={(e) => onChange({ ...value, company: e.target.value })}
                className="w-full h-12 pl-4 pr-4 bg-surface-bright border border-outline-variant rounded-lg font-body-lg text-body-lg text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm transition-all"
              />
            </div>
            <div className="flex flex-col gap-sm">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="review-role">
                Role Title
              </label>
              <input
                id="review-role"
                type="text"
                value={value.roleTitle}
                onChange={(e) => onChange({ ...value, roleTitle: e.target.value })}
                className="w-full h-12 pl-4 pr-4 bg-surface-bright border border-outline-variant rounded-lg font-body-lg text-body-lg text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-sm">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="review-summary">
              Role Summary
            </label>
            <textarea
              id="review-summary"
              rows={4}
              value={value.summary}
              onChange={(e) => onChange({ ...value, summary: e.target.value })}
              className="w-full p-4 bg-surface-bright border border-outline-variant rounded-lg font-body-lg text-body-lg text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm resize-none transition-all leading-relaxed"
            />
          </div>

          <div className="flex flex-col gap-sm">
            <div className="flex items-center justify-between">
              <label className="font-label-md text-label-md text-on-surface-variant">Key Requirements</label>
              <span className="font-mono-sm text-mono-sm text-outline">Press Enter to add</span>
            </div>
            <div className="flex flex-wrap gap-2 p-3 bg-surface-bright border border-outline-variant rounded-lg shadow-sm min-h-[56px] focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              {value.requirements.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary-container text-on-primary-container rounded-full border border-primary-container cursor-pointer"
                  onClick={() => removeTag(tag)}
                >
                  <span className="font-body-sm text-body-sm font-medium">{tag}</span>
                  <span className="material-symbols-outlined text-[16px] opacity-70">close</span>
                </div>
              ))}
              <input
                type="text"
                placeholder="Add requirement..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
                className="flex-1 min-w-[120px] bg-transparent border-none focus:outline-none focus:ring-0 font-body-sm text-body-sm text-on-surface placeholder:text-outline-variant px-2 h-8"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto flex items-center justify-between mt-lg">
        <button
          type="button"
          onClick={onBack}
          className="hidden md:flex items-center justify-center h-12 px-6 rounded-lg border border-outline-variant bg-surface text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-low hover:text-on-surface transition-colors"
        >
          Cancel
        </button>
        <Button onClick={onContinue} className="w-full md:w-auto">
          Continue to Resume
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Button>
      </div>
    </div>
  )
}
