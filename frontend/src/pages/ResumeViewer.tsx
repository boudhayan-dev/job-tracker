import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getApplication, resumeFileUrl } from '../lib/api'

export default function ResumeViewer() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [fileName, setFileName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getApplication(id)
      .then((detail) => setFileName(detail.resume?.fileName ?? null))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const pdfUrl = id && fileName ? resumeFileUrl(id) : null

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
              {fileName ?? 'Resume'}
            </h1>
          </div>
          <a
            href={pdfUrl ?? undefined}
            aria-label="Download document"
            aria-disabled={!pdfUrl}
            download
            className={`p-2 rounded-full transition-colors flex items-center justify-center ${
              pdfUrl
                ? 'text-on-surface-variant hover:bg-surface-container-low active:scale-95 duration-100'
                : 'text-outline-variant pointer-events-none'
            }`}
          >
            <span className="material-symbols-outlined">download</span>
          </a>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto w-full p-margin-mobile md:p-margin-desktop flex justify-center items-start">
        {loading ? (
          <p className="text-surface mt-xl">Loading…</p>
        ) : error ? (
          <p className="text-error-container mt-xl">{error}</p>
        ) : pdfUrl ? (
          <iframe title={fileName ?? 'Resume'} src={pdfUrl} className="w-full max-w-3xl h-full bg-white rounded" />
        ) : (
          <p className="text-surface mt-xl">No resume uploaded for this application yet.</p>
        )}
      </main>
    </div>
  )
}
