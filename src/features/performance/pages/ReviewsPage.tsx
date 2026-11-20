import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { PERMISSIONS } from '@/app/router/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import {
  useFinalizePerformanceReviewMutation,
  useGetPerformanceReviewsQuery,
} from '@/features/performance/api/performanceApi'
import { reviewStatusOptions } from '@/features/performance/statusOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

export function ReviewsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('performance.reviews.title'))
  const { can } = usePermissions()
  const { page, setPage } = useSearchPagination()
  const query = useGetPerformanceReviewsQuery({ page, pageSize: 20 })
  const [finalize] = useFinalizePerformanceReviewMutation()

  return (
    <>
      <PageHeader
        title={t('performance.reviews.title')}
        description={t('performance.reviews.description')}
      />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => !Array.isArray(data.items) || data.items.length === 0}
        emptyTitle={t('performance.reviews.emptyTitle')}
        emptyDescription={t('performance.reviews.emptyDescription')}
      >
        {(data) => {
          const items = (data.items ?? []) as Array<Record<string, unknown>>
          return (
            <div className="grid gap-3">
              <div className="border-line bg-surface overflow-hidden rounded-lg border">
                <Table className="table-fixed">
                  <THead>
                    <TR>
                      <TH className="w-[28%]">{t('performance.reviews.columns.employee')}</TH>
                      <TH className="w-[18%]">{t('common.status')}</TH>
                      <TH className="w-[16%]">{t('performance.reviews.columns.rating')}</TH>
                      <TH className="w-[38%]">{t('common.actions')}</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {items.map((row) => {
                      const id = String(row.id)
                      const status = String(row.status)
                      return (
                        <TR key={id}>
                          <TD dir="ltr">{String(row.employeeId ?? '—')}</TD>
                          <TD>
                            <StatusBadge value={status} options={reviewStatusOptions} />
                          </TD>
                          <TD>
                            {row.finalRating != null
                              ? String(row.finalRating)
                              : row.originalManagerRating != null
                                ? String(row.originalManagerRating)
                                : '—'}
                          </TD>
                          <TD>
                            {['FINAL_REVIEW', 'APPROVED'].includes(status) &&
                            can(PERMISSIONS.performanceReviewFinalize) ? (
                              <Button
                                type="button"
                                onClick={() =>
                                  void finalize({
                                    id,
                                    finalRating: Number(
                                      row.calibratedRating ?? row.originalManagerRating ?? 3,
                                    ),
                                  })
                                }
                              >
                                {t('performance.actions.finalize')}
                              </Button>
                            ) : null}
                          </TD>
                        </TR>
                      )
                    })}
                  </TBody>
                </Table>
              </div>
              <Pagination
                data={data as never}
                page={page}
                onPageChange={setPage}
                disabled={query.isFetching}
              />
            </div>
          )
        }}
      </QueryState>
    </>
  )
}
