import { useEffect } from 'react'
import { appConfig } from '@/config/app.config'
import { authApi } from '@/features/auth/api/authApi'
import { useAppDispatch, useAppSelector } from '@/app/hooks'

export function useAccessTokenRefresh() {
  const dispatch = useAppDispatch()
  const status = useAppSelector((state) => state.auth.status)
  const expiresAt = useAppSelector((state) => state.auth.expiresAt)

  useEffect(() => {
    if (status !== 'authenticated' || !expiresAt) return

    const expiresMs = Date.parse(expiresAt)
    if (Number.isNaN(expiresMs)) return

    const delay = Math.max(expiresMs - Date.now() - appConfig.accessTokenRefreshSkewMs, 15_000)
    const timer = window.setTimeout(() => {
      dispatch(authApi.endpoints.refresh.initiate())
    }, delay)

    return () => window.clearTimeout(timer)
  }, [dispatch, expiresAt, status])
}
