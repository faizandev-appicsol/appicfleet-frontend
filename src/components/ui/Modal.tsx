import { useEffect, useId, useLayoutEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/Button'
import { CloseIcon } from '@/components/ui/icons'
import { cn } from '@/utils/cn'
import '@/components/ui/modal.css'

type ModalProps = {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ open, title, description, onClose, children }: ModalProps) {
  const titleId = useId()
  const descriptionId = useId()
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(open)

  useEffect(() => {
    if (open) {
      setMounted(true)
      const frame = window.requestAnimationFrame(() => setVisible(true))
      return () => window.cancelAnimationFrame(frame)
    }

    setVisible(false)
    const timer = window.setTimeout(() => setMounted(false), 180)
    return () => window.clearTimeout(timer)
  }, [open])

  // Freeze page scroll on #root only so the portaled modal stays viewport-fixed
  // and the always-on scrollbar does not disappear (no layout jump / sidebar gap).
  useLayoutEffect(() => {
    if (!open) return

    const root = document.getElementById('root')
    if (!root) return

    const scrollY = window.scrollY
    const previous = root.getAttribute('style')

    root.style.position = 'fixed'
    root.style.top = `-${scrollY}px`
    root.style.left = '0'
    root.style.right = '0'
    root.style.width = '100%'

    return () => {
      if (previous) root.setAttribute('style', previous)
      else root.removeAttribute('style')
      window.scrollTo(0, scrollY)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!mounted || typeof document === 'undefined') return null

  return createPortal(
    <div className="ui-modal-root" role="presentation">
      <button
        type="button"
        className={cn('ui-modal-backdrop', visible && 'ui-modal-backdrop-visible')}
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn('ui-modal-panel', visible && 'ui-modal-panel-visible')}
      >
        <div className="border-line flex items-start justify-between gap-3 border-b px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-semibold tracking-tight">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="text-muted mt-1 text-sm leading-relaxed">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="text-muted hover:text-ink hover:bg-canvas inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors"
            aria-label="Close"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>
        <div className="max-h-[min(70svh,32rem)] overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

export function ModalActions({ children }: { children: ReactNode }) {
  return <div className="mt-5 flex flex-wrap justify-end gap-2">{children}</div>
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
