import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

type CardProps = {
  title?: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function Card({ title, description, action, children, className }: CardProps) {
  return (
    <section className={cn('border-line bg-surface rounded-lg border', className)}>
      {title || action ? (
        <header className="border-line flex items-start justify-between gap-4 border-b px-5 py-4">
          <div>
            {title ? <h2 className="text-ink text-base font-semibold">{title}</h2> : null}
            {description ? <p className="text-muted mt-1 text-sm">{description}</p> : null}
          </div>
          {action}
        </header>
      ) : null}
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}
