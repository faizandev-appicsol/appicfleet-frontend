import { Link } from 'react-router'
import { buttonClassName } from '@/components/ui/buttonStyles'
import { appConfig } from '@/config/app.config'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function UnauthorizedPage() {
  useDocumentTitle('Unauthorized')

  return (
    <div className="max-w-lg">
      <p className="text-muted text-sm font-medium">403</p>
      <h1 className="text-ink mt-2 text-2xl font-semibold tracking-tight">Unauthorized</h1>
      <p className="text-muted mt-2 text-sm">Your account does not have access to that page.</p>
      <Link to={appConfig.routes.home} className={buttonClassName({ className: 'mt-6' })}>
        Back to dashboard
      </Link>
    </div>
  )
}
