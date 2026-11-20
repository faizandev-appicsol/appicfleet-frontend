import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { PERMISSIONS, procurementDirectoryRoles } from '@/app/router/access'
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
import { useCreateVendorMutation, useGetVendorsQuery } from '@/features/procurement/api/procurementApi'
import { VendorFormDialog } from '@/features/procurement/components/VendorFormDialog'
import { useProcurementOptions } from '@/features/procurement/hooks/useProcurementOptions'
import type { Vendor } from '@/features/procurement/schemas/procurement.schema'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

const PAGE_SIZE = 20

export function VendorsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('procurement.vendors.title'))
  const navigate = useNavigate()
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const options = useProcurementOptions()
  const { searchInput, setSearchInput, search, page, setPage } = useSearchPagination()
  const [status, setStatus] = useState('')
  const [vendorType, setVendorType] = useState('')
  const [creating, setCreating] = useState(false)
  const [createVendor] = useCreateVendorMutation()
  const canCreate = can(PERMISSIONS.vendorCreate) || hasAnyRole(roles, procurementDirectoryRoles)
  const query = useGetVendorsQuery({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    status: status || undefined,
    vendorType: vendorType || undefined,
    sort: 'createdAt',
    order: 'desc',
  })

  const columns: DataTableColumn<Vendor>[] = [
    {
      id: 'code',
      header: t('common.code'),
      cell: (row) => (
        <Link to={`${appConfig.routes.vendors}/${row.id}`} className="text-brand font-medium" dir="ltr">
          {row.vendorCode}
        </Link>
      ),
    },
    { id: 'name', header: t('common.name'), cell: (row) => row.name },
    {
      id: 'type',
      header: t('procurement.fields.vendorType'),
      cell: (row) => <StatusBadge value={row.vendorType} options={options.vendorTypeOptions} />,
    },
    {
      id: 'status',
      header: t('common.status'),
      cell: (row) => <StatusBadge value={row.status} options={options.vendorStatusOptions} />,
    },
  ]

  return (
    <>
      <PageHeader
        title={t('procurement.vendors.title')}
        description={t('procurement.vendors.description')}
        action={canCreate ? <Button type="button" onClick={() => setCreating(true)}>{t('procurement.vendors.create')}</Button> : undefined}
      />
      <div className="grid gap-3 md:grid-cols-3">
        <SearchField value={searchInput} onChange={setSearchInput} label={t('procurement.search.vendors')} placeholder={t('procurement.search.vendors')} />
        <Select label={t('common.status')} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} options={[{ value: '', label: t('common.all') }, ...options.vendorStatusOptions]} />
        <Select label={t('procurement.fields.vendorType')} value={vendorType} onChange={(e) => { setVendorType(e.target.value); setPage(1) }} options={[{ value: '', label: t('common.all') }, ...options.vendorTypeOptions]} />
      </div>
      <QueryState data={query.data} isLoading={query.isLoading} isFetching={query.isFetching && !query.isLoading} error={query.error} onRetry={query.refetch} isEmpty={(data) => data.items.length === 0} emptyTitle={t('procurement.vendors.empty')}>
        {(data) => (
          <div className="grid min-w-0 gap-3">
            <div className="border-line bg-surface min-w-0 overflow-x-auto rounded-lg border">
              <DataTable columns={columns} rows={data.items} rowKey={(row) => row.id} />
            </div>
            <Pagination data={data} page={page} onPageChange={setPage} disabled={query.isFetching} />
          </div>
        )}
      </QueryState>
      <VendorFormDialog
        open={creating}
        onClose={() => setCreating(false)}
        onSubmit={async (body) => {
          const created = await createVendor(body).unwrap()
          navigate(`${appConfig.routes.vendors}/${created.id}`)
        }}
      />
    </>
  )
}
