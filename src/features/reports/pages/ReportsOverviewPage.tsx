import { Link } from 'react-router'
import { PERMISSIONS } from '@/app/router/access'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { appConfig } from '@/config/app.config'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useGetReportsOverviewQuery } from '@/features/reports/api/reportsApi'
import { KpiCard } from '@/features/reports/components/KpiCard'
import { ReportFiltersBar } from '@/features/reports/components/ReportFiltersBar'
import { useReportFilters } from '@/features/reports/hooks/useReportFilters'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

type ReportLink = {
  id: string
  to: string
  labelKey: string
  financial?: boolean
}

const LINKS: ReportLink[] = [
  { id: 'bookings', to: appConfig.routes.reportsBookings, labelKey: 'reports.nav.bookings' },
  { id: 'vehicles', to: appConfig.routes.reportsVehicles, labelKey: 'reports.nav.vehicles' },
  {
    id: 'utilization',
    to: appConfig.routes.reportsFleetUtilization,
    labelKey: 'reports.nav.fleetUtilization',
  },
  { id: 'customers', to: appConfig.routes.reportsCustomers, labelKey: 'reports.nav.customers' },
  { id: 'contracts', to: appConfig.routes.reportsContracts, labelKey: 'reports.nav.contracts' },
  {
    id: 'payments',
    to: appConfig.routes.reportsPayments,
    labelKey: 'reports.nav.payments',
    financial: true,
  },
  {
    id: 'receivables',
    to: appConfig.routes.reportsReceivables,
    labelKey: 'reports.nav.receivables',
    financial: true,
  },
  {
    id: 'expenses',
    to: appConfig.routes.reportsExpenses,
    labelKey: 'reports.nav.expenses',
    financial: true,
  },
  {
    id: 'maintenance',
    to: appConfig.routes.reportsMaintenance,
    labelKey: 'reports.nav.maintenance',
  },
  { id: 'fines', to: appConfig.routes.reportsFines, labelKey: 'reports.nav.fines' },
  {
    id: 'refunds',
    to: appConfig.routes.reportsRefunds,
    labelKey: 'reports.nav.refunds',
    financial: true,
  },
  {
    id: 'accounting',
    to: appConfig.routes.reportsAccounting,
    labelKey: 'reports.nav.accounting',
    financial: true,
  },
  { id: 'vat', to: appConfig.routes.reportsVat, labelKey: 'reports.nav.vat', financial: true },
  {
    id: 'einvoices',
    to: appConfig.routes.reportsEInvoices,
    labelKey: 'reports.nav.eInvoices',
    financial: true,
  },
]

export function ReportsOverviewPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('reports.title'))
  const { can } = usePermissions()
  const filters = useReportFilters()
  const query = useGetReportsOverviewQuery(filters.filters, { skip: !can(PERMISSIONS.reportsView) })
  const canFinancial = can(PERMISSIONS.reportsFinancial)

  return (
    <>
      <PageHeader title={t('reports.title')} description={t('reports.description')} />
      <div className="grid gap-4">
        <ReportFiltersBar
          preset={filters.preset}
          onPresetChange={filters.setPreset}
          presets={filters.presets}
          from={filters.from}
          to={filters.to}
          onFromChange={filters.setFrom}
          onToChange={filters.setTo}
          branchId={filters.branchId}
          onBranchChange={filters.setBranchId}
          legalEntityId={filters.legalEntityId}
          onLegalEntityChange={filters.setLegalEntityId}
        />

        <QueryState
          data={query.data}
          isLoading={query.isLoading}
          error={query.error}
          onRetry={query.refetch}
          isEmpty={() => false}
          emptyTitle={t('reports.empty')}
        >
          {(data) => {
            const booking = data.bookingPerformance as {
              total?: number
              cancellationRate?: number | null
            }
            const utilization = data.utilization as {
              utilizationPercent?: number | null
              rented?: number
              eligible?: number
            }
            const revenue = data.revenue as { amount?: string; currency?: string | null; count?: number }
            return (
              <div className="grid gap-4">
                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <KpiCard
                    label={t('reports.summary.bookings')}
                    value={String(booking?.total ?? 0)}
                    empty={(booking?.total ?? 0) === 0}
                    emptyLabel={t('reports.empty')}
                  />
                  <KpiCard
                    label={t('reports.summary.cancellationRate')}
                    value={booking?.cancellationRate == null ? '—' : `${booking.cancellationRate}%`}
                  />
                  <KpiCard
                    label={t('reports.summary.utilization')}
                    value={
                      utilization?.utilizationPercent == null
                        ? '—'
                        : `${utilization.utilizationPercent}%`
                    }
                    hint={`${utilization?.rented ?? 0} / ${utilization?.eligible ?? 0}`}
                  />
                  <KpiCard
                    label={t('reports.summary.revenue')}
                    value={
                      revenue?.currency
                        ? `${revenue.currency} ${revenue.amount ?? '0.00'}`
                        : String(revenue?.amount ?? '0.00')
                    }
                    empty={!canFinancial || (revenue?.count ?? 0) === 0}
                    emptyLabel={t('reports.empty')}
                  />
                </section>

                <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {LINKS.filter((link) => !link.financial || canFinancial).map((link) => (
                    <Link
                      key={link.id}
                      to={link.to}
                      className="border-line bg-surface hover:border-brand rounded-lg border p-4 transition-colors"
                    >
                      <span className="text-ink text-sm font-medium">{t(link.labelKey as never)}</span>
                    </Link>
                  ))}
                </section>
              </div>
            )
          }}
        </QueryState>
      </div>
    </>
  )
}
