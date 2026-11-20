import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CloseIcon } from '@/components/ui/icons'
import { useTranslation } from '@/i18n'
import { cn } from '@/utils/cn'

export function Drawer({
  open,
  title,
  onClose,
  children,
  side = 'end',
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  side?: 'start' | 'end'
}) {
  const { t } = useTranslation()

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[var(--z-modal)]" role="presentation">
      <button
        type="button"
        className="bg-ink/40 absolute inset-0 cursor-pointer"
        aria-label={t('common.close')}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'border-line bg-surface text-ink absolute inset-y-0 flex w-[min(24rem,100vw)] flex-col border shadow-lg',
          side === 'end' ? 'end-0' : 'start-0',
        )}
      >
        <div className="border-line flex items-center justify-between gap-3 border-b px-4 py-3">
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          <button
            type="button"
            className="text-muted hover:text-ink hover:bg-canvas inline-flex size-9 cursor-pointer items-center justify-center rounded-md"
            aria-label={t('common.close')}
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
      </aside>
    </div>,
    document.body,
  )
}
