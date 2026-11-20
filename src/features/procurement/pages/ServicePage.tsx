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
import { useCreateWorkOrderMutation, useGetWorkOrdersQuery } from '@/features/procurement/api/procurementApi'
import { WorkOrderFormDialog } from '@/features/procurement/components/WorkOrderFormDialog'
import { useProcurementOptions } from '@/features/procurement/hooks/useProcurementOptions'
import type { WorkOrder } from '@/features/procurement/schemas/procurement.schema'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

const PAGE_SIZE = 20

export function ServicePage() {
  const { t } = useTranslation()
  useDocumentTitle(t('procurement.service.title'))
  const navigate = useNavigate()
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const options = useProcurementOptions()
  const { searchInput, setSearchInput, search, page, setPage } = useSearchPagination()
  const [status, setStatus] = useState('')
  const [creating, setCreating] = useState(false)
  const [createWorkOrder] = useCreateWorkOrderMutation()
  const canCreate = can(PERMISSIONS.serviceCreate) || hasAnyRole(roles, procurementDirectoryRoles)
  const query = useGetWorkOrdersQuery({ page, pageSize: PAGE_SIZE, search: search || undefined, status: status || undefined, sort: 'createdAt', order: 'desc' })

  const columns: DataTableColumn<WorkOrder>[] = [
    {
      id: 'number',
      header: t('procurement.columns.number'),
      cell: (row) => (
        <Link to={`${appConfig.routes.service}/${row.id}`} className="text-brand font-medium" dir="ltr">
          {row.documentNumber ?? t('procurement.draftLabel')}
        </Link>
      ),
    },
    { id: 'vehicle', header: t('procurement.fields.vehicle'), cell: (row) => <span dir="ltr">{row.vehiclePlate}</span> },
    { id: 'type', header: t('procurement.fields.serviceType'), cell: (row) => <StatusBadge value={row.serviceType} options={options.serviceTypeOptions} /> },
    { id: 'priority', header: t('procurement.fields.priority'), cell: (row) => <StatusBadge value={row.priority} options={options.priorityOptions} /> },
    { id: 'status', header: t('common.status'), cell: (row) => <StatusBadge value={row.status} options={options.workOrderStatusOptions} /> },
  ]

  return (
    <>
      <PageHeader title={t('procurement.service.title')} description={t('procurement.service.description')} action={canCreate ? <Button onClick={() => setCreating(true)}>{t('procurement.service.create')}</Button> : undefined} />
      <div className="grid gap-3 md:grid-cols-2">
        <SearchField value={searchInput} onChange={setSearchInput} label={t('procurement.search.service')} placeholder={t('procurement.search.service')} />
        <Select label={t('common.status')} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} options={[{ value: '', label: t('common.all') }, ...options.workOrderStatusOptions]} />
      </div>
      <QueryState data={query.data} isLoading={query.isLoading} isFetching={query.isFetching && !query.isLoading} error={query.error} onRetry={query.refetch} isEmpty={(d) => d.items.length === 0} emptyTitle={t('procurement.service.empty')}>
        {(data) => (
          <div className="grid min-w-0 gap-3">
            <div className="border-line bg-surface min-w-0 overflow-x-auto rounded-lg border">
              <DataTable columns={columns} rows={data.items} rowKey={(row) => row.id} />
            </div>
            <Pagination data={data} page={page} onPageChange={setPage} disabled={query.isFetching} />
          </div>
        )}
      </QueryState>
      <WorkOrderFormDialog open={creating} onClose={() => setCreating(false)} onSubmit={async (body) => { const created = await createWorkOrder(body).unwrap(); navigate(`${appConfig.routes.service}/${created.id}`) }} />
    </>
  )
}
