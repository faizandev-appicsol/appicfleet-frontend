import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useChangePasswordMutation } from '@/features/auth/api/authApi'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useTranslation } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'
import { applyApiFieldErrors } from '@/utils/forms'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'validation.passwordRequired'),
    newPassword: z
      .string()
      .min(10, 'profile.password.min')
      .regex(/[A-Z]/, 'profile.password.upper')
      .regex(/[a-z]/, 'profile.password.lower')
      .regex(/[0-9]/, 'profile.password.digit'),
    confirmPassword: z.string().min(1, 'validation.required'),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: 'profile.password.mismatch',
    path: ['confirmPassword'],
  })
  .refine((value) => value.currentPassword !== value.newPassword, {
    message: 'profile.password.sameAsCurrent',
    path: ['newPassword'],
  })

type ChangePasswordValues = z.infer<typeof changePasswordSchema>

export function ChangePasswordForm() {
  const { t, tm } = useTranslation()
  const { logout } = useAuth()
  const [changePassword] = useChangePasswordMutation()
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap()
      form.reset()
      await logout()
    } catch (error) {
      const normalized = normalizeApiError(error)
      if (!applyApiFieldErrors(form.setError, normalized)) {
        form.setError('root', { message: normalized.message })
      }
    }
  })

  const errors = form.formState.errors

  return (
    <Card title={t('profile.password.title')} description={t('profile.password.description')}>
      <form className="grid max-w-md gap-4" noValidate onSubmit={onSubmit}>
        {errors.root ? <Alert tone="danger">{tm(errors.root.message)}</Alert> : null}
        <Input
          label={t('profile.password.current')}
          type="password"
          autoComplete="current-password"
          required
          error={tm(errors.currentPassword?.message)}
          {...form.register('currentPassword')}
        />
        <Input
          label={t('profile.password.next')}
          type="password"
          autoComplete="new-password"
          required
          error={tm(errors.newPassword?.message)}
          {...form.register('newPassword')}
        />
        <Input
          label={t('profile.password.confirm')}
          type="password"
          autoComplete="new-password"
          required
          error={tm(errors.confirmPassword?.message)}
          {...form.register('confirmPassword')}
        />
        <div>
          <Button type="submit" loading={form.formState.isSubmitting}>
            {t('profile.password.submit')}
          </Button>
        </div>
      </form>
    </Card>
  )
}
