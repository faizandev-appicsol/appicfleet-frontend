import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export function Tooltip({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <span className={cn('group relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className="bg-ink text-canvas pointer-events-none absolute top-full left-1/2 z-40 mt-2 -translate-x-1/2 rounded-md px-2 py-1 text-xs whitespace-nowrap opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {label}
      </span>
    </span>
  )
}
