import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { useCreateVehicleDocumentMutation } from '@/features/vehicles/api/vehiclesApi'
import { useVehicleOptions } from '@/features/vehicles/hooks/useVehicleOptions'
import {
  documentFormSchema,
  toDocumentCreateBody,
  type DocumentFormValues,
  type VehicleDetail,
} from '@/features/vehicles/schemas/vehicle.schema'
import { useTranslation } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'
import { todayDateInput } from '@/utils/dates'
import { applyApiFieldErrors } from '@/utils/forms'

const DEFAULT_VALUES: DocumentFormValues = {
  documentType: 'registration',
  documentNumber: '',
  issuedOn: '',
  expiresOn: '',
  storageKey: '',
}

/** Records a document by opaque storage key; the console never uploads or links files. */
export function DocumentFormDialog({
  open,
  vehicle,
  onClose,
}: {
  open: boolean
  vehicle: VehicleDetail
  onClose: () => void
}) {
  const { t, tm } = useTranslation()
  const { documentTypeOptions } = useVehicleOptions()
  const [createDocument] = useCreateVehicleDocumentMutation()
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: DEFAULT_VALUES,
  })

  useEffect(() => {
    if (open) form.reset(DEFAULT_VALUES)
  }, [open, form])

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createDocument({ id: vehicle.id, body: toDocumentCreateBody(values) }).unwrap()
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
  const expiryMin = todayDateInput()

  return (
    <Modal
      open={open}
      size="medium"
      title={t('vehicles.documents.create.title')}
      description={t('vehicles.documents.create.description', { name: vehicle.plateNumber })}
      onClose={onClose}
    >
      <form className="grid gap-4" noValidate onSubmit={onSubmit}>
        {errors.root ? <Alert tone="danger">{tm(errors.root.message)}</Alert> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label={t('vehicles.documents.form.documentType')}
            required
            options={documentTypeOptions}
            error={tm(errors.documentType?.message)}
            {...form.register('documentType')}
          />
          <Input
            label={t('vehicles.documents.form.documentNumber')}
            dir="ltr"
            error={tm(errors.documentNumber?.message)}
            {...form.register('documentNumber')}
          />
          <Input
            label={t('vehicles.documents.form.issuedOn')}
            type="date"
            dir="ltr"
            error={tm(errors.issuedOn?.message)}
            {...form.register('issuedOn')}
          />
          <Input
            label={t('vehicles.documents.form.expiresOn')}
            type="date"
            dir="ltr"
            min={expiryMin}
            error={tm(errors.expiresOn?.message)}
            {...form.register('expiresOn')}
          />
        </div>
        <Input
          label={t('vehicles.documents.form.storageKey')}
          required
          dir="ltr"
          autoComplete="off"
          hint={t('vehicles.documents.form.storageKeyHint')}
          error={tm(errors.storageKey?.message)}
          {...form.register('storageKey')}
        />
        <ModalActions>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={submitting}>
            {t('vehicles.documents.create.submit')}
          </Button>
        </ModalActions>
      </form>
    </Modal>
  )
}
