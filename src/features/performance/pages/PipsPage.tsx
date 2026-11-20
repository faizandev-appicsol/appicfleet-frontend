import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { useGetPerformancePipsQuery } from '@/features/performance/api/performanceApi'
import { pipStatusOptions } from '@/features/performance/statusOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

export function PipsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('performance.pips.title'))
  const { page, setPage } = useSearchPagination()
  const query = useGetPerformancePipsQuery({ page, pageSize: 20 })

  return (
    <>
      <PageHeader title={t('performance.pips.title')} description={t('performance.pips.description')} />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => !Array.isArray(data.items) || data.items.length === 0}
        emptyTitle={t('performance.pips.emptyTitle')}
        emptyDescription={t('performance.pips.emptyDescription')}
      >
        {(data) => {
          const items = (data.items ?? []) as Array<Record<string, unknown>>
          return (
            <div className="grid gap-3">
              <div className="border-line bg-surface overflow-hidden rounded-lg border">
                <Table className="table-fixed">
                  <THead>
                    <TR>
                      <TH className="w-[28%]">{t('performance.pips.columns.employee')}</TH>
                      <TH className="w-[18%]">{t('common.status')}</TH>
                      <TH className="w-[54%]">{t('performance.pips.columns.reason')}</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {items.map((row) => (
                      <TR key={String(row.id)}>
                        <TD dir="ltr">{String(row.employeeId ?? '—')}</TD>
                        <TD>
                          <StatusBadge value={String(row.status)} options={pipStatusOptions} />
                        </TD>
                        <TD>{String(row.reason ?? '—')}</TD>
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
