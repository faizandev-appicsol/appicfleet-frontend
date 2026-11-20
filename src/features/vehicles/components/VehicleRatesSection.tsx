import { useState } from 'react'
import { PERMISSIONS } from '@/app/router/access'
import { QueryState } from '@/components/feedback/QueryState'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useGetVehicleRatesQuery } from '@/features/vehicles/api/vehiclesApi'
import { RateFormDialog } from '@/features/vehicles/components/RateFormDialog'
import { useVehicleOptions } from '@/features/vehicles/hooks/useVehicleOptions'
import type { VehicleDetail, VehicleRate } from '@/features/vehicles/schemas/vehicle.schema'
import { useTranslation } from '@/i18n'
import { formatDateTime } from '@/utils/formatDate'

const PAGE_SIZE = 10

export function VehicleRatesSection({ vehicle }: { vehicle: VehicleDetail }) {
  const { t, locale } = useTranslation()
  const { can } = usePermissions()
  const { labelOf, rateTypeOptions, rateStatusOptions } = useVehicleOptions()
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const canManage = can(PERMISSIONS.vehicleManageRates)

  const query = useGetVehicleRatesQuery({ id: vehicle.id, page, pageSize: PAGE_SIZE })

  const columns: DataTableColumn<VehicleRate>[] = [
    {
      id: 'type',
      header: t('vehicles.rates.columns.type'),
      className: 'whitespace-nowrap',
      cell: (row) => labelOf(rateTypeOptions, row.rateType),
    },
    {
      id: 'amount',
      header: t('vehicles.rates.columns.amount'),
      className: 'whitespace-nowrap',
      // Money is a decimal string; it is displayed as received and never parsed to a number.
      cell: (row) => (
        <span className="text-ink font-medium" dir="ltr">
          {row.amount} {row.currency}
        </span>
      ),
    },
    {
      id: 'from',
      header: t('vehicles.rates.columns.effectiveFrom'),
      className: 'whitespace-nowrap',
      cell: (row) => formatDateTime(row.effectiveFrom, locale),
    },
    {
      id: 'to',
      header: t('vehicles.rates.columns.effectiveTo'),
      className: 'whitespace-nowrap',
      cell: (row) =>
        row.effectiveTo ? (
          formatDateTime(row.effectiveTo, locale)
        ) : (
          <span className="text-muted">{t('vehicles.rates.openEnded')}</span>
        ),
    },
    {
      id: 'status',
      header: t('vehicles.rates.columns.status'),
      cell: (row) => <StatusBadge value={row.status} options={rateStatusOptions} />,
    },
  ]

  return (
    <Card
      title={t('vehicles.rates.title')}
      description={t('vehicles.rates.description')}
      action={
        canManage ? (
          <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
            {t('vehicles.rates.add')}
          </Button>
        ) : undefined
      }
    >
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => data.items.length === 0}
        emptyTitle={t('vehicles.rates.emptyTitle')}
        emptyDescription={t('vehicles.rates.emptyDescription')}
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
              disabled={query.isFetching}
            />
          </div>
        )}
      </QueryState>
      <RateFormDialog open={createOpen} vehicle={vehicle} onClose={() => setCreateOpen(false)} />
    </Card>
  )
}
