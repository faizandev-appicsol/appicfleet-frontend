import { useState } from 'react'
import { PERMISSIONS } from '@/app/router/access'
import { QueryState } from '@/components/feedback/QueryState'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import {
  useArchiveVehicleDocumentMutation,
  useGetVehicleDocumentsQuery,
} from '@/features/vehicles/api/vehiclesApi'
import { DocumentFormDialog } from '@/features/vehicles/components/DocumentFormDialog'
import { useVehicleOptions } from '@/features/vehicles/hooks/useVehicleOptions'
import type { VehicleDetail, VehicleDocument } from '@/features/vehicles/schemas/vehicle.schema'
import { formatDateOnly } from '@/features/vehicles/utils/format'
import { useTranslation } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'

const PAGE_SIZE = 10

export function VehicleDocumentsSection({ vehicle }: { vehicle: VehicleDetail }) {
  const { t, tm, locale } = useTranslation()
  const { can } = usePermissions()
  const { labelOf, documentTypeOptions, documentStatusOptions } = useVehicleOptions()
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [archiving, setArchiving] = useState<VehicleDocument | undefined>()
  const [archiveDocument, archiveState] = useArchiveVehicleDocumentMutation()
  const canManage = can(PERMISSIONS.vehicleManageDocuments)

  const query = useGetVehicleDocumentsQuery({ id: vehicle.id, page, pageSize: PAGE_SIZE })

  const onArchive = async () => {
    if (!archiving) return
    try {
      await archiveDocument({ id: vehicle.id, documentId: archiving.id }).unwrap()
      setArchiving(undefined)
    } catch {
      // The mutation error is rendered inside the dialog.
    }
  }

  const columns: DataTableColumn<VehicleDocument>[] = [
    {
      id: 'type',
      header: t('vehicles.documents.columns.type'),
      className: 'whitespace-nowrap',
      cell: (row) => labelOf(documentTypeOptions, row.documentType),
    },
    {
      id: 'number',
      header: t('vehicles.documents.columns.number'),
      cell: (row) =>
        row.documentNumber ? <span dir="ltr">{row.documentNumber}</span> : <span className="text-muted">—</span>,
    },
    {
      id: 'issuedOn',
      header: t('vehicles.documents.columns.issuedOn'),
      className: 'whitespace-nowrap',
      cell: (row) => (row.issuedOn ? formatDateOnly(row.issuedOn, locale) : '—'),
    },
    {
      id: 'expiresOn',
      header: t('vehicles.documents.columns.expiresOn'),
      className: 'whitespace-nowrap',
      cell: (row) => (row.expiresOn ? formatDateOnly(row.expiresOn, locale) : '—'),
    },
    {
      id: 'storageKey',
      header: t('vehicles.documents.columns.storageKey'),
      className: 'text-muted max-w-56 text-xs break-all',
      cell: (row) => <span dir="ltr">{row.storageKey}</span>,
    },
    {
      id: 'status',
      header: t('vehicles.documents.columns.status'),
      cell: (row) => <StatusBadge value={row.status} options={documentStatusOptions} />,
    },
    ...(canManage
      ? [
          {
            id: 'actions',
            header: t('common.actions'),
            className: 'text-end',
            cell: (row: VehicleDocument) =>
              row.status === 'active' ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    archiveState.reset()
                    setArchiving(row)
                  }}
                >
                  {t('vehicles.documents.archive')}
                </Button>
              ) : null,
          },
        ]
      : []),
  ]

  return (
    <Card
      title={t('vehicles.documents.title')}
      description={t('vehicles.documents.description')}
      action={
        canManage ? (
          <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
            {t('vehicles.documents.add')}
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
        emptyTitle={t('vehicles.documents.emptyTitle')}
        emptyDescription={t('vehicles.documents.emptyDescription')}
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
      <DocumentFormDialog
        open={createOpen}
        vehicle={vehicle}
        onClose={() => setCreateOpen(false)}
      />
      <Modal
        open={Boolean(archiving)}
        title={t('vehicles.documents.archiveTitle')}
        description={t('vehicles.documents.archiveDescription')}
        onClose={() => setArchiving(undefined)}
      >
        <div className="grid gap-4">
          {archiveState.error ? (
            <Alert tone="danger">{tm(normalizeApiError(archiveState.error).message)}</Alert>
          ) : null}
          <ModalActions>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setArchiving(undefined)}
              disabled={archiveState.isLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={archiveState.isLoading}
              onClick={() => void onArchive()}
            >
              {t('vehicles.documents.archiveConfirm')}
            </Button>
          </ModalActions>
        </div>
      </Modal>
    </Card>
  )
}
