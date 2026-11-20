import { useEffect, useId, useRef, useState } from 'react'
import { ChevronIcon } from '@/components/ui/icons'
import { cn } from '@/utils/cn'

export type FilterDropdownOption = {
  value: string
  label: string
}

type FilterDropdownProps = {
  'aria-label': string
  value: string
  options: readonly FilterDropdownOption[]
  onChange: (value: string) => void
  className?: string
}

/**
 * Custom filter dropdown with a rounded options panel.
 * Native `<select>` menus cannot style the OS popup border-radius.
 */
export function FilterDropdown({
  'aria-label': ariaLabel,
  value,
  options,
  onChange,
  className,
}: FilterDropdownProps) {
  const buttonId = useId()
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const selected = options.find((option) => option.value === value) ?? options[0]
  const label = selected?.label ?? ''

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className={cn('relative min-w-40', className)}>
      <button
        id={buttonId}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className={cn(
          'border-line bg-control/70 text-ink hover:border-brand/40 hover:bg-surface focus-visible:border-brand focus-visible:ring-brand/25 inline-flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-full border ps-3.5 pe-3 text-sm shadow-sm outline-none focus-visible:ring-2 dark:bg-white/5',
          open && 'border-brand bg-surface ring-brand/25 ring-2',
        )}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="min-w-0 truncate">{label}</span>
        <ChevronIcon
          aria-hidden
          className={cn(
            'text-muted size-4 shrink-0 motion-safe:transition-transform motion-safe:duration-normal',
            open ? '-rotate-90' : 'rotate-90',
          )}
        />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={buttonId}
          className="border-line bg-surface absolute inset-x-0 top-full z-30 mt-1.5 max-h-60 overflow-auto rounded-2xl border py-1.5 shadow-lg"
        >
          {options.map((option) => {
            const active = option.value === value
            return (
              <li key={option.value || '__all'}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={cn(
                    'w-full cursor-pointer px-3.5 py-2 text-start text-sm transition-colors',
                    active
                      ? 'bg-brand-soft text-brand font-medium'
                      : 'text-ink hover:bg-control dark:hover:bg-white/8',
                  )}
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                >
                  {option.label}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
