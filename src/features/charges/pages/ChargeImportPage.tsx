import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { PERMISSIONS, chargesDirectoryRoles } from '@/app/router/access'
import { useAppSelector } from '@/app/hooks'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { appConfig } from '@/config/app.config'
import { hasAnyRole } from '@/features/auth/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useCreateFineTollImportMutation, useGetFineTollImportsQuery } from '@/features/charges/api/chargesApi'
import { ImportFormDialog } from '@/features/charges/components/ImportFormDialog'
import { useChargesOptions } from '@/features/charges/hooks/useChargesOptions'
import type { ImportBatch } from '@/features/charges/schemas/charges.schema'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

const PAGE_SIZE = 20

export function ChargeImportPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('charges.import.title'))
  const navigate = useNavigate()
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const options = useChargesOptions()
  const { page, setPage } = useSearchPagination()
  const [creating, setCreating] = useState(false)
  const [createImport] = useCreateFineTollImportMutation()
  const canCreate = can(PERMISSIONS.fineImportProcess) || hasAnyRole(roles, chargesDirectoryRoles)
  const query = useGetFineTollImportsQuery({ page, pageSize: PAGE_SIZE })

  const columns: DataTableColumn<ImportBatch>[] = [
    {
      id: 'number',
      header: t('charges.columns.number'),
      cell: (row) => (
        <Link to={`${appConfig.routes.chargeImports}/${row.id}`} className="text-brand font-medium" dir="ltr">
          {row.documentNumber ?? row.id}
        </Link>
      ),
    },
    { id: 'kind', header: t('charges.fields.kind'), cell: (row) => row.kind },
    { id: 'provider', header: t('charges.fields.provider'), cell: (row) => row.provider },
    { id: 'total', header: t('charges.import.totalRows'), cell: (row) => String(row.totalRows) },
    { id: 'success', header: t('charges.import.successRows'), cell: (row) => String(row.successRows) },
    { id: 'duplicates', header: t('charges.import.duplicateRows'), cell: (row) => String(row.duplicateRows) },
    { id: 'failed', header: t('charges.import.failedRows'), cell: (row) => String(row.failedRows) },
    { id: 'status', header: t('common.status'), cell: (row) => <StatusBadge value={row.status} options={options.importStatusOptions} /> },
  ]

  return (
    <>
      <PageHeader
        title={t('charges.import.title')}
        description={t('charges.import.description')}
        action={canCreate ? <Button onClick={() => setCreating(true)}>{t('charges.import.create')}</Button> : undefined}
      />
      <QueryState data={query.data} isLoading={query.isLoading} isFetching={query.isFetching && !query.isLoading} error={query.error} onRetry={query.refetch} isEmpty={(d) => d.items.length === 0} emptyTitle={t('charges.import.empty')}>
        {(data) => (
          <div className="grid min-w-0 gap-3">
            <div className="border-line bg-surface min-w-0 overflow-x-auto rounded-lg border">
              <DataTable columns={columns} rows={data.items} rowKey={(row) => row.id} />
            </div>
            <Pagination data={data} page={page} onPageChange={setPage} disabled={query.isFetching} />
          </div>
        )}
      </QueryState>
      <ImportFormDialog
        open={creating}
        onClose={() => setCreating(false)}
        onSubmit={async (body) => {
          const created = await createImport(body).unwrap()
          navigate(`${appConfig.routes.chargeImports}/${created.id}`)
        }}
      />
    </>
  )
}
