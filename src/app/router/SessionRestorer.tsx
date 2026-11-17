import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { authApi } from '@/features/auth/api/authApi'
import { useAccessTokenRefresh } from '@/features/auth/hooks/useAccessTokenRefresh'
import { LoadingState } from '@/components/feedback/LoadingState'
import { useAppDispatch, useAppSelector } from '@/app/hooks'

export function SessionRestorer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  const status = useAppSelector((state) => state.auth.status)

  useEffect(() => {
    dispatch(authApi.endpoints.refresh.initiate())
  }, [dispatch])

  useAccessTokenRefresh()

  if (status === 'restoring') {
    return <LoadingState fullscreen label="Restoring your session" />
  }

  return children
}
