import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { PERMISSIONS, financeDirectoryRoles } from '@/app/router/access'
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
import { useCreateInvoiceMutation, useGetInvoicesQuery } from '@/features/finance/api/financeApi'
import { InvoiceFormDialog } from '@/features/finance/components/InvoiceFormDialog'
import { useFinanceOptions } from '@/features/finance/hooks/useFinanceOptions'
import type { Invoice } from '@/features/finance/schemas/finance.schema'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

const PAGE_SIZE = 20

export function InvoicesPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('finance.invoices.title'))
  const navigate = useNavigate()
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const options = useFinanceOptions()
  const { searchInput, setSearchInput, search, page, setPage } = useSearchPagination()
  const [status, setStatus] = useState('')
  const [creating, setCreating] = useState(false)
  const [createInvoice] = useCreateInvoiceMutation()
  const canCreate = can(PERMISSIONS.invoiceCreate) || hasAnyRole(roles, financeDirectoryRoles)
  const query = useGetInvoicesQuery({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    status: status || undefined,
    sort: 'createdAt',
    order: 'desc',
  })

  const columns: DataTableColumn<Invoice>[] = [
    {
      id: 'number',
      header: t('finance.columns.number'),
      cell: (row) => (
        <Link to={`${appConfig.routes.invoices}/${row.id}`} className="text-brand font-medium" dir="ltr">
          {row.documentNumber ?? t('finance.draftLabel')}
        </Link>
      ),
    },
    { id: 'customer', header: t('finance.columns.customer'), cell: (row) => row.customerName ?? t('common.notSet') },
    {
      id: 'total',
      header: t('finance.columns.total'),
      cell: (row) => (
        <span dir="ltr">
          {row.currency} {row.totalAmount}
        </span>
      ),
    },
    {
      id: 'outstanding',
      header: t('finance.columns.outstanding'),
      cell: (row) => <span dir="ltr">{row.outstandingAmount}</span>,
    },
    {
      id: 'status',
      header: t('common.status'),
      cell: (row) => <StatusBadge value={row.status} options={options.docStatusOptions} />,
    },
  ]

  return (
    <>
      <PageHeader
        title={t('finance.invoices.title')}
        description={t('finance.invoices.description')}
        action={canCreate ? <Button type="button" onClick={() => setCreating(true)}>{t('finance.invoices.create')}</Button> : undefined}
      />
      <div className="grid gap-3">
        <SearchField
          value={searchInput}
          onChange={setSearchInput}
          label={t('finance.search.invoices')}
          placeholder={t('finance.search.invoices')}
        />
        <Select
          label={t('common.status')}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value)
            setPage(1)
          }}
          options={[{ value: '', label: t('common.all') }, ...options.docStatusOptions]}
        />
      </div>
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => data.items.length === 0}
        emptyTitle={t('finance.invoices.empty')}
      >
        {(data) => (
          <div className="grid min-w-0 gap-3">
            <div className="border-line bg-surface min-w-0 overflow-x-auto rounded-lg border">
              <DataTable columns={columns} rows={data.items} rowKey={(row) => row.id} />
            </div>
            <Pagination data={data} page={page} onPageChange={setPage} disabled={query.isFetching} />
          </div>
        )}
      </QueryState>
      {creating ? (
        <InvoiceFormDialog
          open={creating}
          onClose={() => setCreating(false)}
          onSubmit={async (body) => {
            const created = await createInvoice(body).unwrap()
            navigate(`${appConfig.routes.invoices}/${created.id}`)
          }}
        />
      ) : null}
    </>
  )
}
