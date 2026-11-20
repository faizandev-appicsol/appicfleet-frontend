import type { ReactNode } from 'react'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { useTranslation } from '@/i18n'

export type DataTableColumn<T> = {
  id: string
  header: string
  cell: (row: T) => ReactNode
  className?: string
}

type DataTableProps<T> = {
  columns: readonly DataTableColumn<T>[]
  rows: readonly T[]
  rowKey: (row: T) => string
  isLoading?: boolean
  error?: unknown
  onRetry?: () => void
  emptyTitle?: string
  emptyDescription?: string
  loadingLabel?: string
}

/**
 * Reusable data-table foundation for future modules.
 * Supports loading / empty / error shells; sorting/filtering arrive later.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading = false,
  error,
  onRetry,
  emptyTitle,
  emptyDescription,
  loadingLabel,
}: DataTableProps<T>) {
  const { t } = useTranslation()

  if (isLoading) {
    return <LoadingState label={loadingLabel ?? t('common.loading')} />
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title={emptyTitle ?? t('feedback.emptyTitle')}
        description={emptyDescription ?? t('feedback.emptyDescription')}
      />
    )
  }

  return (
    <Table className="table-fixed">
      <THead>
        <TR>
          {columns.map((column) => (
            <TH key={column.id} className={column.className}>
              {column.header}
            </TH>
          ))}
        </TR>
      </THead>
      <TBody>
        {rows.map((row) => (
          <TR key={rowKey(row)}>
            {columns.map((column) => (
              <TD key={column.id} className={column.className}>
                {column.cell(row)}
              </TD>
            ))}
          </TR>
        ))}
      </TBody>
    </Table>
  )
}
