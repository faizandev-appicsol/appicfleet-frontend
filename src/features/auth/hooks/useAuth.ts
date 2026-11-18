import { useNavigate } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { appConfig } from '@/config/app.config'
import { useLogoutMutation } from '@/features/auth/api/authApi'
import { cancelInFlightRefresh } from '@/features/auth/api/refreshSession'
import { clearSession } from '@/features/auth/slices/authSlice'

export function useAuth() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const status = useAppSelector((state) => state.auth.status)
  const [logoutRequest, { isLoading: isLoggingOut }] = useLogoutMutation()

  const logout = async () => {
    cancelInFlightRefresh()

    try {
      await logoutRequest().unwrap()
    } catch {
      // Local session still ends when the server cannot be reached.
    }

    dispatch(clearSession())
    navigate(appConfig.routes.login, { replace: true })
  }

  return {
    user,
    status,
    isAuthenticated: status === 'authenticated',
    isLoggingOut,
    logout,
  }
}
