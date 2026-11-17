import { Navigate, Outlet, useLocation } from 'react-router'
import { LoadingState } from '@/components/feedback/LoadingState'
import { appConfig } from '@/config/app.config'
import { useAppSelector } from '@/app/hooks'

export function ProtectedRoute() {
  const status = useAppSelector((state) => state.auth.status)
  const location = useLocation()

  if (status === 'restoring') {
    return <LoadingState fullscreen label="Checking your session" />
  }

  if (status !== 'authenticated') {
    return <Navigate to={appConfig.routes.login} replace state={{ from: location }} />
  }

  return <Outlet />
}
