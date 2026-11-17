import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { clearSession } from '@/features/auth/slices/authSlice'
import { isRecord } from '@/lib/utils/typeGuards'
import { rawBaseQuery } from './rawBaseQuery'
import { runReauth, shouldSkipReauth, type ReauthExtraOptions } from './reauthRegistry'

function isUnauthenticated(state: unknown): boolean {
  return isRecord(state) && isRecord(state.auth) && state.auth.status === 'unauthenticated'
}

/**
 * Shared query used by every feature endpoint.
 *
 * 401 from a normal request refreshes the session once and retries.
 * Login, register, logout, and refresh opt out through the reauth registry.
 * A failed refresh, or a retry that is still unauthorized, ends the session.
 */
export const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  ReauthExtraOptions
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status !== 401 || shouldSkipReauth(args, extraOptions)) {
    return result
  }

  const refreshed = await runReauth(api)
  if (!refreshed) return result

  result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status === 401 && !isUnauthenticated(api.getState())) {
    api.dispatch(clearSession())
  }

  return result
}
