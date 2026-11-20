import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { useGetPerformanceGoalsQuery } from '@/features/performance/api/performanceApi'
import { goalStatusOptions } from '@/features/performance/statusOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

export function GoalsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('performance.goals.title'))
  const { page, setPage } = useSearchPagination()
  const query = useGetPerformanceGoalsQuery({ page, pageSize: 20 })

  return (
    <>
      <PageHeader
        title={t('performance.goals.title')}
        description={t('performance.goals.description')}
      />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => !Array.isArray(data.items) || data.items.length === 0}
        emptyTitle={t('performance.goals.emptyTitle')}
        emptyDescription={t('performance.goals.emptyDescription')}
      >
        {(data) => {
          const items = (data.items ?? []) as Array<Record<string, unknown>>
          return (
            <div className="grid gap-3">
              <div className="border-line bg-surface overflow-hidden rounded-lg border">
                <Table className="table-fixed">
                  <THead>
                    <TR>
                      <TH className="w-[34%]">{t('performance.goals.columns.title')}</TH>
                      <TH className="w-[16%]">{t('performance.goals.columns.weight')}</TH>
                      <TH className="w-[16%]">{t('performance.goals.columns.progress')}</TH>
                      <TH className="w-[16%]">{t('common.status')}</TH>
                      <TH className="w-[18%]">{t('performance.goals.columns.employee')}</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {items.map((row) => (
                      <TR key={String(row.id)}>
                        <TD className="font-medium">{String(row.title ?? '—')}</TD>
                        <TD dir="ltr">{String(row.weight ?? '—')}%</TD>
                        <TD dir="ltr">{String(row.progressPercent ?? '0.00')}%</TD>
                        <TD>
                          <StatusBadge
                            value={String(row.status)}
                            options={goalStatusOptions}
                          />
                        </TD>
                        <TD dir="ltr">{String(row.employeeId ?? '—')}</TD>
                      </TR>
                    ))}
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
