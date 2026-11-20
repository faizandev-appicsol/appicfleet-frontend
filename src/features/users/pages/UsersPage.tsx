import { useState } from 'react'
import { SearchField } from '@/components/common/SearchField'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { PERMISSIONS } from '@/app/router/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { CreateUserDialog } from '@/features/users/components/CreateUserDialog'
import { UserTable } from '@/features/users/components/UserTable'
import { USERS_PAGE_SIZE } from '@/features/users/constants'
import { useGetUsersQuery } from '@/features/users/api/usersApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

export function UsersPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('users.title'))
  const { can } = usePermissions()
  const { searchInput, setSearchInput, search, page, setPage } = useSearchPagination()
  const [createOpen, setCreateOpen] = useState(false)

  // UX only: the API rejects creation without users.create regardless of this check.
  const canCreate = can(PERMISSIONS.usersCreate)

  const query = useGetUsersQuery({
    page,
    pageSize: USERS_PAGE_SIZE,
    search: search || undefined,
  })

  return (
    <>
      <PageHeader
        title={t('users.title')}
        description={t('users.description')}
        action={
          canCreate ? (
            <Button type="button" onClick={() => setCreateOpen(true)}>
              {t('users.add')}
            </Button>
          ) : undefined
        }
      />
      <SearchField
        value={searchInput}
        onChange={setSearchInput}
        label={t('users.searchLabel')}
        placeholder={t('users.searchPlaceholder')}
      />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => data.items.length === 0}
        emptyTitle={t('users.emptyTitle')}
        emptyDescription={search ? t('users.emptyFiltered') : t('users.emptyDescription')}
      >
        {(data) => (
          <div className="grid gap-3">
            <UserTable users={data.items} />
            <Pagination
              data={data}
              page={page}
              onPageChange={setPage}
              disabled={query.isFetching}
            />
          </div>
        )}
      </QueryState>
      {canCreate ? <CreateUserDialog open={createOpen} onClose={() => setCreateOpen(false)} /> : null}
    </>
  )
}
