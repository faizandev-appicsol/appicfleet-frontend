import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

type ModalProps = {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ open, title, description, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className="border-line bg-surface text-ink backdrop:bg-ink/50 w-[min(32rem,calc(100vw-2rem))] rounded-lg border p-0 shadow-xl"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      <div className="border-line border-b px-5 py-4">
        <h2 id={titleId} className="text-base font-semibold">
          {title}
        </h2>
        {description ? (
          <p id={descriptionId} className="text-muted mt-1 text-sm">
            {description}
          </p>
        ) : null}
      </div>
      <div className="px-5 py-4">{children}</div>
    </dialog>
  )
}

export function ModalActions({ children }: { children: ReactNode }) {
  return <div className="mt-5 flex justify-end gap-2">{children}</div>
}

export function ModalCloseButton({
  onClose,
  disabled,
}: {
  onClose: () => void
  disabled?: boolean
}) {
  return (
    <Button type="button" variant="secondary" onClick={onClose} disabled={disabled}>
      Cancel
    </Button>
  )
}
