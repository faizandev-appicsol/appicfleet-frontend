import { AuthLayout } from '@/components/layout/AuthLayout'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function RegisterPage() {
  useDocumentTitle('Register')
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  )
}
