import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-ink text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className={cn('text-muted mt-1 max-w-2xl text-sm')}>{description}</p>
        ) : null}
      </div>
      {action}
    </header>
  )
}
