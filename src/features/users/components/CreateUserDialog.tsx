import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { useCreateUserMutation } from '@/features/users/api/usersApi'
import {
  USER_ROLE_OPTIONS,
  userFormSchema,
  type UserFormValues,
} from '@/features/users/schemas/user.schema'
import { normalizeApiError } from '@/lib/api/apiError'
import { applyApiFieldErrors } from '@/utils/forms'

export function CreateUserDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [createUser] = useCreateUserMutation()
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: { name: '', email: '', role: 'viewer' },
  })

  const close = () => {
    form.reset()
    onClose()
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createUser(values).unwrap()
      form.reset()
      onClose()
    } catch (error) {
      const normalized = normalizeApiError(error)
      if (!applyApiFieldErrors(form.setError, normalized)) {
        form.setError('root', { message: normalized.message })
      }
    }
  })

  return (
    <Modal
      open={open}
      title="Add user"
      description="Creates a person who can sign in to the console."
      onClose={close}
    >
      <form className="grid gap-4" noValidate onSubmit={onSubmit}>
        {form.formState.errors.root ? (
          <Alert tone="danger">{form.formState.errors.root.message}</Alert>
        ) : null}
        <Input
          label="Name"
          required
          error={form.formState.errors.name?.message}
          {...form.register('name')}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="off"
          required
          error={form.formState.errors.email?.message}
          {...form.register('email')}
        />
        <Select
          label="Role"
          options={USER_ROLE_OPTIONS}
          error={form.formState.errors.role?.message}
          {...form.register('role')}
        />
        <ModalActions>
          <Button
            type="button"
            variant="secondary"
            onClick={close}
            disabled={form.formState.isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" loading={form.formState.isSubmitting}>
            Create user
          </Button>
        </ModalActions>
      </form>
    </Modal>
  )
}
