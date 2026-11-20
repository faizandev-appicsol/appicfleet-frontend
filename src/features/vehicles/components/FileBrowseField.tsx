import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '@/utils/cn'
import { useTranslation } from '@/i18n'

/** Browse-style file picker for vehicle form uploads. */
export function FileBrowseField({
  label,
  hint,
  accept,
  multiple = false,
  error,
  onFilesChange,
  className,
  /** Shown when no new file is chosen (e.g. existing photo on edit). */
  currentFileLabel,
}: {
  label: string
  hint?: string
  accept?: string
  multiple?: boolean
  error?: string
  onFilesChange?: (files: FileList | null) => void
  className?: string
  currentFileLabel?: string
}) {
  const { t } = useTranslation()
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileLabel, setFileLabel] = useState('')

  useEffect(() => {
    setFileLabel('')
  }, [currentFileLabel])

  return (
    <div className={cn('grid gap-1.5', className)}>
      <label htmlFor={inputId} className="text-ink text-sm font-medium">
        {label}
      </label>
      <div className="border-line bg-surface flex h-10 overflow-hidden rounded-xl border dark:border-white/10">
        <button
          type="button"
          className="text-muted hover:text-ink min-w-0 flex-1 cursor-pointer truncate px-3 text-start text-sm"
          onClick={() => inputRef.current?.click()}
        >
          {fileLabel || currentFileLabel || t('vehicles.form.chooseFile')}
        </button>
        <button
          type="button"
          className="border-line bg-control text-ink hover:bg-brand-soft shrink-0 cursor-pointer border-s px-3 text-sm font-medium dark:bg-white/8"
          onClick={() => inputRef.current?.click()}
        >
          {t('vehicles.form.browse')}
        </button>
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(event) => {
            const files = event.target.files
            if (!files?.length) {
              setFileLabel('')
              onFilesChange?.(null)
              return
            }
            setFileLabel(
              files.length === 1
                ? files[0]!.name
                : t('vehicles.form.filesSelected', { count: files.length }),
            )
            onFilesChange?.(files)
          }}
        />
      </div>
      {error ? <p className="text-danger text-sm">{error}</p> : null}
      {hint && !error ? <p className="text-muted text-sm">{hint}</p> : null}
    </div>
  )
}
