import { useState } from 'react'
import { PERMISSIONS, taxDirectoryRoles } from '@/app/router/access'
import { useAppSelector } from '@/app/hooks'
import { SearchField } from '@/components/common/SearchField'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { hasAnyRole } from '@/features/auth/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useGetTaxCodesQuery, useSeedTaxCodesMutation } from '@/features/tax/api/taxApi'
import type { TaxCode } from '@/features/tax/schemas/tax.schema'
import { useLegalEntityOptions } from '@/features/legal-entities/hooks/useLegalEntityOptions'
import { Select } from '@/components/ui/Input'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

const PAGE_SIZE = 50

export function TaxCodesPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('tax.codes.title'))
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const legalEntities = useLegalEntityOptions()
  const [legalEntityId, setLegalEntityId] = useState('')
  const { searchInput, setSearchInput, search, page, setPage } = useSearchPagination()
  const [seed] = useSeedTaxCodesMutation()
  const canManage = can(PERMISSIONS.taxManageCodes) || hasAnyRole(roles, taxDirectoryRoles)
  const query = useGetTaxCodesQuery({ page, pageSize: PAGE_SIZE, search: search || undefined, sort: 'code', order: 'asc' })

  const columns: DataTableColumn<TaxCode>[] = [
    { id: 'code', header: t('tax.fields.code'), cell: (row) => <span dir="ltr">{row.code}</span> },
    { id: 'name', header: t('tax.fields.name'), cell: (row) => row.name },
    { id: 'treatment', header: t('tax.fields.treatment'), cell: (row) => row.treatment },
    { id: 'active', header: t('common.status'), cell: (row) => (row.isActive ? t('common.yes') : t('common.no')) },
  ]

  return (
    <>
      <PageHeader
        title={t('tax.codes.title')}
        description={t('tax.codes.description')}
        action={
          canManage ? (
            <Button disabled={!legalEntityId} onClick={() => void seed({ legalEntityId }).unwrap()}>
              {t('tax.codes.seed')}
            </Button>
          ) : undefined
        }
      />
      <div className="grid items-end gap-3 md:grid-cols-2">
        <SearchField value={searchInput} onChange={setSearchInput} label={t('tax.search.codes')} placeholder={t('tax.search.codes')} />
        <Select label={t('tax.fields.legalEntity')} value={legalEntityId} onChange={(e) => setLegalEntityId(e.target.value)} options={[{ value: '', label: t('common.none') }, ...legalEntities.options]} />
      </div>
      <QueryState data={query.data} isLoading={query.isLoading} error={query.error} onRetry={query.refetch} isEmpty={(d) => d.items.length === 0} emptyTitle={t('tax.codes.empty')}>
        {(data) => (
          <div className="grid min-w-0 gap-3">
            <div className="border-line bg-surface min-w-0 overflow-x-auto rounded-lg border">
              <DataTable columns={columns} rows={data.items} rowKey={(row) => row.id} />
            </div>
            <Pagination data={data} page={page} onPageChange={setPage} disabled={query.isFetching} />
          </div>
        )}
      </QueryState>
    </>
  )
}
