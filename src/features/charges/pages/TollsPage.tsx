import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { PERMISSIONS, chargesDirectoryRoles } from '@/app/router/access'
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
import { useCreateTollMutation, useGetTollsQuery } from '@/features/charges/api/chargesApi'
import { TollFormDialog } from '@/features/charges/components/TollFormDialog'
import { useChargesOptions } from '@/features/charges/hooks/useChargesOptions'
import type { Toll } from '@/features/charges/schemas/charges.schema'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

const PAGE_SIZE = 20

export function TollsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('charges.tolls.title'))
  const navigate = useNavigate()
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const options = useChargesOptions()
  const { searchInput, setSearchInput, search, page, setPage } = useSearchPagination()
  const [status, setStatus] = useState('')
  const [creating, setCreating] = useState(false)
  const [createToll] = useCreateTollMutation()
  const canCreate = can(PERMISSIONS.tollCreate) || hasAnyRole(roles, chargesDirectoryRoles)
  const query = useGetTollsQuery({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    status: status || undefined,
    sort: 'createdAt',
    order: 'desc',
  })

  const columns: DataTableColumn<Toll>[] = [
    {
      id: 'number',
      header: t('charges.columns.number'),
      className: 'w-[16%]',
      cell: (row) => (
        <Link to={`${appConfig.routes.tolls}/${row.id}`} className="text-brand font-medium" dir="ltr">
          {row.documentNumber ?? row.externalReference}
        </Link>
      ),
    },
    { id: 'provider', header: t('charges.fields.provider'), className: 'w-[14%]', cell: (row) => row.provider },
    { id: 'vehicle', header: t('charges.fields.vehicle'), className: 'w-[14%]', cell: (row) => row.vehiclePlate ?? '—' },
    { id: 'customer', header: t('charges.fields.customer'), className: 'w-[20%]', cell: (row) => row.customerName ?? '—' },
    { id: 'amount', header: t('charges.columns.amount'), className: 'w-[16%]', cell: (row) => <span dir="ltr">{row.currency} {row.amount}</span> },
    { id: 'status', header: t('common.status'), className: 'w-[20%]', cell: (row) => <StatusBadge value={row.status} options={options.tollStatusOptions} /> },
  ]

  return (
    <>
      <PageHeader
        title={t('charges.tolls.title')}
        description={t('charges.tolls.description')}
        action={canCreate ? <Button onClick={() => setCreating(true)}>{t('charges.tolls.create')}</Button> : undefined}
      />
      <div className="grid items-end gap-3 md:grid-cols-2">
        <SearchField value={searchInput} onChange={setSearchInput} label={t('charges.search.tolls')} placeholder={t('charges.search.tolls')} />
        <Select label={t('common.status')} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} options={[{ value: '', label: t('common.all') }, ...options.tollStatusOptions]} />
      </div>
      <QueryState data={query.data} isLoading={query.isLoading} isFetching={query.isFetching && !query.isLoading} error={query.error} onRetry={query.refetch} isEmpty={(d) => d.items.length === 0} emptyTitle={t('charges.tolls.empty')}>
        {(data) => (
          <div className="grid min-w-0 gap-3">
            <div className="border-line bg-surface min-w-0 overflow-x-auto rounded-lg border">
              <DataTable columns={columns} rows={data.items} rowKey={(row) => row.id} />
            </div>
            <Pagination data={data} page={page} onPageChange={setPage} disabled={query.isFetching} />
          </div>
        )}
      </QueryState>
      <TollFormDialog
        open={creating}
        onClose={() => setCreating(false)}
        onSubmit={async (body) => {
          const created = await createToll(body).unwrap()
          navigate(`${appConfig.routes.tolls}/${created.id}`)
        }}
      />
    </>
  )
}
