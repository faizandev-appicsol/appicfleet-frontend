import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { SessionUser } from '@/features/auth/types/auth.types'

export type SessionStatus = 'restoring' | 'authenticated' | 'unauthenticated'

type AuthState = {
  status: SessionStatus
  accessToken: string | null
  expiresAt: string | null
  user: SessionUser | null
}

type SessionPayload = {
  accessToken: string
  expiresAt: string
  user?: SessionUser
}

const initialState: AuthState = {
  status: 'restoring',
  accessToken: null,
  expiresAt: null,
  user: null,
}

/**
 * Client session only: the principal needed for route guards and the access token
 * needed for request headers. Server records such as the user directory stay in RTK Query.
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<SessionPayload>) {
      state.accessToken = action.payload.accessToken
      state.expiresAt = action.payload.expiresAt
      if (action.payload.user) state.user = action.payload.user
      state.status = 'authenticated'
    },
    clearSession(state) {
      state.accessToken = null
      state.expiresAt = null
      state.user = null
      state.status = 'unauthenticated'
    },
  },
})

export const { setSession, clearSession } = authSlice.actions
export const authReducer = authSlice.reducer
