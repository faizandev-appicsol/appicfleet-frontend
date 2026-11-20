import { useId, type ComponentProps } from 'react'
import { ChevronIcon } from '@/components/ui/icons'
import { cn } from '@/utils/cn'

const fieldClassName =
  'h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-[color-mix(in_srgb,var(--ui-surface)_80%,transparent)]'

const selectFieldClassName =
  'h-10 w-full appearance-none rounded-xl border border-line bg-surface ps-3 pe-10 text-sm text-ink outline-none transition-colors focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-[color-mix(in_srgb,var(--ui-surface)_80%,transparent)]'

type InputProps = ComponentProps<'input'> & {
  label: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, id, className, ...props }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = error ? `${inputId}-error` : undefined
  const hintId = hint && !error ? `${inputId}-hint` : undefined

  return (
    <div className="grid gap-1.5">
      <label htmlFor={inputId} className="text-ink text-sm font-medium">
        {label}
        {props.required ? <span className="text-danger ms-1">*</span> : null}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId ?? hintId}
        className={cn(
          fieldClassName,
          error && 'border-danger focus-visible:border-danger',
          className,
        )}
        {...props}
      />
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

type SelectOption = {
  value: string
  label: string
}

type SelectProps = Omit<ComponentProps<'select'>, 'children'> & {
  label?: string
  error?: string
  options: readonly SelectOption[]
}

export function Select({ label, error, options, id, className, ...props }: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const errorId = error ? `${selectId}-error` : undefined

  return (
    <div className="grid gap-1.5">
      {label ? (
        <label htmlFor={selectId} className="text-ink text-sm font-medium">
          {label}
          {props.required ? <span className="text-danger ms-1">*</span> : null}
        </label>
      ) : null}
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={cn(selectFieldClassName, error && 'border-danger', className)}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronIcon
          aria-hidden
          className="text-muted pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 rotate-90"
        />
      </div>
      {error ? (
        <p id={errorId} className="text-danger text-sm">
          {error}
        </p>
      ) : null}
    </div>
  )
}
