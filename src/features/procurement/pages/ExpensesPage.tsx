import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { PERMISSIONS, procurementDirectoryRoles } from '@/app/router/access'
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
import { useCreateExpenseMutation, useGetExpensesQuery } from '@/features/procurement/api/procurementApi'
import { ExpenseFormDialog } from '@/features/procurement/components/ExpenseFormDialog'
import { useProcurementOptions } from '@/features/procurement/hooks/useProcurementOptions'
import type { Expense } from '@/features/procurement/schemas/procurement.schema'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

const PAGE_SIZE = 20

export function ExpensesPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('procurement.expenses.title'))
  const navigate = useNavigate()
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const options = useProcurementOptions()
  const { searchInput, setSearchInput, search, page, setPage } = useSearchPagination()
  const [status, setStatus] = useState('')
  const [creating, setCreating] = useState(false)
  const [createExpense] = useCreateExpenseMutation()
  const canCreate = can(PERMISSIONS.expenseCreate) || hasAnyRole(roles, procurementDirectoryRoles)
  const query = useGetExpensesQuery({ page, pageSize: PAGE_SIZE, search: search || undefined, status: status || undefined, sort: 'createdAt', order: 'desc' })

  const columns: DataTableColumn<Expense>[] = [
    {
      id: 'number',
      header: t('procurement.columns.number'),
      cell: (row) => (
        <Link to={`${appConfig.routes.expenses}/${row.id}`} className="text-brand font-medium" dir="ltr">
          {row.documentNumber ?? t('procurement.draftLabel')}
        </Link>
      ),
    },
    { id: 'category', header: t('procurement.fields.category'), cell: (row) => row.categoryCode },
    { id: 'description', header: t('procurement.fields.description'), cell: (row) => row.description },
    { id: 'total', header: t('procurement.columns.total'), cell: (row) => <span dir="ltr">{row.currency} {row.totalAmount}</span> },
    { id: 'status', header: t('common.status'), cell: (row) => <StatusBadge value={row.status} options={options.expenseStatusOptions} /> },
  ]

  return (
    <>
      <PageHeader title={t('procurement.expenses.title')} description={t('procurement.expenses.description')} action={canCreate ? <Button onClick={() => setCreating(true)}>{t('procurement.expenses.create')}</Button> : undefined} />
      <div className="grid gap-3 md:grid-cols-2">
        <SearchField value={searchInput} onChange={setSearchInput} label={t('procurement.search.expenses')} placeholder={t('procurement.search.expenses')} />
        <Select label={t('common.status')} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} options={[{ value: '', label: t('common.all') }, ...options.expenseStatusOptions]} />
      </div>
      <QueryState data={query.data} isLoading={query.isLoading} isFetching={query.isFetching && !query.isLoading} error={query.error} onRetry={query.refetch} isEmpty={(d) => d.items.length === 0} emptyTitle={t('procurement.expenses.empty')}>
        {(data) => (
          <div className="grid min-w-0 gap-3">
            <div className="border-line bg-surface min-w-0 overflow-x-auto rounded-lg border">
              <DataTable columns={columns} rows={data.items} rowKey={(row) => row.id} />
            </div>
            <Pagination data={data} page={page} onPageChange={setPage} disabled={query.isFetching} />
          </div>
        )}
      </QueryState>
      <ExpenseFormDialog open={creating} onClose={() => setCreating(false)} onSubmit={async (body) => { const created = await createExpense(body).unwrap(); navigate(`${appConfig.routes.expenses}/${created.id}`) }} />
    </>
  )
}
