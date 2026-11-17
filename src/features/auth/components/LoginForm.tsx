import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { appConfig } from '@/config/app.config'
import { useLoginMutation } from '@/features/auth/api/authApi'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/login.schema'
import { normalizeApiError } from '@/lib/api/apiError'
import { applyApiFieldErrors } from '@/utils/forms'
import { readRedirectPath } from '@/app/router/redirect'

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const [login] = useLoginMutation()
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await login(values).unwrap()
      navigate(readRedirectPath(location.state), { replace: true })
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
        <h2 className="text-ink text-2xl font-semibold tracking-tight">Sign in</h2>
        <p className="text-muted mt-1 text-sm">Use your fleet account to open the console.</p>
      </div>
      {form.formState.errors.root ? (
        <Alert tone="danger">{form.formState.errors.root.message}</Alert>
      ) : null}
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
        autoComplete="current-password"
        required
        error={form.formState.errors.password?.message}
        {...form.register('password')}
      />
      <Button type="submit" loading={form.formState.isSubmitting}>
        Sign in
      </Button>
      <p className="text-muted text-sm">
        Need an account?{' '}
        <Link
          to={appConfig.routes.register}
          className="text-brand hover:text-brand-strong font-medium"
        >
          Register
        </Link>
      </p>
    </form>
  )
}
