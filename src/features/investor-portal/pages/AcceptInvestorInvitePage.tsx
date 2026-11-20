import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router'
import { Button } from '@/components/ui/Button'
import { appConfig } from '@/config/app.config'
import { useAcceptInvestorInviteMutation } from '@/features/investor-portal/api/investorPortalApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'

type FormValues = { token: string; password: string; name: string }

export function AcceptInvestorInvitePage() {
  const { t } = useTranslation()
  useDocumentTitle(t('investorPortal.invite.title'))
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [acceptInvite, state] = useAcceptInvestorInviteMutation()
  const form = useForm<FormValues>({
    defaultValues: {
      token: params.get('token') ?? '',
      password: '',
      name: '',
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await acceptInvite({
        token: values.token.trim(),
        password: values.password,
        name: values.name.trim() || undefined,
      }).unwrap()
      navigate(appConfig.routes.login, { replace: true })
    } catch (error) {
      form.setError('root', { message: normalizeApiError(error).message })
    }
  })

  return (
    <div className="bg-canvas flex min-h-svh items-center justify-center px-4 py-10">
      <form
        className="border-line bg-surface grid w-full max-w-md gap-4 rounded-2xl border p-6 shadow-sm"
        onSubmit={onSubmit}
        noValidate
      >
        <div>
          <h1 className="text-ink text-2xl font-semibold tracking-tight">
            {t('investorPortal.invite.title')}
          </h1>
          <p className="text-muted mt-2 text-sm">{t('investorPortal.invite.description')}</p>
        </div>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">{t('investorPortal.invite.token')}</span>
          <input
            className="border-line rounded-md border px-3 py-2"
            {...form.register('token', { required: true })}
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">{t('common.name')}</span>
          <input className="border-line rounded-md border px-3 py-2" {...form.register('name')} />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">{t('auth.password')}</span>
          <input
            type="password"
            className="border-line rounded-md border px-3 py-2"
            autoComplete="new-password"
            {...form.register('password', { required: true, minLength: 8 })}
          />
        </label>
        {form.formState.errors.root ? (
          <p role="alert" className="text-danger text-sm">
            {form.formState.errors.root.message}
          </p>
        ) : null}
        <Button type="submit" disabled={state.isLoading}>
          {t('investorPortal.invite.submit')}
        </Button>
      </form>
    </div>
  )
}
