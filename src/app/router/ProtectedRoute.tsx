import { useRef } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { LoadingState } from '@/components/feedback/LoadingState'
import { appConfig } from '@/config/app.config'
import { useAppSelector } from '@/app/hooks'
import { useTranslation } from '@/i18n'

export function ProtectedRoute() {
  const status = useAppSelector((state) => state.auth.status)
  const location = useLocation()
  const { t } = useTranslation()
  // True once this guard has rendered an authenticated session. Losing it afterwards
  // (failed refresh, revoked token) is an expiry, not a first visit.
  const wasAuthenticated = useRef(false)

  if (status === 'authenticated') wasAuthenticated.current = true

  if (status === 'restoring') {
    return <LoadingState fullscreen label={t('session.checking')} />
  }

  if (status !== 'authenticated') {
    return (
      <Navigate
        to={appConfig.routes.login}
        replace
        state={{ from: location, sessionExpired: wasAuthenticated.current }}
      />
    )
  }

  return <Outlet />
}
