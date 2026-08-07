import type { InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & { icon?: string }

export default function Input({ icon, className = '', ...rest }: Props) {
  return (
    <div className={`relative ${className}`}>
      {icon && (
        <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
          {icon}
        </span>
      )}
      <input
        className={`w-full bg-surface border border-outline-variant rounded-lg ${icon ? 'pl-xl' : 'pl-md'} pr-md py-sm text-body-sm text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm`}
        {...rest}
      />
    </div>
  )
}
