import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { PERMISSIONS } from '@/app/router/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import {
  useCancelInterviewMutation,
  useCompleteInterviewMutation,
  useGetInterviewsQuery,
} from '@/features/recruitment/api/recruitmentApi'
import { interviewStatusOptions } from '@/features/recruitment/statusOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

function formatInstant(value: unknown) {
  if (!value) return '—'
  const d = new Date(String(value))
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString()
}

export function InterviewsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('recruitment.interviews.title'))
  const { can } = usePermissions()
  const { page, setPage } = useSearchPagination()
  const query = useGetInterviewsQuery({ page, pageSize: 20 })
  const [complete] = useCompleteInterviewMutation()
  const [cancel] = useCancelInterviewMutation()

  return (
    <>
      <PageHeader
        title={t('recruitment.interviews.title')}
        description={t('recruitment.interviews.description')}
      />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => !Array.isArray(data.items) || data.items.length === 0}
        emptyTitle={t('recruitment.interviews.emptyTitle')}
        emptyDescription={t('recruitment.interviews.emptyDescription')}
      >
        {(data) => {
          const items = (data.items ?? []) as Array<Record<string, unknown>>
          return (
            <div className="grid gap-3">
              <div className="border-line bg-surface overflow-hidden rounded-lg border">
                <Table className="table-fixed">
                  <THead>
                    <TR>
                      <TH className="w-[18%]">{t('recruitment.interviews.columns.type')}</TH>
                      <TH className="w-[28%]">{t('recruitment.interviews.columns.when')}</TH>
                      <TH className="w-[16%]">{t('common.status')}</TH>
                      <TH className="w-[38%]">{t('common.actions')}</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {items.map((row) => {
                      const id = String(row.id)
                      const status = String(row.status)
                      return (
                        <TR key={id}>
                          <TD>{String(row.interviewType ?? '—')}</TD>
                          <TD dir="ltr">{formatInstant(row.scheduledStart)}</TD>
                          <TD>
                            <StatusBadge value={status} options={interviewStatusOptions} />
                          </TD>
                          <TD>
                            <div className="flex flex-wrap gap-2">
                              {['SCHEDULED', 'CONFIRMED', 'RESCHEDULED'].includes(status) &&
                              can(PERMISSIONS.interviewManage) ? (
                                <>
                                  <Button type="button" onClick={() => void complete(id)}>
                                    {t('recruitment.actions.complete')}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => void cancel(id)}
                                  >
                                    {t('recruitment.actions.cancel')}
                                  </Button>
                                </>
                              ) : null}
                            </div>
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
