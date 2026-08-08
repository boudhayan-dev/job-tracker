import { useRef, useState } from 'react'
import Stepper from '../../components/Stepper'
import Button from '../../components/Button'
import type { ResumeDraft, WorkExperienceEntry } from '../../lib/types'

type Props = {
  value: ResumeDraft
  onChange: (value: ResumeDraft) => void
  onFileSelected: (file: File) => void
  extracting: boolean
  extractError: string | null
  onBack: () => void
  onContinue: () => void
}

export default function ResumeUpload({
  value,
  onChange,
  onFileSelected,
  extracting,
  extractError,
  onBack,
  onContinue,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [newSkill, setNewSkill] = useState('')

  const addSkill = () => {
    const skill = newSkill.trim()
    if (!skill || value.skills.includes(skill)) return
    onChange({ ...value, skills: [...value.skills, skill] })
    setNewSkill('')
  }

  const removeSkill = (skill: string) => onChange({ ...value, skills: value.skills.filter((s) => s !== skill) })

  const addExperience = () => {
    const entry: WorkExperienceEntry = { company: '', title: '', bullets: [''] }
    onChange({ ...value, workExperience: [...value.workExperience, entry] })
  }

  const updateExperience = (index: number, entry: WorkExperienceEntry) => {
    const next = [...value.workExperience]
    next[index] = entry
    onChange({ ...value, workExperience: next })
  }

  const removeExperience = (index: number) => {
    onChange({ ...value, workExperience: value.workExperience.filter((_, i) => i !== index) })
  }

  return (
    <div>
      <Stepper activeIndex={1} />

      <div className="max-w-2xl mx-auto mb-lg text-center">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-sm">
          Upload the Resume You're Sending
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          The exact tailored resume for this application — we'll pull out the skills and experience you claimed so
          you can recall them later.
        </p>
      </div>

      <div className="max-w-2xl mx-auto bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-lg md:p-xl flex flex-col gap-xl">
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            const file = e.dataTransfer.files?.[0]
            if (file) onFileSelected(file)
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-sm border-2 border-dashed rounded-lg p-xl text-center cursor-pointer transition-colors ${
            dragOver ? 'border-primary bg-primary-container/10' : 'border-outline-variant hover:border-primary'
          }`}
        >
          <span className="material-symbols-outlined text-primary text-[32px]">upload_file</span>
          {value.file ? (
            <>
              <p className="font-body-lg text-body-lg text-on-surface font-medium">{value.file.name}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Click or drop to replace</p>
            </>
          ) : (
            <>
              <p className="font-body-lg text-body-lg text-on-surface">Drop your resume PDF here, or click to browse</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">PDF only</p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onFileSelected(file)
            }}
          />
        </div>

        {extracting && (
          <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-sm">
            <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
            Extracting skills and experience from your resume…
          </p>
        )}
        {extractError && (
          <p className="font-body-sm text-body-sm text-error">
            {extractError} You can still add skills/experience manually below.
          </p>
        )}

        <div className="flex flex-col gap-sm">
          <div className="flex items-center justify-between">
            <label className="font-label-md text-label-md text-on-surface-variant">Skills on this resume</label>
            <span className="font-mono-sm text-mono-sm text-outline">Press Enter to add</span>
          </div>
          <div className="flex flex-wrap gap-2 p-3 bg-surface-bright border border-outline-variant rounded-lg shadow-sm min-h-[56px] focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            {value.skills.map((skill) => (
              <div
                key={skill}
                onClick={() => removeSkill(skill)}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary-container text-on-primary-container rounded-full border border-primary-container cursor-pointer"
              >
                <span className="font-body-sm text-body-sm font-medium">{skill}</span>
                <span className="material-symbols-outlined text-[16px] opacity-70">close</span>
              </div>
            ))}
            <input
              type="text"
              placeholder="Add skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addSkill()
                }
              }}
              className="flex-1 min-w-[120px] bg-transparent border-none focus:outline-none focus:ring-0 font-body-sm text-body-sm text-on-surface placeholder:text-outline-variant px-2 h-8"
            />
          </div>
        </div>

        <div className="flex flex-col gap-sm">
          <div className="flex items-center justify-between">
            <label className="font-label-md text-label-md text-on-surface-variant">Work experience claimed</label>
            <button
              type="button"
              onClick={addExperience}
              className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add entry
            </button>
          </div>

          {value.workExperience.length === 0 && (
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              No entries yet — add the roles/bullets this resume version claims.
            </p>
          )}

          <div className="flex flex-col gap-md">
            {value.workExperience.map((entry, i) => (
              <div key={i} className="border border-outline-variant rounded-lg p-md bg-surface-bright flex flex-col gap-sm">
                <div className="flex items-start justify-between gap-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-sm flex-1">
                    <input
                      type="text"
                      placeholder="Company"
                      value={entry.company}
                      onChange={(e) => updateExperience(i, { ...entry, company: e.target.value })}
                      className="h-10 px-3 bg-surface border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                    <input
                      type="text"
                      placeholder="Title"
                      value={entry.title}
                      onChange={(e) => updateExperience(i, { ...entry, title: e.target.value })}
                      className="h-10 px-3 bg-surface border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExperience(i)}
                    className="text-on-surface-variant hover:text-error transition-colors p-1"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  placeholder="Bullets from this resume (one per line)"
                  value={entry.bullets.join('\n')}
                  onChange={(e) => updateExperience(i, { ...entry, bullets: e.target.value.split('\n') })}
                  className="w-full p-3 bg-surface border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto flex items-center justify-between mt-lg">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center h-12 px-6 rounded-lg border border-outline-variant bg-surface text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-low hover:text-on-surface transition-colors"
        >
          Back
        </button>
        <Button onClick={onContinue} disabled={!value.file} className="flex-1 md:flex-none ml-md">
          Continue to Confirm
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Button>
      </div>
    </div>
  )
}
