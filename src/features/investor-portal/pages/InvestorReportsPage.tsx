import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { PERMISSIONS } from '@/app/router/access'
import { useAppSelector } from '@/app/hooks'
import { API_ENDPOINTS } from '@/config/constants'
import { env } from '@/config/env'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useGetInvestorReportsQuery } from '@/features/investor-portal/api/investorPortalApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation, type MessageKey } from '@/i18n'

function reportLabel(key: string, t: (key: MessageKey) => string) {
  const map: Record<string, MessageKey> = {
    fleet_performance: 'investorPortal.reports.fleetPerformance',
    revenue_summary: 'investorPortal.reports.revenueSummary',
    utilization: 'investorPortal.reports.utilization',
    contract_performance: 'investorPortal.reports.contractPerformance',
    vehicle_performance: 'investorPortal.reports.vehiclePerformance',
    financial_summary: 'investorPortal.reports.financialSummary',
  }
  return t(map[key] ?? 'investorPortal.reports.unknown')
}

export function InvestorReportsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('investorPortal.reports.title'))
  const { can } = usePermissions()
  const canExport = can(PERMISSIONS.investorExport)
  const accessToken = useAppSelector((state) => state.auth.accessToken)
  const query = useGetInvestorReportsQuery()

  async function exportReport(key: string) {
    const response = await fetch(
      `${env.apiUrl}${API_ENDPOINTS.investor}/reports/export?key=${encodeURIComponent(key)}`,
      {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        credentials: 'include',
      },
    )
    if (!response.ok) return
    const blob = await response.blob()
    const href = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = href
    anchor.download = `investor-${key}.csv`
    anchor.click()
    URL.revokeObjectURL(href)
  }

  return (
    <>
      <PageHeader
        title={t('investorPortal.reports.title')}
        description={t('investorPortal.reports.description')}
      />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => data.items.length === 0}
        emptyTitle={t('investorPortal.reports.emptyTitle')}
        emptyDescription={t('investorPortal.reports.emptyDescription')}
      >
        {(data) => (
          <ul className="grid gap-3">
            {data.items.map((item) => (
              <li
                key={item.key}
                className="border-line bg-surface flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3"
              >
                <div>
                  <p className="text-ink font-medium">{reportLabel(item.key, t)}</p>
                  <p className="text-muted text-sm">
                    {item.allowed
                      ? t('investorPortal.reports.allowed')
                      : t('investorPortal.reports.denied')}
                  </p>
                </div>
                {item.allowed && canExport ? (
                  <Button type="button" variant="secondary" onClick={() => void exportReport(item.key)}>
                    {t('investorPortal.reports.exportCsv')}
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </QueryState>
    </>
  )
}
