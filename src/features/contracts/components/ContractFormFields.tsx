import { Component, useEffect, useId, useState, type ErrorInfo, type ReactNode } from 'react'
import { useTranslation } from '@/i18n'
import type { Option } from '../utils/contractFormState'

/* ------------------------------------------------------------------ layout */

/** Card with a title. `wide` makes it span both columns of the dialog grid on md+ screens. */
export function Section({
  title,
  hint,
  wide = false,
  children,
}: {
  title: string
  hint?: string
  wide?: boolean
  children: ReactNode
}) {
  return (
    <section
      className={`border-line grid min-w-0 content-start gap-3 rounded-lg border p-4 ${wide ? 'md:col-span-2' : ''}`}
    >
      <div className="grid gap-0.5">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {hint ? <p className="text-muted text-sm">{hint}</p> : null}
      </div>
      <div className="grid gap-3">{children}</div>
    </section>
  )
}

/** Responsive field grid: 1 column on phones, 2 on tablets, 3 on wide screens. */
export function FieldGrid({ cols = 3, children }: { cols?: 2 | 3 | 4; children: ReactNode }) {
  const wide = cols === 4 ? 'sm:grid-cols-2 xl:grid-cols-4' : cols === 3 ? 'sm:grid-cols-2 xl:grid-cols-3' : 'sm:grid-cols-2'
  return <div className={`grid min-w-0 gap-3 ${wide}`}>{children}</div>
}

/** Inline validation message shown under a field. */
export function FieldError({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="text-danger text-sm">
      {children}
    </p>
  )
}

/** Small divider heading inside a section. */
export function SubHeading({ children }: { children: ReactNode }) {
  return <h4 className="border-line text-muted border-b pb-1 text-sm font-medium">{children}</h4>
}

/** Read-only label / value line used by the price summary. */
export function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-3 text-sm ${strong ? 'font-semibold' : ''}`}>
      <span className={strong ? '' : 'text-muted'}>{label}</span>
      <span dir="ltr" className="tabular-nums">
        {value}
      </span>
    </div>
  )
}

/* ---------------------------------------------------------------- controls */

export function Check({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint?: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="border-line bg-surface hover:border-brand/60 flex min-h-11 cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-sm">
      <input
        type="checkbox"
        className="accent-brand mt-0.5 size-4 shrink-0"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="grid gap-0.5">
        <span className="font-medium">{label}</span>
        {hint ? <span className="text-muted">{hint}</span> : null}
      </span>
    </label>
  )
}

const chipBase =
  'relative border-line bg-surface has-[:focus-visible]:ring-brand/40 has-[:checked]:border-brand has-[:checked]:bg-brand/10 has-[:checked]:text-brand inline-flex min-h-10 cursor-pointer items-center rounded-full border px-4 text-sm font-medium has-[:focus-visible]:ring-2'

/** Single choice shown as pill buttons (radio group). Wraps nicely on small screens. */
export function ChoiceGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Option[]
  onChange: (value: string) => void
}) {
  const name = useId()
  return (
    <fieldset className="grid min-w-0 gap-1.5">
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option.value} className={chipBase}>
            <input
              type="radio"
              name={name}
              className="sr-only"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

/** Multiple choice shown as toggle chips (checkbox group). */
export function MultiChoice({
  label,
  values,
  options,
  onChange,
}: {
  label: string
  values: string[]
  options: Option[]
  onChange: (values: string[]) => void
}) {
  const selected = Array.isArray(values) ? values : []
  return (
    <fieldset className="grid min-w-0 gap-1.5">
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const checked = selected.includes(option.value)
          return (
            <label key={option.value} className={chipBase}>
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={() =>
                  onChange(checked ? selected.filter((item) => item !== option.value) : [...selected, option.value])
                }
              />
              {option.label}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

/** Slider + number readout, used for the fuel level. */
export function PercentSlider({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      <span className="flex items-baseline justify-between">
        {label}
        <span dir="ltr" className="text-brand tabular-nums">
          {value || '0'}%
        </span>
      </span>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value || '0'}
        className="accent-brand h-11 w-full"
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

/**
 * File picker. On phones `accept="image/*"` lets the user choose camera or gallery.
 * Shows thumbnails for images and a remove button per file.
 */
export function FileField({
  label,
  files,
  onChange,
  accept = 'image/jpeg,image/png,image/webp,application/pdf',
  multiple = false,
}: {
  label: string
  files: File[]
  onChange: (files: File[]) => void
  accept?: string
  multiple?: boolean
}) {
  const { t } = useTranslation()
  const id = useId()
  const [previews, setPreviews] = useState<{ file: File; url?: string }[]>([])
  // Object URLs are created and revoked in the same effect, so StrictMode's double run stays safe.
  useEffect(() => {
    const next = files.map((file) => ({ file, url: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined }))
    setPreviews(next)
    return () => next.forEach((preview) => preview.url && URL.revokeObjectURL(preview.url))
  }, [files])

  return (
    <div className="relative grid min-w-0 gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <label
        htmlFor={id}
        className="border-line bg-surface hover:border-brand focus-within:border-brand flex min-h-11 min-w-0 cursor-pointer items-center gap-3 rounded-md border border-dashed px-3 py-2 text-sm"
      >
        <span className="text-brand shrink-0 font-medium">
          {multiple ? t('contracts.form.chooseFiles') : t('contracts.form.chooseFile')}
        </span>
        <span className="text-muted min-w-0 truncate">
          {files.length === 0
            ? t('contracts.form.noFileChosen')
            : files.length === 1
              ? files[0].name
              : t('contracts.form.filesSelected', { count: files.length })}
        </span>
      </label>
      <input
        id={id}
        type="file"
        className="sr-only"
        accept={accept}
        multiple={multiple}
        onChange={(event) => {
          const picked = Array.from(event.target.files ?? [])
          onChange(multiple ? [...files, ...picked] : picked.slice(0, 1))
          event.target.value = ''
        }}
      />
      {previews.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {previews.map(({ file, url }, index) => (
            <li key={`${file.name}-${index}`} className="border-line flex max-w-full items-center gap-2 rounded-md border p-1.5 text-xs">
              {url ? (
                <img src={url} alt="" className="size-10 shrink-0 rounded object-cover" />
              ) : (
                <span className="bg-surface grid size-10 shrink-0 place-items-center rounded font-medium">
                  {file.name.split('.').pop()?.slice(0, 4).toUpperCase()}
                </span>
              )}
              <span className="min-w-0 max-w-40 truncate">{file.name}</span>
              <button
                type="button"
                className="text-muted hover:text-danger min-h-8 px-2 text-base leading-none"
                aria-label={t('contracts.form.removeFile', { name: file.name })}
                onClick={() => onChange(files.filter((_, position) => position !== index))}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------ error boundary */

/** Shows the real error inside the modal instead of a blank screen, and logs it with the component stack. */
export class FormErrorBoundary extends Component<{ children: ReactNode; onReset?: () => void }, { error?: Error }> {
  state: { error?: Error } = {}

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Contract form crashed:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div role="alert" className="border-danger grid gap-2 rounded-lg border p-4 text-sm">
        <p className="font-semibold">Something went wrong in this form.</p>
        <pre className="text-muted whitespace-pre-wrap break-words">{this.state.error.message}</pre>
        <div>
          <button
            type="button"
            className="border-line min-h-10 rounded-md border px-4 font-medium"
            onClick={() => {
              this.setState({ error: undefined })
              this.props.onReset?.()
            }}
          >
            Try again
          </button>
        </div>
      </div>
    )
  }
}