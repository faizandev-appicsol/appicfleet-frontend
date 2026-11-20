import { z } from 'zod'
import { isRecord } from '@/lib/utils/typeGuards'
import type { Paginated } from '@/types/pagination'

/**
 * The API answers `{ success, message, data }` and also copies object payloads onto the
 * response root. Feature schemas strip unknown keys, so reading the root works; this helper
 * prefers `data` when present so list and resource parsing do not depend on the root copy.
 */
export function unwrapEnvelope(response: unknown): unknown {
  if (isRecord(response) && 'data' in response && response.data !== undefined) {
    return response.data
  }
  return response
}

export function paginatedSchema<T extends z.ZodType>(item: T) {
  return z.object({
    items: z.array(item),
    page: z.number().int().nonnegative(),
    pageSize: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  })
}

/**
 * Parses a resource response. Throws an Error whose message is an i18n key so the UI can
 * localize it through `tm()`.
 */
export function parseResource<T extends z.ZodType>(
  schema: T,
  response: unknown,
  errorKey: string,
): z.infer<T> {
  const parsed = schema.safeParse(unwrapEnvelope(response))
  if (parsed.success) return parsed.data
  const root = schema.safeParse(response)
  if (root.success) return root.data
  throw new Error(errorKey)
}

export function parsePage<T extends z.ZodType>(
  item: T,
  response: unknown,
  errorKey: string,
): Paginated<z.infer<T>> {
  return parseResource(paginatedSchema(item), response, errorKey) as Paginated<z.infer<T>>
}
