import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { useCreateVehicleRateMutation } from '@/features/vehicles/api/vehiclesApi'
import { useVehicleOptions } from '@/features/vehicles/hooks/useVehicleOptions'
import {
  rateFormSchema,
  toRateCreateBody,
  type RateFormValues,
  type VehicleDetail,
} from '@/features/vehicles/schemas/vehicle.schema'
import { useTranslation } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'
import { applyApiFieldErrors } from '@/utils/forms'

const DEFAULT_VALUES: RateFormValues = {
  rateType: 'daily',
  amount: '',
  currency: '',
  effectiveFrom: '',
  effectiveTo: '',
}

/** Adds a rate card. The amount stays a decimal string end to end. */
export function RateFormDialog({
  open,
  vehicle,
  onClose,
}: {
  open: boolean
  vehicle: VehicleDetail
  onClose: () => void
}) {
  const { t, tm } = useTranslation()
  const { rateTypeOptions } = useVehicleOptions()
  const [createRate] = useCreateVehicleRateMutation()
  const form = useForm<RateFormValues>({
    resolver: zodResolver(rateFormSchema),
    defaultValues: DEFAULT_VALUES,
  })

  useEffect(() => {
    if (open) form.reset(DEFAULT_VALUES)
  }, [open, form])

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createRate({ id: vehicle.id, body: toRateCreateBody(values) }).unwrap()
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
      title={t('vehicles.rates.create.title')}
      description={t('vehicles.rates.create.description', { name: vehicle.plateNumber })}
      onClose={onClose}
    >
      <form className="grid gap-4" noValidate onSubmit={onSubmit}>
        {errors.root ? <Alert tone="danger">{tm(errors.root.message)}</Alert> : null}
        <Select
          label={t('vehicles.rates.form.rateType')}
          required
          options={rateTypeOptions}
          error={tm(errors.rateType?.message)}
          {...form.register('rateType')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('vehicles.rates.form.amount')}
            required
            dir="ltr"
            inputMode="decimal"
            hint={t('vehicles.rates.form.amountHint')}
            error={tm(errors.amount?.message)}
            {...form.register('amount')}
          />
          <Input
            label={t('vehicles.rates.form.currency')}
            required
            dir="ltr"
            maxLength={3}
            autoCapitalize="characters"
            hint={t('vehicles.rates.form.currencyHint')}
            error={tm(errors.currency?.message)}
            {...form.register('currency')}
          />
          <Input
            label={t('vehicles.rates.form.effectiveFrom')}
            type="datetime-local"
            required
            dir="ltr"
            error={tm(errors.effectiveFrom?.message)}
            {...form.register('effectiveFrom')}
          />
          <Input
            label={t('vehicles.rates.form.effectiveTo')}
            type="datetime-local"
            dir="ltr"
            hint={t('vehicles.rates.form.effectiveToHint')}
            error={tm(errors.effectiveTo?.message)}
            {...form.register('effectiveTo')}
          />
        </div>
        <ModalActions>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={submitting}>
            {t('vehicles.rates.create.submit')}
          </Button>
        </ModalActions>
      </form>
    </Modal>
  )
}
