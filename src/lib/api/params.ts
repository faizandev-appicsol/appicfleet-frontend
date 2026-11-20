import { API_DEFAULT_PAGE_SIZE } from '@/config/constants'
import type { PageQuery } from '@/types/pagination'

/**
 * Builds list query params: pagination defaults, a trimmed search term, and any extra filters.
 * Empty and undefined filters are dropped.
 */
export function buildListParams(
  query: PageQuery & Record<string, string | number | undefined>,
): Record<string, string | number> {
  const { page, pageSize, search, ...filters } = query
  const params: Record<string, string | number> = {
    page: page ?? 1,
    pageSize: pageSize ?? API_DEFAULT_PAGE_SIZE,
  }
  const term = search?.trim()
  if (term) params.search = term
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') params[key] = value
  }
  return params
}
