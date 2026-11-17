import { Navigate, Outlet } from 'react-router'
import { appConfig } from '@/config/app.config'
import { hasAnyRole } from '@/features/auth/access'
import { useAppSelector } from '@/app/hooks'

export function RoleRoute({ allow }: { allow: readonly string[] }) {
  const roles = useAppSelector((state) => state.auth.user?.roles)

  if (!hasAnyRole(roles, allow)) {
    return <Navigate to={appConfig.routes.unauthorized} replace />
  }

  return <Outlet />
}
