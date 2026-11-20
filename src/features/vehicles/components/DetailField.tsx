import type { ReactNode } from 'react'

/** A label/value pair for `<dl>` grids. Empty values render a muted placeholder. */
export function DetailField({
  label,
  children,
  placeholder,
  ltr = false,
}: {
  label: string
  children?: ReactNode
  placeholder: string
  /** Render the value left-to-right (identifiers, numbers, codes). */
  ltr?: boolean
}) {
  const empty = children === undefined || children === null || children === ''

  return (
    <div className="grid min-w-0 gap-1">
      <dt className="text-muted text-xs font-medium tracking-wide uppercase">{label}</dt>
      <dd className="text-ink text-sm break-words">
        {empty ? (
          <span className="text-muted">{placeholder}</span>
        ) : ltr ? (
          <span dir="ltr">{children}</span>
        ) : (
          children
        )}
      </dd>
    </div>
  )
}
