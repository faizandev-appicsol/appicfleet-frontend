import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import {
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
} from '@/features/organizations/api/organizationsApi'
import {
  organizationFormSchema,
  type Organization,
  type OrganizationFormValues,
} from '@/features/organizations/schemas/organization.schema'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useTranslation } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'
import { applyApiFieldErrors } from '@/utils/forms'

function toDefaults(organization?: Organization): OrganizationFormValues {
  return {
    name: organization?.name ?? '',
    code: organization?.code ?? '',
    status: organization?.status === 'inactive' ? 'inactive' : 'active',
  }
}

/** Creates an organization, or edits one when `organization` is provided. */
export function OrganizationFormDialog({
  open,
  organization,
  onClose,
}: {
  open: boolean
  organization?: Organization
  onClose: () => void
}) {
  const { t, tm } = useTranslation()
  const { accessAllOrganizations } = usePermissions()
  const [createOrganization] = useCreateOrganizationMutation()
  const [updateOrganization] = useUpdateOrganizationMutation()
  const isEdit = Boolean(organization)
  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: toDefaults(organization),
  })

  useEffect(() => {
    if (open) form.reset(toDefaults(organization))
  }, [open, organization, form])

  const statusOptions = [
    { value: 'active', label: t('status.active') },
    { value: 'inactive', label: t('status.inactive') },
  ]

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (organization) {
        await updateOrganization({
          id: organization.id,
          body: {
            name: values.name.trim(),
            // Only platform administrators may change the status; the API enforces it too.
            ...(accessAllOrganizations ? { status: values.status } : {}),
          },
        }).unwrap()
      } else {
        await createOrganization(values).unwrap()
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
      title={isEdit ? t('organizations.edit.title') : t('organizations.create.title')}
      description={
        organization
          ? t('organizations.edit.description', { name: organization.name })
          : t('organizations.create.description')
      }
      onClose={onClose}
    >
      <form className="grid gap-4" noValidate onSubmit={onSubmit}>
        {errors.root ? <Alert tone="danger">{tm(errors.root.message)}</Alert> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('organizations.form.name')}
            required
            error={tm(errors.name?.message)}
            {...form.register('name')}
          />
          <Input
            label={t('organizations.form.code')}
            required
            disabled={isEdit}
            autoCapitalize="characters"
            dir="ltr"
            hint={t('organizations.form.codeHint')}
            error={tm(errors.code?.message)}
            {...form.register('code')}
          />
        </div>
        <div className="grid gap-1.5">
          <Select
            label={t('organizations.form.status')}
            options={statusOptions}
            disabled={isEdit && !accessAllOrganizations}
            error={tm(errors.status?.message)}
            {...form.register('status')}
          />
          {isEdit && !accessAllOrganizations ? (
            <p className="text-muted text-sm">{t('organizations.form.statusLocked')}</p>
          ) : null}
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
            {isEdit ? t('organizations.edit.submit') : t('organizations.create.submit')}
          </Button>
        </ModalActions>
      </form>
    </Modal>
  )
}
