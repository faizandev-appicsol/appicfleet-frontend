import { useId, type ComponentProps } from 'react'
import { cn } from '@/utils/cn'

const fieldClassName =
  'h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-60'

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
  label: string
  error?: string
  options: readonly SelectOption[]
}

export function Select({ label, error, options, id, className, ...props }: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const errorId = error ? `${selectId}-error` : undefined

  return (
    <div className="grid gap-1.5">
      <label htmlFor={selectId} className="text-ink text-sm font-medium">
        {label}
      </label>
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={cn(fieldClassName, error && 'border-danger', className)}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={errorId} className="text-danger text-sm">
          {error}
        </p>
      ) : null}
    </div>
  )
}
