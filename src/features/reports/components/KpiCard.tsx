import { cn } from '@/utils/cn'

type KpiCardProps = {
  label: string
  value: string
  hint?: string
  changePercent?: number | null
  empty?: boolean
  emptyLabel?: string
  className?: string
}

export function KpiCard({
  label,
  value,
  hint,
  changePercent,
  empty,
  emptyLabel,
  className,
}: KpiCardProps) {
  if (empty) {
    return (
      <article className={cn('border-line bg-surface rounded-lg border p-4', className)}>
        <p className="text-muted text-sm">{label}</p>
        <p className="text-muted mt-3 text-sm">{emptyLabel ?? 'No data available'}</p>
      </article>
    )
  }

  const change =
    changePercent == null
      ? null
      : changePercent > 0
        ? `+${changePercent}%`
        : `${changePercent}%`

  return (
    <article className={cn('border-line bg-surface rounded-lg border p-4', className)}>
      <p className="text-muted text-sm">{label}</p>
      <p className="text-ink mt-2 text-2xl font-semibold tracking-tight" dir="ltr">
        {value}
      </p>
      {change != null ? (
        <p
          className={cn(
            'mt-2 text-sm',
            changePercent! > 0 ? 'text-success' : changePercent! < 0 ? 'text-danger' : 'text-muted',
          )}
          dir="ltr"
        >
          {change}
        </p>
      ) : null}
      {hint ? <p className="text-muted mt-2 text-xs">{hint}</p> : null}
    </article>
  )
}
