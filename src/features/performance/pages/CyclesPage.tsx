import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { PERMISSIONS } from '@/app/router/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import {
  useGetPerformanceCyclesQuery,
  useTransitionPerformanceCycleMutation,
} from '@/features/performance/api/performanceApi'
import { cycleStatusOptions } from '@/features/performance/statusOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

export function CyclesPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('performance.cycles.title'))
  const { can } = usePermissions()
  const { page, setPage } = useSearchPagination()
  const query = useGetPerformanceCyclesQuery({ page, pageSize: 20 })
  const [transition] = useTransitionPerformanceCycleMutation()

  return (
    <>
      <PageHeader
        title={t('performance.cycles.title')}
        description={t('performance.cycles.description')}
      />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => !Array.isArray(data.items) || data.items.length === 0}
        emptyTitle={t('performance.cycles.emptyTitle')}
        emptyDescription={t('performance.cycles.emptyDescription')}
      >
        {(data) => {
          const items = (data.items ?? []) as Array<Record<string, unknown>>
          return (
            <div className="grid gap-3">
              <div className="border-line bg-surface overflow-hidden rounded-lg border">
                <Table className="table-fixed">
                  <THead>
                    <TR>
                      <TH className="w-[36%]">{t('common.name')}</TH>
                      <TH className="w-[18%]">{t('common.status')}</TH>
                      <TH className="w-[20%]">{t('performance.cycles.columns.type')}</TH>
                      <TH className="w-[26%]">{t('common.actions')}</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {items.map((row) => {
                      const id = String(row.id)
                      const status = String(row.status)
                      return (
                        <TR key={id}>
                          <TD className="font-medium">{String(row.name ?? '—')}</TD>
                          <TD>
                            <StatusBadge value={status} options={cycleStatusOptions} />
                          </TD>
                          <TD>{String(row.reviewType ?? '—')}</TD>
                          <TD>
                            {status === 'CONFIGURING' && can(PERMISSIONS.performanceCycleUpdate) ? (
                              <Button
                                type="button"
                                onClick={() => void transition({ id, status: 'OPEN' })}
                              >
                                {t('performance.actions.open')}
                              </Button>
                            ) : null}
                            {status === 'DRAFT' && can(PERMISSIONS.performanceCycleUpdate) ? (
                              <Button
                                type="button"
                                onClick={() => void transition({ id, status: 'CONFIGURING' })}
                              >
                                {t('performance.actions.configure')}
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
