import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { KpiCard } from '@/features/reports/components/KpiCard'
import { useGetInvestorPerformanceQuery } from '@/features/investor-portal/api/investorPortalApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function InvestorPerformancePage() {
  const { t } = useTranslation()
  useDocumentTitle(t('investorPortal.performance.title'))
  const query = useGetInvestorPerformanceQuery({ preset: 'this_month' })

  return (
    <>
      <PageHeader
        title={t('investorPortal.performance.title')}
        description={t('investorPortal.performance.description')}
      />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={() => false}
        emptyTitle={t('investorPortal.emptyTitle')}
        emptyDescription={t('investorPortal.emptyDescription')}
      >
        {(data) => {
          const metrics = (data.metrics ?? {}) as Record<string, unknown>
          return (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <KpiCard
                label={t('investorPortal.kpis.fleetSize')}
                value={String(metrics.fleetSize ?? 0)}
              />
              <KpiCard
                label={t('investorPortal.kpis.activeVehicles')}
                value={String(metrics.activeVehicles ?? 0)}
              />
              <KpiCard
                label={t('investorPortal.kpis.utilization')}
                value={
                  metrics.utilizationPercent == null
                    ? '—'
                    : `${String(metrics.utilizationPercent)}%`
                }
              />
              <KpiCard
                label={t('investorPortal.kpis.activeContracts')}
                value={String(metrics.activeContracts ?? 0)}
              />
              <KpiCard
                label={t('investorPortal.kpis.revenue')}
                value={metrics.revenue == null ? '—' : String(metrics.revenue)}
              />
              <KpiCard
                label={t('investorPortal.kpis.avgRevenue')}
                value={
                  metrics.averageRevenuePerVehicle == null
                    ? '—'
                    : String(metrics.averageRevenuePerVehicle)
                }
              />
            </div>
          )
        }}
      </QueryState>
    </>
  )
}
