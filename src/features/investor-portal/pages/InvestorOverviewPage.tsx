import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { KpiCard } from '@/features/reports/components/KpiCard'
import { useGetInvestorOverviewQuery } from '@/features/investor-portal/api/investorPortalApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function InvestorOverviewPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('investorPortal.overview.title'))
  const query = useGetInvestorOverviewQuery({ preset: 'this_month' })

  return (
    <>
      <PageHeader
        title={t('investorPortal.overview.title')}
        description={t('investorPortal.overview.description')}
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
        {(data) => (
          <div className="grid gap-6">
            <p className="text-muted text-sm">
              {t('investorPortal.welcome', { name: data.investor.displayName })}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <KpiCard label={t('investorPortal.kpis.fleetSize')} value={String(data.kpis.fleetSize)} />
              <KpiCard
                label={t('investorPortal.kpis.activeVehicles')}
                value={String(data.kpis.activeVehicles)}
              />
              <KpiCard
                label={t('investorPortal.kpis.utilization')}
                value={
                  data.kpis.utilizationPercent == null
                    ? '—'
                    : `${data.kpis.utilizationPercent}%`
                }
              />
              <KpiCard
                label={t('investorPortal.kpis.activeContracts')}
                value={String(data.kpis.activeContracts)}
              />
              {data.permissions.financial ? (
                <>
                  <KpiCard
                    label={t('investorPortal.kpis.revenue')}
                    value={data.kpis.revenue ?? '—'}
                    hint={data.kpis.currency ?? undefined}
                  />
                  <KpiCard
                    label={t('investorPortal.kpis.avgRevenue')}
                    value={data.kpis.averageRevenuePerVehicle ?? '—'}
                  />
                </>
              ) : null}
            </div>
          </div>
        )}
      </QueryState>
    </>
  )
}
