import { useNavigate } from 'react-router-dom'
import { useIdentity } from '../lib/useIdentity'

type Props = {
  title?: string
  showBack?: boolean
}

function initialsFor(name: string | null, email: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    return parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() : parts[0][0].toUpperCase()
  }
  if (email) return email[0].toUpperCase()
  return ''
}

export default function TopAppBar({ title = 'CareerRecall', showBack = false }: Props) {
  const navigate = useNavigate()
  const { name, email, photoUrl } = useIdentity()
  const label = name ?? email ?? undefined

  return (
    <header className="bg-surface dark:bg-inverse-surface w-full sticky top-0 z-40 border-b border-outline-variant dark:border-outline">
      <div className="flex items-center justify-between px-md py-sm max-w-screen-xl mx-auto h-14">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            className="text-on-surface-variant hover:bg-surface-container-low transition-colors active:scale-95 duration-100 p-sm rounded-full flex items-center justify-center"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        ) : (
          <span className="w-8" />
        )}
        <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">
          {title}
        </h1>
        <div
          title={label}
          className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant flex items-center justify-center flex-shrink-0"
        >
          {photoUrl ? (
            <img src={photoUrl} alt={label ?? 'Profile'} className="w-full h-full object-cover" />
          ) : label ? (
            <span className="font-label-md text-label-md font-bold text-secondary">
              {initialsFor(name, email)}
            </span>
          ) : null}
        </div>
      </div>
    </header>
  )
}
