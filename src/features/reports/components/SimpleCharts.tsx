import { cn } from '@/utils/cn'

type Point = { label: string; value: number }

function maxOf(points: Point[]) {
  return Math.max(1, ...points.map((p) => p.value))
}

export function SimpleBarChart({
  title,
  points,
  emptyLabel,
  className,
}: {
  title: string
  points: Point[]
  emptyLabel: string
  className?: string
}) {
  if (points.length === 0) {
    return (
      <section className={cn('border-line bg-surface rounded-lg border p-4', className)} aria-label={title}>
        <h3 className="text-ink text-sm font-medium">{title}</h3>
        <p className="text-muted mt-6 text-sm">{emptyLabel}</p>
      </section>
    )
  }
  const max = maxOf(points)
  return (
    <section className={cn('border-line bg-surface rounded-lg border p-4', className)} aria-label={title}>
      <h3 className="text-ink text-sm font-medium">{title}</h3>
      <ul className="mt-4 grid gap-2" role="list">
        {points.map((point) => (
          <li key={point.label} className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-2">
            <span className="text-muted truncate text-xs" dir="ltr">
              {point.label}
            </span>
            <div className="bg-muted/20 h-2 overflow-hidden rounded">
              <div
                className="bg-brand h-full rounded"
                style={{ width: `${Math.max(4, (point.value / max) * 100)}%` }}
              />
            </div>
            <span className="text-ink text-xs tabular-nums" dir="ltr">
              {point.value}
            </span>
          </li>
        ))}
      </ul>
      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>
          {points.map((point) => (
            <tr key={point.label}>
              <th scope="row">{point.label}</th>
              <td>{point.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export function SimpleDonutChart({
  title,
  points,
  emptyLabel,
  className,
}: {
  title: string
  points: Point[]
  emptyLabel: string
  className?: string
}) {
  if (points.length === 0) {
    return (
      <section className={cn('border-line bg-surface rounded-lg border p-4', className)} aria-label={title}>
        <h3 className="text-ink text-sm font-medium">{title}</h3>
        <p className="text-muted mt-6 text-sm">{emptyLabel}</p>
      </section>
    )
  }
  const total = points.reduce((sum, p) => sum + p.value, 0) || 1
  let offset = 0
  const colors = ['var(--color-brand)', '#38bdf8', '#10b981', '#f59e0b', '#ef4444', '#6366f1']
  const segments = points.map((point, index) => {
    const pct = (point.value / total) * 100
    const dash = `${pct} ${100 - pct}`
    const seg = { ...point, dash, offset, color: colors[index % colors.length]! }
    offset -= pct
    return seg
  })

  return (
    <section className={cn('border-line bg-surface rounded-lg border p-4', className)} aria-label={title}>
      <h3 className="text-ink text-sm font-medium">{title}</h3>
      <div className="mt-4 flex flex-wrap items-center gap-6">
        <svg viewBox="0 0 36 36" className="size-28 shrink-0" role="img" aria-hidden>
          {segments.map((seg) => (
            <circle
              key={seg.label}
              cx="18"
              cy="18"
              r="15.915"
              fill="transparent"
              stroke={seg.color}
              strokeWidth="3.5"
              strokeDasharray={seg.dash}
              strokeDashoffset={seg.offset}
            />
          ))}
        </svg>
        <ul className="grid gap-1.5 text-sm">
          {points.map((point, index) => (
            <li key={point.label} className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-sm"
                style={{ background: colors[index % colors.length] }}
                aria-hidden
              />
              <span className="text-ink">{point.label}</span>
              <span className="text-muted ms-auto tabular-nums" dir="ltr">
                {point.value}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
