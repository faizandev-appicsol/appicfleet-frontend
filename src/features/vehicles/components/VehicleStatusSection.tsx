import { useState } from 'react'
import { PERMISSIONS } from '@/app/router/access'
import { QueryState } from '@/components/feedback/QueryState'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useGetVehicleStatusHistoryQuery } from '@/features/vehicles/api/vehiclesApi'
import { ChangeStatusDialog } from '@/features/vehicles/components/ChangeStatusDialog'
import { useVehicleOptions } from '@/features/vehicles/hooks/useVehicleOptions'
import type {
  VehicleDetail,
  VehicleStatus,
  VehicleStatusEvent,
} from '@/features/vehicles/schemas/vehicle.schema'
import { useTranslation } from '@/i18n'
import { formatDateTime } from '@/utils/formatDate'

const PAGE_SIZE = 10

/** Current status with change/deactivate actions, plus the status history. */
export function VehicleStatusSection({ vehicle }: { vehicle: VehicleDetail }) {
  const { t, locale } = useTranslation()
  const { can } = usePermissions()
  const { statusOptions } = useVehicleOptions()
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [preset, setPreset] = useState<VehicleStatus | undefined>()

  const canChange = can(PERMISSIONS.vehicleChangeStatus)
  const canDeactivate = can(PERMISSIONS.vehicleDeactivate)
  const canViewHistory = can(PERMISSIONS.vehicleViewHistory)
  const canAct = canChange || canDeactivate

  const history = useGetVehicleStatusHistoryQuery(
    { id: vehicle.id, page, pageSize: PAGE_SIZE },
    { skip: !canViewHistory },
  )

  const openDialog = (status?: VehicleStatus) => {
    setPreset(status)
    setDialogOpen(true)
  }

  const statusCell = (value: string) => <StatusBadge value={value} options={statusOptions} />

  const columns: DataTableColumn<VehicleStatusEvent>[] = [
    {
      id: 'when',
      header: t('vehicles.statusPanel.columns.when'),
      className: 'whitespace-nowrap',
      cell: (row) => formatDateTime(row.createdAt, locale),
    },
    {
      id: 'from',
      header: t('vehicles.statusPanel.columns.from'),
      cell: (row) => statusCell(row.fromStatus),
    },
    {
      id: 'to',
      header: t('vehicles.statusPanel.columns.to'),
      cell: (row) => statusCell(row.toStatus),
    },
    {
      id: 'reason',
      header: t('vehicles.statusPanel.columns.reason'),
      className: 'min-w-48',
      cell: (row) => row.reason,
    },
    {
      id: 'actor',
      header: t('vehicles.statusPanel.columns.actor'),
      className: 'text-muted text-xs',
      cell: (row) => <span dir="ltr">{row.actorUserId}</span>,
    },
  ]

  return (
    <div className="grid gap-4">
      <Card
        title={t('vehicles.statusPanel.current')}
        description={t('vehicles.statusPanel.currentDescription')}
      >
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge value={vehicle.status} options={statusOptions} />
          {canChange ? (
            <Button type="button" variant="secondary" size="sm" onClick={() => openDialog()}>
              {t('vehicles.actions.changeStatus')}
            </Button>
          ) : null}
          {canDeactivate && vehicle.status !== 'inactive' ? (
            <Button type="button" variant="danger" size="sm" onClick={() => openDialog('inactive')}>
              {t('vehicles.actions.deactivate')}
            </Button>
          ) : null}
        </div>
        {!canAct ? (
          <div className="mt-3">
            <Alert tone="info">{t('vehicles.statusPanel.readOnly')}</Alert>
          </div>
        ) : null}
      </Card>

      <Card
        title={t('vehicles.statusPanel.historyTitle')}
        description={t('vehicles.statusPanel.historyDescription')}
      >
        {canViewHistory ? (
          <QueryState
            data={history.data}
            isLoading={history.isLoading}
            isFetching={history.isFetching && !history.isLoading}
            error={history.error}
            onRetry={history.refetch}
            isEmpty={(data) => data.items.length === 0}
            emptyTitle={t('vehicles.statusPanel.historyEmptyTitle')}
            emptyDescription={t('vehicles.statusPanel.historyEmptyDescription')}
          >
            {(data) => (
              <div className="grid min-w-0 gap-3">
                <div className="border-line min-w-0 overflow-x-auto rounded-lg border">
                  <DataTable columns={columns} rows={data.items} rowKey={(row) => row.id} />
                </div>
                <Pagination
                  data={data}
                  page={page}
                  onPageChange={setPage}
                  disabled={history.isFetching}
                />
              </div>
            )}
          </QueryState>
        ) : (
          <Alert tone="info">{t('vehicles.statusPanel.historyDenied')}</Alert>
        )}
      </Card>

      <ChangeStatusDialog
        open={dialogOpen}
        vehicle={vehicle}
        presetStatus={preset}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  )
}
