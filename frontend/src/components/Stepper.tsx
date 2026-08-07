const STEPS = ['JD Review', 'Resume', 'Confirm']

export default function Stepper({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="flex items-center justify-between max-w-md mx-auto mb-xl relative">
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-outline-variant -z-10 -translate-y-1/2" />
      {STEPS.map((label, i) => {
        const isActive = i === activeIndex
        const isDone = i < activeIndex
        return (
          <div key={label} className="flex flex-col items-center gap-sm bg-background px-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-label-md text-label-md border-2 border-background ${
                isActive || isDone
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-highest text-on-surface-variant'
              }`}
            >
              {isDone ? <span className="material-symbols-outlined text-[16px]">check</span> : i + 1}
            </div>
            <span
              className={`font-label-md text-label-md uppercase ${
                isActive ? 'text-primary' : 'text-on-surface-variant'
              }`}
            >
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
