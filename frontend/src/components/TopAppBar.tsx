import { useNavigate } from 'react-router-dom'

type Props = {
  title?: string
  showBack?: boolean
}

export default function TopAppBar({ title = 'CareerRecall', showBack = false }: Props) {
  const navigate = useNavigate()
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
        <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant" />
      </div>
    </header>
  )
}
