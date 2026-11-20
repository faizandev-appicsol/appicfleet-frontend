import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useBranchOptions } from '@/features/branches/hooks/useBranchOptions'
import { useOrganizationOptions } from '@/features/organizations/hooks/useOrganizationOptions'
import { useCreateUserMutation } from '@/features/users/api/usersApi'
import { useUserOptions } from '@/features/users/hooks/useUserOptions'
import {
  toUserCreateBody,
  userFormSchema,
  type UserFormValues,
} from '@/features/users/schemas/user.schema'
import { useTranslation } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'
import { applyApiFieldErrors } from '@/utils/forms'

const DEFAULT_VALUES: UserFormValues = {
  name: '',
  email: '',
  role: 'viewer',
  organizationId: '',
  branchIds: [],
  accessAllBranches: false,
}

export function CreateUserDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, tm } = useTranslation()
  const { roleOptions } = useUserOptions()
  const { accessAllBranches: canGrantAllBranches, accessAllOrganizations } = usePermissions()
  const organizations = useOrganizationOptions()
  const [createUser] = useCreateUserMutation()
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const organizationId = form.watch('organizationId')
  const selectedBranchIds = form.watch('branchIds')
  const accessAllBranches = form.watch('accessAllBranches')
  const branches = useBranchOptions({
    enabled: open && (!organizations.required || Boolean(organizationId)),
    organizationId: organizations.required ? organizationId : undefined,
  })

  useEffect(() => {
    if (open) form.reset(DEFAULT_VALUES)
  }, [open, form])

  const close = () => {
    form.reset(DEFAULT_VALUES)
    onClose()
  }

  const toggleBranch = (id: string, checked: boolean) => {
    const next = checked ? [...selectedBranchIds, id] : selectedBranchIds.filter((item) => item !== id)
    form.setValue('branchIds', next, { shouldDirty: true })
  }

  const onSubmit = form.handleSubmit(async (values) => {
    if (organizations.required && !values.organizationId) {
      form.setError('organizationId', { message: 'validation.selectRequired' })
      return
    }

    try {
      await createUser(toUserCreateBody(values)).unwrap()
      close()
    } catch (error) {
      const normalized = normalizeApiError(error)
      if (!applyApiFieldErrors(form.setError, normalized)) {
        form.setError('root', { message: normalized.message })
      }
    }
  })

  const errors = form.formState.errors
  const canGrantAll = canGrantAllBranches || accessAllOrganizations

  return (
    <Modal
      open={open}
      size="medium"
      title={t('users.create.title')}
      description={t('users.create.description')}
      onClose={close}
    >
      <form className="grid gap-4" noValidate onSubmit={onSubmit}>
        {errors.root ? <Alert tone="danger">{tm(errors.root.message)}</Alert> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('users.form.name')}
            required
            error={tm(errors.name?.message)}
            {...form.register('name')}
          />
          <Input
            label={t('users.form.email')}
            type="email"
            autoComplete="off"
            required
            dir="ltr"
            error={tm(errors.email?.message)}
            {...form.register('email')}
          />
        </div>
        <Select
          label={t('users.form.role')}
          options={roleOptions}
          error={tm(errors.role?.message)}
          {...form.register('role')}
        />
        {organizations.required ? (
          <Select
            label={t('users.form.organization')}
            required
            options={[
              { value: '', label: t('users.form.selectOrganization') },
              ...organizations.options,
            ]}
            error={tm(errors.organizationId?.message)}
            {...form.register('organizationId', {
              onChange: () => {
                form.setValue('branchIds', [])
              },
            })}
          />
        ) : null}
        {branches.allowed ? (
          <fieldset className="grid gap-2">
            <legend className="text-ink mb-1 text-sm font-medium">{t('users.form.branches')}</legend>
            {canGrantAll ? (
              <label className="text-ink flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="accent-brand size-4"
                  {...form.register('accessAllBranches')}
                />
                {t('users.form.accessAllBranches')}
              </label>
            ) : null}
            {!accessAllBranches ? (
              branches.items.length > 0 ? (
                <ul className="border-line grid max-h-40 gap-1 overflow-y-auto rounded-md border p-2">
                  {branches.items.map((branch) => (
                    <li key={branch.id}>
                      <label className="text-ink flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="accent-brand size-4"
                          checked={selectedBranchIds.includes(branch.id)}
                          onChange={(event) => toggleBranch(branch.id, event.target.checked)}
                        />
                        <span>{branch.name}</span>
                        <span className="text-muted text-xs" dir="ltr">
                          {branch.code}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              ) : branches.isLoading ? null : (
                <p className="text-muted text-sm">{t('users.form.noBranchesAvailable')}</p>
              )
            ) : null}
            {errors.branchIds?.message ? (
              <p className="text-danger text-sm">{tm(errors.branchIds.message)}</p>
            ) : null}
          </fieldset>
        ) : null}
        <ModalActions>
          <Button
            type="button"
            variant="secondary"
            onClick={close}
            disabled={form.formState.isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={form.formState.isSubmitting}>
            {t('users.create.submit')}
          </Button>
        </ModalActions>
      </form>
    </Modal>
  )
}
