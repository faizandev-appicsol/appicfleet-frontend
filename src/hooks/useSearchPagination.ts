import { useState } from 'react'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

/** Debounced search plus page state; changing the search term resets to page 1. */
export function useSearchPagination(delayMs = 300) {
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [trackedSearch, setTrackedSearch] = useState('')
  const search = useDebouncedValue(searchInput, delayMs)

  if (trackedSearch !== search) {
    setTrackedSearch(search)
    setPage(1)
  }

  return {
    searchInput,
    setSearchInput,
    search: search.trim(),
    page,
    setPage,
  }
}
