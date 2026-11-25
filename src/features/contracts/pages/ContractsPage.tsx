import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { PERMISSIONS, contractDirectoryRoles } from '@/app/router/access'
import { useAppSelector } from '@/app/hooks'
import { SearchField } from '@/components/common/SearchField'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { Dropdown } from '@/components/ui/Dropdown'
import { FilterDropdown } from '@/components/ui/FilterDropdown'
import {
  DownloadIcon,
  EyeIcon,
  MoreHorizontalIcon,
  PlusIcon,
} from '@/components/ui/icons'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { appConfig } from '@/config/app.config'
import { hasAnyRole } from '@/features/auth/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useBranchOptions } from '@/features/branches/hooks/useBranchOptions'
import { formatInZone } from '@/features/bookings/utils/zonedTime'
import {
  useCreateContractMutation,
  useGetContractStatsQuery,
  useGetContractsQuery,
  useUpdateContractMutation,
} from '@/features/contracts/api/contractsApi'
import { ContractFormDialog } from '@/features/contracts/components/ContractFormDialog'
import { ContractStatCards } from '@/features/contracts/components/ContractStatCards'
import { useContractOptions } from '@/features/contracts/hooks/useContractOptions'
import {
  contractTypes,
  type Contract,
  type ContractStats,
  type ContractWriteBody,
} from '@/features/contracts/schemas/contract.schema'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'
import { cn } from '@/utils/cn'

const PAGE_SIZE = 20

