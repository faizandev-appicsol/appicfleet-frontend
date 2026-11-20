import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  useGetLeaveBalancesQuery,
  useGetLeaveRequestsQuery,
} from '@/features/workforce/api/workforceApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function LeavePage() {
  const { t } = useTranslation()
  useDocumentTitle(t('workforce.leave.title'))
  const balances = useGetLeaveBalancesQuery({ page: 1, pageSize: 50 })
  const requests = useGetLeaveRequestsQuery({ page: 1, pageSize: 50 })

  return (
    <>
      <PageHeader title={t('workforce.leave.title')} description={t('workforce.leave.description')} />

      <section className="mb-6" aria-labelledby="leave-balances">
        <h2 id="leave-balances" className="mb-2 text-base font-semibold">
          {t('workforce.leave.balances')}
        </h2>
        <QueryState
          data={balances.data}
          isLoading={balances.isLoading}
          isFetching={balances.isFetching && !balances.isLoading}
          error={balances.error}
          onRetry={balances.refetch}
          isEmpty={(data) => !Array.isArray(data.items) || data.items.length === 0}
          emptyTitle={t('workforce.leave.emptyBalancesTitle')}
          emptyDescription={t('workforce.leave.emptyBalancesDescription')}
        >
          {(data) => {
            const items = (data.items ?? []) as Array<Record<string, unknown>>
            return (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full table-fixed border-collapse text-sm">
                  <thead className="bg-muted/40 text-left">
                    <tr>
                      <th className="p-3 font-medium">{t('workforce.leave.year')}</th>
                      <th className="p-3 font-medium">{t('workforce.leave.opening')}</th>
                      <th className="p-3 font-medium">{t('workforce.leave.accrued')}</th>
                      <th className="p-3 font-medium">{t('workforce.leave.used')}</th>
                      <th className="p-3 font-medium">{t('workforce.leave.pending')}</th>
                      <th className="p-3 font-medium">{t('workforce.leave.available')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((row) => (
                      <tr key={String(row.id)} className="border-t border-border">
                        <td className="p-3">{String(row.periodYear ?? '—')}</td>
                        <td className="p-3">{String(row.openingDays ?? '—')}</td>
                        <td className="p-3">{String(row.accruedDays ?? '—')}</td>
                        <td className="p-3">{String(row.usedDays ?? '—')}</td>
                        <td className="p-3">{String(row.pendingDays ?? '—')}</td>
                        <td className="p-3 font-medium">{String(row.availableDays ?? '—')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }}
        </QueryState>
      </section>

      <section aria-labelledby="leave-requests">
        <h2 id="leave-requests" className="mb-2 text-base font-semibold">
          {t('workforce.leave.requests')}
        </h2>
        <QueryState
          data={requests.data}
          isLoading={requests.isLoading}
          isFetching={requests.isFetching && !requests.isLoading}
          error={requests.error}
          onRetry={requests.refetch}
          isEmpty={(data) => !Array.isArray(data.items) || data.items.length === 0}
          emptyTitle={t('workforce.leave.emptyRequestsTitle')}
          emptyDescription={t('workforce.leave.emptyRequestsDescription')}
        >
          {(data) => {
            const items = (data.items ?? []) as Array<Record<string, unknown>>
            return (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full table-fixed border-collapse text-sm">
                  <thead className="bg-muted/40 text-left">
                    <tr>
                      <th className="p-3 font-medium">{t('workforce.leave.start')}</th>
                      <th className="p-3 font-medium">{t('workforce.leave.end')}</th>
                      <th className="p-3 font-medium">{t('workforce.leave.days')}</th>
                      <th className="p-3 font-medium">{t('workforce.leave.status')}</th>
                      <th className="p-3 font-medium">{t('workforce.leave.dayPart')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((row) => (
                      <tr key={String(row.id)} className="border-t border-border">
                        <td className="p-3">{String(row.startDate ?? '—')}</td>
                        <td className="p-3">{String(row.endDate ?? '—')}</td>
                        <td className="p-3">{String(row.daysRequested ?? '—')}</td>
                        <td className="p-3">
                          <span aria-label={String(row.status)}>{String(row.status ?? '—')}</span>
                        </td>
                        <td className="p-3">{String(row.dayPart ?? '—')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }}
        </QueryState>
      </section>
    </>
  )
}
