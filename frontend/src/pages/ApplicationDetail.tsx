import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopAppBar from '../components/TopAppBar'
import BottomNav from '../components/BottomNav'
import StatusSelect from '../components/StatusSelect'
import { getMockDetail } from '../lib/mockApplicationDetail'
import type { ApplicationStatus } from '../lib/status'

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [detail, setDetail] = useState(() => getMockDetail(id ?? ''))

  const updateStatus = (status: ApplicationStatus) => {
    setDetail((d) => ({ ...d, status }))
    // Placeholder — real implementation PATCHes /api/applications/:id.
  }

  return (
    <div className="font-body-lg text-body-lg text-on-surface antialiased bg-background min-h-screen pb-[80px] md:pb-0">
      <TopAppBar showBack />
      <main className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-md md:py-xl grid grid-cols-1 md:grid-cols-12 gap-md md:gap-lg">
        {/* Header */}
        <section className="md:col-span-12 bg-surface-container-lowest border border-surface-container-highest rounded-xl p-md md:p-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center border border-outline-variant flex-shrink-0">
              <span className="font-headline-md text-headline-md font-bold text-secondary">
                {detail.company.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface">
                {detail.company}
              </h1>
              <h2 className="font-headline-md text-headline-md text-on-surface-variant">{detail.roleTitle}</h2>
            </div>
          </div>
          <StatusSelect status={detail.status} onChange={updateStatus} />
        </section>

        {/* Main content */}
        <div className="md:col-span-8 flex flex-col gap-md">
          <section className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-md md:p-lg">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Tailored Experience</h3>
            <div className="mb-md">
              <h4 className="font-label-md text-label-md text-on-surface-variant mb-sm uppercase">Highlighted Skills</h4>
              <div className="flex flex-wrap gap-xs">
                {detail.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-sm py-xs bg-surface-container-low rounded font-mono-sm text-mono-sm text-on-surface border border-surface-container-highest"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="border-t border-surface-container-highest pt-md">
              <h4 className="font-label-md text-label-md text-on-surface-variant mb-sm uppercase">Resume Bullets Used</h4>
              <div className="flex flex-col gap-sm">
                {detail.resumeBullets.map((bullet, i) => (
                  <div key={i} className="pb-sm border-b border-surface-container-highest last:border-0 last:pb-0">
                    <p className="font-body-sm text-body-sm text-on-surface">{bullet}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-[#EEF2FF] border border-[#C7D2FE] rounded-xl p-md md:p-lg shadow-sm">
            <h3 className="font-headline-md text-headline-md text-primary mb-sm flex items-center gap-sm">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                bolt
              </span>
              Recall Nudges
            </h3>
            <ul className="flex flex-col gap-sm">
              {detail.nudges.map((nudge, i) => (
                <li key={i} className="flex items-start gap-sm">
                  <span className="material-symbols-outlined text-primary mt-0.5 text-sm">check_circle</span>
                  <p className="font-body-sm text-body-sm text-on-surface font-semibold">{nudge}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-4 flex flex-col gap-md">
          <section className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-md">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-sm flex items-center gap-sm">
              <span className="material-symbols-outlined text-on-surface-variant">summarize</span>
              JD Summary
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{detail.jdSummary}</p>
          </section>

          <section className="flex flex-col gap-sm">
            <button
              onClick={() => navigate(`/applications/${id}/resume`)}
              className="w-full flex items-center justify-between p-md bg-surface-container-lowest border border-surface-container-highest rounded-xl hover:bg-surface-container-low hover:border-primary transition-all active:scale-95 group text-left focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            >
              <div className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-lg bg-error-container text-on-error-container flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined">picture_as_pdf</span>
                </div>
                <div>
                  <h4 className="font-headline-md text-[16px] font-semibold text-on-surface group-hover:text-primary transition-colors">
                    {detail.resumeFileName}
                  </h4>
                  <p className="font-body-sm text-sm text-on-surface-variant">{detail.resumeFileSizeLabel}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">open_in_new</span>
            </button>

            <button className="w-full flex items-center justify-between p-md bg-surface-container-lowest border border-surface-container-highest rounded-xl hover:bg-surface-container-low hover:border-primary transition-all active:scale-95 group text-left focus:outline-none focus:ring-2 focus:ring-primary shadow-sm">
              <div className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <div>
                  <h4 className="font-headline-md text-[16px] font-semibold text-on-surface group-hover:text-primary transition-colors">
                    Full JD Text
                  </h4>
                  <p className="font-body-sm text-sm text-on-surface-variant">View full posting</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">open_in_new</span>
            </button>
          </section>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
