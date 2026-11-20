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
import { useCreatePaymentMutation, useGetPaymentsQuery } from '@/features/finance/api/financeApi'
import { PaymentFormDialog } from '@/features/finance/components/PaymentFormDialog'
import { useFinanceOptions } from '@/features/finance/hooks/useFinanceOptions'
import type { Payment } from '@/features/finance/schemas/finance.schema'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

const PAGE_SIZE = 20

export function PaymentsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('finance.payments.title'))
  const navigate = useNavigate()
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const options = useFinanceOptions()
  const { searchInput, setSearchInput, search, page, setPage } = useSearchPagination()
  const [status, setStatus] = useState('')
  const [creating, setCreating] = useState(false)
  const [createPayment] = useCreatePaymentMutation()
  const canCreate = can(PERMISSIONS.paymentCreate) || hasAnyRole(roles, financeDirectoryRoles)
  const query = useGetPaymentsQuery({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    status: status || undefined,
    sort: 'createdAt',
    order: 'desc',
  })

  const columns: DataTableColumn<Payment>[] = [
    {
      id: 'number',
      header: t('finance.columns.number'),
      cell: (row) => (
        <Link to={`${appConfig.routes.payments}/${row.id}`} className="text-brand font-medium" dir="ltr">
          {row.paymentNumber ?? t('finance.draftLabel')}
        </Link>
      ),
    },
    { id: 'customer', header: t('finance.columns.customer'), cell: (row) => row.customerName ?? t('common.notSet') },
    {
      id: 'amount',
      header: t('finance.columns.amount'),
      cell: (row) => (
        <span dir="ltr">
          {row.currency} {row.amount}
        </span>
      ),
    },
    {
      id: 'method',
      header: t('finance.fields.method'),
      cell: (row) => options.labelOf(options.methodOptions, row.method),
    },
    {
      id: 'status',
      header: t('common.status'),
      cell: (row) => <StatusBadge value={row.status} options={options.paymentStatusOptions} />,
    },
  ]

  return (
    <>
      <PageHeader
        title={t('finance.payments.title')}
        description={t('finance.payments.description')}
        action={canCreate ? <Button type="button" onClick={() => setCreating(true)}>{t('finance.payments.create')}</Button> : undefined}
      />
      <div className="grid gap-3">
        <SearchField
          value={searchInput}
          onChange={setSearchInput}
          label={t('finance.search.payments')}
          placeholder={t('finance.search.payments')}
        />
        <Select
          label={t('common.status')}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value)
            setPage(1)
          }}
          options={[{ value: '', label: t('common.all') }, ...options.paymentStatusOptions]}
        />
      </div>
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => data.items.length === 0}
        emptyTitle={t('finance.payments.empty')}
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
        <PaymentFormDialog
          open={creating}
          onClose={() => setCreating(false)}
          onSubmit={async (body) => {
            const created = await createPayment(body).unwrap()
            navigate(`${appConfig.routes.payments}/${created.id}`)
          }}
        />
      ) : null}
    </>
  )
}
