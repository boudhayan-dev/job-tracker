import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary'

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    'bg-primary text-on-primary hover:bg-primary-container hover:shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)]',
  secondary:
    'bg-surface text-on-surface border border-surface-container-high hover:bg-surface-container-low',
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }

export default function Button({ variant = 'primary', className = '', children, ...rest }: Props) {
  return (
    <button
      className={`font-label-md text-label-md rounded-lg px-xl py-sm min-h-[48px] flex items-center justify-center gap-sm active:scale-95 transition-all duration-150 whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 ${VARIANT_CLASS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
