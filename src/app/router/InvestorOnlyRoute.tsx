import { Navigate, Outlet } from 'react-router'
import { appConfig } from '@/config/app.config'
import { investorRole } from '@/app/router/access'
import { hasAnyRole } from '@/features/auth/access'
import { useAppSelector } from '@/app/hooks'

/** UX gate: only investor sessions enter the investor portal shell. */
export function InvestorOnlyRoute() {
  const roles = useAppSelector((state) => state.auth.user?.roles)
  if (!hasAnyRole(roles, [investorRole])) {
    return <Navigate to={appConfig.routes.unauthorized} replace />
  }
  return <Outlet />
}
