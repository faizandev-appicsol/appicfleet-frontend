import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { PERMISSIONS } from '@/app/router/access'
import { useAppSelector } from '@/app/hooks'
import { QueryState } from '@/components/feedback/QueryState'
import { SearchField } from '@/components/common/SearchField'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { FilterDropdown } from '@/components/ui/FilterDropdown'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import {
  DownloadIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '@/components/ui/icons'
import { appConfig } from '@/config/app.config'
import { hasAnyRole } from '@/features/auth/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useBranchOptions } from '@/features/branches/hooks/useBranchOptions'
import {
  useGetCustomerQuery,
  useGetCustomerStatsQuery,
  useGetCustomersQuery,
} from '@/features/customers/api/customersApi'
import { DeleteCustomerDialog } from '@/features/customers/components/DeleteCustomerDialog'
import { CustomerFormDialog } from '@/features/customers/components/CustomerFormDialog'
import { CustomerStatCards } from '@/features/customers/components/CustomerStatCards'
import { useCustomerOptions } from '@/features/customers/hooks/useCustomerOptions'
import type { CustomerListItem } from '@/features/customers/schemas/customer.schema'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'
import { formatDateTime } from '@/utils/formatDate'

const PAGE_SIZE = 20
const CREATE_ROLES = ['admin', 'org_admin', 'super_admin', 'manager', 'branch_manager'] as const

function exportCsv(
  rows: readonly CustomerListItem[],
  filename: string,
  branchNameOf: (branchId: string) => string,
) {
  const header = ['Customer', 'Customer Number', 'Type', 'Phone', 'Email', 'Branch', 'Status']
  const lines = rows.map((row) =>
    [
      row.displayName,
      row.customerNumber,
      row.customerType ?? row.type,
      row.phone ?? '',
      row.email ?? '',
      branchNameOf(row.branchId),
      row.status,
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

export function CustomersPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('customers.title'))
  const navigate = useNavigate()
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const options = useCustomerOptions()
  const branches = useBranchOptions()
  const { searchInput, setSearchInput, search, page, setPage } = useSearchPagination()
  const [customerType, setCustomerType] = useState('')
  const [status, setStatus] = useState('')
  const [branchId, setBranchId] = useState('')
  const [sort, setSort] = useState<'displayName' | 'createdAt' | 'customerNumber'>('displayName')
  const [createOpen, setCreateOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const canCreate = can(PERMISSIONS.customerCreate) || hasAnyRole(roles, CREATE_ROLES)
  const canUpdate = can(PERMISSIONS.customerUpdate)
  const canDelete = can(PERMISSIONS.customerDeactivate)
  const hasFilters = Boolean(search || customerType || status || branchId)

  const query = useGetCustomersQuery({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    customerType: customerType || undefined,
    status: status || undefined,
    branchId: branchId || undefined,
    sort,
    order: sort === 'createdAt' ? 'desc' : 'asc',
  })
  const statsQuery = useGetCustomerStatsQuery({
    search: search || undefined,
    customerType: customerType || undefined,
    branchId: branchId || undefined,
  })
  const editQuery = useGetCustomerQuery(
    { id: editId ?? '' },
    { skip: !editId, refetchOnMountOrArgChange: true },
  )

  const onFilter = (apply: (value: string) => void) => (value: string) => {
    apply(value)
    setPage(1)
  }

  const detailPath = (id: string) => `${appConfig.routes.customers}/${encodeURIComponent(id)}`

  const columns: DataTableColumn<CustomerListItem>[] = [
    {
      id: 'customer',
      header: t('customers.columns.customer'),
      className: 'min-w-40',
      cell: (row) => (
        <>
          <Link to={detailPath(row.id)} className="text-brand hover:text-brand-strong font-medium">
            {row.displayName}
          </Link>
          <p className="text-muted text-xs" dir="ltr">
            {row.customerNumber}
          </p>
        </>
      ),
    },
    {
      id: 'type',
      header: t('customers.columns.type'),
      className: 'whitespace-nowrap',
      cell: (row) =>
        options.labelOf(
          options.profileTypeOptions,
          row.customerType ?? (row.type === 'corporate' ? 'organization' : 'individual'),
        ),
    },
    {
      id: 'phone',
      header: t('common.phone'),
      className: 'whitespace-nowrap',
      cell: (row) => (row.phone ? <span dir="ltr">{row.phone}</span> : t('common.notSet')),
    },
    {
      id: 'email',
      header: t('common.email'),
      className: 'min-w-40',
      cell: (row) => (row.email ? <span dir="ltr">{row.email}</span> : t('common.notSet')),
    },
    {
      id: 'branch',
      header: t('customers.columns.branch'),
      cell: (row) => branches.nameById.get(row.branchId) ?? <span dir="ltr">{row.branchId}</span>,
    },
    {
      id: 'status',
      header: t('common.status'),
      cell: (row) => <StatusBadge value={row.status} options={options.statusOptions} />,
    },
    {
      id: 'created',
      header: t('common.created'),
      className: 'whitespace-nowrap',
      cell: (row) => <span dir="ltr">{formatDateTime(row.createdAt)}</span>,
    },
    {
      id: 'actions',
      header: t('common.actions'),
      className: 'text-end',
      cell: (row) => (
        <div className="inline-flex items-center justify-end gap-1">
          <Link
            to={detailPath(row.id)}
            className="text-muted hover:bg-control hover:text-brand inline-flex size-8 items-center justify-center rounded-lg"
            aria-label={t('customers.actions.view')}
            title={t('customers.actions.view')}
          >
            <EyeIcon className="size-4" />
          </Link>
          {canUpdate ? (
            <button
              type="button"
              className="text-muted hover:bg-control hover:text-ink inline-flex size-8 cursor-pointer items-center justify-center rounded-lg"
              aria-label={t('customers.actions.edit')}
              title={t('customers.actions.edit')}
              onClick={() => setEditId(row.id)}
            >
              <PencilIcon className="size-4" />
            </button>
          ) : null}
          {canDelete ? (
            <button
              type="button"
              className="text-muted hover:bg-danger-soft hover:text-danger inline-flex size-8 cursor-pointer items-center justify-center rounded-lg"
              aria-label={t('common.delete')}
              title={t('common.delete')}
              onClick={() => setDeleteTarget({ id: row.id, name: row.displayName })}
            >
              <TrashIcon className="size-4" />
            </button>
          ) : null}
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title={t('customers.title')}
        description={t('customers.description')}
      />
      <QueryState
        data={statsQuery.data}
        isLoading={statsQuery.isLoading}
        isFetching={statsQuery.isFetching && !statsQuery.isLoading}
        error={statsQuery.error}
        onRetry={statsQuery.refetch}
        isEmpty={() => false}
        emptyTitle=""
      >
        {(stats) => <CustomerStatCards stats={stats} />}
      </QueryState>
      <div className="border-line bg-surface shadow-card flex min-w-0 flex-col gap-3 rounded-2xl border p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1 lg:max-w-xs">
            <SearchField
              value={searchInput}
              onChange={setSearchInput}
              label={t('customers.searchLabel')}
              placeholder={t('customers.searchPlaceholder')}
              showLabel={false}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-wrap lg:items-center">
            <FilterDropdown
              aria-label={t('customers.filters.type')}
              value={customerType}
              onChange={onFilter(setCustomerType)}
              options={[
                { value: '', label: t('customers.filters.allTypes') },
                ...options.profileTypeOptions,
              ]}
            />
            <FilterDropdown
              aria-label={t('customers.filters.status')}
              value={status}
              onChange={onFilter(setStatus)}
              options={[
                { value: '', label: t('customers.filters.allStatuses') },
                ...options.statusOptions,
              ]}
            />
            {branches.allowed ? (
              <FilterDropdown
                aria-label={t('customers.filters.branch')}
                value={branchId}
                onChange={onFilter(setBranchId)}
                options={[
                  { value: '', label: t('customers.filters.allBranches') },
                  ...branches.items.map((branch) => ({ value: branch.id, label: branch.name })),
                ]}
              />
            ) : null}
            <FilterDropdown
              aria-label={t('customers.filters.sort')}
              value={sort}
              onChange={(value) => {
                if (value === 'createdAt' || value === 'customerNumber' || value === 'displayName') {
                  setSort(value)
                  setPage(1)
                }
              }}
              options={[
                { value: 'displayName', label: t('customers.sort.displayName') },
                { value: 'createdAt', label: t('customers.sort.createdAt') },
                { value: 'customerNumber', label: t('customers.sort.customerNumber') },
              ]}
            />
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              exportCsv(
                query.data?.items ?? [],
                `customers-${new Date().toISOString().slice(0, 10)}.csv`,
                (id) => branches.nameById.get(id) ?? id,
              )
            }
            disabled={!query.data?.items.length}
          >
            <DownloadIcon className="size-4" />
            {t('customers.actions.export')}
          </Button>
          {canCreate ? (
            <Button type="button" onClick={() => setCreateOpen(true)}>
              <PlusIcon className="size-4" />
              {t('customers.add')}
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
        emptyTitle={t('customers.emptyTitle')}
        emptyDescription={hasFilters ? t('customers.emptyFiltered') : t('customers.emptyDescription')}
      >
        {(data) => (
          <div className="grid min-w-0 gap-3">
            <div className="border-line bg-surface min-w-0 overflow-x-auto rounded-lg border">
              <DataTable columns={columns} rows={data.items} rowKey={(row) => row.id} />
            </div>
            <Pagination data={data} page={page} onPageChange={setPage} disabled={query.isFetching} />
          </div>
        )}
      </QueryState>
      <CustomerFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(id) => navigate(detailPath(id))}
      />
      {editId ? (
        <div className="grid gap-3">
          <div className="flex justify-end">
            <Button type="button" variant="secondary" onClick={() => setEditId(null)}>
              {t('common.cancel')}
            </Button>
          </div>
          <QueryState
            data={editQuery.data}
            isLoading={editQuery.isLoading}
            isFetching={editQuery.isFetching && !editQuery.isLoading}
            error={editQuery.error}
            onRetry={editQuery.refetch}
            isEmpty={() => false}
            emptyTitle=""
          >
            {(customer) => (
              <CustomerFormDialog
                key={customer.id}
                open
                customer={customer}
                onClose={() => setEditId(null)}
              />
            )}
          </QueryState>
        </div>
      ) : null}
      {deleteTarget ? (
        <DeleteCustomerDialog
          open
          customerId={deleteTarget.id}
          customerName={deleteTarget.name}
          onClose={() => setDeleteTarget(null)}
        />
      ) : null}
    </>
  )
}
