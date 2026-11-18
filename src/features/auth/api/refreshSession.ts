import type { BaseQueryApi } from '@reduxjs/toolkit/query'
import type { Dispatch } from '@reduxjs/toolkit'
import { AUTH_ENDPOINTS } from '@/config/constants'
import { clearSession, setSession } from '@/features/auth/slices/authSlice'
import { parseAuthSession, type AuthSession } from '@/features/auth/types/auth.types'
import { rawBaseQuery } from '@/lib/api/rawBaseQuery'
import { registerReauthHandler, skipReauthFor } from '@/lib/api/reauthRegistry'
import { tokenStorage } from '@/lib/storage/tokenStorage'
import { isRecord } from '@/lib/utils/typeGuards'

let inFlight: Promise<AuthSession | null> | null = null

function isUnauthenticated(state: unknown): boolean {
  return isRecord(state) && isRecord(state.auth) && state.auth.status === 'unauthenticated'
}

async function executeRefresh(api: BaseQueryApi): Promise<AuthSession | null> {
  if (isUnauthenticated(api.getState())) return null

  const refreshToken = tokenStorage.getRefreshToken()
  const result = await rawBaseQuery(
    {
      url: AUTH_ENDPOINTS.refresh,
      method: 'POST',
      body: refreshToken ? { refreshToken } : {},
    },
    api,
    {},
  )

  if (isUnauthenticated(api.getState())) return null
  if (result.error) return null
  return parseAuthSession(result.data)
}

export function requestRefresh(api: BaseQueryApi): Promise<AuthSession | null> {
  if (!inFlight) {
    inFlight = executeRefresh(api).finally(() => {
      inFlight = null
    })
  }

  return inFlight
}

export function rememberSession(
  dispatch: Dispatch,
  session: AuthSession,
  state?: unknown,
): void {
  if (state !== undefined && isUnauthenticated(state)) return
  if (session.refreshToken) tokenStorage.setRefreshToken(session.refreshToken)
  dispatch(
    setSession({
      accessToken: session.accessToken,
      expiresAt: session.expiresAt,
      user: session.user,
    }),
  )
}

function endSession(dispatch: Dispatch, state: unknown): void {
  if (isUnauthenticated(state)) return
  dispatch(clearSession())
}

registerReauthHandler(async (api) => {
  const session = await requestRefresh(api)
  if (!session) {
    endSession(api.dispatch, api.getState())
    return false
  }

  rememberSession(api.dispatch, session, api.getState())
  return true
})

export function cancelInFlightRefresh(): void {
  inFlight = null
}

skipReauthFor(AUTH_ENDPOINTS.login)
skipReauthFor(AUTH_ENDPOINTS.logout)
skipReauthFor(AUTH_ENDPOINTS.refresh)
