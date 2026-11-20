import { useState } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { useDeleteVehicleMutation } from '@/features/vehicles/api/vehiclesApi'
import { useTranslation } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'

/** Confirms a soft delete — the vehicle stays in the database with deletedAt set. */
export function DeleteVehicleDialog({
  open,
  vehicleId,
  vehicleName,
  onClose,
  onDeleted,
}: {
  open: boolean
  vehicleId: string
  vehicleName: string
  onClose: () => void
  onDeleted?: () => void
}) {
  const { t, tm } = useTranslation()
  const [deleteVehicle] = useDeleteVehicleMutation()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onConfirm = async () => {
    setError(null)
    setSubmitting(true)
    try {
      await deleteVehicle(vehicleId).unwrap()
      onDeleted?.()
      onClose()
    } catch (err) {
      setError(normalizeApiError(err).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      title={t('vehicles.delete.title')}
      description={t('vehicles.delete.description', { name: vehicleName })}
      onClose={onClose}
    >
      <div className="grid gap-4">
        {error ? <Alert tone="danger">{tm(error)}</Alert> : null}
        <p className="text-muted text-sm">{t('vehicles.delete.softHint')}</p>
        <ModalActions>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            {t('common.cancel')}
          </Button>
          <Button type="button" variant="danger" loading={submitting} onClick={() => void onConfirm()}>
            {t('vehicles.delete.submit')}
          </Button>
        </ModalActions>
      </div>
    </Modal>
  )
}
