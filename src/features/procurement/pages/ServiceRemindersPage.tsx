import { useState } from 'react'
import { PERMISSIONS, procurementDirectoryRoles } from '@/app/router/access'
import { useAppSelector } from '@/app/hooks'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { Select } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { hasAnyRole } from '@/features/auth/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import {
  useCreateServiceReminderMutation,
  useGetServiceRemindersQuery,
  useReminderActionMutation,
} from '@/features/procurement/api/procurementApi'
import { ReminderFormDialog } from '@/features/procurement/components/ReminderFormDialog'
import { useProcurementOptions } from '@/features/procurement/hooks/useProcurementOptions'
import type { Reminder } from '@/features/procurement/schemas/procurement.schema'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

const PAGE_SIZE = 20

export function ServiceRemindersPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('procurement.reminders.title'))
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const options = useProcurementOptions()
  const { page, setPage } = useSearchPagination()
  const [status, setStatus] = useState('')
  const [creating, setCreating] = useState(false)
  const [createReminder] = useCreateServiceReminderMutation()
  const [action, actionState] = useReminderActionMutation()
  const canCreate = can(PERMISSIONS.serviceReminderCreate) || hasAnyRole(roles, procurementDirectoryRoles)
  const canManage = can(PERMISSIONS.serviceReminderManage) || hasAnyRole(roles, procurementDirectoryRoles)
  const query = useGetServiceRemindersQuery({ page, pageSize: PAGE_SIZE, status: status || undefined })

  const columns: DataTableColumn<Reminder>[] = [
    { id: 'vehicle', header: t('procurement.fields.vehicle'), cell: (row) => <span dir="ltr">{row.vehiclePlate}</span> },
    { id: 'type', header: t('procurement.fields.serviceType'), cell: (row) => <StatusBadge value={row.serviceType} options={options.serviceTypeOptions} /> },
    { id: 'basis', header: t('procurement.fields.basis'), cell: (row) => <StatusBadge value={row.basis} options={options.reminderBasisOptions} /> },
    { id: 'due', header: t('procurement.fields.dueAt'), cell: (row) => <span dir="ltr">{row.dueAt ?? row.dueMileage ?? t('common.notSet')}</span> },
    { id: 'status', header: t('common.status'), cell: (row) => <StatusBadge value={row.status} options={options.reminderStatusOptions} /> },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: (row) =>
        canManage && row.status !== 'completed' && row.status !== 'dismissed' ? (
          <div className="flex gap-2">
            <Button variant="ghost" disabled={actionState.isLoading} onClick={() => void action({ id: row.id, action: 'complete', body: {} })}>
              {t('procurement.actions.complete')}
            </Button>
            <Button variant="ghost" disabled={actionState.isLoading} onClick={() => void action({ id: row.id, action: 'dismiss' })}>
              {t('procurement.actions.dismiss')}
            </Button>
          </div>
        ) : null,
    },
  ]

  return (
    <>
      <PageHeader title={t('procurement.reminders.title')} description={t('procurement.reminders.description')} action={canCreate ? <Button onClick={() => setCreating(true)}>{t('procurement.reminders.create')}</Button> : undefined} />
      <Select label={t('common.status')} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} options={[{ value: '', label: t('common.all') }, ...options.reminderStatusOptions]} />
      <QueryState data={query.data} isLoading={query.isLoading} isFetching={query.isFetching && !query.isLoading} error={query.error} onRetry={query.refetch} isEmpty={(d) => d.items.length === 0} emptyTitle={t('procurement.reminders.empty')}>
        {(data) => (
          <div className="grid min-w-0 gap-3">
            <div className="border-line bg-surface min-w-0 overflow-x-auto rounded-lg border">
              <DataTable columns={columns} rows={data.items} rowKey={(row) => row.id} />
            </div>
            <Pagination data={data} page={page} onPageChange={setPage} disabled={query.isFetching} />
          </div>
        )}
      </QueryState>
      <ReminderFormDialog open={creating} onClose={() => setCreating(false)} onSubmit={async (body) => { await createReminder(body).unwrap() }} />
    </>
  )
}
