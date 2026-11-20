import { useState } from 'react'
import { QueryState } from '@/components/feedback/QueryState'
import { SearchField } from '@/components/common/SearchField'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PERMISSIONS } from '@/app/router/access'
import { useGetBranchesQuery } from '@/features/branches/api/branchesApi'
import { BranchFormDialog } from '@/features/branches/components/BranchFormDialog'
import type { Branch } from '@/features/branches/schemas/branch.schema'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useLegalEntityOptions } from '@/features/legal-entities/hooks/useLegalEntityOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useStatusOptions } from '@/hooks/useStatusOptions'
import { useTranslation } from '@/i18n'

const PAGE_SIZE = 20

export function BranchesPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('branches.title'))
  const { can } = usePermissions()
  const statusOptions = useStatusOptions()
  const legalEntities = useLegalEntityOptions()
  const { searchInput, setSearchInput, search, page, setPage } = useSearchPagination()
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Branch | undefined>()
  const [editOpen, setEditOpen] = useState(false)

  const canManage = can(PERMISSIONS.branchesManage)

  const query = useGetBranchesQuery({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
  })

  const columns: DataTableColumn<Branch>[] = [
    {
      id: 'name',
      header: t('branches.columns.name'),
      cell: (row) => (
        <>
          <p className="text-ink font-medium">{row.name}</p>
          <p className="text-muted text-xs" dir="ltr">
            {row.code}
          </p>
        </>
      ),
    },
    {
      id: 'legalEntity',
      header: t('branches.columns.legalEntity'),
      cell: (row) => legalEntities.nameById.get(row.legalEntityId) ?? '—',
    },
    {
      id: 'city',
      header: t('branches.columns.city'),
      cell: (row) => row.address?.city || '—',
    },
    {
      id: 'timezone',
      header: t('branches.columns.timezone'),
      className: 'text-muted whitespace-nowrap',
      cell: (row) => <span dir="ltr">{row.timezone}</span>,
    },
    {
      id: 'status',
      header: t('branches.columns.status'),
      cell: (row) => <StatusBadge value={row.status} options={statusOptions} />,
    },
    ...(canManage
      ? [
          {
            id: 'actions',
            header: t('common.actions'),
            className: 'text-end',
            cell: (row: Branch) => (
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
        title={t('branches.title')}
        description={t('branches.description')}
        action={
          canManage ? (
            <Button type="button" onClick={() => setCreateOpen(true)}>
              {t('branches.add')}
            </Button>
          ) : undefined
        }
      />
      <SearchField
        value={searchInput}
        onChange={setSearchInput}
        label={t('branches.searchLabel')}
        placeholder={t('branches.searchPlaceholder')}
      />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => data.items.length === 0}
        emptyTitle={t('branches.emptyTitle')}
        emptyDescription={search ? t('branches.emptyFiltered') : t('branches.emptyDescription')}
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
      <BranchFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <BranchFormDialog
        open={editOpen && Boolean(editing)}
        branch={editing}
        onClose={() => setEditOpen(false)}
      />
    </>
  )
}
