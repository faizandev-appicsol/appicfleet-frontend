import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { PERMISSIONS } from '@/app/router/access'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useChangeVehicleStatusMutation } from '@/features/vehicles/api/vehiclesApi'
import { useVehicleOptions } from '@/features/vehicles/hooks/useVehicleOptions'
import {
  changeStatusFormSchema,
  vehicleStatuses,
  type ChangeStatusFormValues,
  type VehicleDetail,
  type VehicleStatus,
} from '@/features/vehicles/schemas/vehicle.schema'
import { useTranslation } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'
import { applyApiFieldErrors } from '@/utils/forms'

function defaultValues(
  currentStatus: string,
  canDeactivate: boolean,
  deactivate: boolean,
): ChangeStatusFormValues {
  const allowed = vehicleStatuses.filter(
    (status) => status !== currentStatus && (status !== 'inactive' || canDeactivate),
  )
  const status = deactivate && canDeactivate ? 'inactive' : (allowed[0] ?? 'available')
  return { status, reason: '' }
}

/**
 * Changes a vehicle's status with a recorded reason. The `inactive` option (deactivation) is only
 * offered to accounts holding `vehicle.deactivate`; the API remains the authority.
 */
export function ChangeStatusDialog({
  open,
  vehicle,
  presetStatus,
  onClose,
}: {
  open: boolean
  vehicle: VehicleDetail
  /** Pre-selects a status, for example `inactive` from the deactivate action. */
  presetStatus?: VehicleStatus
  onClose: () => void
}) {
  const { t, tm } = useTranslation()
  const { can } = usePermissions()
  const { statusOptions, labelOf } = useVehicleOptions()
  const [changeStatus] = useChangeVehicleStatusMutation()
  const canDeactivate = can(PERMISSIONS.vehicleDeactivate)
  const isDeactivate = presetStatus === 'inactive' && canDeactivate

  const selectable = statusOptions.filter(
    (option) =>
      option.value !== vehicle.status && (option.value !== 'inactive' || canDeactivate),
  )

  const form = useForm<ChangeStatusFormValues>({
    resolver: zodResolver(changeStatusFormSchema),
    defaultValues: defaultValues(vehicle.status, canDeactivate, isDeactivate),
  })

  useEffect(() => {
    if (open) form.reset(defaultValues(vehicle.status, canDeactivate, isDeactivate))
  }, [open, vehicle.status, canDeactivate, isDeactivate, form])

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await changeStatus({
        id: vehicle.id,
        body: { status: values.status, reason: values.reason.trim() },
      }).unwrap()
      onClose()
    } catch (error) {
      const normalized = normalizeApiError(error)
      if (!applyApiFieldErrors(form.setError, normalized)) {
        form.setError('root', { message: normalized.message })
      }
    }
  })

  const errors = form.formState.errors
  const submitting = form.formState.isSubmitting

  return (
    <Modal
      open={open}
      size="medium"
      title={isDeactivate ? t('vehicles.statusDialog.deactivateTitle') : t('vehicles.statusDialog.title')}
      description={
        isDeactivate
          ? t('vehicles.statusDialog.deactivateDescription', { name: vehicle.plateNumber })
          : t('vehicles.statusDialog.description', {
              status: labelOf(statusOptions, vehicle.status),
            })
      }
      onClose={onClose}
    >
      <form className="grid gap-4" noValidate onSubmit={onSubmit}>
        {errors.root ? <Alert tone="danger">{tm(errors.root.message)}</Alert> : null}
        <Select
          label={t('vehicles.statusDialog.newStatus')}
          required
          options={selectable}
          error={tm(errors.status?.message)}
          {...form.register('status')}
        />
        <Textarea
          label={t('vehicles.statusDialog.reason')}
          required
          hint={t('vehicles.statusDialog.reasonHint')}
          error={tm(errors.reason?.message)}
          {...form.register('reason')}
        />
        <ModalActions>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant={isDeactivate ? 'danger' : 'primary'}
            loading={submitting}
          >
            {isDeactivate
              ? t('vehicles.statusDialog.deactivateSubmit')
              : t('vehicles.statusDialog.submit')}
          </Button>
        </ModalActions>
      </form>
    </Modal>
  )
}
