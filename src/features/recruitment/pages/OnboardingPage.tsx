import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { PERMISSIONS } from '@/app/router/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import {
  useCompleteOnboardingMutation,
  useGetOnboardingsQuery,
} from '@/features/recruitment/api/recruitmentApi'
import { onboardingStatusOptions } from '@/features/recruitment/statusOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

export function OnboardingPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('recruitment.onboarding.title'))
  const { can } = usePermissions()
  const { page, setPage } = useSearchPagination()
  const query = useGetOnboardingsQuery({ page, pageSize: 20 })
  const [complete] = useCompleteOnboardingMutation()

  return (
    <>
      <PageHeader
        title={t('recruitment.onboarding.title')}
        description={t('recruitment.onboarding.description')}
      />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => !Array.isArray(data.items) || data.items.length === 0}
        emptyTitle={t('recruitment.onboarding.emptyTitle')}
        emptyDescription={t('recruitment.onboarding.emptyDescription')}
      >
        {(data) => {
          const items = (data.items ?? []) as Array<Record<string, unknown>>
          return (
            <div className="grid gap-3">
              <div className="border-line bg-surface overflow-hidden rounded-lg border">
                <Table className="table-fixed">
                  <THead>
                    <TR>
                      <TH className="w-[28%]">{t('recruitment.onboarding.columns.employee')}</TH>
                      <TH className="w-[16%]">{t('recruitment.onboarding.columns.progress')}</TH>
                      <TH className="w-[16%]">{t('common.status')}</TH>
                      <TH className="w-[18%]">{t('recruitment.onboarding.columns.start')}</TH>
                      <TH className="w-[22%]">{t('common.actions')}</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {items.map((row) => {
                      const id = String(row.id)
                      const status = String(row.status)
                      return (
                        <TR key={id}>
                          <TD dir="ltr">{String(row.employeeId ?? '—')}</TD>
                          <TD>{String(row.progressPercent ?? 0)}%</TD>
                          <TD>
                            <StatusBadge value={status} options={onboardingStatusOptions} />
                          </TD>
                          <TD dir="ltr">
                            {row.startDate
                              ? new Date(String(row.startDate)).toLocaleDateString()
                              : '—'}
                          </TD>
                          <TD>
                            {status === 'IN_PROGRESS' && can(PERMISSIONS.onboardingComplete) ? (
                              <Button type="button" onClick={() => void complete({ id })}>
                                {t('recruitment.actions.complete')}
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
