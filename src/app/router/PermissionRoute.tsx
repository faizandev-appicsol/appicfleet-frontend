import { Navigate, Outlet } from 'react-router'
import { appConfig } from '@/config/app.config'
import { hasAnyPermission, hasAnyRole } from '@/features/auth/access'
import { useAppSelector } from '@/app/hooks'

/**
 * Route guard on permissions, with an optional role fallback for sessions issued
 * before that permission existed. UX only: the backend authorizes every request.
 */
export function PermissionRoute({
  allow,
  roles,
}: {
  allow: readonly string[]
  roles?: readonly string[]
}) {
  const permissions = useAppSelector((state) => state.auth.user?.permissions)
  const sessionRoles = useAppSelector((state) => state.auth.user?.roles)
  const allowed =
    hasAnyPermission(permissions, allow) || (roles ? hasAnyRole(sessionRoles, roles) : false)

  if (!allowed) {
    return <Navigate to={appConfig.routes.unauthorized} replace />
  }

  return <Outlet />
}
