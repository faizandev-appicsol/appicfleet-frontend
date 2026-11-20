import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { PERMISSIONS, accountingDirectoryRoles } from '@/app/router/access'
import { useAppSelector } from '@/app/hooks'
import { SearchField } from '@/components/common/SearchField'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { Select } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { appConfig } from '@/config/app.config'
import { hasAnyRole } from '@/features/auth/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useGetJournalsQuery } from '@/features/accounting/api/accountingApi'
import type { Journal } from '@/features/accounting/schemas/accounting.schema'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

const PAGE_SIZE = 20
const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'posted', label: 'Posted' },
  { value: 'reversed', label: 'Reversed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function JournalsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('accounting.journals.title'))
  const navigate = useNavigate()
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const { searchInput, setSearchInput, search, page, setPage } = useSearchPagination()
  const [status, setStatus] = useState('')
  const canCreate = can(PERMISSIONS.accountingCreate) || hasAnyRole(roles, accountingDirectoryRoles)
  const query = useGetJournalsQuery({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    status: status || undefined,
    sort: 'createdAt',
    order: 'desc',
  })

  const columns: DataTableColumn<Journal>[] = [
    {
      id: 'number',
      header: t('accounting.fields.journalNumber'),
      cell: (row) => (
        <Link to={`${appConfig.routes.accountingJournals}/${row.id}`} className="text-brand font-medium" dir="ltr">
          {row.journalNumber ?? t('accounting.draftLabel')}
        </Link>
      ),
    },
    { id: 'date', header: t('accounting.fields.accountingDate'), cell: (row) => <span dir="ltr">{row.accountingDate}</span> },
    { id: 'type', header: t('accounting.fields.journalType'), cell: (row) => row.journalType },
    { id: 'description', header: t('accounting.fields.description'), cell: (row) => row.description },
    { id: 'debit', header: t('accounting.fields.debit'), cell: (row) => <span dir="ltr">{row.totalDebit}</span> },
    { id: 'credit', header: t('accounting.fields.credit'), cell: (row) => <span dir="ltr">{row.totalCredit}</span> },
    { id: 'status', header: t('common.status'), cell: (row) => <StatusBadge value={row.status} options={statusOptions} /> },
  ]

  return (
    <>
      <PageHeader
        title={t('accounting.journals.title')}
        description={t('accounting.journals.description')}
        action={canCreate ? <Button onClick={() => navigate(`${appConfig.routes.accountingJournals}/new`)}>{t('accounting.journals.create')}</Button> : undefined}
      />
      <div className="grid gap-3 md:grid-cols-2">
        <SearchField value={searchInput} onChange={setSearchInput} label={t('accounting.search.journals')} placeholder={t('accounting.search.journals')} />
        <Select label={t('common.status')} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} options={[{ value: '', label: t('common.all') }, ...statusOptions.map((o) => ({ value: o.value, label: t(`accounting.journalStatus.${o.value}` as 'accounting.journalStatus.draft') }))]} />
      </div>
      <QueryState data={query.data} isLoading={query.isLoading} isFetching={query.isFetching && !query.isLoading} error={query.error} onRetry={query.refetch} isEmpty={(d) => d.items.length === 0} emptyTitle={t('accounting.journals.empty')}>
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
