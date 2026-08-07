import { useNavigate, useParams } from 'react-router-dom'
import { getMockResume } from '../lib/mockResume'

export default function ResumeViewer() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const resume = getMockResume(id ?? '')

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col font-body-sm antialiased text-on-surface bg-[rgba(25,28,30,0.85)]">
      <header className="bg-surface w-full sticky top-0 z-40 border-b border-outline-variant shadow-sm">
        <div className="flex items-center justify-between px-md py-sm max-w-screen-xl mx-auto h-16">
          <button
            aria-label="Close document viewer"
            onClick={() => navigate(-1)}
            className="p-2 text-on-surface-variant hover:bg-surface-container-low active:scale-95 duration-100 rounded-full transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <div className="flex-1 flex justify-center px-4 overflow-hidden text-center">
            <h1 className="font-headline-md text-headline-md font-bold text-primary truncate max-w-full">
              {resume.fileName}
            </h1>
          </div>
          <a
            href={resume.pdfUrl ?? undefined}
            aria-label="Download document"
            aria-disabled={!resume.pdfUrl}
            download
            className={`p-2 rounded-full transition-colors flex items-center justify-center ${
              resume.pdfUrl
                ? 'text-on-surface-variant hover:bg-surface-container-low active:scale-95 duration-100'
                : 'text-outline-variant pointer-events-none'
            }`}
          >
            <span className="material-symbols-outlined">download</span>
          </a>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto w-full p-margin-mobile md:p-margin-desktop flex justify-center items-start">
        {resume.pdfUrl ? (
          <iframe title={resume.fileName} src={resume.pdfUrl} className="w-full max-w-3xl h-full bg-white rounded" />
        ) : (
          <div className="bg-surface-container-lowest w-full max-w-3xl min-h-[1056px] shadow-lg rounded p-8 md:p-12 border border-surface-variant my-4 relative">
            <div className="space-y-8 text-on-surface">
              <div className="border-b border-surface-variant pb-6 mb-6">
                <h2 className="font-headline-lg text-headline-lg mb-2 text-on-background">{resume.name}</h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant">{resume.headline}</p>
                <div className="flex gap-4 mt-3 font-body-sm text-body-sm text-on-surface-variant flex-wrap">
                  {resume.contact.map((line, i) => (
                    <span key={line} className="flex items-center gap-4">
                      {i > 0 && <span className="text-outline-variant">•</span>}
                      {line}
                    </span>
                  ))}
                </div>
              </div>

              <section>
                <h3 className="font-headline-md text-headline-md mb-3 text-primary uppercase tracking-wide">Summary</h3>
                <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">{resume.summary}</p>
              </section>

              <section>
                <h3 className="font-headline-md text-headline-md mb-4 text-primary uppercase tracking-wide border-b border-surface-variant pb-2">
                  Experience
                </h3>
                <div className="space-y-6">
                  {resume.experience.map((job) => (
                    <div key={job.title}>
                      <div className="flex justify-between items-baseline mb-1 gap-md">
                        <h4 className="font-headline-md text-[16px] font-bold">{job.title}</h4>
                        <span className="font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
                          {job.dateRange}
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm italic text-on-surface-variant mb-2">{job.company}</p>
                      <ul className="list-disc list-outside ml-5 space-y-2 font-body-sm text-body-sm">
                        {job.bullets.map((bullet, i) => (
                          <li key={i}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="font-headline-md text-headline-md mb-4 text-primary uppercase tracking-wide border-b border-surface-variant pb-2">
                  Technical Skills
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resume.skillGroups.map((group) => (
                    <div key={group.label}>
                      <h4 className="font-label-md text-label-md text-on-surface-variant mb-2">{group.label}</h4>
                      <p className="font-body-sm text-body-sm">{group.items}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            <div className="absolute bottom-4 right-8 font-mono-sm text-mono-sm text-outline">Page 1 of 1</div>
          </div>
        )}
      </main>
    </div>
  )
}
