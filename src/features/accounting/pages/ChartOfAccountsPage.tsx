import { useState } from 'react'
import { PERMISSIONS, accountingDirectoryRoles } from '@/app/router/access'
import { useAppSelector } from '@/app/hooks'
import { SearchField } from '@/components/common/SearchField'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { Select } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { hasAnyRole } from '@/features/auth/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useGetAccountsQuery, useSeedChartMutation } from '@/features/accounting/api/accountingApi'
import type { Account } from '@/features/accounting/schemas/accounting.schema'
import { useLegalEntityOptions } from '@/features/legal-entities/hooks/useLegalEntityOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

const PAGE_SIZE = 50

export function ChartOfAccountsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('accounting.accounts.title'))
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const legalEntities = useLegalEntityOptions()
  const { searchInput, setSearchInput, search, page, setPage } = useSearchPagination()
  const [accountType, setAccountType] = useState('')
  const [legalEntityId, setLegalEntityId] = useState('')
  const [seedChart] = useSeedChartMutation()
  const canManage = can(PERMISSIONS.accountingManageAccounts) || hasAnyRole(roles, accountingDirectoryRoles)
  const query = useGetAccountsQuery({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    accountType: accountType || undefined,
    sort: 'code',
    order: 'asc',
  })

  const columns: DataTableColumn<Account>[] = [
    { id: 'code', header: t('accounting.fields.code'), cell: (row) => <span dir="ltr">{row.code}</span> },
    { id: 'name', header: t('accounting.fields.name'), cell: (row) => row.name },
    { id: 'type', header: t('accounting.fields.accountType'), cell: (row) => row.accountType },
    { id: 'normal', header: t('accounting.fields.normalBalance'), cell: (row) => row.normalBalance },
    { id: 'active', header: t('common.status'), cell: (row) => (row.isActive ? t('common.yes') : t('common.no')) },
  ]

  return (
    <>
      <PageHeader
        title={t('accounting.accounts.title')}
        description={t('accounting.accounts.description')}
        action={
          canManage ? (
            <Button
              disabled={!legalEntityId}
              onClick={() => void seedChart({ legalEntityId }).unwrap()}
            >
              {t('accounting.accounts.seed')}
            </Button>
          ) : undefined
        }
      />
      <div className="grid gap-3 md:grid-cols-3">
        <SearchField value={searchInput} onChange={setSearchInput} label={t('accounting.search.accounts')} placeholder={t('accounting.search.accounts')} />
        <Select
          label={t('accounting.fields.accountType')}
          value={accountType}
          onChange={(e) => { setAccountType(e.target.value); setPage(1) }}
          options={[
            { value: '', label: t('common.all') },
            { value: 'asset', label: t('accounting.accountTypes.asset') },
            { value: 'liability', label: t('accounting.accountTypes.liability') },
            { value: 'equity', label: t('accounting.accountTypes.equity') },
            { value: 'revenue', label: t('accounting.accountTypes.revenue') },
            { value: 'expense', label: t('accounting.accountTypes.expense') },
          ]}
        />
        <Select
          label={t('accounting.fields.legalEntity')}
          value={legalEntityId}
          onChange={(e) => setLegalEntityId(e.target.value)}
          options={[{ value: '', label: t('common.none') }, ...legalEntities.options]}
        />
      </div>
      <QueryState data={query.data} isLoading={query.isLoading} isFetching={query.isFetching && !query.isLoading} error={query.error} onRetry={query.refetch} isEmpty={(d) => d.items.length === 0} emptyTitle={t('accounting.accounts.empty')}>
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
