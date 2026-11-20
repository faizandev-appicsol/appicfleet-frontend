import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { useGetDevelopmentPlansQuery } from '@/features/performance/api/performanceApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

export function DevelopmentPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('performance.development.title'))
  const { page, setPage } = useSearchPagination()
  const query = useGetDevelopmentPlansQuery({ page, pageSize: 20 })

  return (
    <>
      <PageHeader
        title={t('performance.development.title')}
        description={t('performance.development.description')}
      />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => !Array.isArray(data.items) || data.items.length === 0}
        emptyTitle={t('performance.development.emptyTitle')}
        emptyDescription={t('performance.development.emptyDescription')}
      >
        {(data) => {
          const items = (data.items ?? []) as Array<Record<string, unknown>>
          return (
            <div className="grid gap-3">
              <div className="border-line bg-surface overflow-hidden rounded-lg border">
                <Table className="table-fixed">
                  <THead>
                    <TR>
                      <TH className="w-[28%]">{t('performance.development.columns.employee')}</TH>
                      <TH className="w-[44%]">{t('performance.development.columns.objective')}</TH>
                      <TH className="w-[14%]">{t('common.status')}</TH>
                      <TH className="w-[14%]">{t('performance.development.columns.progress')}</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {items.map((row) => (
                      <TR key={String(row.id)}>
                        <TD dir="ltr">{String(row.employeeId ?? '—')}</TD>
                        <TD className="font-medium">{String(row.objective ?? '—')}</TD>
                        <TD>{String(row.status ?? '—')}</TD>
                        <TD dir="ltr">{String(row.progressPercent ?? '0.00')}%</TD>
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
