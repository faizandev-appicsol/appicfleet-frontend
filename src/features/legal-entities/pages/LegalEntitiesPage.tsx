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
import { useGetLegalEntitiesQuery } from '@/features/legal-entities/api/legalEntitiesApi'
import { LegalEntityFormDialog } from '@/features/legal-entities/components/LegalEntityFormDialog'
import type { LegalEntity } from '@/features/legal-entities/schemas/legalEntity.schema'
import { useOrganizationOptions } from '@/features/organizations/hooks/useOrganizationOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useStatusOptions } from '@/hooks/useStatusOptions'
import { useTranslation } from '@/i18n'

const PAGE_SIZE = 20

export function LegalEntitiesPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('legalEntities.title'))
  const { can, accessAllOrganizations } = usePermissions()
  const statusOptions = useStatusOptions()
  const organizations = useOrganizationOptions()
  const { searchInput, setSearchInput, search, page, setPage } = useSearchPagination()
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<LegalEntity | undefined>()
  const [editOpen, setEditOpen] = useState(false)

  const canManage = can(PERMISSIONS.legalEntitiesManage)

  const query = useGetLegalEntitiesQuery({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
  })

  const columns: DataTableColumn<LegalEntity>[] = [
    {
      id: 'name',
      header: t('legalEntities.columns.name'),
      cell: (row) => (
        <>
          <p className="text-ink font-medium">{row.displayName}</p>
          {row.legalName !== row.displayName ? (
            <p className="text-muted text-xs">{row.legalName}</p>
          ) : null}
        </>
      ),
    },
    ...(accessAllOrganizations
      ? [
          {
            id: 'organization',
            header: t('legalEntities.columns.organization'),
            cell: (row: LegalEntity) => organizations.nameById.get(row.organizationId) ?? '—',
          },
        ]
      : []),
    {
      id: 'country',
      header: t('legalEntities.columns.country'),
      cell: (row) => <span dir="ltr">{row.country}</span>,
    },
    {
      id: 'currency',
      header: t('legalEntities.columns.currency'),
      cell: (row) => <span dir="ltr">{row.defaultCurrency}</span>,
    },
    {
      id: 'status',
      header: t('legalEntities.columns.status'),
      cell: (row) => <StatusBadge value={row.status} options={statusOptions} />,
    },
    ...(canManage
      ? [
          {
            id: 'actions',
            header: t('common.actions'),
            className: 'text-end',
            cell: (row: LegalEntity) => (
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
        title={t('legalEntities.title')}
        description={t('legalEntities.description')}
        action={
          canManage ? (
            <Button type="button" onClick={() => setCreateOpen(true)}>
              {t('legalEntities.add')}
            </Button>
          ) : undefined
        }
      />
      <SearchField
        value={searchInput}
        onChange={setSearchInput}
        label={t('legalEntities.searchLabel')}
        placeholder={t('legalEntities.searchPlaceholder')}
      />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => data.items.length === 0}
        emptyTitle={t('legalEntities.emptyTitle')}
        emptyDescription={
          search ? t('legalEntities.emptyFiltered') : t('legalEntities.emptyDescription')
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
      <LegalEntityFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <LegalEntityFormDialog
        open={editOpen && Boolean(editing)}
        legalEntity={editing}
        onClose={() => setEditOpen(false)}
      />
    </>
  )
}
