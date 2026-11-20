import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { PERMISSIONS } from '@/app/router/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import {
  useApproveRequisitionMutation,
  useGetRequisitionsQuery,
  useSubmitRequisitionMutation,
  useTransitionRequisitionMutation,
} from '@/features/recruitment/api/recruitmentApi'
import { requisitionStatusOptions } from '@/features/recruitment/statusOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

export function RequisitionsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('recruitment.requisitions.title'))
  const { can } = usePermissions()
  const { page, setPage } = useSearchPagination()
  const query = useGetRequisitionsQuery({ page, pageSize: 20 })
  const [submitReq] = useSubmitRequisitionMutation()
  const [approveReq] = useApproveRequisitionMutation()
  const [transitionReq] = useTransitionRequisitionMutation()

  return (
    <>
      <PageHeader
        title={t('recruitment.requisitions.title')}
        description={t('recruitment.requisitions.description')}
      />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => !Array.isArray(data.items) || data.items.length === 0}
        emptyTitle={t('recruitment.requisitions.emptyTitle')}
        emptyDescription={t('recruitment.requisitions.emptyDescription')}
      >
        {(data) => {
          const items = (data.items ?? []) as Array<Record<string, unknown>>
          return (
            <div className="grid gap-3">
              <div className="border-line bg-surface overflow-hidden rounded-lg border">
                <Table className="table-fixed">
                  <THead>
                    <TR>
                      <TH className="w-[16%]">{t('recruitment.requisitions.columns.number')}</TH>
                      <TH className="w-[28%]">{t('recruitment.requisitions.columns.title')}</TH>
                      <TH className="w-[14%]">{t('common.status')}</TH>
                      <TH className="w-[12%]">{t('recruitment.requisitions.columns.openings')}</TH>
                      <TH className="w-[30%]">{t('common.actions')}</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {items.map((row) => {
                      const id = String(row.id)
                      const status = String(row.status)
                      return (
                        <TR key={id}>
                          <TD dir="ltr">{String(row.requisitionNumber ?? '—')}</TD>
                          <TD className="font-medium">{String(row.jobTitle ?? '—')}</TD>
                          <TD>
                            <StatusBadge value={status} options={requisitionStatusOptions} />
                          </TD>
                          <TD>{String(row.openings ?? '—')}</TD>
                          <TD>
                            <div className="flex flex-wrap gap-2">
                              {status === 'DRAFT' && can(PERMISSIONS.requisitionUpdate) ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => void submitReq(id)}
                                >
                                  {t('recruitment.actions.submit')}
                                </Button>
                              ) : null}
                              {status === 'PENDING_APPROVAL' &&
                              can(PERMISSIONS.requisitionApprove) ? (
                                <>
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => void approveReq({ id, approve: true })}
                                  >
                                    {t('recruitment.actions.approve')}
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => void approveReq({ id, approve: false })}
                                  >
                                    {t('recruitment.actions.reject')}
                                  </Button>
                                </>
                              ) : null}
                              {status === 'APPROVED' && can(PERMISSIONS.requisitionUpdate) ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => void transitionReq({ id, status: 'OPEN' })}
                                >
                                  {t('recruitment.actions.open')}
                                </Button>
                              ) : null}
                              {status === 'OPEN' && can(PERMISSIONS.requisitionUpdate) ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => void transitionReq({ id, status: 'ON_HOLD' })}
                                >
                                  {t('recruitment.actions.hold')}
                                </Button>
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
