import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { PageHeader } from '@/components/layout/PageHeader'
import { PERMISSIONS } from '@/app/router/access'
import { appConfig } from '@/config/app.config'
import { useRoleLabel } from '@/features/auth/hooks/useRoleLabel'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useBranchOptions } from '@/features/branches/hooks/useBranchOptions'
import { useOrganizationOptions } from '@/features/organizations/hooks/useOrganizationOptions'
import {
  useDeleteUserMutation,
  useGetUserQuery,
  useUpdateUserMutation,
} from '@/features/users/api/usersApi'
import { useUserOptions } from '@/features/users/hooks/useUserOptions'
import {
  isUserRole,
  isUserStatus,
  normalizeUserStatus,
  userUpdateSchema,
  type User,
  type UserRole,
  type UserStatus,
  type UserUpdateValues,
} from '@/features/users/schemas/user.schema'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'
import { applyApiFieldErrors } from '@/utils/forms'
import { formatDateTime } from '@/utils/formatDate'

export function UserDetailsPage() {
  const { t, tm } = useTranslation()
  const { userId } = useParams()
  const query = useGetUserQuery(userId ?? '', { skip: !userId })
  useDocumentTitle(query.data?.name ?? t('users.detail.title'))

  if (!userId) {
    return <ErrorState error={new Error(tm('users.detail.missingId'))} />
  }

  return (
    <>
      <PageHeader
        title={query.data?.name ?? t('users.detail.title')}
        description={t('users.detail.description')}
        action={
          <Link
            to={appConfig.routes.users}
            className="text-brand hover:text-brand-strong text-sm font-medium"
          >
            {t('users.detail.back')}
          </Link>
        }
      />
      {query.isLoading ? <LoadingState label={t('users.detail.loading')} /> : null}
      {query.error ? <ErrorState error={query.error} onRetry={query.refetch} /> : null}
      {query.data ? <UserDetails user={query.data} /> : null}
    </>
  )
}

function isEditableUser(user: User): boolean {
  return isUserRole(user.role) && isUserStatus(normalizeUserStatus(user.status))
}

function UserDetails({ user }: { user: User }) {
  const { t } = useTranslation()
  const roleLabel = useRoleLabel()
  const { can } = usePermissions()
  const canUpdate = can(PERMISSIONS.usersUpdate)
  const canDelete = can(PERMISSIONS.usersDeactivate)

  return (
    <div className="grid gap-4">
      {isEditableUser(user) ? (
        <EditUserForm
          user={user}
          role={user.role as UserRole}
          status={normalizeUserStatus(user.status) as UserStatus}
          canUpdate={canUpdate}
        />
      ) : (
        <Card title={t('users.detail.profile')}>
          <p className="text-muted text-sm">
            {t('users.detail.unsupported', {
              role: roleLabel(user.role),
              status: t(`status.${normalizeUserStatus(user.status) as UserStatus}`),
            })}
          </p>
        </Card>
      )}
      <AccessScope user={user} />
      {canDelete ? <DeleteUser userId={user.id} name={user.name} /> : null}
    </div>
  )
}

function AccessScope({ user }: { user: User }) {
  const { t } = useTranslation()
  const organizations = useOrganizationOptions()
  const branches = useBranchOptions()

  const organization = user.accessAllOrganizations
    ? t('users.detail.allOrganizations')
    : user.organizationId
      ? (organizations.nameById.get(user.organizationId) ?? user.organizationId)
      : t('users.detail.noOrganization')

  return (
    <Card title={t('users.detail.access')}>
      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1">
          <dt className="text-muted text-xs font-medium tracking-wide uppercase">
            {t('users.detail.organization')}
          </dt>
          <dd className="text-ink text-sm">{organization}</dd>
        </div>
        <div className="grid gap-1">
          <dt className="text-muted text-xs font-medium tracking-wide uppercase">
            {t('users.detail.branches')}
          </dt>
          <dd className="text-ink text-sm">
            {user.accessAllBranches ? (
              t('users.detail.allBranches')
            ) : user.branchIds.length > 0 ? (
              <ul className="grid gap-1">
                {user.branchIds.map((id) => (
                  <li key={id}>{branches.nameById.get(id) ?? id}</li>
                ))}
              </ul>
            ) : (
              <span className="text-muted">{t('users.detail.noBranches')}</span>
            )}
          </dd>
        </div>
      </dl>
    </Card>
  )
}

