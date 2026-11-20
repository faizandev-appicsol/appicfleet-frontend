import { Link } from 'react-router'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { appConfig } from '@/config/app.config'
import { env } from '@/config/env'
import { useAppSelector } from '@/app/hooks'
import { PERMISSIONS } from '@/app/router/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import {
  useGetBookingReportQuery,
  useGetContractReportQuery,
  useGetCustomerReportQuery,
  useGetEInvoiceReportQuery,
  useGetExpenseReportQuery,
  useGetFinesReportQuery,
  useGetFleetUtilizationReportQuery,
  useGetMaintenanceReportQuery,
  useGetPaymentReportQuery,
  useGetReceivablesReportQuery,
  useGetRefundsReportQuery,
  useGetVehicleReportQuery,
} from '@/features/reports/api/reportsApi'
import { KpiCard } from '@/features/reports/components/KpiCard'
import { ReportFiltersBar } from '@/features/reports/components/ReportFiltersBar'
import { useReportFilters } from '@/features/reports/hooks/useReportFilters'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'
import { formatDateTime } from '@/utils/formatDate'
import type { Paginated } from '@/types/pagination'

function cell(value: unknown) {
  return value == null || value === '' ? '—' : String(value)
}

function asPage(data: Record<string, unknown> | undefined): Paginated<Record<string, unknown>> | null {
  if (!data || !Array.isArray(data.items)) return null
  return {
    items: data.items as Array<Record<string, unknown>>,
    page: Number(data.page ?? 1),
    pageSize: Number(data.pageSize ?? 20),
    total: Number(data.total ?? 0),
  }
}

