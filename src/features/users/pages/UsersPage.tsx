import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { SearchIcon } from '@/components/ui/icons'
import { CreateUserDialog } from '@/features/users/components/CreateUserDialog'
import { UserTable } from '@/features/users/components/UserTable'
import { USERS_PAGE_SIZE } from '@/features/users/constants'
import { useGetUsersQuery } from '@/features/users/api/usersApi'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function UsersPage() {
  useDocumentTitle('Users')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [trackedSearch, setTrackedSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const search = useDebouncedValue(searchInput, 300)

  if (trackedSearch !== search) {
    setTrackedSearch(search)
    setPage(1)
  }

  const query = useGetUsersQuery({
    page,
    pageSize: USERS_PAGE_SIZE,
    search: search.trim() || undefined,
  })
  const totalPages = query.data ? Math.max(1, Math.ceil(query.data.total / query.data.pageSize)) : 1
  const rangeStart =
    query.data && query.data.total > 0 ? (query.data.page - 1) * query.data.pageSize + 1 : 0
  const rangeEnd = query.data
    ? Math.min(query.data.page * query.data.pageSize, query.data.total)
    : 0

  return (
    <>
      <PageHeader
        title="Users"
        description="People who can sign in to the console."
        action={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            Add user
          </Button>
        }
      />
      <div className="relative max-w-sm">
        <SearchIcon className="text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" />
        <input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search by name or email"
          aria-label="Search users"
          className="border-line bg-surface text-ink placeholder:text-muted focus-visible:border-brand focus-visible:ring-brand/30 h-10 w-full rounded-md border pr-3 pl-10 text-sm outline-none focus-visible:ring-2"
        />
      </div>
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => data.items.length === 0}
        emptyTitle="No users"
        emptyDescription={
          search.trim() ? 'No users match that search.' : 'Add the first person to this directory.'
        }
      >
        {(data) => (
          <div className="grid gap-3">
            <UserTable users={data.items} />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted text-sm">
                Showing {rangeStart}–{rangeEnd} of {data.total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1 || query.isFetching}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </Button>
                <span className="text-muted text-sm">
                  Page {data.page} of {totalPages}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages || query.isFetching}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </QueryState>
      <CreateUserDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  )
}
