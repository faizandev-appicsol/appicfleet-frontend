import { Spinner } from '@/components/ui/Spinner'
import { useTranslation } from '@/i18n'
import { cn } from '@/utils/cn'

export function LoadingState({
  label,
  fullscreen = false,
}: {
  label?: string
  fullscreen?: boolean
}) {
  const { t } = useTranslation()
  const text = label ?? t('feedback.loadingTitle')

  return (
    <div
      className={cn(
        'text-muted grid place-items-center gap-3',
        fullscreen ? 'bg-canvas min-h-svh' : 'min-h-40',
      )}
      role="status"
      aria-live="polite"
    >
      <Spinner className="size-5" label={text} />
      <p className="text-sm">{text}</p>
    </div>
  )
}
