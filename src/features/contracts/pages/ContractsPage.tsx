import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { PERMISSIONS, contractDirectoryRoles } from '@/app/router/access'
import { useAppSelector } from '@/app/hooks'
import { SearchField } from '@/components/common/SearchField'
import { QueryState } from '@/components/feedback/QueryState'
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
import { formatInZone } from '@/features/bookings/utils/zonedTime'
import { useCreateContractMutation, useGetContractsQuery } from '@/features/contracts/api/contractsApi'
import { ContractFormDialog } from '@/features/contracts/components/ContractFormDialog'
import { useContractOptions } from '@/features/contracts/hooks/useContractOptions'
import type { Contract, ContractWriteBody } from '@/features/contracts/schemas/contract.schema'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

const PAGE_SIZE = 20

export function ContractsPage() {
  const { t, locale } = useTranslation()
  useDocumentTitle(t('contracts.title'))
  const navigate = useNavigate()
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const options = useContractOptions()
  const branches = useBranchOptions()
  const { searchInput, setSearchInput, search, page, setPage } = useSearchPagination()
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [branchId, setBranchId] = useState('')
  const [creating, setCreating] = useState(false)
  const [createContract] = useCreateContractMutation()
  const canCreate = can(PERMISSIONS.contractCreate) || hasAnyRole(roles, contractDirectoryRoles)

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

  const onFilter = (apply: (value: string) => void) => (value: string) => {
    apply(value)
    setPage(1)
  }
  const detailPath = (id: string) => `${appConfig.routes.contracts}/${encodeURIComponent(id)}`
  const zoneFor = (id: string) => branches.items.find((branch) => branch.id === id)?.timezone || 'UTC'

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
    { id: 'customer', header: t('contracts.columns.customer'), cell: (row) => row.customerName ?? t('common.notSet') },
    { id: 'type', header: t('contracts.columns.type'), cell: (row) => options.labelOf(options.typeOptions, row.type) },
    {
      id: 'vehicle',
      header: t('contracts.columns.vehicle'),
      cell: (row) => (row.currentPlate ? <span dir="ltr">{row.currentPlate}</span> : t('common.notSet')),
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
    { id: 'status', header: t('common.status'), cell: (row) => <StatusBadge value={row.status} options={options.statusOptions} /> },
    {
      id: 'branch',
      header: t('contracts.columns.branch'),
      cell: (row) => branches.nameById.get(row.branchId) ?? row.branchId,
    },
    {
      id: 'actions',
      header: t('common.actions'),
      className: 'text-end',
      cell: (row) => (
        <Link to={detailPath(row.id)} className="text-brand text-sm font-medium">
          {t('contracts.actions.view')}
        </Link>
      ),
    },
  ]

  async function save(body: ContractWriteBody) {
    const created = await createContract(body).unwrap()
    navigate(detailPath(created.id))
  }

  return (
    <>
      <PageHeader
        title={t('contracts.title')}
        description={t('contracts.description')}
        action={
          canCreate ? (
            <Button type="button" onClick={() => setCreating(true)}>
              {t('contracts.add')}
            </Button>
          ) : undefined
        }
      />
      <div className="grid gap-3">
        <SearchField
          value={searchInput}
          onChange={setSearchInput}
          label={t('contracts.searchLabel')}
          placeholder={t('contracts.searchPlaceholder')}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Select
            label={t('contracts.columns.type')}
            value={type}
            onChange={(event) => onFilter(setType)(event.target.value)}
            options={[{ value: '', label: t('contracts.filters.allTypes') }, ...options.typeOptions]}
          />
          <Select
            label={t('common.status')}
            value={status}
            onChange={(event) => onFilter(setStatus)(event.target.value)}
            options={[{ value: '', label: t('contracts.filters.allStatuses') }, ...options.statusOptions]}
          />
          {branches.allowed ? (
            <Select
              label={t('contracts.columns.branch')}
              value={branchId}
              onChange={(event) => onFilter(setBranchId)(event.target.value)}
              options={[
                { value: '', label: t('contracts.filters.allBranches') },
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
        emptyTitle={t('contracts.emptyTitle')}
        emptyDescription={search || status || type ? t('contracts.emptyFiltered') : t('contracts.emptyDescription')}
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
      {creating ? (
        <ContractFormDialog open onClose={() => setCreating(false)} onSubmit={save} />
      ) : null}
    </>
  )
}
