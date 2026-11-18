import { Link } from 'react-router'
import { buttonClassName } from '@/components/ui/buttonStyles'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/layout/PageHeader'
import { appConfig } from '@/config/app.config'
import { hasAnyRole } from '@/features/auth/access'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { userDirectoryRoles } from '@/app/router/access'

function greeting(date: Date): string {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function DashboardPage() {
  useDocumentTitle('Dashboard')
  const { user } = useAuth()
  const canManageUsers = hasAnyRole(user?.roles, userDirectoryRoles)

  return (
    <>
      <PageHeader
        title={`${greeting(new Date())}${user ? `, ${user.name}` : ''}`}
        description="Your session is active. Use the directory to manage who can sign in."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Session">
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="text-muted">Email</dt>
              <dd className="text-ink font-medium">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-muted">Roles</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {user?.roles.length ? (
                  user.roles.map((role) => (
                    <Badge key={role} tone="brand">
                      {role}
                    </Badge>
                  ))
                ) : (
                  <span className="text-ink">No roles assigned</span>
                )}
              </dd>
            </div>
          </dl>
        </Card>
        <Card title="Directory" description="People who can access this console.">
          {canManageUsers ? (
            <Link to={appConfig.routes.users} className={buttonClassName()}>
              Open users
            </Link>
          ) : (
            <p className="text-muted text-sm">
              User administration is limited to administrators and managers.
            </p>
          )}
        </Card>
      </div>
    </>
  )
}
