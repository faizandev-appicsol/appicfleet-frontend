import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { isRecord } from '@/lib/utils/typeGuards'

export type ApiErrorStatus = number | 'NETWORK' | 'TIMEOUT' | 'PARSE' | 'UNKNOWN'

export type NormalizedApiError = {
  status: ApiErrorStatus
  message: string
  fieldErrors?: Record<string, string>
}

const STATUS_MESSAGES: Record<number, string> = {
  400: 'The request could not be processed.',
  401: 'You are not authorized to continue.',
  403: 'You do not have permission to do that.',
  404: 'The requested record was not found.',
  409: 'This conflicts with an existing record.',
  422: 'Some fields need to be corrected.',
  429: 'Too many requests. Wait a moment and try again.',
  500: 'The server could not complete the request.',
}

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
      return {
        status: 'NETWORK',
        message: 'Cannot reach the server. Check your connection and try again.',
      }
    }

    if (error.status === 'TIMEOUT_ERROR') {
      return { status: 'TIMEOUT', message: 'The request timed out. Try again.' }
    }

    if (error.status === 'PARSING_ERROR') {
      return { status: 'PARSE', message: 'The server returned a response we could not read.' }
    }

    if (error.status === 'CUSTOM_ERROR') {
      return {
        status: 'UNKNOWN',
        message: typeof error.error === 'string' ? error.error : 'The request failed.',
      }
    }

    if (typeof error.status === 'number') {
      const message =
        readMessage(error.data) ?? STATUS_MESSAGES[error.status] ?? 'The request failed.'
      return {
        status: error.status,
        message,
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

  return { status: 'UNKNOWN', message: 'Something went wrong. Try again.' }
}
