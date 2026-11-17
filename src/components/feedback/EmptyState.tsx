import type { ReactNode } from 'react'

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="border-line bg-surface grid justify-items-start gap-2 rounded-lg border border-dashed px-5 py-8">
      <h2 className="text-ink text-base font-semibold">{title}</h2>
      {description ? <p className="text-muted max-w-md text-sm">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}
