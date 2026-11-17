import { cn } from '@/utils/cn'

export function Spinner({ className, label = 'Loading' }: { className?: string; label?: string }) {
  return (
    <span className="inline-flex items-center gap-2" role="status">
      <span
        className={cn(
          'size-4 rounded-full border-2 border-current border-r-transparent motion-safe:animate-spin',
          className,
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  )
}
