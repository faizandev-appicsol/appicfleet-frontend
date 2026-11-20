import { useId, type ComponentProps } from 'react'
import { cn } from '@/utils/cn'

type TextareaProps = ComponentProps<'textarea'> & {
  label: string
  error?: string
  hint?: string
}

export function Textarea({ label, error, hint, id, className, ...props }: TextareaProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const errorId = error ? `${fieldId}-error` : undefined
  const hintId = hint && !error ? `${fieldId}-hint` : undefined

  return (
    <div className="grid gap-1.5">
      <label htmlFor={fieldId} className="text-ink text-sm font-medium">
        {label}
        {props.required ? <span className="text-danger ms-1">*</span> : null}
      </label>
      <textarea
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId ?? hintId}
        className={cn(
          'border-line bg-surface text-ink placeholder:text-muted focus-visible:border-brand focus-visible:ring-brand/25 min-h-24 w-full rounded-xl border px-3 py-2 text-sm outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60',
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
