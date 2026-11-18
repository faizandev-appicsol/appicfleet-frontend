import { appConfig } from '@/config/app.config'
import { LoginForm } from '@/features/auth/components/LoginForm'
import '@/features/auth/styles/login.css'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function LoginPage() {
  useDocumentTitle('Sign in')

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
              Secure access
            </p>
          </div>

          <LoginForm />
        </div>

        <p className="login-fade-up login-fade-up-delay-4 mt-6 text-center text-xs text-[var(--login-muted)]">
          Authorized personnel only · Session protected
        </p>
      </div>
    </div>
  )
}
