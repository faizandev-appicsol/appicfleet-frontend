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
import { appConfig } from '@/config/app.config'
import {
  useDeleteUserMutation,
  useGetUserQuery,
  useUpdateUserMutation,
} from '@/features/users/api/usersApi'
import {
  USER_ROLE_OPTIONS,
  USER_STATUS_OPTIONS,
  isUserRole,
  isUserStatus,
  userUpdateSchema,
  type User,
  type UserRole,
  type UserStatus,
  type UserUpdateValues,
} from '@/features/users/schemas/user.schema'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { normalizeApiError } from '@/lib/api/apiError'
import { applyApiFieldErrors } from '@/utils/forms'
import { formatDateTime } from '@/utils/formatDate'

export function UserDetailsPage() {
  const { userId } = useParams()
  const query = useGetUserQuery(userId ?? '', { skip: !userId })
  useDocumentTitle(query.data?.name ?? 'User')

  if (!userId) {
    return <ErrorState error={new Error('This user address is missing an id.')} />
  }

  return (
    <>
      <PageHeader
        title={query.data?.name ?? 'User'}
        description="Review and update this person's access."
        action={
          <Link
            to={appConfig.routes.users}
            className="text-brand hover:text-brand-strong text-sm font-medium"
          >
            Back to users
          </Link>
        }
      />
      {query.isLoading ? <LoadingState label="Loading user" /> : null}
      {query.error ? <ErrorState error={query.error} onRetry={query.refetch} /> : null}
      {query.data ? <UserDetails user={query.data} /> : null}
    </>
  )
}

function isEditableUser(user: User): user is User & { role: UserRole; status: UserStatus } {
  return isUserRole(user.role) && isUserStatus(user.status)
}

function UserDetails({ user }: { user: User }) {
  return (
    <div className="grid gap-4">
      {isEditableUser(user) ? (
        <EditUserForm user={user} role={user.role} status={user.status} />
      ) : (
        <Card title="Profile">
          <p className="text-muted text-sm">
            This record uses a role or status the form does not edit. Current role: {user.role}.
            Current status: {user.status}.
          </p>
        </Card>
      )}
      <DeleteUser userId={user.id} name={user.name} />
    </div>
  )
}

function EditUserForm({ user, role, status }: { user: User; role: UserRole; status: UserStatus }) {
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

  return (
    <Card title="Profile" description={`Created ${formatDateTime(user.createdAt)}`}>
      <form className="grid gap-4" noValidate onSubmit={onSubmit}>
        {form.formState.errors.root ? (
          <Alert tone="danger">{form.formState.errors.root.message}</Alert>
        ) : null}
        {saved ? <Alert tone="success">User updated.</Alert> : null}
        <Input
          label="Name"
          required
          error={form.formState.errors.name?.message}
          {...form.register('name')}
        />
        <Input
          label="Email"
          type="email"
          required
          error={form.formState.errors.email?.message}
          {...form.register('email')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Role"
            options={USER_ROLE_OPTIONS}
            error={form.formState.errors.role?.message}
            {...form.register('role')}
          />
          <Select
            label="Status"
            options={USER_STATUS_OPTIONS}
            error={form.formState.errors.status?.message}
            {...form.register('status')}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={form.formState.isSubmitting}>
            Save changes
          </Button>
        </div>
      </form>
    </Card>
  )
}

function DeleteUser({ userId, name }: { userId: string; name: string }) {
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
    <Card title="Remove user" description="This revokes console access for this person.">
      <Button type="button" variant="danger" onClick={() => setOpen(true)}>
        Delete user
      </Button>
      <Modal
        open={open}
        title={`Delete ${name}?`}
        description="This cannot be undone from the console."
        onClose={() => setOpen(false)}
      >
        <div className="grid gap-4">
          {deleteState.error ? (
            <Alert tone="danger">{normalizeApiError(deleteState.error).message}</Alert>
          ) : null}
          <ModalActions>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={deleteState.isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={deleteState.isLoading}
              onClick={() => void onDelete()}
            >
              Delete user
            </Button>
          </ModalActions>
        </div>
      </Modal>
    </Card>
  )
}
