import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { LoginForm } from '@/features/auth/components/LoginForm'

export function LoginPage() {
  useDocumentTitle('Sign in')
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}
