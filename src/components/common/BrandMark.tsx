import { appConfig } from '@/config/app.config'
import { cn } from '@/utils/cn'

export function BrandMark({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 text-inherit', className)}>
      <span className="bg-brand text-brand-contrast inline-flex size-9 items-center justify-center rounded-md text-sm font-semibold tracking-tight">
        FM
      </span>
      {compact ? null : (
        <span className="text-sm font-semibold tracking-tight">{appConfig.name}</span>
      )}
    </span>
  )
}
