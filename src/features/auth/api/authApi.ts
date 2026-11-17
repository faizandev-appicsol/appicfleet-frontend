import { AUTH_ENDPOINTS } from '@/config/constants'
import { rememberSession, requestRefresh } from '@/features/auth/api/refreshSession'
import { clearSession } from '@/features/auth/slices/authSlice'
import {
  parseAuthSession,
  sessionUserSchema,
  type AuthSession,
  type LoginRequest,
  type RegisterRequest,
  type SessionUser,
} from '@/features/auth/types/auth.types'
import { baseApi } from '@/lib/api/baseApi'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

function isAbort(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('error' in error)) return false
  const inner = (error as { error?: unknown }).error
  return (
    typeof inner === 'object' && inner !== null && 'name' in inner && inner.name === 'AbortError'
  )
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthSession, LoginRequest>({
      query: (body) => ({
        url: AUTH_ENDPOINTS.login,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => {
        const session = parseAuthSession(response)
        if (!session) throw new Error('The login response did not include a session.')
        return session
      },
      async onQueryStarted(_argument, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          rememberSession(dispatch, data)
        } catch {
          // The form renders the error. A failed login must not clear an existing session.
        }
      },
    }),
    register: builder.mutation<AuthSession, RegisterRequest>({
      query: (body) => ({
        url: AUTH_ENDPOINTS.register,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => {
        const session = parseAuthSession(response)
        if (!session) throw new Error('The registration response did not include a session.')
        return session
      },
      async onQueryStarted(_argument, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          rememberSession(dispatch, data)
        } catch {
          // The form renders the error.
        }
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: AUTH_ENDPOINTS.logout,
        method: 'POST',
      }),
    }),
    refresh: builder.mutation<AuthSession, void>({
      async queryFn(_argument, api) {
        const session = await requestRefresh(api)
        if (!session) {
          return {
            error: {
              status: 401,
              data: { message: 'Unable to restore the session.' },
            } satisfies FetchBaseQueryError,
          }
        }

        return { data: session }
      },
      async onQueryStarted(_argument, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          rememberSession(dispatch, data)
        } catch (error) {
          if (!isAbort(error)) dispatch(clearSession())
        }
      },
    }),
    me: builder.query<SessionUser, void>({
      query: () => AUTH_ENDPOINTS.me,
      transformResponse: (response: unknown) => {
        const direct = sessionUserSchema.safeParse(response)
        if (direct.success) return direct.data

        if (typeof response === 'object' && response !== null && 'user' in response) {
          const nested = sessionUserSchema.safeParse(response.user)
          if (nested.success) return nested.data
        }

        throw new Error('The profile response did not include a user.')
      },
      providesTags: ['Auth'],
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshMutation,
  useMeQuery,
} = authApi
