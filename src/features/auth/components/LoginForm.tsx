import { useEffect, useId, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router'
import { investorRole } from '@/app/router/access'
import { readRedirectPath } from '@/app/router/redirect'
import { appConfig } from '@/config/app.config'
import { hasAnyRole } from '@/features/auth/access'
import { useLoginMutation } from '@/features/auth/api/authApi'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/login.schema'
import { useTranslation } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'
import { applyApiFieldErrors } from '@/utils/forms'

const REMEMBER_EMAIL_KEY = 'fleet.login.rememberEmail'

function readSessionExpired(state: unknown): boolean {
  return (
    typeof state === 'object' &&
    state !== null &&
    'sessionExpired' in state &&
    (state as { sessionExpired?: unknown }).sessionExpired === true
  )
}

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t, tm } = useTranslation()
  const sessionExpired = readSessionExpired(location.state)
  const [login] = useLoginMutation()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [forgotHint, setForgotHint] = useState(false)
  const emailId = useId()
  const passwordId = useId()
  const rememberId = useId()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_EMAIL_KEY)
      if (saved) {
        form.setValue('email', saved)
        setRememberMe(true)
      }
    } catch {
      /* Storage can be blocked. */
    }
  }, [form])

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const session = await login(values).unwrap()
      try {
        if (rememberMe) {
          localStorage.setItem(REMEMBER_EMAIL_KEY, values.email.trim())
        } else {
          localStorage.removeItem(REMEMBER_EMAIL_KEY)
        }
      } catch {
        /* Storage can be blocked. */
      }
      const requested = readRedirectPath(location.state)
      const isInvestor = hasAnyRole(session.user.roles, [investorRole])
      const destination = isInvestor
        ? requested.startsWith(appConfig.routes.investor)
          ? requested
          : appConfig.routes.investor
        : requested.startsWith(appConfig.routes.investor)
          ? appConfig.routes.home
          : requested
      navigate(destination, { replace: true })
    } catch (error) {
      const normalized = normalizeApiError(error)
      if (!applyApiFieldErrors(form.setError, normalized)) {
        form.setError('root', { message: normalized.message })
      }
    }
  })

  const emailError = tm(form.formState.errors.email?.message)
  const passwordError = tm(form.formState.errors.password?.message)

  return (
    <form className="grid gap-5" noValidate onSubmit={onSubmit}>
      <div className="login-fade-up text-center sm:text-start">
        <h1 className="text-[1.85rem] leading-tight font-semibold tracking-tight text-[var(--login-ink)] sm:text-[2rem]">
          {t('auth.welcomeTitle')}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--login-muted)]">
          {t('auth.welcomeSubtitle')}
        </p>
      </div>

      {sessionExpired && !form.formState.errors.root ? (
        <div
          role="status"
          className="login-fade-up rounded-2xl border border-[#ecd9a8] bg-[#fffaf0] px-4 py-3 text-sm text-[#7a5a12]"
        >
          {t('auth.sessionExpired')}
        </div>
      ) : null}

      {form.formState.errors.root ? (
        <div
          role="alert"
          className="login-fade-up rounded-2xl border border-[#f0c1bc] bg-[#fff5f4] px-4 py-3 text-sm text-[#9f2d22]"
        >
          {tm(form.formState.errors.root.message)}
        </div>
      ) : null}

      <div className="login-fade-up login-fade-up-delay-1 grid gap-2">
        <label htmlFor={emailId} className="text-sm font-medium text-[var(--login-ink)]">
          {t('auth.email')}
        </label>
        <div
          className="login-field flex items-center gap-3 rounded-2xl border border-[var(--login-line)] px-4 transition-[border-color,box-shadow,background-color]"
          data-invalid={emailError ? 'true' : undefined}
        >
          <MailIcon />
          <input
            id={emailId}
            type="email"
            autoComplete="email"
            required
            dir="ltr"
            placeholder={t('auth.emailPlaceholder')}
            aria-invalid={emailError ? true : undefined}
            className="h-12 w-full bg-transparent text-[0.95rem] text-[var(--login-ink)] outline-none placeholder:text-[var(--login-muted)]/80"
            {...form.register('email')}
          />
        </div>
        {emailError ? <p className="text-sm text-[#9f2d22]">{emailError}</p> : null}
      </div>

      <div className="login-fade-up login-fade-up-delay-2 grid gap-2">
        <label htmlFor={passwordId} className="text-sm font-medium text-[var(--login-ink)]">
          {t('auth.password')}
        </label>
        <div
          className="login-field flex items-center gap-3 rounded-2xl border border-[var(--login-line)] px-4 transition-[border-color,box-shadow,background-color]"
          data-invalid={passwordError ? 'true' : undefined}
        >
          <LockIcon />
          <input
            id={passwordId}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            placeholder={t('auth.passwordPlaceholder')}
            aria-invalid={passwordError ? true : undefined}
            className="h-12 w-full bg-transparent text-[0.95rem] text-[var(--login-ink)] outline-none placeholder:text-[var(--login-muted)]/80"
            {...form.register('password')}
          />
          <button
            type="button"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-[var(--login-muted)] transition-colors hover:bg-black/5 hover:text-[var(--login-ink)]"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {passwordError ? <p className="text-sm text-[#9f2d22]">{passwordError}</p> : null}
      </div>

      <div className="login-fade-up login-fade-up-delay-3 flex items-center justify-between gap-3 pt-0.5">
        <label
          htmlFor={rememberId}
          className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-[var(--login-ink)]"
        >
          <input
            id={rememberId}
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="size-4 rounded border-[var(--login-line)] accent-black"
          />
          {t('auth.rememberMe')}
        </label>
        <button
          type="button"
          className="text-sm font-medium text-[var(--login-ink)] underline-offset-4 transition-opacity hover:underline hover:opacity-70"
          onClick={() => setForgotHint(true)}
        >
          {t('auth.forgotPassword')}
        </button>
      </div>

      {forgotHint ? (
        <p className="login-fade-up rounded-2xl bg-[var(--login-soft)] px-4 py-3 text-sm text-[var(--login-muted)]">
          {t('auth.forgotHint')}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="login-submit login-fade-up login-fade-up-delay-4 mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--login-black)] text-[0.95rem] font-semibold tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {form.formState.isSubmitting ? (
          <>
            <span
              className="size-4 rounded-full border-2 border-white border-r-transparent motion-safe:animate-spin"
              aria-hidden="true"
            />
            {t('auth.signingIn')}
          </>
        ) : (
          t('auth.signIn')
        )}
      </button>
    </form>
  )
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4 shrink-0 text-[var(--login-muted)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="m5 8 7 5 7-5" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4 shrink-0 text-[var(--login-muted)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M4 4l16 16" />
      <path d="M9.9 5.5A9.4 9.4 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-3.2 3.8" />
      <path d="M6.7 7.2A15.7 15.7 0 0 0 2.5 12S6 18.5 12 18.5c1.4 0 2.7-.3 3.9-.8" />
    </svg>
  )
}
