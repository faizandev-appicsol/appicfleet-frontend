import type { ReactNode } from 'react'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { cn } from '@/utils/cn'

export function PageHeader({
  title,
  description,
  action,
  secondaryActions,
  status,
  showBreadcrumbs = true,
  className,
}: {
  title: string
  description?: string
  action?: ReactNode
  secondaryActions?: ReactNode
  status?: ReactNode
  showBreadcrumbs?: boolean
  className?: string
}) {
  return (
    <header className={cn('grid gap-3', className)}>
      {showBreadcrumbs ? <Breadcrumbs /> : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-ink text-2xl font-semibold tracking-tight">{title}</h1>
            {status}
          </div>
          {description ? (
            <p className="text-muted mt-1 max-w-2xl text-sm leading-relaxed">{description}</p>
          ) : null}
        </div>
        {action || secondaryActions ? (
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {secondaryActions}
            {action}
          </div>
        ) : null}
      </div>
    </header>
  )
}
