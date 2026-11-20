import { useState } from 'react'
import { QueryState } from '@/components/feedback/QueryState'
import { SearchField } from '@/components/common/SearchField'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PERMISSIONS } from '@/app/router/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useGetOrganizationsQuery } from '@/features/organizations/api/organizationsApi'
import { OrganizationFormDialog } from '@/features/organizations/components/OrganizationFormDialog'
import type { Organization } from '@/features/organizations/schemas/organization.schema'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useStatusOptions } from '@/hooks/useStatusOptions'
import { useTranslation } from '@/i18n'
import { formatDateTime } from '@/utils/formatDate'

const PAGE_SIZE = 20

export function OrganizationsPage() {
  const { t, locale } = useTranslation()
  useDocumentTitle(t('organizations.title'))
  const { can, accessAllOrganizations } = usePermissions()
  const statusOptions = useStatusOptions()
  const { searchInput, setSearchInput, search, page, setPage } = useSearchPagination()
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Organization | undefined>()
  const [editOpen, setEditOpen] = useState(false)

  const canManage = can(PERMISSIONS.organizationsManage)
  // The API only lets platform administrators create tenants; hide the action for everyone else.
  const canCreate = canManage && accessAllOrganizations

  const query = useGetOrganizationsQuery({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
  })

  const columns: DataTableColumn<Organization>[] = [
    {
      id: 'name',
      header: t('organizations.columns.name'),
      cell: (row) => <span className="text-ink font-medium">{row.name}</span>,
    },
    {
      id: 'code',
      header: t('organizations.columns.code'),
      cell: (row) => <span dir="ltr">{row.code}</span>,
    },
    {
      id: 'status',
      header: t('organizations.columns.status'),
      cell: (row) => <StatusBadge value={row.status} options={statusOptions} />,
    },
    {
      id: 'created',
      header: t('organizations.columns.created'),
      className: 'text-muted whitespace-nowrap',
      cell: (row) => formatDateTime(row.createdAt, locale),
    },
    ...(canManage
      ? [
          {
            id: 'actions',
            header: t('common.actions'),
            className: 'text-end',
            cell: (row: Organization) => (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setEditing(row)
                  setEditOpen(true)
                }}
              >
                {t('common.edit')}
              </Button>
            ),
          },
        ]
      : []),
  ]

  return (
    <>
      <PageHeader
        title={t('organizations.title')}
        description={t('organizations.description')}
        action={
          canCreate ? (
            <Button type="button" onClick={() => setCreateOpen(true)}>
              {t('organizations.add')}
            </Button>
          ) : undefined
        }
      />
      <SearchField
        value={searchInput}
        onChange={setSearchInput}
        label={t('organizations.searchLabel')}
        placeholder={t('organizations.searchPlaceholder')}
      />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => data.items.length === 0}
        emptyTitle={t('organizations.emptyTitle')}
        emptyDescription={
          search ? t('organizations.emptyFiltered') : t('organizations.emptyDescription')
        }
      >
        {(data) => (
          <div className="grid gap-3">
            <div className="border-line bg-surface overflow-hidden rounded-lg border">
              <DataTable columns={columns} rows={data.items} rowKey={(row) => row.id} />
            </div>
            <Pagination
              data={data}
              page={page}
              onPageChange={setPage}
              disabled={query.isFetching}
            />
          </div>
        )}
      </QueryState>
      <OrganizationFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <OrganizationFormDialog
        open={editOpen && Boolean(editing)}
        organization={editing}
        onClose={() => setEditOpen(false)}
      />
    </>
  )
}