function EditUserForm({
  user,
  role,
  status,
  canUpdate,
}: {
  user: User
  role: UserRole
  status: UserStatus
  canUpdate: boolean
}) {
  const { t, tm, locale } = useTranslation()
  const { roleOptions, statusOptions } = useUserOptions()
  const [updateUser] = useUpdateUserMutation()
  const [saved, setSaved] = useState(false)
  const form = useForm<UserUpdateValues>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      role,
      status,
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setSaved(false)
    try {
      await updateUser({ id: user.id, body: values }).unwrap()
      setSaved(true)
    } catch (error) {
      const normalized = normalizeApiError(error)
      if (!applyApiFieldErrors(form.setError, normalized)) {
        form.setError('root', { message: normalized.message })
      }
    }
  })

  const errors = form.formState.errors

  return (
    <Card
      title={t('users.detail.profile')}
      description={t('users.detail.createdOn', { date: formatDateTime(user.createdAt, locale) })}
    >
      <form className="grid gap-4" noValidate onSubmit={onSubmit}>
        {errors.root ? <Alert tone="danger">{tm(errors.root.message)}</Alert> : null}
        {saved ? <Alert tone="success">{t('users.detail.saved')}</Alert> : null}
        {!canUpdate ? <Alert tone="info">{t('users.detail.readOnly')}</Alert> : null}
        <Input
          label={t('users.form.name')}
          required
          disabled={!canUpdate}
          error={tm(errors.name?.message)}
          {...form.register('name')}
        />
        <Input
          label={t('users.form.email')}
          type="email"
          required
          dir="ltr"
          disabled={!canUpdate}
          error={tm(errors.email?.message)}
          {...form.register('email')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label={t('users.form.role')}
            options={roleOptions}
            disabled={!canUpdate}
            error={tm(errors.role?.message)}
            {...form.register('role')}
          />
          <Select
            label={t('users.form.status')}
            options={statusOptions}
            disabled={!canUpdate}
            error={tm(errors.status?.message)}
            {...form.register('status')}
          />
        </div>
        {canUpdate ? (
          <div className="flex justify-end">
            <Button type="submit" loading={form.formState.isSubmitting}>
              {t('common.saveChanges')}
            </Button>
          </div>
        ) : null}
      </form>
    </Card>
  )
}

function DeleteUser({ userId, name }: { userId: string; name: string }) {
  const { t, tm } = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [deleteUser, deleteState] = useDeleteUserMutation()

  const onDelete = async () => {
    try {
      await deleteUser(userId).unwrap()
      navigate(appConfig.routes.users, { replace: true })
    } catch {
      // The mutation error is rendered below.
    }
  }

  return (
    <Card title={t('users.remove.cardTitle')} description={t('users.remove.cardDescription')}>
      <Button type="button" variant="danger" onClick={() => setOpen(true)}>
        {t('users.remove.button')}
      </Button>
      <Modal
        open={open}
        title={t('users.remove.title', { name })}
        description={t('users.remove.description')}
        onClose={() => setOpen(false)}
      >
        <div className="grid gap-4">
          {deleteState.error ? (
            <Alert tone="danger">{tm(normalizeApiError(deleteState.error).message)}</Alert>
          ) : null}
          <ModalActions>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={deleteState.isLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={deleteState.isLoading}
              onClick={() => void onDelete()}
            >
              {t('users.remove.button')}
            </Button>
          </ModalActions>
        </div>
      </Modal>
    </Card>
  )
}