function exportCsv(
  rows: readonly Contract[],
  filename: string,
  branchNameOf: (branchId: string) => string,
  labelOfType: (type: string) => string,
  labelOfStatus: (status: string) => string,
) {
  const header = ['Contract', 'Customer', 'Type', 'Vehicle', 'Start', 'End', 'Status', 'Branch']
  const lines = rows.map((row) =>
    [
      row.contractNumber,
      row.customerName ?? '',
      labelOfType(row.type),
      row.currentPlate ?? '',
      row.startsAt,
      row.endsAt,
      labelOfStatus(row.status),
      branchNameOf(row.branchId),
    ]
      .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
      .join(','),
  )
  const blob = new Blob([`\uFEFF${[header.join(','), ...lines].join('\n')}`], {
    type: 'text/csv;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function isContractType(value: string): value is (typeof contractTypes)[number] {
  return (contractTypes as readonly string[]).includes(value)
}

export function ContractsPage() {
  const { t, locale } = useTranslation()
  useDocumentTitle(t('contracts.title'))
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const options = useContractOptions()
  const branches = useBranchOptions()
  const { searchInput, setSearchInput, search, page, setPage } = useSearchPagination()
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [branchId, setBranchId] = useState('')
  const [creating, setCreating] = useState<(typeof contractTypes)[number] | null>(null)
  const [menuId, setMenuId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string>()
  const [createContract] = useCreateContractMutation()
  const [updateContract] = useUpdateContractMutation()
  const canCreate =
    (can(PERMISSIONS.contractCreate) || hasAnyRole(roles, contractDirectoryRoles)) &&
    can(PERMISSIONS.contractActivate)

  const query = useGetContractsQuery({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    status: status || undefined,
    type: type || undefined,
    branchId: branchId || undefined,
    sort: 'createdAt',
    order: 'desc',
  })
  const statsQuery = useGetContractStatsQuery({
    search: search || undefined,
    type: type || undefined,
    branchId: branchId || undefined,
  })

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(undefined), 4000)
    return () => window.clearTimeout(timer)
  }, [notice])

  const onFilter = (apply: (value: string) => void) => (value: string) => {
    apply(value)
    setPage(1)
  }
  const detailPath = (id: string) => `${appConfig.routes.contracts}/${encodeURIComponent(id)}`
  const customerPath = (id: string) => `${appConfig.routes.customers}/${encodeURIComponent(id)}`
  const vehiclePath = (id: string) => `${appConfig.routes.vehicles}/${encodeURIComponent(id)}`
  const zoneFor = (id: string) => branches.items.find((branch) => branch.id === id)?.timezone || 'UTC'
  const hasFilters = Boolean(search || status || type || branchId)

  const columns: DataTableColumn<Contract>[] = [
    {
      id: 'number',
      header: t('contracts.columns.number'),
      cell: (row) => (
        <Link to={detailPath(row.id)} className="text-brand font-medium" dir="ltr">
          {row.contractNumber}
        </Link>
      ),
    },
    {
      id: 'customer',
      header: t('contracts.columns.customer'),
      cell: (row) =>
        row.customerId ? (
          <Link to={customerPath(row.customerId)} className="text-brand font-medium">
            {row.customerName ?? t('common.notSet')}
          </Link>
        ) : (
          (row.customerName ?? t('common.notSet'))
        ),
    },
    {
      id: 'type',
      header: t('contracts.columns.type'),
      cell: (row) => options.labelOf(options.typeOptions, row.type),
    },
    {
      id: 'vehicle',
      header: t('contracts.columns.vehicle'),
      cell: (row) =>
        row.currentVehicleId ? (
          <Link to={vehiclePath(row.currentVehicleId)} className="text-brand font-medium" dir="ltr">
            {row.currentPlate ?? t('contracts.form.openVehicle')}
          </Link>
        ) : (
          t('common.notSet')
        ),
    },
    {
      id: 'start',
      header: t('contracts.columns.start'),
      cell: (row) => <span dir="ltr">{formatInZone(row.startsAt, zoneFor(row.branchId), locale)}</span>,
    },
    {
      id: 'end',
      header: t('contracts.columns.end'),
      cell: (row) => <span dir="ltr">{formatInZone(row.endsAt, zoneFor(row.branchId), locale)}</span>,
    },
    {
      id: 'status',
      header: t('common.status'),
      cell: (row) => <StatusBadge value={row.status} options={options.statusOptions} />,
    },
    {
      id: 'branch',
      header: t('contracts.columns.branch'),
      cell: (row) => branches.nameById.get(row.branchId) ?? row.branchId,
    },
    {
      id: 'actions',
      header: t('common.actions'),
      className: 'w-14 text-end',
      cell: (row) => (
        <div className="relative flex justify-end">
          <button
            type="button"
            className="text-muted hover:bg-control hover:text-ink inline-flex size-8 items-center justify-center rounded-lg"
            aria-label={t('common.actions')}
            onClick={(event) => {
              event.stopPropagation()
              setMenuId((current) => (current === row.id ? null : row.id))
            }}
          >
            <MoreHorizontalIcon className="size-4" />
          </button>
          {menuId === row.id ? (
            <div
              className="border-line bg-surface shadow-card absolute end-0 top-9 z-20 min-w-40 overflow-hidden rounded-xl border py-1"
              onClick={(event) => event.stopPropagation()}
            >
              <Link
                to={detailPath(row.id)}
                className="text-ink hover:bg-control flex w-full items-center gap-2.5 px-3.5 py-2.5 text-start text-sm"
                onClick={() => setMenuId(null)}
              >
                <EyeIcon className="text-muted size-4 shrink-0" />
                {t('contracts.actions.view')}
              </Link>
            </div>
          ) : null}
        </div>
      ),
    },
  ]

  async function save(body: ContractWriteBody, contractId?: string) {
    const saved = contractId
      ? await updateContract({ id: contractId, body }).unwrap()
      : await createContract(body).unwrap()
    setNotice(t('contracts.form.saved'))
    return saved
  }

  return (
    <>
      <PageHeader title={t('contracts.title')} description={t('contracts.description')} />

      {notice ? <Alert tone="success">{notice}</Alert> : null}

      <QueryState
        data={statsQuery.data}
        isLoading={statsQuery.isLoading}
        isFetching={statsQuery.isFetching && !statsQuery.isLoading}
        error={statsQuery.error}
        onRetry={statsQuery.refetch}
        isEmpty={() => false}
        emptyTitle=""
      >
        {(stats: ContractStats) => <ContractStatCards stats={stats} />}
      </QueryState>

      <div className="border-line bg-surface shadow-card flex min-w-0 flex-col gap-3 rounded-2xl border p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1 lg:max-w-xs">
            <SearchField
              value={searchInput}
              onChange={setSearchInput}
              label={t('contracts.searchLabel')}
              placeholder={t('contracts.searchPlaceholder')}
              showLabel={false}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-wrap lg:items-center">
            <FilterDropdown
              aria-label={t('contracts.columns.type')}
              value={type}
              onChange={onFilter(setType)}
              options={[{ value: '', label: t('contracts.filters.allTypes') }, ...options.typeOptions]}
            />
            <FilterDropdown
              aria-label={t('common.status')}
              value={status}
              onChange={onFilter(setStatus)}
              options={[{ value: '', label: t('contracts.filters.allStatuses') }, ...options.statusOptions]}
            />
            {branches.allowed ? (
              <FilterDropdown
                aria-label={t('contracts.columns.branch')}
                value={branchId}
                onChange={onFilter(setBranchId)}
                options={[
                  { value: '', label: t('contracts.filters.allBranches') },
                  ...branches.items.map((branch) => ({ value: branch.id, label: branch.name })),
                ]}
              />
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              exportCsv(
                query.data?.items ?? [],
                `contracts-${new Date().toISOString().slice(0, 10)}.csv`,
                (id) => branches.nameById.get(id) ?? id,
                (value) => options.labelOf(options.typeOptions, value),
                (value) => options.labelOf(options.statusOptions, value),
              )
            }
            disabled={!query.data?.items.length}
          >
            <DownloadIcon className="size-4" />
            {t('contracts.actions.export')}
          </Button>
          {canCreate ? (
            <Dropdown
              options={options.typeOptions.map((option) => ({ label: option.label, value: option.value }))}
              onSelect={(value) => {
                if (isContractType(value)) setCreating(value)
              }}
            >
              <Button type="button">
                <PlusIcon className="size-4" />
                {t('contracts.add')}
              </Button>
            </Dropdown>
          ) : null}
        </div>
      </div>

      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => data.items.length === 0}
        emptyTitle={t('contracts.emptyTitle')}
        emptyDescription={hasFilters ? t('contracts.emptyFiltered') : t('contracts.emptyDescription')}
      >
        {(data) => (
          <div className="grid min-w-0 gap-3">
            <div
              className={cn('border-line bg-surface shadow-card min-w-0 overflow-x-auto rounded-2xl border')}
              onClick={() => menuId && setMenuId(null)}
            >
              <DataTable columns={columns} rows={data.items} rowKey={(row) => row.id} />
            </div>
            <Pagination data={data} page={page} onPageChange={setPage} disabled={query.isFetching} />
          </div>
        )}
      </QueryState>

      {creating ? (
        <ContractFormDialog
          open
          initialType={creating}
          onClose={() => setCreating(null)}
          onSubmit={save}
        />
      ) : null}
    </>
  )
}
