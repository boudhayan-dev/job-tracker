import type { HTMLAttributes } from 'react'

export default function Card({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-surface border border-outline-variant rounded-lg p-md hover:shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] hover:border-primary transition-all duration-200 ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
