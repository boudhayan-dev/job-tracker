import { Link, useLocation } from 'react-router-dom'

export default function BottomNav() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <nav className="bg-surface dark:bg-inverse-surface fixed bottom-0 w-full z-50 rounded-t-xl border-t border-outline-variant dark:border-outline shadow-sm md:hidden">
      <div className="flex justify-around items-center w-full h-16 px-gutter">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center rounded-full px-lg py-xs active:scale-90 transition-transform duration-150 ${
            isHome
              ? 'bg-primary-container dark:bg-primary text-on-primary-container dark:text-on-primary'
              : 'text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors'
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${isHome ? 1 : 0}` }}>
            home
          </span>
          <span className="font-label-md text-[10px] leading-[12px] mt-xs">Home</span>
        </Link>
        <Link
          to="/track"
          className="flex flex-col items-center justify-center text-on-surface-variant dark:text-surface-variant px-lg py-xs hover:text-primary dark:hover:text-primary-fixed transition-colors active:scale-90 duration-150"
        >
          <span className="material-symbols-outlined">add_circle</span>
          <span className="font-label-md text-[10px] leading-[12px] mt-xs">Track</span>
        </Link>
      </div>
    </nav>
  )
}
