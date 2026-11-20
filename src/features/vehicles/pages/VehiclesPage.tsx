import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { QueryState } from '@/components/feedback/QueryState'
import { SearchField } from '@/components/common/SearchField'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { FilterDropdown } from '@/components/ui/FilterDropdown'
import {
  CalendarDaysIcon,
  DownloadIcon,
  EyeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '@/components/ui/icons'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Tooltip } from '@/components/ui/Tooltip'
import { PERMISSIONS } from '@/app/router/access'
import { useAppSelector } from '@/app/hooks'
import { appConfig } from '@/config/app.config'
import { hasAnyRole } from '@/features/auth/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useBranchOptions } from '@/features/branches/hooks/useBranchOptions'
import {
  useGetVehicleQuery,
  useGetVehicleStatsQuery,
  useGetVehicleTypesQuery,
  useGetVehiclesQuery,
} from '@/features/vehicles/api/vehiclesApi'
import { DeleteVehicleDialog } from '@/features/vehicles/components/DeleteVehicleDialog'
import { VehicleFormDialog } from '@/features/vehicles/components/VehicleFormDialog'
import { VehicleOwnershipBadge } from '@/features/vehicles/components/VehicleOwnershipBadge'
import { VehicleStatCards } from '@/features/vehicles/components/VehicleStatCards'
import { VehicleThumbnail } from '@/features/vehicles/components/VehicleThumbnail'
import { useVehicleOptions } from '@/features/vehicles/hooks/useVehicleOptions'
import type { VehicleListItem } from '@/features/vehicles/schemas/vehicle.schema'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'
import { cn } from '@/utils/cn'

const PAGE_SIZE = 20

function formatMileage(value: number, locale: string): string {
  return `${value.toLocaleString(locale)} KM`
}

