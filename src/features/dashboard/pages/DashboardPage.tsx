import type { ReactNode } from 'react'
import {
  ArrowUpRight,
  CarFront,
  CircleDollarSign,
  ClipboardList,
  FileCheck2,
  Gauge,
  UsersRound,
  WalletCards,
  type LucideIcon,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router'
import { PERMISSIONS } from '@/app/router/access'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { appConfig } from '@/config/app.config'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import {
  CountBarChart,
  dashboardChartColors,
  DonutChart,
  RevenueAreaChart,
  RevenueLineChart,
  VehicleUtilizationChart,
  PaymentStackedChart,
  type DonutPoint,
} from '@/features/dashboard/components/DashboardCharts'
import { useGetDashboardOverviewQuery } from '@/features/reports/api/reportsApi'
import { ReportFiltersBar } from '@/features/reports/components/ReportFiltersBar'
import { useReportFilters } from '@/features/reports/hooks/useReportFilters'
import type { DashboardOverview } from '@/features/reports/schemas/reports.schema'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'
import { formatDateTime } from '@/utils/formatDate'

type DashboardRow = Record<string, unknown>

type StatCardProps = {
  label: string
  value: string
  icon: LucideIcon
  tone: string
  index: number
  reducedMotion: boolean
}

type StatItem = Omit<StatCardProps, 'reducedMotion' | 'index'>

function StatCard({ label, value, icon: Icon, tone, index, reducedMotion }: StatCardProps) {
  return (
    <motion.article
      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={reducedMotion ? undefined : { y: -3 }}
      transition={{ duration: 0.2, delay: reducedMotion ? 0 : index * 0.035 }}
      className="border-line bg-surface shadow-card min-w-0 rounded-2xl border p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-muted text-sm leading-5">{label}</p>
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tone}`}>
          <Icon aria-hidden="true" size={19} />
        </span>
      </div>
      <p className="text-ink mt-4 text-2xl font-semibold tracking-tight tabular-nums" dir="ltr">
        {value}
      </p>
    </motion.article>
  )
}

function StatGrid({ cards, reducedMotion }: { cards: StatItem[]; reducedMotion: boolean }) {
  if (cards.length === 0) return null

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <StatCard key={card.label} {...card} index={index} reducedMotion={reducedMotion} />
      ))}
    </div>
  )
}

function DashboardGroup({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="border-line bg-surface shadow-card grid min-w-0 gap-4 rounded-2xl border p-4 sm:p-5">
      <header className="flex items-start gap-3 border-b border-line pb-4">
        <span className="bg-brand/10 text-brand grid size-10 shrink-0 place-items-center rounded-xl">
          <Icon aria-hidden="true" size={19} />
        </span>
        <div className="min-w-0">
          <h2 className="text-ink text-base font-semibold">{title}</h2>
          <p className="text-muted mt-1 text-sm">{description}</p>
        </div>
      </header>
      {children}
    </section>
  )
}

function SectionHeading({
  title,
  to,
  viewAll,
}: {
  title: string
  to: string
  viewAll: string
}) {
  return (
    <div className="border-line flex items-center justify-between gap-3 border-b px-4 py-3">
      <h2 className="text-ink text-sm font-semibold">{title}</h2>
      <Link
        to={to}
        className="text-brand hover:text-brand/80 inline-flex shrink-0 items-center gap-1 text-xs font-medium"
      >
        {viewAll}
        <ArrowUpRight aria-hidden="true" size={14} />
      </Link>
    </div>
  )
}

function RecentSection({
  title,
  to,
  viewAll,
  rows,
  columns,
  emptyLabel,
}: {
  title: string
  to: string
  viewAll: string
  rows: DashboardRow[]
  columns: DataTableColumn<DashboardRow>[]
  emptyLabel: string
}) {
  return (
    <section className="border-line bg-surface min-w-0 overflow-hidden rounded-2xl border">
      <SectionHeading title={title} to={to} viewAll={viewAll} />
      {rows.length === 0 ? (
        <p className="text-muted p-4 text-sm">{emptyLabel}</p>
      ) : (
        <div className="overflow-x-auto">
          <DataTable columns={columns} rows={rows} rowKey={(row) => String(row.id)} />
        </div>
      )}
    </section>
  )
}

function moneyLabel(currency: string | null | undefined, amount: string | null | undefined, locale?: string) {
  if (amount == null) return '—'
  const formatted = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(Number(amount) || 0)
  return currency ? `${currency} ${formatted}` : formatted
}

function dateLabel(value: unknown) {
  return value ? <span dir="ltr">{formatDateTime(String(value))}</span> : '—'
}

function compactLabel(value: unknown) {
  return String(value ?? '—')
}

function typeLabel(value: unknown, t: ReturnType<typeof useTranslation>['t']) {
  const type = String(value ?? '').toLowerCase().replaceAll('_', '')
  if (type === 'b2c') return t('dashboard.contractTypes.b2c')
  if (type === 'b2b') return t('dashboard.contractTypes.b2b')
  if (type === 'borrow') return t('dashboard.contractTypes.borrow')
  if (type === 'oldcontract') return t('dashboard.contractTypes.oldContract')
  return t('dashboard.contractTypes.other')
}

function customerTypeLabel(value: unknown, t: ReturnType<typeof useTranslation>['t']) {
  const type = String(value ?? '').toLowerCase()
  if (type === 'individual') return t('dashboard.customerTypes.individual')
  if (type === 'corporate') return t('dashboard.customerTypes.corporate')
  return compactLabel(value)
}

function statusLabel(value: unknown, t: ReturnType<typeof useTranslation>['t']) {
  const status = String(value ?? '').toLowerCase()
  const knownStatuses: Record<string, string> = {
    active: 'dashboard.status.active',
    available: 'dashboard.status.available',
    rented: 'dashboard.status.rented',
    maintenance: 'dashboard.status.maintenance',
    reserved: 'dashboard.status.reserved',
    pending: 'dashboard.status.pending',
    completed: 'dashboard.status.completed',
  }
  const key = knownStatuses[status]
  return key ? t(key as never) : compactLabel(value)
}

function vehicleDistribution(statuses: Record<string, number>, t: ReturnType<typeof useTranslation>['t']): DonutPoint[] {
  const known = [
    { key: 'available', name: t('dashboard.status.available'), color: dashboardChartColors.available },
    { key: 'rented', name: t('dashboard.status.rented'), color: dashboardChartColors.rented },
    { key: 'maintenance', name: t('dashboard.status.maintenance'), color: dashboardChartColors.maintenance },
    { key: 'reserved', name: t('dashboard.status.reserved'), color: dashboardChartColors.reserved },
  ]
  const points = known.map((item) => ({ name: item.name, value: statuses[item.key] ?? 0, color: item.color }))
  const otherCount = Object.entries(statuses)
    .filter(([key]) => !known.some((item) => item.key === key))
    .reduce((total, [, count]) => total + count, 0)
  if (otherCount > 0) points.push({ name: t('dashboard.status.other'), value: otherCount, color: dashboardChartColors.other })
  return points.filter((point) => point.value > 0)
}

function contractDistribution(
  counts: Record<string, number>,
  t: ReturnType<typeof useTranslation>['t'],
): DonutPoint[] {
  const labels: Record<string, { name: string; color: string }> = {
    b2c: { name: t('dashboard.contractTypes.b2c'), color: dashboardChartColors.b2c },
    b2b: { name: t('dashboard.contractTypes.b2b'), color: dashboardChartColors.b2b },
    borrow: { name: t('dashboard.contractTypes.borrow'), color: dashboardChartColors.borrow },
    old_contract: { name: t('dashboard.contractTypes.oldContract'), color: dashboardChartColors.oldContract },
    draft_b2c: { name: t('dashboard.contractTypes.b2c'), color: dashboardChartColors.b2c },
    draft_b2b: { name: t('dashboard.contractTypes.b2b'), color: dashboardChartColors.b2b },
  }
  const points: DonutPoint[] = []
  let other = 0
  for (const [type, value] of Object.entries(counts)) {
    const definition = labels[type]
    if (definition) {
      const current = points.find((point) => point.name === definition.name)
      if (current) current.value += value
      else points.push({ ...definition, value })
    } else {
      other += value
    }
  }
  if (other > 0) points.push({ name: t('dashboard.contractTypes.other'), value: other, color: dashboardChartColors.contractsOther })
  return points.filter((point) => point.value > 0)
}

export function DashboardPage() {
  const { t, locale } = useTranslation()
  useDocumentTitle(t('dashboard.title'))
  const { can } = usePermissions()
  const filters = useReportFilters()
  const reducedMotion = useReducedMotion()
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
          presets={['today', 'this_week', 'this_month', 'this_year']}
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
          {(data: DashboardOverview) => {
            const count = (value: number) => new Intl.NumberFormat(locale).format(value)
            const fleet = data.charts.fleetStatus
            const contractStats: StatItem[] = [
              { label: t('dashboard.kpis.totalContracts'), value: count(data.kpis.totalContracts), icon: ClipboardList, tone: 'bg-violet-500/10 text-violet-600' },
              { label: t('dashboard.kpis.activeContracts'), value: count(data.kpis.activeContracts.count), icon: FileCheck2, tone: 'bg-emerald-500/10 text-emerald-600' },
              { label: t('dashboard.kpis.b2cContracts'), value: count(data.kpis.b2cContracts), icon: ClipboardList, tone: 'bg-pink-500/10 text-pink-600' },
              { label: t('dashboard.kpis.b2bContracts'), value: count(data.kpis.b2bContracts), icon: ClipboardList, tone: 'bg-sky-500/10 text-sky-600' },
            ]
            const customerStats: StatItem[] = [
              { label: t('dashboard.kpis.totalCustomers'), value: count(data.kpis.totalCustomers), icon: UsersRound, tone: 'bg-amber-500/10 text-amber-600' },
            ]
            const vehicleStats: StatItem[] = [
              { label: t('dashboard.kpis.totalVehicles'), value: count(data.kpis.totalVehicles), icon: CarFront, tone: 'bg-brand/10 text-brand' },
              { label: t('dashboard.kpis.availableVehicles'), value: count(data.kpis.fleetUtilization.available), icon: CarFront, tone: 'bg-emerald-500/10 text-emerald-600' },
              { label: t('dashboard.kpis.rentedVehicles'), value: count(fleet.rented ?? 0), icon: Gauge, tone: 'bg-sky-500/10 text-sky-600' },
            ]
            const bookingStats: StatItem[] = [
              { label: t('dashboard.kpis.bookings'), value: count(data.kpis.bookings.total), icon: ClipboardList, tone: 'bg-indigo-500/10 text-indigo-600' },
            ]
            const financeStats: StatItem[] = data.permissions.financial
              ? [
                  {
                    label: t('dashboard.kpis.receivables'),
                    value: moneyLabel(
                      data.kpis.outstandingReceivables?.currency,
                      data.kpis.outstandingReceivables?.amount,
                      locale,
                    ),
                    icon: WalletCards,
                    tone: 'bg-rose-500/10 text-rose-600',
                  },
                  {
                    label:
                      filters.preset === 'this_month'
                        ? t('dashboard.kpis.monthlyRevenue')
                        : t('dashboard.kpis.revenue'),
                    value: moneyLabel(data.kpis.revenue?.currency, data.kpis.revenue?.amount, locale),
                    icon: CircleDollarSign,
                    tone: 'bg-emerald-500/10 text-emerald-600',
                  },
                  {
                    label: t('dashboard.kpis.pendingPayments'),
                    value: moneyLabel(data.kpis.pendingPayments?.currency, data.kpis.pendingPayments?.amount, locale),
                    icon: WalletCards,
                    tone: 'bg-orange-500/10 text-orange-600',
                  },
                ]
              : []

            const contractColumns: DataTableColumn<DashboardRow>[] = [
              {
                id: 'contract',
                header: t('dashboard.columns.contract'),
                cell: (row) => (
                  <Link className="text-brand hover:underline" to={`${appConfig.routes.contracts}/${String(row.id)}`}>
                    {compactLabel(row.contractNumber)}
                  </Link>
                ),
              },
              {
                id: 'customer',
                header: t('dashboard.columns.customer'),
                cell: (row) => (
                  <Link className="hover:text-brand hover:underline" to={`${appConfig.routes.customers}/${String(row.customerId)}`}>
                    {compactLabel(row.customerName)}
                  </Link>
                ),
              },
              {
                id: 'vehicle',
                header: t('dashboard.columns.vehicle'),
                cell: (row) =>
                  row.vehicleId ? (
                    <Link className="hover:text-brand hover:underline" to={`${appConfig.routes.vehicles}/${String(row.vehicleId)}`}>
                      {compactLabel(row.vehiclePlate)}
                    </Link>
                  ) : (
                    compactLabel(row.vehiclePlate)
                  ),
              },
              {
                id: 'type',
                header: t('dashboard.columns.type'),
                cell: (row) => typeLabel(row.type, t),
              },
              {
                id: 'createdAt',
                header: t('dashboard.columns.createdAt'),
                cell: (row) => dateLabel(row.createdAt),
              },
            ]
            const vehicleColumns: DataTableColumn<DashboardRow>[] = [
              {
                id: 'vehicle',
                header: t('dashboard.columns.vehicle'),
                cell: (row) => (
                  <Link className="text-brand hover:underline" to={`${appConfig.routes.vehicles}/${String(row.id)}`}>
                    {compactLabel(row.plateNumber)}
                  </Link>
                ),
              },
              {
                id: 'model',
                header: t('dashboard.columns.model'),
                cell: (row) => `${compactLabel(row.make)} ${compactLabel(row.model)} ${compactLabel(row.year)}`,
              },
              {
                id: 'status',
                header: t('common.status'),
                cell: (row) => statusLabel(row.status, t),
              },
              {
                id: 'createdAt',
                header: t('dashboard.columns.createdAt'),
                cell: (row) => dateLabel(row.createdAt),
              },
            ]
            const customerColumns: DataTableColumn<DashboardRow>[] = [
              {
                id: 'customer',
                header: t('dashboard.columns.customer'),
                cell: (row) => (
                  <Link className="text-brand hover:underline" to={`${appConfig.routes.customers}/${String(row.id)}`}>
                    {compactLabel(row.displayName)}
                  </Link>
                ),
              },
              {
                id: 'customerNumber',
                header: t('dashboard.columns.customerNumber'),
                cell: (row) => compactLabel(row.customerNumber),
              },
              {
                id: 'type',
                header: t('dashboard.columns.type'),
                cell: (row) => customerTypeLabel(row.type, t),
              },
              {
                id: 'createdAt',
                header: t('dashboard.columns.createdAt'),
                cell: (row) => dateLabel(row.createdAt),
              },
            ]
            const paymentColumns: DataTableColumn<DashboardRow>[] = [
              {
                id: 'payment',
                header: t('dashboard.columns.transaction'),
                cell: (row) => compactLabel(row.paymentNumber ?? row.id),
              },
              {
                id: 'customer',
                header: t('dashboard.columns.customer'),
                cell: (row) => compactLabel(row.customerName),
              },
              {
                id: 'amount',
                header: t('dashboard.columns.amount'),
                cell: (row) => moneyLabel(String(row.currency ?? ''), String(row.amount ?? '0'), locale),
              },
              {
                id: 'date',
                header: t('dashboard.columns.date'),
                cell: (row) => dateLabel(row.paymentDate),
              },
            ]
            const upcomingColumns: DataTableColumn<DashboardRow>[] = [
              {
                id: 'contract',
                header: t('dashboard.columns.contract'),
                cell: (row) => compactLabel(row.contractNumber),
              },
              {
                id: 'customer',
                header: t('dashboard.columns.customer'),
                cell: (row) => compactLabel(row.customerName),
              },
              {
                id: 'vehicle',
                header: t('dashboard.columns.vehicle'),
                cell: (row) => compactLabel(row.vehiclePlate),
              },
              {
                id: 'endsAt',
                header: t('dashboard.columns.returnAt'),
                cell: (row) => dateLabel(row.endsAt),
              },
            ]

            return (
              <div className="grid gap-5">
                <DashboardGroup
                  icon={FileCheck2}
                  title={t('dashboard.sections.contractOverview')}
                  description={t('dashboard.sections.contractOverviewDescription')}
                >
                  <StatGrid cards={contractStats} reducedMotion={Boolean(reducedMotion)} />
                  <div className="grid min-w-0 gap-4 xl:grid-cols-2">
                    <CountBarChart
                      title={t('dashboard.charts.contractTrend')}
                      data={data.charts.contractTrend}
                      emptyLabel={t('dashboard.empty.contracts')}
                    />
                    <DonutChart
                      title={t('dashboard.charts.contractType')}
                      data={contractDistribution(data.charts.contractType, t)}
                      emptyLabel={t('dashboard.empty.contracts')}
                    />
                  </div>
                  <RecentSection
                    title={t('dashboard.sections.recentContracts')}
                    to={appConfig.routes.contracts}
                    viewAll={t('dashboard.viewAll')}
                    rows={data.recent.contracts}
                    columns={contractColumns}
                    emptyLabel={t('dashboard.empty.contracts')}
                  />
                  <div className="grid min-w-0 gap-4 xl:grid-cols-2">
                    <div className="border-line bg-surface min-w-0 overflow-x-auto rounded-2xl border">
                      <SectionHeading
                        title={t('dashboard.sections.upcomingReturns')}
                        to={appConfig.routes.contracts}
                        viewAll={t('dashboard.viewAll')}
                      />
                      {data.operational.upcomingReturns.length === 0 ? (
                        <p className="text-muted p-4 text-sm">{t('dashboard.empty.upcoming')}</p>
                      ) : (
                        <DataTable
                          columns={upcomingColumns}
                          rows={data.operational.upcomingReturns as DashboardRow[]}
                          rowKey={(row) => String(row.id)}
                        />
                      )}
                    </div>
                    <div className="border-line bg-surface min-w-0 overflow-x-auto rounded-2xl border">
                      <SectionHeading
                        title={t('dashboard.sections.overdueContracts')}
                        to={appConfig.routes.contracts}
                        viewAll={t('dashboard.viewAll')}
                      />
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
                          rows={data.operational.overdueContracts as DashboardRow[]}
                          rowKey={(row) => String(row.id)}
                        />
                      )}
                    </div>
                  </div>
                </DashboardGroup>

                <DashboardGroup
                  icon={UsersRound}
                  title={t('dashboard.sections.customerOverview')}
                  description={t('dashboard.sections.customerOverviewDescription')}
                >
                  <StatGrid cards={customerStats} reducedMotion={Boolean(reducedMotion)} />
                  <div className="grid min-w-0 gap-4 xl:grid-cols-2">
                    <CountBarChart
                      title={t('dashboard.charts.customerTrend')}
                      data={data.charts.customerTrend}
                      emptyLabel={t('dashboard.empty.customers')}
                    />
                    <RecentSection
                      title={t('dashboard.sections.recentCustomers')}
                      to={appConfig.routes.customers}
                      viewAll={t('dashboard.viewAll')}
                      rows={data.recent.customers}
                      columns={customerColumns}
                      emptyLabel={t('dashboard.empty.customers')}
                    />
                  </div>
                </DashboardGroup>

                <DashboardGroup
                  icon={CarFront}
                  title={t('dashboard.sections.vehicleOverview')}
                  description={t('dashboard.sections.vehicleOverviewDescription')}
                >
                  <StatGrid cards={vehicleStats} reducedMotion={Boolean(reducedMotion)} />
                  <div className="grid min-w-0 gap-4 xl:grid-cols-2">
                    <DonutChart
                      title={t('dashboard.charts.fleetStatus')}
                      data={vehicleDistribution(data.charts.fleetStatus, t)}
                      emptyLabel={t('dashboard.empty.fleet')}
                    />
                    <VehicleUtilizationChart
                      title={t('dashboard.charts.vehicleUtilization')}
                      label={t('dashboard.kpis.fleetUtilization')}
                      percentage={data.kpis.fleetUtilization.utilizationPercent}
                      emptyLabel={t('dashboard.empty.fleet')}
                    />
                  </div>
                  <RecentSection
                    title={t('dashboard.sections.recentVehicles')}
                    to={appConfig.routes.vehicles}
                    viewAll={t('dashboard.viewAll')}
                    rows={data.recent.vehicles}
                    columns={vehicleColumns}
                    emptyLabel={t('dashboard.empty.vehicles')}
                  />
                </DashboardGroup>

                <DashboardGroup
                  icon={ClipboardList}
                  title={t('dashboard.sections.bookingOverview')}
                  description={t('dashboard.sections.bookingOverviewDescription')}
                >
                  <StatGrid cards={bookingStats} reducedMotion={Boolean(reducedMotion)} />
                  <CountBarChart
                    title={t('dashboard.charts.bookingTrend')}
                    data={data.charts.bookingTrend}
                    emptyLabel={t('dashboard.empty.bookings')}
                  />
                </DashboardGroup>

                {data.permissions.financial ? (
                  <DashboardGroup
                    icon={WalletCards}
                    title={t('dashboard.sections.financeOverview')}
                    description={t('dashboard.sections.financeOverviewDescription')}
                  >
                    <StatGrid cards={financeStats} reducedMotion={Boolean(reducedMotion)} />
                    <div className="grid min-w-0 gap-4 xl:grid-cols-2">
                      <RevenueLineChart
                        title={t('dashboard.charts.revenueTrend')}
                        data={data.charts.revenueTrend}
                        currency={data.kpis.revenue?.currency ?? null}
                        locale={locale}
                        emptyLabel={t('dashboard.empty.revenue')}
                      />
                      <RevenueAreaChart
                        title={t('dashboard.charts.revenueGrowth')}
                        data={data.charts.revenueTrend}
                        currency={data.kpis.revenue?.currency ?? null}
                        locale={locale}
                        emptyLabel={t('dashboard.empty.revenue')}
                      />
                      <PaymentStackedChart
                        title={t('dashboard.charts.paymentStatus')}
                        paidLabel={t('dashboard.charts.paid')}
                        pendingLabel={t('dashboard.charts.pending')}
                        data={data.charts.paymentTrend}
                        currency={data.charts.paymentCurrency}
                        locale={locale}
                        emptyLabel={t('dashboard.empty.payments')}
                      />
                    </div>
                    <RecentSection
                      title={t('dashboard.sections.recentTransactions')}
                      to={appConfig.routes.payments}
                      viewAll={t('dashboard.viewAll')}
                      rows={data.recent.payments}
                      columns={paymentColumns}
                      emptyLabel={t('dashboard.empty.payments')}
                    />
                  </DashboardGroup>
                ) : null}
              </div>
            )
          }}
        </QueryState>
      </div>
    </>
  )
}
