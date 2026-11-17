import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/utils/cn'

export function LoadingState({
  label = 'Loading',
  fullscreen = false,
}: {
  label?: string
  fullscreen?: boolean
}) {
  return (
    <div
      className={cn(
        'text-muted grid place-items-center gap-3',
        fullscreen ? 'bg-canvas min-h-svh' : 'min-h-40',
      )}
      role="status"
      aria-live="polite"
    >
      <Spinner className="size-5" label={label} />
      <p className="text-sm">{label}</p>
    </div>
  )
}
