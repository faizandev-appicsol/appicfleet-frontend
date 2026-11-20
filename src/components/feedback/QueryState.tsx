import type { ReactNode } from 'react'
import { Alert } from '@/components/ui/Alert'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { useTranslation } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'

type QueryStateProps<T> = {
  data: T | undefined
  isLoading: boolean
  isFetching?: boolean
  error: unknown
  isEmpty: (data: T) => boolean
  onRetry?: () => void
  emptyTitle: string
  emptyDescription?: string
  children: (data: T) => ReactNode
}

export function QueryState<T>({
  data,
  isLoading,
  isFetching = false,
  error,
  isEmpty,
  onRetry,
  emptyTitle,
  emptyDescription,
  children,
}: QueryStateProps<T>) {
  const { t, tm } = useTranslation()

  if (data === undefined && (isLoading || !error)) {
    return <LoadingState />
  }

  if (data === undefined && error) {
    return <ErrorState error={error} onRetry={onRetry} />
  }

  if (data === undefined) return <LoadingState />

  return (
    <div className="grid gap-4">
      {error ? <Alert tone="danger">{tm(normalizeApiError(error).message)}</Alert> : null}
      {isFetching ? <p className="text-muted text-sm">{t('common.updating')}</p> : null}
      {isEmpty(data) ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        children(data)
      )}
    </div>
  )
}
