import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export function Table({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full border-collapse text-start text-sm', className)}>{children}</table>
    </div>
  )
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-line text-muted border-b text-xs tracking-wide uppercase">
      {children}
    </thead>
  )
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-line divide-y">{children}</tbody>
}

export function TR({ children }: { children: ReactNode }) {
  return <tr>{children}</tr>
}

export function TH({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th className={cn('px-4 py-3 text-start align-middle font-medium whitespace-nowrap', className)}>
      {children}
    </th>
  )
}

export function TD({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn('text-ink px-4 py-3 text-start align-top', className)}>{children}</td>
}
