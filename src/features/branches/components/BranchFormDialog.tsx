import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import {
  useCreateBranchMutation,
  useUpdateBranchMutation,
} from '@/features/branches/api/branchesApi'
import {
  branchFormSchema,
  toBranchCreateBody,
  toBranchUpdateBody,
  type Branch,
  type BranchFormValues,
} from '@/features/branches/schemas/branch.schema'
import { useLegalEntityOptions } from '@/features/legal-entities/hooks/useLegalEntityOptions'
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

function toDefaults(branch?: Branch): BranchFormValues {
  return {
    organizationId: branch?.organizationId ?? '',
    legalEntityId: branch?.legalEntityId ?? '',
    name: branch?.name ?? '',
    code: branch?.code ?? '',
    timezone: branch?.timezone ?? browserTimeZone(),
    status: branch?.status === 'inactive' ? 'inactive' : 'active',
    line1: branch?.address?.line1 ?? '',
    line2: branch?.address?.line2 ?? '',
    city: branch?.address?.city ?? '',
    region: branch?.address?.region ?? '',
    postalCode: branch?.address?.postalCode ?? '',
    country: branch?.address?.country ?? '',
  }
}

/** Creates a branch, or edits one when `branch` is provided. */
export function BranchFormDialog({
  open,
  branch,
  onClose,
}: {
  open: boolean
  branch?: Branch
  onClose: () => void
}) {
  const { t, tm } = useTranslation()
  const organizations = useOrganizationOptions()
  const [createBranch] = useCreateBranchMutation()
  const [updateBranch] = useUpdateBranchMutation()
  const isEdit = Boolean(branch)
  const showOrganization = !isEdit && organizations.required
  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: toDefaults(branch),
  })

  const selectedOrganizationId = form.watch('organizationId')
  const legalEntities = useLegalEntityOptions({
    enabled: open && (!showOrganization || Boolean(selectedOrganizationId)),
    organizationId: showOrganization ? selectedOrganizationId : undefined,
  })

  useEffect(() => {
    if (open) form.reset(toDefaults(branch))
  }, [open, branch, form])

  const statusOptions = [
    { value: 'active', label: t('status.active') },
    { value: 'inactive', label: t('status.inactive') },
  ]

  const legalEntityOptions = [
    { value: '', label: t('branches.form.selectLegalEntity') },
    ...legalEntities.options,
  ]
  // Keep the current legal entity selectable even when the account cannot list them.
  if (branch && !legalEntityOptions.some((option) => option.value === branch.legalEntityId)) {
    legalEntityOptions.push({ value: branch.legalEntityId, label: branch.legalEntityId })
  }

  const onSubmit = form.handleSubmit(async (values) => {
    if (showOrganization && !values.organizationId) {
      form.setError('organizationId', { message: 'validation.selectRequired' })
      return
    }

    try {
      if (branch) {
        await updateBranch({ id: branch.id, body: toBranchUpdateBody(values) }).unwrap()
      } else {
        await createBranch(toBranchCreateBody(values)).unwrap()
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
      size="wide"
      title={isEdit ? t('branches.edit.title') : t('branches.create.title')}
      description={
        branch
          ? t('branches.edit.description', { name: branch.name })
          : t('branches.create.description')
      }
      onClose={onClose}
    >
      <form className="grid gap-4" noValidate onSubmit={onSubmit}>
        {errors.root ? <Alert tone="danger">{tm(errors.root.message)}</Alert> : null}
        <div className="grid items-start gap-4 lg:grid-cols-2">
        <div className="grid min-w-0 content-start gap-4">
        {showOrganization ? (
          <Select
            label={t('branches.form.organization')}
            required
            options={[
              { value: '', label: t('branches.form.selectOrganization') },
              ...organizations.options,
            ]}
            error={tm(errors.organizationId?.message)}
            {...form.register('organizationId', {
              onChange: () => form.setValue('legalEntityId', ''),
            })}
          />
        ) : null}
        <Select
          label={t('branches.form.legalEntity')}
          required
          options={legalEntityOptions}
          error={tm(errors.legalEntityId?.message)}
          {...form.register('legalEntityId')}
        />
        {legalEntities.allowed && !legalEntities.isLoading && legalEntities.options.length === 0 ? (
          <p className="text-muted -mt-2 text-sm">{t('branches.form.noLegalEntities')}</p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('branches.form.name')}
            required
            error={tm(errors.name?.message)}
            {...form.register('name')}
          />
          <Input
            label={t('branches.form.code')}
            required
            disabled={isEdit}
            dir="ltr"
            autoCapitalize="characters"
            hint={t('branches.form.codeHint')}
            error={tm(errors.code?.message)}
            {...form.register('code')}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('branches.form.timezone')}
            required
            dir="ltr"
            hint={t('branches.form.timezoneHint')}
            error={tm(errors.timezone?.message)}
            {...form.register('timezone')}
          />
          <Select
            label={t('branches.form.status')}
            options={statusOptions}
            error={tm(errors.status?.message)}
            {...form.register('status')}
          />
        </div>
        </div>
        <fieldset className="border-line grid min-w-0 content-start gap-4 rounded-lg border p-4">
          <legend className="text-ink mb-2 text-sm font-semibold">
            {t('branches.form.address')}
          </legend>
          <Input
            label={t('branches.form.line1')}
            error={tm(errors.line1?.message)}
            {...form.register('line1')}
          />
          <Input
            label={t('branches.form.line2')}
            error={tm(errors.line2?.message)}
            {...form.register('line2')}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t('branches.form.city')}
              error={tm(errors.city?.message)}
              {...form.register('city')}
            />
            <Input
              label={t('branches.form.region')}
              error={tm(errors.region?.message)}
              {...form.register('region')}
            />
            <Input
              label={t('branches.form.postalCode')}
              dir="ltr"
              error={tm(errors.postalCode?.message)}
              {...form.register('postalCode')}
            />
            <Input
              label={t('branches.form.country')}
              dir="ltr"
              maxLength={2}
              hint={t('branches.form.countryHint')}
              error={tm(errors.country?.message)}
              {...form.register('country')}
            />
          </div>
        </fieldset>
        </div>
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
            {isEdit ? t('branches.edit.submit') : t('branches.create.submit')}
          </Button>
        </ModalActions>
      </form>
    </Modal>
  )
}
