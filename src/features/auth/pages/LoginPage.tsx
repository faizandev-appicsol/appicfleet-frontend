import { useAppDispatch } from '@/app/hooks'
import { appConfig } from '@/config/app.config'
import { LoginForm } from '@/features/auth/components/LoginForm'
import '@/features/auth/styles/login.css'
import { setLocale } from '@/features/ui/slices/uiSlice'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function LoginPage() {
  const dispatch = useAppDispatch()
  const { t, locale } = useTranslation()
  useDocumentTitle(t('auth.pageTitle'))

  const nextLocale = locale === 'ar' ? 'en' : 'ar'

  return (
    <div className="login-page login-backdrop flex min-h-svh items-center justify-center px-4 py-12 sm:px-6">
      <div className="login-fade-up w-full max-w-[28rem]">
        <div className="login-card rounded-[1.75rem] px-7 py-9 sm:px-10 sm:py-11">
          <div className="mb-8 flex flex-col items-center text-center">
            <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-[var(--login-black)] text-sm font-bold tracking-tight text-white shadow-[0_12px_28px_rgba(0,0,0,0.22)]">
              FM
            </span>
            <p className="mt-4 text-sm font-semibold tracking-tight text-[var(--login-ink)]">
              {appConfig.name}
            </p>
            <p className="mt-1 text-xs tracking-[0.16em] text-[var(--login-muted)] uppercase">
              {t('auth.secureAccess')}
            </p>
          </div>

          <LoginForm />
        </div>

        <p className="login-fade-up login-fade-up-delay-4 mt-6 text-center text-xs text-[var(--login-muted)]">
          {t('auth.footer')}
        </p>
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            lang={nextLocale}
            className="text-xs font-medium text-[var(--login-muted)] underline-offset-4 hover:text-[var(--login-ink)] hover:underline"
            onClick={() => dispatch(setLocale(nextLocale))}
          >
            {nextLocale === 'ar' ? 'العربية' : 'English'}
          </button>
        </div>
      </div>
    </div>
  )
}
