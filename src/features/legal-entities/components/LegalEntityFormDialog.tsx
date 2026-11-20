import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import {
  useCreateLegalEntityMutation,
  useUpdateLegalEntityMutation,
} from '@/features/legal-entities/api/legalEntitiesApi'
import {
  legalEntityFormSchema,
  toLegalEntityCreateBody,
  toLegalEntityUpdateBody,
  type LegalEntity,
  type LegalEntityFormValues,
} from '@/features/legal-entities/schemas/legalEntity.schema'
import { useOrganizationOptions } from '@/features/organizations/hooks/useOrganizationOptions'
import { useTranslation } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'
import { applyApiFieldErrors } from '@/utils/forms'

function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  } catch {
    return ''
  }
}

function toDefaults(legalEntity?: LegalEntity): LegalEntityFormValues {
  return {
    organizationId: legalEntity?.organizationId ?? '',
    legalName: legalEntity?.legalName ?? '',
    displayName: legalEntity?.displayName ?? '',
    country: legalEntity?.country ?? '',
    taxIdentifier: legalEntity?.taxIdentifier ?? '',
    defaultCurrency: legalEntity?.defaultCurrency ?? '',
    timezone: legalEntity?.timezone ?? browserTimeZone(),
    status: legalEntity?.status === 'inactive' ? 'inactive' : 'active',
  }
}

/** Creates a legal entity, or edits one when `legalEntity` is provided. */
export function LegalEntityFormDialog({
  open,
  legalEntity,
  onClose,
}: {
  open: boolean
  legalEntity?: LegalEntity
  onClose: () => void
}) {
  const { t, tm } = useTranslation()
  const organizations = useOrganizationOptions()
  const [createLegalEntity] = useCreateLegalEntityMutation()
  const [updateLegalEntity] = useUpdateLegalEntityMutation()
  const isEdit = Boolean(legalEntity)
  // Platform-wide accounts must name the organization on create; others use their own.
  const showOrganization = !isEdit && organizations.required
  const form = useForm<LegalEntityFormValues>({
    resolver: zodResolver(legalEntityFormSchema),
    defaultValues: toDefaults(legalEntity),
  })

  useEffect(() => {
    if (open) form.reset(toDefaults(legalEntity))
  }, [open, legalEntity, form])

  const statusOptions = [
    { value: 'active', label: t('status.active') },
    { value: 'inactive', label: t('status.inactive') },
  ]

  const onSubmit = form.handleSubmit(async (values) => {
    if (showOrganization && !values.organizationId) {
      form.setError('organizationId', { message: 'validation.selectRequired' })
      return
    }

    try {
      if (legalEntity) {
        await updateLegalEntity({
          id: legalEntity.id,
          body: toLegalEntityUpdateBody(values),
        }).unwrap()
      } else {
        await createLegalEntity(toLegalEntityCreateBody(values)).unwrap()
      }
      onClose()
    } catch (error) {
      const normalized = normalizeApiError(error)
      if (!applyApiFieldErrors(form.setError, normalized)) {
        form.setError('root', { message: normalized.message })
      }
    }
  })

  const errors = form.formState.errors

  return (
    <Modal
      open={open}
      size="medium"
      title={isEdit ? t('legalEntities.edit.title') : t('legalEntities.create.title')}
      description={
        legalEntity
          ? t('legalEntities.edit.description', { name: legalEntity.displayName })
          : t('legalEntities.create.description')
      }
      onClose={onClose}
    >
      <form className="grid gap-4" noValidate onSubmit={onSubmit}>
        {errors.root ? <Alert tone="danger">{tm(errors.root.message)}</Alert> : null}
        {showOrganization ? (
          <Select
            label={t('legalEntities.form.organization')}
            required
            options={[
              { value: '', label: t('legalEntities.form.selectOrganization') },
              ...organizations.options,
            ]}
            error={tm(errors.organizationId?.message)}
            {...form.register('organizationId')}
          />
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('legalEntities.form.legalName')}
            required
            error={tm(errors.legalName?.message)}
            {...form.register('legalName')}
          />
          <Input
            label={t('legalEntities.form.displayName')}
            required
            error={tm(errors.displayName?.message)}
            {...form.register('displayName')}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('legalEntities.form.country')}
            required
            dir="ltr"
            maxLength={2}
            hint={t('legalEntities.form.countryHint')}
            error={tm(errors.country?.message)}
            {...form.register('country')}
          />
          <Input
            label={t('legalEntities.form.currency')}
            required
            dir="ltr"
            maxLength={3}
            hint={t('legalEntities.form.currencyHint')}
            error={tm(errors.defaultCurrency?.message)}
            {...form.register('defaultCurrency')}
          />
        </div>
        <Input
          label={t('legalEntities.form.taxIdentifier')}
          dir="ltr"
          error={tm(errors.taxIdentifier?.message)}
          {...form.register('taxIdentifier')}
        />
        <Input
          label={t('legalEntities.form.timezone')}
          required
          dir="ltr"
          hint={t('legalEntities.form.timezoneHint')}
          error={tm(errors.timezone?.message)}
          {...form.register('timezone')}
        />
        <Select
          label={t('legalEntities.form.status')}
          options={statusOptions}
          error={tm(errors.status?.message)}
          {...form.register('status')}
        />
        <ModalActions>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={form.formState.isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={form.formState.isSubmitting}>
            {isEdit ? t('legalEntities.edit.submit') : t('legalEntities.create.submit')}
          </Button>
        </ModalActions>
      </form>
    </Modal>
  )
}