function exportCsv(rows: readonly VehicleListItem[], filename: string) {
  const header = ['#', 'Vehicle', 'Plate', 'Year', 'Ownership', 'Supplier', 'Mileage', 'Status']
  const lines = rows.map((row, index) =>
    [
      index + 1,
      `${row.make} ${row.model}`,
      row.plateNumber,
      row.year,
      row.ownershipType,
      row.ownershipParty ?? '',
      row.mileageKm,
      row.status,
    ]
      .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
      .join(','),
  )
  const blob = new Blob([[header.join(','), ...lines].join('\n')], {
    type: 'text/csv;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function VehiclesPage() {
  const { t, locale } = useTranslation()
  useDocumentTitle(t('vehicles.title'))
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const options = useVehicleOptions()
  const branches = useBranchOptions()
  const typesQuery = useGetVehicleTypesQuery()
  const { searchInput, setSearchInput, search, page, setPage } = useSearchPagination()
  const [status, setStatus] = useState('')
  const [ownershipType, setOwnershipType] = useState('')
  const [category, setCategory] = useState('')
  const [branchId, setBranchId] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [menuId, setMenuId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const canCreate =
    can(PERMISSIONS.vehicleCreate) ||
    hasAnyRole(roles, ['admin', 'org_admin', 'super_admin'])
  const canUpdate = can(PERMISSIONS.vehicleUpdate)
  const canDelete = can(PERMISSIONS.vehicleDeactivate)
  const hasFilters = Boolean(search || status || ownershipType || category || branchId)

  const listFilters = {
    search: search || undefined,
    status: status || undefined,
    ownershipType: ownershipType || undefined,
    category: category || undefined,
    branchId: branchId || undefined,
  }

  const query = useGetVehiclesQuery({
    page,
    pageSize: PAGE_SIZE,
    ...listFilters,
  })
  const statsQuery = useGetVehicleStatsQuery(listFilters)
  const editQuery = useGetVehicleQuery(editId ?? '', {
    skip: !editId,
    refetchOnMountOrArgChange: true,
  })

  const onFilter = (apply: (value: string) => void) => (value: string) => {
    apply(value)
    setPage(1)
  }

  const detailPath = (id: string) => `${appConfig.routes.vehicles}/${encodeURIComponent(id)}`

  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(new Date())
  }, [locale])

  const categoryOptions = [
    { value: '', label: t('vehicles.filters.allCategories') },
    ...(typesQuery.data ?? []).map((item) => ({ value: item.name, label: item.name })),
  ]

  const columns: DataTableColumn<VehicleListItem>[] = [
    {
      id: 'index',
      header: '#',
      className: 'w-12 text-muted whitespace-nowrap',
      cell: (row) => {
        const index = (query.data?.items.findIndex((item) => item.id === row.id) ?? 0) + 1
        return <span dir="ltr">{(page - 1) * PAGE_SIZE + index}</span>
      },
    },
    {
      id: 'vehicle',
      header: t('vehicles.columns.vehicle'),
      className: 'w-72',
      cell: (row) => {
        const fullName = `${row.make} ${row.model}`.trim()
        return (
          <Link to={detailPath(row.id)} className="flex min-w-0 max-w-full items-center gap-3">
            <VehicleThumbnail
              size="sm"
              vehicleId={row.id}
              hasPhoto={row.hasPhoto}
              alt={fullName}
            />
            <Tooltip label={fullName} className="min-w-0 flex-1">
              <span className="block min-w-0 truncate text-sm">
                <span className="text-brand hover:text-brand-strong font-semibold">{row.make}</span>
                {row.model ? (
                  <span className="text-ink font-normal"> {row.model}</span>
                ) : null}
              </span>
            </Tooltip>
          </Link>
        )
      },
    },
    {
      id: 'plate',
      header: t('vehicles.columns.plateNumber'),
      className: 'whitespace-nowrap',
      cell: (row) => (
        <span className="text-ink font-medium" dir="ltr">
          {row.plateNumber}
        </span>
      ),
    },
    {
      id: 'year',
      header: t('vehicles.columns.year'),
      className: 'text-muted whitespace-nowrap',
      cell: (row) => <span dir="ltr">{row.year}</span>,
    },
    {
      id: 'ownership',
      header: t('vehicles.columns.ownership'),
      className: 'whitespace-nowrap',
      cell: (row) => <VehicleOwnershipBadge ownershipType={row.ownershipType} />,
    },
    {
      id: 'supplier',
      header: t('vehicles.columns.supplierFinance'),
      className: 'min-w-32',
      cell: (row) => (
        <span className="text-ink text-sm">
          {row.ownershipParty?.trim() ? row.ownershipParty : t('common.notSetDash')}
        </span>
      ),
    },
    {
      id: 'mileage',
      header: t('vehicles.columns.mileage'),
      className: 'whitespace-nowrap',
      cell: (row) => (
        <span className="text-ink font-medium" dir="ltr">
          {formatMileage(row.mileageKm ?? 0, locale)}
        </span>
      ),
    },
    {
      id: 'status',
      header: t('vehicles.columns.status'),
      cell: (row) => <StatusBadge value={row.status} options={options.statusOptions} />,
    },
    {
      id: 'actions',
      header: t('common.actions'),
      className: 'text-end',
      cell: (row) => (
        <div className="relative inline-flex items-center justify-end gap-1">
          <Link
            to={detailPath(row.id)}
            className="text-muted hover:bg-control hover:text-brand inline-flex size-8 items-center justify-center rounded-lg"
            aria-label={t('vehicles.actions.view')}
            title={t('vehicles.actions.view')}
          >
            <EyeIcon className="size-4" />
          </Link>
          <button
            type="button"
            className="text-muted hover:bg-control hover:text-ink inline-flex size-8 cursor-pointer items-center justify-center rounded-lg"
            aria-label={t('vehicles.actions.more')}
            aria-expanded={menuId === row.id}
            onClick={(event) => {
              event.stopPropagation()
              setMenuId((current) => (current === row.id ? null : row.id))
            }}
          >
            <MoreHorizontalIcon className="size-4" />
          </button>
          {menuId === row.id ? (
            <div
              className="border-line bg-surface absolute end-0 top-full z-20 mt-1 min-w-44 overflow-hidden rounded-xl border py-1.5 shadow-md"
              onClick={(event) => event.stopPropagation()}
            >
              <Link
                to={detailPath(row.id)}
                className="text-ink hover:bg-control flex w-full items-center gap-2.5 px-3.5 py-2.5 text-start text-sm"
                onClick={() => setMenuId(null)}
              >
                <EyeIcon className="text-muted size-4 shrink-0" />
                {t('vehicles.actions.view')}
              </Link>
              {canUpdate ? (
                <button
                  type="button"
                  className="text-ink hover:bg-control flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-start text-sm"
                  onClick={() => {
                    setMenuId(null)
                    setEditId(row.id)
                  }}
                >
                  <PencilIcon className="text-muted size-4 shrink-0" />
                  {t('vehicles.actions.edit')}
                </button>
              ) : null}
              {canDelete && row.status !== 'rented' && row.status !== 'reserved' ? (
                <button
                  type="button"
                  className="text-danger hover:bg-danger-soft flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-start text-sm"
                  onClick={() => {
                    setMenuId(null)
                    setDeleteTarget({
                      id: row.id,
                      name: `${row.make} ${row.model}`.trim() || row.plateNumber,
                    })
                  }}
                >
                  <TrashIcon className="size-4 shrink-0" />
                  {t('vehicles.actions.delete')}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title={t('vehicles.title')}
        description={t('vehicles.description')}
        action={
          <button
            type="button"
            className="border-line bg-surface text-ink inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-medium"
          >
            <CalendarDaysIcon className="text-brand size-4" />
            {monthLabel}
          </button>
        }
      />

      <VehicleStatCards stats={statsQuery.data} isLoading={statsQuery.isLoading} />

      <div className="border-line bg-surface shadow-card flex min-w-0 flex-col gap-3 rounded-2xl border p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1 lg:max-w-xs">
            <SearchField
              value={searchInput}
              onChange={setSearchInput}
              label={t('vehicles.searchLabel')}
              placeholder={t('vehicles.searchPlaceholder')}
              showLabel={false}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:flex-wrap lg:items-center">
            <FilterDropdown
              aria-label={t('vehicles.filters.category')}
              value={category}
              onChange={onFilter(setCategory)}
              options={categoryOptions}
            />
            <FilterDropdown
              aria-label={t('vehicles.filters.ownership')}
              value={ownershipType}
              onChange={onFilter(setOwnershipType)}
              options={[
                { value: '', label: t('vehicles.filters.allOwnerships') },
                ...options.ownershipOptions,
              ]}
            />
            {branches.allowed ? (
              <FilterDropdown
                aria-label={t('vehicles.filters.branch')}
                value={branchId}
                onChange={onFilter(setBranchId)}
                options={[
                  { value: '', label: t('vehicles.filters.allBranches') },
                  ...branches.items.map((branch) => ({ value: branch.id, label: branch.name })),
                ]}
              />
            ) : null}
            <FilterDropdown
              aria-label={t('vehicles.filters.status')}
              value={status}
              onChange={onFilter(setStatus)}
              options={[
                { value: '', label: t('vehicles.filters.allStatuses') },
                ...options.statusOptions,
              ]}
            />
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              exportCsv(query.data?.items ?? [], `vehicles-${new Date().toISOString().slice(0, 10)}.csv`)
            }
            disabled={!query.data?.items.length}
          >
            <DownloadIcon className="size-4" />
            {t('vehicles.actions.export')}
          </Button>
          {canCreate ? (
            <Button type="button" onClick={() => setCreateOpen(true)}>
              <PlusIcon className="size-4" />
              {t('vehicles.add')}
            </Button>
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
        emptyTitle={t('vehicles.emptyTitle')}
        emptyDescription={hasFilters ? t('vehicles.emptyFiltered') : t('vehicles.emptyDescription')}
      >
        {(data) => (
          <div className="grid min-w-0 gap-3">
            <div
              className={cn(
                'border-line bg-surface shadow-card min-w-0 overflow-x-auto rounded-2xl border',
              )}
              onClick={() => menuId && setMenuId(null)}
            >
              <DataTable columns={columns} rows={data.items} rowKey={(row) => row.id} />
            </div>
            <Pagination
              data={data}
              page={page}
              onPageChange={setPage}
              disabled={query.isFetching}
            />
          </div>
        )}
      </QueryState>

      <VehicleFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={() => setCreateOpen(false)}
      />

      {editId && editQuery.data ? (
        <VehicleFormDialog
          key={editId}
          open
          vehicle={editQuery.data}
          onClose={() => setEditId(null)}
          onSaved={() => setEditId(null)}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteVehicleDialog
          open
          vehicleId={deleteTarget.id}
          vehicleName={deleteTarget.name}
          onClose={() => setDeleteTarget(null)}
        />
      ) : null}
    </>
  )
}
