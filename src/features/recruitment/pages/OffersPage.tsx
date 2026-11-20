import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { PERMISSIONS } from '@/app/router/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import {
  useApproveOfferMutation,
  useConvertHireMutation,
  useGetOffersQuery,
  useRespondOfferMutation,
  useSendOfferMutation,
  useSubmitOfferMutation,
} from '@/features/recruitment/api/recruitmentApi'
import { offerStatusOptions } from '@/features/recruitment/statusOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

export function OffersPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('recruitment.offers.title'))
  const { can } = usePermissions()
  const { page, setPage } = useSearchPagination()
  const query = useGetOffersQuery({ page, pageSize: 20 })
  const [submit] = useSubmitOfferMutation()
  const [approve] = useApproveOfferMutation()
  const [send] = useSendOfferMutation()
  const [respond] = useRespondOfferMutation()
  const [hire] = useConvertHireMutation()

  return (
    <>
      <PageHeader
        title={t('recruitment.offers.title')}
        description={t('recruitment.offers.description')}
      />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => !Array.isArray(data.items) || data.items.length === 0}
        emptyTitle={t('recruitment.offers.emptyTitle')}
        emptyDescription={t('recruitment.offers.emptyDescription')}
      >
        {(data) => {
          const items = (data.items ?? []) as Array<Record<string, unknown>>
          return (
            <div className="grid gap-3">
              <div className="border-line bg-surface overflow-hidden rounded-lg border">
                <Table className="table-fixed">
                  <THead>
                    <TR>
                      <TH className="w-[18%]">{t('recruitment.offers.columns.salary')}</TH>
                      <TH className="w-[14%]">{t('common.status')}</TH>
                      <TH className="w-[18%]">{t('recruitment.offers.columns.start')}</TH>
                      <TH className="w-[50%]">{t('common.actions')}</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {items.map((row) => {
                      const id = String(row.id)
                      const status = String(row.status)
                      return (
                        <TR key={id}>
                          <TD dir="ltr">
                            {String(row.baseSalary ?? '—')} {String(row.currency ?? '')}
                          </TD>
                          <TD>
                            <StatusBadge value={status} options={offerStatusOptions} />
                          </TD>
                          <TD dir="ltr">
                            {row.proposedStartDate
                              ? new Date(String(row.proposedStartDate)).toLocaleDateString()
                              : '—'}
                          </TD>
                          <TD>
                            <div className="flex flex-wrap gap-2">
                              {status === 'DRAFT' && can(PERMISSIONS.offerUpdate) ? (
                                <Button type="button" onClick={() => void submit(id)}>
                                  {t('recruitment.actions.submit')}
                                </Button>
                              ) : null}
                              {status === 'PENDING_APPROVAL' && can(PERMISSIONS.offerApprove) ? (
                                <>
                                  <Button
                                    type="button"
                                    onClick={() => void approve({ id, approve: true })}
                                  >
                                    {t('recruitment.actions.approve')}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => void approve({ id, approve: false })}
                                  >
                                    {t('recruitment.actions.reject')}
                                  </Button>
                                </>
                              ) : null}
                              {status === 'APPROVED' && can(PERMISSIONS.offerSend) ? (
                                <Button type="button" onClick={() => void send(id)}>
                                  {t('recruitment.actions.send')}
                                </Button>
                              ) : null}
                              {['SENT', 'VIEWED'].includes(status) &&
                              can(PERMISSIONS.offerUpdate) ? (
                                <>
                                  <Button
                                    type="button"
                                    onClick={() => void respond({ id, accept: true })}
                                  >
                                    {t('recruitment.actions.accept')}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => void respond({ id, accept: false })}
                                  >
                                    {t('recruitment.actions.reject')}
                                  </Button>
                                </>
                              ) : null}
                              {status === 'ACCEPTED' && can(PERMISSIONS.onboardingManage) ? (
                                <Button
                                  type="button"
                                  onClick={() => void hire({ offerId: id })}
                                >
                                  {t('recruitment.actions.convertHire')}
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
