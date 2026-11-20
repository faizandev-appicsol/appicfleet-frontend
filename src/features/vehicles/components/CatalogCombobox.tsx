import { useId, useMemo, useState } from 'react'
import { ChevronIcon } from '@/components/ui/icons'
import { cn } from '@/utils/cn'

type CatalogComboboxProps = {
  label: string
  value: string
  options: readonly string[]
  required?: boolean
  error?: string
  hint?: string
  placeholder?: string
  onChange: (value: string) => void
}

/** Typeable catalog field: pick from saved options or enter a new value to persist on save. */
export function CatalogCombobox({
  label,
  value,
  options,
  required,
  error,
  hint,
  placeholder,
  onChange,
}: CatalogComboboxProps) {
  const inputId = useId()
  const listId = useId()
  const errorId = error ? `${inputId}-error` : undefined
  const hintId = hint && !error ? `${inputId}-hint` : undefined
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    const query = value.trim().toLowerCase()
    if (!query) return options
    return options.filter((option) => option.toLowerCase().includes(query))
  }, [options, value])

  return (
    <div className="relative grid gap-1.5">
      <label htmlFor={inputId} className="text-ink text-sm font-medium">
        {label}
        {required ? <span className="text-danger ms-1">*</span> : null}
      </label>
      <div className="relative">
        <input
          id={inputId}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId ?? hintId}
          autoComplete="off"
          value={value}
          placeholder={placeholder}
          required={required}
          className={cn(
            'border-line bg-surface text-ink placeholder:text-muted focus-visible:border-brand focus-visible:ring-brand/25 h-10 w-full rounded-xl border ps-3 pe-10 text-sm outline-none focus-visible:ring-2 dark:border-white/10',
            error && 'border-danger focus-visible:border-danger',
          )}
          onChange={(event) => {
            onChange(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Delay so option clicks register before the list closes.
            window.setTimeout(() => setOpen(false), 120)
          }}
        />
        <ChevronIcon
          aria-hidden
          className={cn(
            'text-muted pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 motion-safe:transition-transform motion-safe:duration-normal',
            open ? '-rotate-90' : 'rotate-90',
          )}
        />
      </div>
      {open && filtered.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="border-line bg-surface absolute inset-x-0 top-full z-20 mt-1 max-h-48 overflow-auto rounded-xl border py-1 shadow-md"
        >
          {filtered.map((option) => (
            <li key={option}>
              <button
                type="button"
                role="option"
                className="text-ink hover:bg-control w-full cursor-pointer px-3 py-2 text-start text-sm dark:hover:bg-white/8"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(option)
                  setOpen(false)
                }}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {error ? (
        <p id={errorId} className="text-danger text-sm">
          {error}
        </p>
      ) : null}
      {hint && !error ? (
        <p id={hintId} className="text-muted text-sm">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
