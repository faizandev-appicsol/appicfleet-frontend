import { Link } from 'react-router'
import { PERMISSIONS } from '@/app/router/access'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { appConfig } from '@/config/app.config'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { KpiCard } from '@/features/reports/components/KpiCard'
import { ReportFiltersBar } from '@/features/reports/components/ReportFiltersBar'
import { SimpleBarChart, SimpleDonutChart } from '@/features/reports/components/SimpleCharts'
import { useGetDashboardOverviewQuery } from '@/features/reports/api/reportsApi'
import { useReportFilters } from '@/features/reports/hooks/useReportFilters'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'
import { formatDateTime } from '@/utils/formatDate'

function moneyLabel(currency: string | null | undefined, amount: string | null | undefined) {
  if (amount == null) return '—'
  return currency ? `${currency} ${amount}` : amount
}

export function DashboardPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('dashboard.title'))
  const { can } = usePermissions()
  const filters = useReportFilters()
  const canView = can(PERMISSIONS.dashboardView)
  const query = useGetDashboardOverviewQuery(filters.filters, { skip: !canView })

  if (!canView) {
    return (
      <>
        <PageHeader title={t('dashboard.title')} description={t('dashboard.description')} />
        <p className="text-muted text-sm">{t('feedback.permissionDescription')}</p>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title={t('dashboard.title')}
        description={t('dashboard.description')}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {query.data?.generatedAt ? (
              <span className="text-muted text-xs" dir="ltr">
                {t('dashboard.lastUpdated')}: {formatDateTime(query.data.generatedAt)}
              </span>
            ) : null}
            <Button type="button" variant="secondary" onClick={() => void query.refetch()} disabled={query.isFetching}>
              {t('dashboard.refresh')}
            </Button>
            {can(PERMISSIONS.reportsView) ? (
              <Link
                to={appConfig.routes.reports}
                className="border-line text-ink hover:bg-muted/20 inline-flex h-10 items-center rounded-md border px-3 text-sm"
              >
                {t('navigation.reports')}
              </Link>
            ) : null}
          </div>
        }
      />

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
          isFetching={query.isFetching && !query.isLoading}
          error={query.error}
          onRetry={query.refetch}
          isEmpty={() => false}
          emptyTitle={t('dashboard.emptyTitle')}
        >
          {(data) => {
            const revenueEmpty = !data.permissions.financial || !data.kpis.revenue || data.kpis.revenue.count === 0
            const bookingEmpty = data.kpis.bookings.total === 0
            const upcomingColumns: DataTableColumn<Record<string, unknown>>[] = [
              {
                id: 'contract',
                header: t('dashboard.columns.contract'),
                cell: (row) => String(row.contractNumber ?? '—'),
              },
              {
                id: 'customer',
                header: t('dashboard.columns.customer'),
                cell: (row) => String(row.customerName ?? '—'),
              },
              {
                id: 'vehicle',
                header: t('dashboard.columns.vehicle'),
                cell: (row) => String(row.vehiclePlate ?? '—'),
              },
              {
                id: 'endsAt',
                header: t('dashboard.columns.returnAt'),
                cell: (row) => (
                  <span dir="ltr">{formatDateTime(String(row.endsAt ?? ''))}</span>
                ),
              },
            ]

            return (
              <div className="grid gap-4">
                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <KpiCard
                    label={t('dashboard.kpis.revenue')}
                    value={moneyLabel(data.kpis.revenue?.currency, data.kpis.revenue?.amount)}
                    changePercent={data.kpis.revenue?.changePercent}
                    empty={revenueEmpty}
                    emptyLabel={t('dashboard.empty.revenue')}
                    hint={data.kpis.revenue?.definition}
                  />
                  <KpiCard
                    label={t('dashboard.kpis.bookings')}
                    value={String(data.kpis.bookings.total)}
                    changePercent={data.kpis.bookings.changePercent}
                    empty={bookingEmpty}
                    emptyLabel={t('dashboard.empty.bookings')}
                  />
                  <KpiCard
                    label={t('dashboard.kpis.activeContracts')}
                    value={String(data.kpis.activeContracts.count)}
                    hint={
                      data.kpis.activeContracts.overdueCount > 0
                        ? t('dashboard.kpis.overdueHint', {
                            count: data.kpis.activeContracts.overdueCount,
                          })
                        : undefined
                    }
                  />
                  <KpiCard
                    label={t('dashboard.kpis.fleetUtilization')}
                    value={
                      data.kpis.fleetUtilization.utilizationPercent == null
                        ? '—'
                        : `${data.kpis.fleetUtilization.utilizationPercent}%`
                    }
                    hint={`${data.kpis.fleetUtilization.rented} / ${data.kpis.fleetUtilization.eligible}`}
                    empty={data.kpis.fleetUtilization.eligible === 0}
                    emptyLabel={t('dashboard.empty.fleet')}
                  />
                  <KpiCard
                    label={t('dashboard.kpis.receivables')}
                    value={moneyLabel(
                      data.kpis.outstandingReceivables?.currency,
                      data.kpis.outstandingReceivables?.amount,
                    )}
                    empty={!data.permissions.financial || (data.kpis.outstandingReceivables?.count ?? 0) === 0}
                    emptyLabel={t('dashboard.empty.receivables')}
                  />
                  <KpiCard
                    label={t('dashboard.kpis.availableVehicles')}
                    value={String(data.kpis.fleetUtilization.available)}
                    empty={data.kpis.fleetUtilization.eligible === 0}
                    emptyLabel={t('dashboard.empty.fleet')}
                  />
                </section>

                <section className="grid gap-3 lg:grid-cols-2">
                  <SimpleBarChart
                    title={t('dashboard.charts.revenueTrend')}
                    emptyLabel={t('dashboard.empty.revenue')}
                    points={data.charts.revenueTrend.map((row) => ({
                      label: row.period,
                      value: Number(row.amount) || 0,
                    }))}
                  />
                  <SimpleBarChart
                    title={t('dashboard.charts.bookingTrend')}
                    emptyLabel={t('dashboard.empty.bookings')}
                    points={data.charts.bookingTrend.map((row) => ({
                      label: row.period,
                      value: row.count,
                    }))}
                  />
                  <SimpleDonutChart
                    title={t('dashboard.charts.fleetStatus')}
                    emptyLabel={t('dashboard.empty.fleet')}
                    points={Object.entries(data.charts.fleetStatus).map(([label, value]) => ({
                      label,
                      value,
                    }))}
                    className="lg:col-span-2"
                  />
                </section>

                <section className="grid gap-3 lg:grid-cols-2">
                  <div className="border-line bg-surface min-w-0 overflow-x-auto rounded-lg border">
                    <div className="border-line border-b px-4 py-3">
                      <h3 className="text-ink text-sm font-medium">{t('dashboard.sections.upcomingReturns')}</h3>
                    </div>
                    {data.operational.upcomingReturns.length === 0 ? (
                      <p className="text-muted p-4 text-sm">{t('dashboard.empty.upcoming')}</p>
                    ) : (
                      <DataTable
                        columns={upcomingColumns}
                        rows={data.operational.upcomingReturns as Array<Record<string, unknown>>}
                        rowKey={(row) => String(row.id)}
                      />
                    )}
                  </div>
                  <div className="border-line bg-surface min-w-0 overflow-x-auto rounded-lg border">
                    <div className="border-line border-b px-4 py-3">
                      <h3 className="text-ink text-sm font-medium">{t('dashboard.sections.overdueContracts')}</h3>
                    </div>
                    {data.operational.overdueContracts.length === 0 ? (
                      <p className="text-muted p-4 text-sm">{t('dashboard.empty.overdue')}</p>
                    ) : (
                      <DataTable
                        columns={[
                          ...upcomingColumns,
                          {
                            id: 'days',
                            header: t('dashboard.columns.daysOverdue'),
                            cell: (row) => <span dir="ltr">{String(row.daysOverdue ?? 0)}</span>,
                          },
                        ]}
                        rows={data.operational.overdueContracts as Array<Record<string, unknown>>}
                        rowKey={(row) => String(row.id)}
                      />
                    )}
                  </div>
                </section>
              </div>
            )
          }}
        </QueryState>
      </div>
    </>
  )
}
