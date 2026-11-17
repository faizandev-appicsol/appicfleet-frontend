import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { appConfig } from '@/config/app.config'
import { useRegisterMutation } from '@/features/auth/api/authApi'
import { registerSchema, type RegisterFormValues } from '@/features/auth/schemas/register.schema'
import { normalizeApiError } from '@/lib/api/apiError'
import { applyApiFieldErrors } from '@/utils/forms'

export function RegisterForm() {
  const navigate = useNavigate()
  const [register] = useRegisterMutation()
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
      }).unwrap()
      navigate(appConfig.routes.home, { replace: true })
    } catch (error) {
      const normalized = normalizeApiError(error)
      if (!applyApiFieldErrors(form.setError, normalized)) {
        form.setError('root', { message: normalized.message })
      }
    }
  })

  return (
    <form className="grid gap-4" noValidate onSubmit={onSubmit}>
      <div>
        <h2 className="text-ink text-2xl font-semibold tracking-tight">Create account</h2>
        <p className="text-muted mt-1 text-sm">Register a console account for your organization.</p>
      </div>
      {form.formState.errors.root ? (
        <Alert tone="danger">{form.formState.errors.root.message}</Alert>
      ) : null}
      <Input
        label="Name"
        autoComplete="name"
        required
        error={form.formState.errors.name?.message}
        {...form.register('name')}
      />
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        required
        error={form.formState.errors.email?.message}
        {...form.register('email')}
      />
      <Input
        label="Password"
        type="password"
        autoComplete="new-password"
        required
        hint="At least 8 characters, with a letter and a number."
        error={form.formState.errors.password?.message}
        {...form.register('password')}
      />
      <Input
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        required
        error={form.formState.errors.confirmPassword?.message}
        {...form.register('confirmPassword')}
      />
      <Button type="submit" loading={form.formState.isSubmitting}>
        Create account
      </Button>
      <p className="text-muted text-sm">
        Already registered?{' '}
        <Link
          to={appConfig.routes.login}
          className="text-brand hover:text-brand-strong font-medium"
        >
          Sign in
        </Link>
      </p>
    </form>
  )
}
