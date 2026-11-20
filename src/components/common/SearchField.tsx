import { SearchIcon } from '@/components/ui/icons'

/** Logical-property search input: the icon sits at the inline start in both LTR and RTL. */
export function SearchField({
  value,
  onChange,
  label,
  placeholder,
  showLabel = true,
}: {
  value: string
  onChange: (value: string) => void
  label: string
  placeholder: string
  /** When true (default), renders a visible label so the field aligns with Select filters. */
  showLabel?: boolean
}) {
  return (
    <div className="grid max-w-sm gap-1.5">
      {showLabel ? (
        <span className="text-ink text-sm font-medium">{label}</span>
      ) : null}
      <div className="relative">
        <SearchIcon className="text-muted pointer-events-none absolute start-3 top-1/2 -translate-y-1/2" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className="border-line bg-surface text-ink placeholder:text-muted focus-visible:border-brand focus-visible:ring-brand/25 h-10 w-full rounded-xl border ps-10 pe-3 text-sm outline-none focus-visible:ring-2"
        />
      </div>
    </div>
  )
}
