import { Link, useLocation } from 'react-router'
import { breadcrumbsForPath } from '@/config/navigation'
import { useTranslation } from '@/i18n'
import { cn } from '@/utils/cn'

export function Breadcrumbs({ className }: { className?: string }) {
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const keys = breadcrumbsForPath(pathname)

  if (keys.length === 0) return null

  return (
    <nav aria-label={t('common.breadcrumb')} className={cn('text-muted text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {keys.map((key, index) => {
          const label = t(key)
          const isLast = index === keys.length - 1
          return (
            <li key={key} className="inline-flex items-center gap-1.5">
              {index > 0 ? (
                <span aria-hidden="true" className="text-line">
                  /
                </span>
              ) : null}
              {isLast ? (
                <span className="text-ink font-medium" aria-current="page">
                  {label}
                </span>
              ) : (
                <Link to="/" className="hover:text-ink transition-colors">
                  {label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
