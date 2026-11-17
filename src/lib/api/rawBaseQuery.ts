import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query'
import { appConfig } from '@/config/app.config'
import { env } from '@/config/env'
import { isRecord } from '@/lib/utils/typeGuards'

function readAccessToken(state: unknown): string | null {
  if (typeof state !== 'object' || state === null || !('auth' in state)) return null

  const auth = (state as { auth?: { accessToken?: unknown } }).auth
  return typeof auth?.accessToken === 'string' ? auth.accessToken : null
}

const fetchQuery = fetchBaseQuery({
  baseUrl: env.apiUrl,
  credentials: 'include',
  timeout: appConfig.apiTimeoutMs,
  prepareHeaders: (headers, { getState }) => {
    const accessToken = readAccessToken(getState())
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
    headers.set('Accept', 'application/json')
    return headers
  },
})

export const rawBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await fetchQuery(args, api, extraOptions)
  if (result.error || !isRecord(result.data) || result.data.success !== true || !('data' in result.data)) {
    return result
  }

  return {
    data: result.data.data,
    meta: result.meta,
  }
}
