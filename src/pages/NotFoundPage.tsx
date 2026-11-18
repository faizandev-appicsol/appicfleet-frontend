import { Link } from 'react-router'
import { buttonClassName } from '@/components/ui/buttonStyles'
import { appConfig } from '@/config/app.config'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function NotFoundPage() {
  useDocumentTitle('Page not found')

  return (
    <div className="bg-canvas grid min-h-svh place-items-center px-4">
      <div className="border-line bg-surface w-full max-w-md rounded-lg border px-6 py-8">
        <p className="text-muted text-sm font-medium">404</p>
        <h1 className="text-ink mt-2 text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-muted mt-2 text-sm">That address is not part of the console.</p>
        <Link to={appConfig.routes.home} className={buttonClassName({ className: 'mt-6' })}>
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
