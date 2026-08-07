import Stepper from '../../components/Stepper'
import Button from '../../components/Button'
import type { ParsedJd, ResumeDraft } from '../../lib/types'

type Props = {
  jd: ParsedJd
  resume: ResumeDraft
  onBack: () => void
  onSave: () => void
  saving: boolean
}

export default function Confirm({ jd, resume, onBack, onSave, saving }: Props) {
  return (
    <div>
      <Stepper activeIndex={2} />

      <div className="max-w-2xl mx-auto mb-lg text-center">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-sm">
          Confirm & Save
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Once saved, we'll generate a few recall nudges in the background — ready by the time you need them.
        </p>
      </div>

      <div className="max-w-2xl mx-auto bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-lg md:p-xl flex flex-col gap-lg">
        <div className="flex items-center gap-md">
          <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center border border-outline-variant">
            <span className="font-headline-md text-headline-md font-bold text-secondary">
              {jd.company.charAt(0) || '?'}
            </span>
          </div>
          <div>
            <p className="font-headline-md text-headline-md font-bold text-on-surface">{jd.company || 'Untitled company'}</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{jd.roleTitle || 'Untitled role'}</p>
          </div>
        </div>

        <div className="border-t border-outline-variant pt-md">
          <p className="font-label-md text-label-md text-on-surface-variant mb-xs">Role Summary</p>
          <p className="font-body-sm text-body-sm text-on-surface">{jd.summary || 'No summary provided.'}</p>
        </div>

        <div className="border-t border-outline-variant pt-md">
          <p className="font-label-md text-label-md text-on-surface-variant mb-xs">Requirements ({jd.requirements.length})</p>
          <div className="flex flex-wrap gap-2">
            {jd.requirements.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-primary-container text-on-primary-container rounded-full font-body-sm text-body-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-outline-variant pt-md">
          <p className="font-label-md text-label-md text-on-surface-variant mb-xs">Resume</p>
          <p className="font-body-sm text-body-sm text-on-surface">{resume.file?.name ?? 'No file attached'}</p>
          <div className="flex flex-wrap gap-2 mt-sm">
            {resume.skills.map((skill) => (
              <span key={skill} className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-body-sm text-body-sm">
                {skill}
              </span>
            ))}
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-sm">
            {resume.workExperience.length} work experience {resume.workExperience.length === 1 ? 'entry' : 'entries'}
          </p>
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
        <Button onClick={onSave} disabled={saving} className="flex-1 md:flex-none ml-md">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          {saving ? 'Saving…' : 'Save Application'}
        </Button>
      </div>
    </div>
  )
}
