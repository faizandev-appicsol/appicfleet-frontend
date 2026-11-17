import { Navigate, Outlet } from 'react-router'
import { appConfig } from '@/config/app.config'
import { useAppSelector } from '@/app/hooks'

export function PublicOnlyRoute() {
  const status = useAppSelector((state) => state.auth.status)

  if (status === 'authenticated') {
    return <Navigate to={appConfig.routes.home} replace />
  }

  return <Outlet />
}
