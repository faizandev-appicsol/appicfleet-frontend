import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form'
import type { NormalizedApiError } from '@/lib/api/apiError'

export function applyApiFieldErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  error: NormalizedApiError,
): boolean {
  if (!error.fieldErrors) return false

  let applied = false
  for (const [field, message] of Object.entries(error.fieldErrors)) {
    setError(field as FieldPath<T>, { message })
    applied = true
  }

  return applied
}
