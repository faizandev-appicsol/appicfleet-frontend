import { Button } from '@/components/ui/Button'
import { useTranslation } from '@/i18n'
import type { Paginated } from '@/types/pagination'

export function Pagination({
  data,
  page,
  onPageChange,
  disabled = false,
}: {
  data: Pick<Paginated<unknown>, 'page' | 'pageSize' | 'total'>
  page: number
  onPageChange: (page: number) => void
  disabled?: boolean
}) {
  const { t } = useTranslation()
  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize))
  const rangeStart = data.total > 0 ? (data.page - 1) * data.pageSize + 1 : 0
  const rangeEnd = Math.min(data.page * data.pageSize, data.total)

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted text-sm">
        {t('pagination.showing', { start: rangeStart, end: rangeEnd, total: data.total })}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={page <= 1 || disabled}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          {t('pagination.previous')}
        </Button>
        <span className="text-muted text-sm">
          {t('pagination.pageOf', { page: data.page, total: totalPages })}
        </span>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={page >= totalPages || disabled}
          onClick={() => onPageChange(page + 1)}
        >
          {t('pagination.next')}
        </Button>
      </div>
    </div>
  )
}
