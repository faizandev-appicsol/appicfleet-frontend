import { Navigate, Outlet } from 'react-router'
import { investorRole } from '@/app/router/access'
import { appConfig } from '@/config/app.config'
import { hasAnyRole } from '@/features/auth/access'
import { useAppSelector } from '@/app/hooks'

export function PublicOnlyRoute() {
  const status = useAppSelector((state) => state.auth.status)
  const roles = useAppSelector((state) => state.auth.user?.roles)

  if (status === 'authenticated') {
    const destination = hasAnyRole(roles, [investorRole])
      ? appConfig.routes.investor
      : appConfig.routes.home
    return <Navigate to={destination} replace />
  }

  return <Outlet />
}
