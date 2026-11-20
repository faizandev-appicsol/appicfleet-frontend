import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { isRecord } from '@/lib/utils/typeGuards'

export type ApiErrorStatus = number | 'NETWORK' | 'TIMEOUT' | 'PARSE' | 'UNKNOWN'

/**
 * `message` is either an i18n key (`errors.*`) or plain text from the server.
 * Translate it at render time with `tm()` from `useTranslation`; plain text passes through.
 */
export type NormalizedApiError = {
  status: ApiErrorStatus
  message: string
  code?: string
  fieldErrors?: Record<string, string>
}

const STATUS_MESSAGE_KEYS: Record<number, string> = {
  400: 'errors.http400',
  401: 'errors.http401',
  403: 'errors.http403',
  404: 'errors.http404',
  409: 'errors.http409',
  422: 'errors.http422',
  429: 'errors.http429',
  500: 'errors.http500',
}

/** Backend error codes that have a localized message. Validation errors keep field messages. */
const LOCALIZED_ERROR_CODES: ReadonlySet<string> = new Set([
  'INVALID_CREDENTIALS',
  'UNAUTHENTICATED',
  'TOKEN_EXPIRED',
  'TOKEN_INVALID',
  'FORBIDDEN',
  'ACCOUNT_DISABLED',
  'ACCOUNT_INVITED',
  'ACCOUNT_INACTIVE',
  'ACCOUNT_SUSPENDED',
  'ACCOUNT_LOCKED',
  'RATE_LIMITED',
  'DATABASE_UNAVAILABLE',
  'INTERNAL_ERROR',
])

function readMessage(data: unknown): string | undefined {
  if (typeof data === 'string' && data.trim()) return data
  if (!isRecord(data)) return undefined

  if (typeof data.message === 'string' && data.message.trim()) return data.message
  if (Array.isArray(data.message)) {
    const messages = data.message.filter((item): item is string => typeof item === 'string')
    if (messages.length > 0) return messages.join(' ')
  }
  if (typeof data.title === 'string' && data.title.trim()) return data.title
  if (typeof data.error === 'string' && data.error.trim()) return data.error
  return undefined
}

function readCode(data: unknown): string | undefined {
  if (!isRecord(data) || !isRecord(data.error)) return undefined
  return typeof data.error.code === 'string' ? data.error.code : undefined
}

function readFieldErrors(data: unknown): Record<string, string> | undefined {
  if (!isRecord(data)) return undefined

  const source = isRecord(data.errors)
    ? data.errors
    : isRecord(data.fieldErrors)
      ? data.fieldErrors
      : undefined
  if (!source) return undefined

  const entries: Array<[string, string]> = []
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === 'string' && value.trim()) {
      entries.push([key, value])
      continue
    }
    if (Array.isArray(value)) {
      const first = value.find(
        (item): item is string => typeof item === 'string' && item.trim() !== '',
      )
      if (first) entries.push([key, first])
    }
  }

  return entries.length > 0 ? Object.fromEntries(entries) : undefined
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return isRecord(error) && 'status' in error
}

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (isFetchBaseQueryError(error)) {
    if (error.status === 'FETCH_ERROR') {
      return { status: 'NETWORK', message: 'errors.network' }
    }

    if (error.status === 'TIMEOUT_ERROR') {
      return { status: 'TIMEOUT', message: 'errors.timeout' }
    }

    if (error.status === 'PARSING_ERROR') {
      return { status: 'PARSE', message: 'errors.parse' }
    }

    if (error.status === 'CUSTOM_ERROR') {
      return {
        status: 'UNKNOWN',
        message: typeof error.error === 'string' ? error.error : 'errors.requestFailed',
      }
    }

    if (typeof error.status === 'number') {
      const code = readCode(error.data)
      const message =
        code && LOCALIZED_ERROR_CODES.has(code)
          ? `errors.code.${code}`
          : (readMessage(error.data) ?? STATUS_MESSAGE_KEYS[error.status] ?? 'errors.requestFailed')
      return {
        status: error.status,
        message,
        code,
        fieldErrors: readFieldErrors(error.data),
      }
    }
  }

  if (error instanceof Error && error.message) {
    return { status: 'UNKNOWN', message: error.message }
  }

  if (isRecord(error) && typeof error.message === 'string' && error.message.trim()) {
    return { status: 'UNKNOWN', message: error.message }
  }

  return { status: 'UNKNOWN', message: 'errors.unknown' }
}