function useExport(kind: string | undefined, filters: Record<string, unknown>) {
  const { can } = usePermissions()
  const accessToken = useAppSelector((state) => state.auth.accessToken)
  const allowed = Boolean(kind && can(PERMISSIONS.reportsExport))
  return {
    allowed,
    exportCsv: async () => {
      if (!kind) return
      const params = new URLSearchParams()
      params.set('kind', kind)
      for (const [key, value] of Object.entries(filters)) {
        if (value != null && value !== '') params.set(key, String(value))
      }
      const response = await fetch(`${env.apiUrl}/reports/export?${params.toString()}`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        credentials: 'include',
      })
      if (!response.ok) return
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${kind}-report.csv`
      anchor.click()
      URL.revokeObjectURL(url)
    },
  }
}

function ReportTableBlock({
  data,
  isLoading,
  isFetching,
  error,
  refetch,
  columns,
  emptyTitle,
  page,
  onPageChange,
}: {
  data?: Record<string, unknown>
  isLoading: boolean
  isFetching: boolean
  error: unknown
  refetch: () => void
  columns: DataTableColumn<Record<string, unknown>>[]
  emptyTitle: string
  page: number
  onPageChange: (page: number) => void
}) {
  const paged = asPage(data)
  return (
    <QueryState
      data={data}
      isLoading={isLoading}
      isFetching={isFetching && !isLoading}
      error={error}
      onRetry={refetch}
      isEmpty={(row) => !Array.isArray(row.items) || row.items.length === 0}
      emptyTitle={emptyTitle}
    >
      {() => (
        <div className="grid gap-3">
          <div className="border-line bg-surface min-w-0 overflow-x-auto rounded-lg border">
            <DataTable columns={columns} rows={paged?.items ?? []} rowKey={(row) => String(row.id)} />
          </div>
          {paged ? (
            <Pagination data={paged} page={page} onPageChange={onPageChange} disabled={isFetching} />
          ) : null}
        </div>
      )}
    </QueryState>
  )
}

export function BookingReportPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('reports.bookings.title'))
  const filterState = useReportFilters()
  const query = useGetBookingReportQuery(filterState.filters)
  const exporter = useExport('bookings', filterState.filters as Record<string, unknown>)
  const summary = query.data?.summary as { total?: number } | undefined
  const columns: DataTableColumn<Record<string, unknown>>[] = [
    { id: 'number', header: t('reports.columns.number'), cell: (row) => cell(row.bookingNumber) },
    { id: 'customer', header: t('reports.columns.customer'), cell: (row) => cell(row.customerName) },
    { id: 'vehicle', header: t('reports.columns.vehicle'), cell: (row) => cell(row.vehiclePlate) },
    {
      id: 'starts',
      header: t('reports.columns.pickup'),
      cell: (row) => <span dir="ltr">{formatDateTime(String(row.startsAt ?? ''))}</span>,
    },
    {
      id: 'ends',
      header: t('reports.columns.return'),
      cell: (row) => <span dir="ltr">{formatDateTime(String(row.endsAt ?? ''))}</span>,
    },
    { id: 'status', header: t('common.status'), cell: (row) => cell(row.status) },
    {
      id: 'amount',
      header: t('reports.columns.amount'),
      cell: (row) => (
        <span dir="ltr">
          {row.currency ? `${row.currency} ` : ''}
          {cell(row.estimatedAmount)}
        </span>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title={t('reports.bookings.title')}
        description={t('reports.bookings.description')}
        action={
          exporter.allowed ? (
            <Button type="button" variant="secondary" onClick={() => void exporter.exportCsv()}>
              {t('reports.exportCsv')}
            </Button>
          ) : undefined
        }
      />
      <div className="grid gap-4">
        <ReportFiltersBar
          preset={filterState.preset}
          onPresetChange={filterState.setPreset}
          presets={filterState.presets}
          from={filterState.from}
          to={filterState.to}
          onFromChange={filterState.setFrom}
          onToChange={filterState.setTo}
          branchId={filterState.branchId}
          onBranchChange={filterState.setBranchId}
          legalEntityId={filterState.legalEntityId}
          onLegalEntityChange={filterState.setLegalEntityId}
          status={filterState.status}
          onStatusChange={filterState.setStatus}
          showStatus
        />
        <KpiCard
          label={t('reports.summary.bookings')}
          value={String(summary?.total ?? 0)}
          empty={(summary?.total ?? 0) === 0}
          emptyLabel={t('reports.bookings.empty')}
        />
        <ReportTableBlock
          data={query.data}
          isLoading={query.isLoading}
          isFetching={query.isFetching}
          error={query.error}
          refetch={query.refetch}
          columns={columns}
          emptyTitle={t('reports.bookings.empty')}
          page={filterState.page}
          onPageChange={filterState.setPage}
        />
      </div>
    </>
  )
}

function SimpleListReport({
  titleKey,
  descriptionKey,
  emptyKey,
  exportKind,
  showStatus,
  columns,
  useQuery,
}: {
  titleKey: string
  descriptionKey: string
  emptyKey: string
  exportKind?: string
  showStatus?: boolean
  columns: (t: (key: never) => string) => DataTableColumn<Record<string, unknown>>[]
  useQuery: typeof useGetVehicleReportQuery
}) {
  const { t } = useTranslation()
  useDocumentTitle(t(titleKey as never))
  const filterState = useReportFilters()
  const query = useQuery(filterState.filters)
  const exporter = useExport(exportKind, filterState.filters as Record<string, unknown>)

  return (
    <>
      <PageHeader
        title={t(titleKey as never)}
        description={t(descriptionKey as never)}
        action={
          exporter.allowed ? (
            <Button type="button" variant="secondary" onClick={() => void exporter.exportCsv()}>
              {t('reports.exportCsv')}
            </Button>
          ) : undefined
        }
      />
      <div className="grid gap-4">
        <ReportFiltersBar
          preset={filterState.preset}
          onPresetChange={filterState.setPreset}
          presets={filterState.presets}
          from={filterState.from}
          to={filterState.to}
          onFromChange={filterState.setFrom}
          onToChange={filterState.setTo}
          branchId={filterState.branchId}
          onBranchChange={filterState.setBranchId}
          legalEntityId={filterState.legalEntityId}
          onLegalEntityChange={filterState.setLegalEntityId}
          status={filterState.status}
          onStatusChange={filterState.setStatus}
          showStatus={showStatus}
        />
        <ReportTableBlock
          data={query.data}
          isLoading={query.isLoading}
          isFetching={query.isFetching}
          error={query.error}
          refetch={query.refetch}
          columns={columns(t as never)}
          emptyTitle={t(emptyKey as never)}
          page={filterState.page}
          onPageChange={filterState.setPage}
        />
      </div>
    </>
  )
}

export function VehicleReportPage() {
  return (
    <SimpleListReport
      titleKey="reports.vehicles.title"
      descriptionKey="reports.vehicles.description"
      emptyKey="reports.vehicles.empty"
      exportKind="vehicles"
      showStatus
      useQuery={useGetVehicleReportQuery}
      columns={(t) => [
        { id: 'plate', header: t('reports.columns.vehicle' as never), cell: (row) => cell(row.plateNumber) },
        {
          id: 'model',
          header: t('reports.columns.model' as never),
          cell: (row) => `${cell(row.make)} ${cell(row.model)}`,
        },
        { id: 'category', header: t('reports.columns.category' as never), cell: (row) => cell(row.category) },
        { id: 'status', header: t('common.status' as never), cell: (row) => cell(row.status) },
        {
          id: 'contract',
          header: t('reports.columns.contract' as never),
          cell: (row) => cell(row.currentContractNumber),
        },
        {
          id: 'customer',
          header: t('reports.columns.customer' as never),
          cell: (row) => cell(row.currentCustomerName),
        },
      ]}
    />
  )
}

export function FleetUtilizationReportPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('reports.utilization.title'))
  const filterState = useReportFilters()
  const query = useGetFleetUtilizationReportQuery(filterState.filters)
  const summary = query.data?.summary as {
    utilizationPercent?: number | null
    rented?: number
    eligible?: number
  }
  const columns: DataTableColumn<Record<string, unknown>>[] = [
    { id: 'plate', header: t('reports.columns.vehicle'), cell: (row) => cell(row.plateNumber) },
    { id: 'available', header: t('reports.columns.availableDays'), cell: (row) => cell(row.availableDays) },
    { id: 'rented', header: t('reports.columns.rentedDays'), cell: (row) => cell(row.rentedDays) },
    {
      id: 'util',
      header: t('reports.columns.utilization'),
      cell: (row) => (row.utilizationPercent == null ? '—' : `${row.utilizationPercent}%`),
    },
    {
      id: 'revenue',
      header: t('reports.columns.revenue'),
      cell: (row) => <span dir="ltr">{cell(row.revenue)}</span>,
    },
  ]
  return (
    <>
      <PageHeader title={t('reports.utilization.title')} description={t('reports.utilization.description')} />
      <div className="grid gap-4">
        <ReportFiltersBar
          preset={filterState.preset}
          onPresetChange={filterState.setPreset}
          presets={filterState.presets}
          from={filterState.from}
          to={filterState.to}
          onFromChange={filterState.setFrom}
          onToChange={filterState.setTo}
          branchId={filterState.branchId}
          onBranchChange={filterState.setBranchId}
          legalEntityId={filterState.legalEntityId}
          onLegalEntityChange={filterState.setLegalEntityId}
        />
        <KpiCard
          label={t('reports.summary.utilization')}
          value={summary?.utilizationPercent == null ? '—' : `${summary.utilizationPercent}%`}
          hint={`${summary?.rented ?? 0} / ${summary?.eligible ?? 0}`}
        />
        <ReportTableBlock
          data={query.data}
          isLoading={query.isLoading}
          isFetching={query.isFetching}
          error={query.error}
          refetch={query.refetch}
          columns={columns}
          emptyTitle={t('reports.utilization.empty')}
          page={filterState.page}
          onPageChange={filterState.setPage}
        />
      </div>
    </>
  )
}

export function CustomerReportPage() {
  return (
    <SimpleListReport
      titleKey="reports.customers.title"
      descriptionKey="reports.customers.description"
      emptyKey="reports.customers.empty"
      exportKind="customers"
      useQuery={useGetCustomerReportQuery}
      columns={(t) => [
        { id: 'name', header: t('reports.columns.customer' as never), cell: (row) => cell(row.displayName) },
        { id: 'type', header: t('reports.columns.type' as never), cell: (row) => cell(row.type) },
        {
          id: 'contracts',
          header: t('reports.columns.activeContracts' as never),
          cell: (row) => cell(row.activeContracts),
        },
        {
          id: 'bookings',
          header: t('reports.columns.bookings' as never),
          cell: (row) => cell(row.totalBookings),
        },
        {
          id: 'invoiced',
          header: t('reports.columns.invoiced' as never),
          cell: (row) => <span dir="ltr">{cell(row.totalInvoiced)}</span>,
        },
        {
          id: 'paid',
          header: t('reports.columns.paid' as never),
          cell: (row) => <span dir="ltr">{cell(row.totalPaid)}</span>,
        },
        {
          id: 'outstanding',
          header: t('reports.columns.outstanding' as never),
          cell: (row) => <span dir="ltr">{cell(row.outstandingBalance)}</span>,
        },
      ]}
    />
  )
}

export function ContractReportPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('reports.contracts.title'))
  const filterState = useReportFilters()
  const query = useGetContractReportQuery(filterState.filters)
  const exporter = useExport('contracts', filterState.filters as Record<string, unknown>)
  const summary = query.data?.summary as { active?: number; overdue?: number }
  const columns: DataTableColumn<Record<string, unknown>>[] = [
    { id: 'number', header: t('reports.columns.number'), cell: (row) => cell(row.contractNumber) },
    { id: 'customer', header: t('reports.columns.customer'), cell: (row) => cell(row.customerName) },
    { id: 'vehicle', header: t('reports.columns.vehicle'), cell: (row) => cell(row.vehiclePlate) },
    {
      id: 'starts',
      header: t('reports.columns.start'),
      cell: (row) => <span dir="ltr">{formatDateTime(String(row.startsAt ?? ''))}</span>,
    },
    {
      id: 'ends',
      header: t('reports.columns.end'),
      cell: (row) => <span dir="ltr">{formatDateTime(String(row.endsAt ?? ''))}</span>,
    },
    { id: 'status', header: t('common.status'), cell: (row) => cell(row.status) },
    {
      id: 'outstanding',
      header: t('reports.columns.outstanding'),
      cell: (row) => <span dir="ltr">{cell(row.outstandingBalance)}</span>,
    },
  ]
  return (
    <>
      <PageHeader
        title={t('reports.contracts.title')}
        description={t('reports.contracts.description')}
        action={
          exporter.allowed ? (
            <Button type="button" variant="secondary" onClick={() => void exporter.exportCsv()}>
              {t('reports.exportCsv')}
            </Button>
          ) : undefined
        }
      />
      <div className="grid gap-4">
        <ReportFiltersBar
          preset={filterState.preset}
          onPresetChange={filterState.setPreset}
          presets={filterState.presets}
          from={filterState.from}
          to={filterState.to}
          onFromChange={filterState.setFrom}
          onToChange={filterState.setTo}
          branchId={filterState.branchId}
          onBranchChange={filterState.setBranchId}
          legalEntityId={filterState.legalEntityId}
          onLegalEntityChange={filterState.setLegalEntityId}
          status={filterState.status}
          onStatusChange={filterState.setStatus}
          showStatus
        />
        <section className="grid gap-3 sm:grid-cols-2">
          <KpiCard label={t('reports.summary.activeContracts')} value={String(summary?.active ?? 0)} />
          <KpiCard label={t('reports.summary.overdueContracts')} value={String(summary?.overdue ?? 0)} />
        </section>
        <ReportTableBlock
          data={query.data}
          isLoading={query.isLoading}
          isFetching={query.isFetching}
          error={query.error}
          refetch={query.refetch}
          columns={columns}
          emptyTitle={t('reports.contracts.empty')}
          page={filterState.page}
          onPageChange={filterState.setPage}
        />
      </div>
    </>
  )
}

export function PaymentReportPage() {
  return (
    <SimpleListReport
      titleKey="reports.payments.title"
      descriptionKey="reports.payments.description"
      emptyKey="reports.payments.empty"
      exportKind="payments"
      showStatus
      useQuery={useGetPaymentReportQuery}
      columns={(t) => [
        { id: 'number', header: t('reports.columns.number' as never), cell: (row) => cell(row.paymentNumber) },
        { id: 'customer', header: t('reports.columns.customer' as never), cell: (row) => cell(row.customerName) },
        {
          id: 'amount',
          header: t('reports.columns.amount' as never),
          cell: (row) => (
            <span dir="ltr">
              {cell(row.currency)} {cell(row.amount)}
            </span>
          ),
        },
        { id: 'method', header: t('reports.columns.method' as never), cell: (row) => cell(row.method) },
        { id: 'status', header: t('common.status' as never), cell: (row) => cell(row.status) },
        {
          id: 'date',
          header: t('reports.columns.date' as never),
          cell: (row) => <span dir="ltr">{formatDateTime(String(row.paymentDate ?? ''))}</span>,
        },
      ]}
    />
  )
}

export function ReceivablesReportPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('reports.receivables.title'))
  const filterState = useReportFilters()
  const query = useGetReceivablesReportQuery(filterState.filters)
  const customers = Array.isArray(query.data?.customers)
    ? (query.data?.customers as Array<Record<string, unknown>>)
    : []
  const summary = query.data?.summary as { amount?: string; currency?: string | null; count?: number }
  const columns: DataTableColumn<Record<string, unknown>>[] = [
    { id: 'customer', header: t('reports.columns.customer'), cell: (row) => cell(row.customerName) },
    {
      id: 'outstanding',
      header: t('reports.columns.outstanding'),
      cell: (row) => <span dir="ltr">{cell(row.outstanding)}</span>,
    },
    {
      id: 'current',
      header: t('reports.columns.current'),
      cell: (row) => <span dir="ltr">{cell(row.current)}</span>,
    },
    {
      id: 'overdue',
      header: t('reports.columns.overdue'),
      cell: (row) => <span dir="ltr">{cell(row.overdue)}</span>,
    },
  ]
  return (
    <>
      <PageHeader title={t('reports.receivables.title')} description={t('reports.receivables.description')} />
      <div className="grid gap-4">
        <ReportFiltersBar
          preset={filterState.preset}
          onPresetChange={filterState.setPreset}
          presets={filterState.presets}
          from={filterState.from}
          to={filterState.to}
          onFromChange={filterState.setFrom}
          onToChange={filterState.setTo}
          branchId={filterState.branchId}
          onBranchChange={filterState.setBranchId}
          legalEntityId={filterState.legalEntityId}
          onLegalEntityChange={filterState.setLegalEntityId}
        />
        <QueryState
          data={query.data}
          isLoading={query.isLoading}
          error={query.error}
          onRetry={query.refetch}
          isEmpty={() => customers.length === 0}
          emptyTitle={t('reports.receivables.empty')}
        >
          {() => (
            <div className="grid gap-4">
              <KpiCard
                label={t('reports.summary.receivables')}
                value={
                  summary?.currency
                    ? `${summary.currency} ${summary.amount ?? '0.00'}`
                    : String(summary?.amount ?? '0.00')
                }
                empty={(summary?.count ?? 0) === 0}
                emptyLabel={t('reports.receivables.empty')}
              />
              <div className="border-line bg-surface min-w-0 overflow-x-auto rounded-lg border">
                <DataTable columns={columns} rows={customers} rowKey={(row) => String(row.customerId)} />
              </div>
            </div>
          )}
        </QueryState>
      </div>
    </>
  )
}

export function ExpenseReportPage() {
  return (
    <SimpleListReport
      titleKey="reports.expenses.title"
      descriptionKey="reports.expenses.description"
      emptyKey="reports.expenses.empty"
      exportKind="expenses"
      showStatus
      useQuery={useGetExpenseReportQuery}
      columns={(t) => [
        { id: 'number', header: t('reports.columns.number' as never), cell: (row) => cell(row.expenseNumber) },
        { id: 'vendor', header: t('reports.columns.vendor' as never), cell: (row) => cell(row.vendorName) },
        { id: 'category', header: t('reports.columns.category' as never), cell: (row) => cell(row.category) },
        {
          id: 'amount',
          header: t('reports.columns.amount' as never),
          cell: (row) => (
            <span dir="ltr">
              {cell(row.currency)} {cell(row.amount)}
            </span>
          ),
        },
        {
          id: 'date',
          header: t('reports.columns.date' as never),
          cell: (row) => <span dir="ltr">{formatDateTime(String(row.expenseDate ?? ''))}</span>,
        },
        { id: 'status', header: t('common.status' as never), cell: (row) => cell(row.status) },
      ]}
    />
  )
}

export function MaintenanceReportPage() {
  return (
    <SimpleListReport
      titleKey="reports.maintenance.title"
      descriptionKey="reports.maintenance.description"
      emptyKey="reports.maintenance.empty"
      exportKind="maintenance"
      useQuery={useGetMaintenanceReportQuery}
      columns={(t) => [
        {
          id: 'number',
          header: t('reports.columns.number' as never),
          cell: (row) => cell(row.workOrderNumber),
        },
        { id: 'vehicle', header: t('reports.columns.vehicle' as never), cell: (row) => cell(row.vehiclePlate) },
        { id: 'vendor', header: t('reports.columns.vendor' as never), cell: (row) => cell(row.vendorName) },
        { id: 'type', header: t('reports.columns.type' as never), cell: (row) => cell(row.maintenanceType) },
        {
          id: 'cost',
          header: t('reports.columns.amount' as never),
          cell: (row) => (
            <span dir="ltr">
              {cell(row.currency)} {cell(row.cost)}
            </span>
          ),
        },
        {
          id: 'downtime',
          header: t('reports.columns.downtime' as never),
          cell: (row) => cell(row.downtimeHours),
        },
        { id: 'status', header: t('common.status' as never), cell: (row) => cell(row.status) },
      ]}
    />
  )
}

export function FinesReportPage() {
  return (
    <SimpleListReport
      titleKey="reports.fines.title"
      descriptionKey="reports.fines.description"
      emptyKey="reports.fines.empty"
      exportKind="fines"
      useQuery={useGetFinesReportQuery}
      columns={(t) => [
        { id: 'kind', header: t('reports.columns.type' as never), cell: (row) => cell(row.kind) },
        { id: 'number', header: t('reports.columns.number' as never), cell: (row) => cell(row.number) },
        { id: 'vehicle', header: t('reports.columns.vehicle' as never), cell: (row) => cell(row.vehiclePlate) },
        {
          id: 'event',
          header: t('reports.columns.date' as never),
          cell: (row) => <span dir="ltr">{formatDateTime(String(row.eventAt ?? ''))}</span>,
        },
        {
          id: 'amount',
          header: t('reports.columns.amount' as never),
          cell: (row) => (
            <span dir="ltr">
              {cell(row.currency)} {cell(row.amount)}
            </span>
          ),
        },
        { id: 'status', header: t('common.status' as never), cell: (row) => cell(row.recoveryStatus) },
      ]}
    />
  )
}

export function RefundsReportPage() {
  return (
    <SimpleListReport
      titleKey="reports.refunds.title"
      descriptionKey="reports.refunds.description"
      emptyKey="reports.refunds.empty"
      exportKind="refunds"
      showStatus
      useQuery={useGetRefundsReportQuery}
      columns={(t) => [
        { id: 'number', header: t('reports.columns.number' as never), cell: (row) => cell(row.refundNumber) },
        { id: 'customer', header: t('reports.columns.customer' as never), cell: (row) => cell(row.customerName) },
        { id: 'source', header: t('reports.columns.source' as never), cell: (row) => cell(row.source) },
        {
          id: 'amount',
          header: t('reports.columns.amount' as never),
          cell: (row) => (
            <span dir="ltr">
              {cell(row.currency)} {cell(row.amount)}
            </span>
          ),
        },
        { id: 'status', header: t('common.status' as never), cell: (row) => cell(row.status) },
        {
          id: 'date',
          header: t('reports.columns.date' as never),
          cell: (row) => <span dir="ltr">{formatDateTime(String(row.createdAt ?? ''))}</span>,
        },
      ]}
    />
  )
}

export function AccountingReportsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('reports.accounting.title'))
  return (
    <>
      <PageHeader title={t('reports.accounting.title')} description={t('reports.accounting.description')} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Link className="border-line bg-surface rounded-lg border p-4" to={appConfig.routes.accountingTrialBalance}>
          {t('navigation.trialBalance')}
        </Link>
        <Link className="border-line bg-surface rounded-lg border p-4" to={appConfig.routes.accountingLedger}>
          {t('navigation.generalLedger')}
        </Link>
        <Link className="border-line bg-surface rounded-lg border p-4" to={appConfig.routes.accounting}>
          {t('navigation.accountingOverview')}
        </Link>
      </div>
    </>
  )
}

export function VatReportsLinkPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('reports.vat.title'))
  return (
    <>
      <PageHeader title={t('reports.vat.title')} description={t('reports.vat.description')} />
      <p className="text-muted text-sm">{t('reports.vat.redirect')}</p>
      <Link className="text-brand mt-3 inline-flex text-sm font-medium" to={appConfig.routes.taxReports}>
        {t('navigation.vatReports')}
      </Link>
    </>
  )
}

export function EInvoiceReportPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('reports.eInvoices.title'))
  const filterState = useReportFilters()
  const query = useGetEInvoiceReportQuery(filterState.filters)
  const statuses = Array.isArray(query.data?.statuses)
    ? (query.data?.statuses as Array<Record<string, unknown>>)
    : []
  return (
    <>
      <PageHeader title={t('reports.eInvoices.title')} description={t('reports.eInvoices.description')} />
      <div className="grid gap-4">
        <ReportFiltersBar
          preset={filterState.preset}
          onPresetChange={filterState.setPreset}
          presets={filterState.presets}
          from={filterState.from}
          to={filterState.to}
          onFromChange={filterState.setFrom}
          onToChange={filterState.setTo}
          branchId={filterState.branchId}
          onBranchChange={filterState.setBranchId}
          legalEntityId={filterState.legalEntityId}
          onLegalEntityChange={filterState.setLegalEntityId}
        />
        <QueryState
          data={query.data}
          isLoading={query.isLoading}
          error={query.error}
          onRetry={query.refetch}
          isEmpty={() => statuses.length === 0}
          emptyTitle={t('reports.eInvoices.empty')}
        >
          {() => (
            <div className="grid gap-4">
              <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {statuses.map((row) => (
                  <KpiCard
                    key={String(row.status)}
                    label={String(row.status)}
                    value={`${cell(row.count)} · ${cell(row.amount)}`}
                  />
                ))}
              </section>
              <Link className="text-brand text-sm font-medium" to={appConfig.routes.taxEinvoices}>
                {t('navigation.eInvoicing')}
              </Link>
            </div>
          )}
        </QueryState>
      </div>
    </>
  )
}
