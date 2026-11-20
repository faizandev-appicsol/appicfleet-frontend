import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { PERMISSIONS } from '@/app/router/access'
import { useAppSelector } from '@/app/hooks'
import { QueryState } from '@/components/feedback/QueryState'
import { SearchField } from '@/components/common/SearchField'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { Select } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { appConfig } from '@/config/app.config'
import { hasAnyRole } from '@/features/auth/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useBranchOptions } from '@/features/branches/hooks/useBranchOptions'
import { useGetCustomersQuery } from '@/features/customers/api/customersApi'
import { CustomerFormDialog } from '@/features/customers/components/CustomerFormDialog'
import { useCustomerOptions } from '@/features/customers/hooks/useCustomerOptions'
import type { CustomerListItem } from '@/features/customers/schemas/customer.schema'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'
import { formatDateTime } from '@/utils/formatDate'

const PAGE_SIZE = 20
const CREATE_ROLES = ['admin', 'org_admin', 'super_admin', 'manager', 'branch_manager'] as const

export function CustomersPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('customers.title'))
  const navigate = useNavigate()
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const options = useCustomerOptions()
  const branches = useBranchOptions()
  const { searchInput, setSearchInput, search, page, setPage } = useSearchPagination()
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [documentStatus, setDocumentStatus] = useState('')
  const [branchId, setBranchId] = useState('')
  const [sort, setSort] = useState<'displayName' | 'createdAt' | 'customerNumber'>('displayName')
  const [createOpen, setCreateOpen] = useState(false)

  const canCreate = can(PERMISSIONS.customerCreate) || hasAnyRole(roles, CREATE_ROLES)
  const hasFilters = Boolean(search || type || status || documentStatus || branchId)

  const query = useGetCustomersQuery({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    type: type || undefined,
    status: status || undefined,
    documentStatus: documentStatus || undefined,
    branchId: branchId || undefined,
    sort,
    order: sort === 'createdAt' ? 'desc' : 'asc',
  })

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
      cell: (row) => options.labelOf(options.typeOptions, row.type),
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
      id: 'documents',
      header: t('customers.columns.documents'),
      cell: (row) => (
        <StatusBadge value={row.documentStatus} options={options.documentStatusOptions} />
      ),
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
        <Link
          to={detailPath(row.id)}
          className="text-brand hover:text-brand-strong text-sm font-medium whitespace-nowrap"
        >
          {t('customers.actions.view')}
        </Link>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title={t('customers.title')}
        description={t('customers.description')}
        action={
          canCreate ? (
            <Button type="button" onClick={() => setCreateOpen(true)}>
              {t('customers.add')}
            </Button>
          ) : undefined
        }
      />
      <div className="grid min-w-0 gap-3">
        <SearchField
          value={searchInput}
          onChange={setSearchInput}
          label={t('customers.searchLabel')}
          placeholder={t('customers.searchPlaceholder')}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label={t('customers.filters.type')}
            value={type}
            onChange={(event) => onFilter(setType)(event.target.value)}
            options={[{ value: '', label: t('customers.filters.allTypes') }, ...options.typeOptions]}
          />
          <Select
            label={t('customers.filters.status')}
            value={status}
            onChange={(event) => onFilter(setStatus)(event.target.value)}
            options={[
              { value: '', label: t('customers.filters.allStatuses') },
              ...options.statusOptions,
            ]}
          />
          <Select
            label={t('customers.filters.documentStatus')}
            value={documentStatus}
            onChange={(event) => onFilter(setDocumentStatus)(event.target.value)}
            options={[
              { value: '', label: t('customers.filters.allDocumentStatuses') },
              ...options.documentStatusOptions,
            ]}
          />
          <Select
            label={t('customers.filters.sort')}
            value={sort}
            onChange={(event) => {
              const value = event.target.value
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
          {branches.allowed ? (
            <Select
              label={t('customers.filters.branch')}
              value={branchId}
              onChange={(event) => onFilter(setBranchId)(event.target.value)}
              options={[
                { value: '', label: t('customers.filters.allBranches') },
                ...branches.items.map((branch) => ({ value: branch.id, label: branch.name })),
              ]}
            />
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
    </>
  )
}
