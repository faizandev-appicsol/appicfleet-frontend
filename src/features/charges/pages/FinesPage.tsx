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
import { useCreateFineMutation, useGetFinesQuery } from '@/features/charges/api/chargesApi'
import { FineFormDialog } from '@/features/charges/components/FineFormDialog'
import { useChargesOptions } from '@/features/charges/hooks/useChargesOptions'
import type { Fine } from '@/features/charges/schemas/charges.schema'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

const PAGE_SIZE = 20

export function FinesPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('charges.fines.title'))
  const navigate = useNavigate()
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const options = useChargesOptions()
  const { searchInput, setSearchInput, search, page, setPage } = useSearchPagination()
  const [status, setStatus] = useState('')
  const [creating, setCreating] = useState(false)
  const [createFine] = useCreateFineMutation()
  const canCreate = can(PERMISSIONS.fineCreate) || hasAnyRole(roles, chargesDirectoryRoles)
  const query = useGetFinesQuery({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    status: status || undefined,
    sort: 'createdAt',
    order: 'desc',
  })

  const columns: DataTableColumn<Fine>[] = [
    {
      id: 'number',
      header: t('charges.columns.number'),
      className: 'w-[16%]',
      cell: (row) => (
        <Link to={`${appConfig.routes.fines}/${row.id}`} className="text-brand font-medium" dir="ltr">
          {row.documentNumber ?? row.externalReference}
        </Link>
      ),
    },
    { id: 'vehicle', header: t('charges.fields.vehicle'), className: 'w-[14%]', cell: (row) => row.vehiclePlate ?? '—' },
    { id: 'customer', header: t('charges.fields.customer'), className: 'w-[20%]', cell: (row) => row.customerName ?? '—' },
    { id: 'event', header: t('charges.fields.eventAt'), className: 'w-[18%]', cell: (row) => <span dir="ltr">{row.eventAt}</span> },
    { id: 'amount', header: t('charges.columns.amount'), className: 'w-[16%]', cell: (row) => <span dir="ltr">{row.currency} {row.amount}</span> },
    { id: 'status', header: t('common.status'), className: 'w-[16%]', cell: (row) => <StatusBadge value={row.status} options={options.fineStatusOptions} /> },
  ]

  return (
    <>
      <PageHeader
        title={t('charges.fines.title')}
        description={t('charges.fines.description')}
        action={canCreate ? <Button onClick={() => setCreating(true)}>{t('charges.fines.create')}</Button> : undefined}
      />
      <div className="grid items-end gap-3 md:grid-cols-2">
        <SearchField value={searchInput} onChange={setSearchInput} label={t('charges.search.fines')} placeholder={t('charges.search.fines')} />
        <Select label={t('common.status')} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} options={[{ value: '', label: t('common.all') }, ...options.fineStatusOptions]} />
      </div>
      <QueryState data={query.data} isLoading={query.isLoading} isFetching={query.isFetching && !query.isLoading} error={query.error} onRetry={query.refetch} isEmpty={(d) => d.items.length === 0} emptyTitle={t('charges.fines.empty')}>
        {(data) => (
          <div className="grid min-w-0 gap-3">
            <div className="border-line bg-surface min-w-0 overflow-x-auto rounded-lg border">
              <DataTable columns={columns} rows={data.items} rowKey={(row) => row.id} />
            </div>
            <Pagination data={data} page={page} onPageChange={setPage} disabled={query.isFetching} />
          </div>
        )}
      </QueryState>
      <FineFormDialog
        open={creating}
        onClose={() => setCreating(false)}
        onSubmit={async (body) => {
          const created = await createFine(body).unwrap()
          navigate(`${appConfig.routes.fines}/${created.id}`)
        }}
      />
    </>
  )
}
