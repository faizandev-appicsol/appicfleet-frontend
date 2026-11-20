import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { PERMISSIONS, chargesDirectoryRoles } from '@/app/router/access'
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
import { useCreateRefundMutation, useGetRefundsQuery } from '@/features/charges/api/chargesApi'
import { RefundFormDialog } from '@/features/charges/components/RefundFormDialog'
import { useChargesOptions } from '@/features/charges/hooks/useChargesOptions'
import type { Refund } from '@/features/charges/schemas/charges.schema'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

const PAGE_SIZE = 20

export function RefundsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('charges.refunds.title'))
  const navigate = useNavigate()
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const options = useChargesOptions()
  const { searchInput, setSearchInput, search, page, setPage } = useSearchPagination()
  const [status, setStatus] = useState('')
  const [creating, setCreating] = useState(false)
  const [createRefund] = useCreateRefundMutation()
  const canCreate = can(PERMISSIONS.refundCreate) || hasAnyRole(roles, chargesDirectoryRoles)
  const query = useGetRefundsQuery({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    status: status || undefined,
    sort: 'createdAt',
    order: 'desc',
  })

  const columns: DataTableColumn<Refund>[] = [
    {
      id: 'number',
      header: t('charges.columns.number'),
      className: 'w-[18%]',
      cell: (row) => (
        <Link to={`${appConfig.routes.refunds}/${row.id}`} className="text-brand font-medium" dir="ltr">
          {row.documentNumber ?? row.id}
        </Link>
      ),
    },
    {
      id: 'customer',
      header: t('charges.fields.customer'),
      className: 'w-[26%]',
      cell: (row) => row.customerName ?? row.customerId,
    },
    {
      id: 'source',
      header: t('charges.fields.sourceKind'),
      className: 'w-[16%]',
      cell: (row) => row.sourceKind,
    },
    {
      id: 'amount',
      header: t('charges.columns.amount'),
      className: 'w-[20%]',
      cell: (row) => (
        <span dir="ltr">
          {row.currency} {row.amount}
        </span>
      ),
    },
    {
      id: 'status',
      header: t('common.status'),
      className: 'w-[20%]',
      cell: (row) => <StatusBadge value={row.status} options={options.refundStatusOptions} />,
    },
  ]

  return (
    <>
      <PageHeader
        title={t('charges.refunds.title')}
        description={t('charges.refunds.description')}
        action={
          canCreate ? (
            <Button onClick={() => setCreating(true)}>{t('charges.refunds.create')}</Button>
          ) : undefined
        }
      />
      <div className="grid items-end gap-3 md:grid-cols-2">
        <SearchField
          value={searchInput}
          onChange={setSearchInput}
          label={t('charges.search.refunds')}
          placeholder={t('charges.search.refunds')}
        />
        <Select
          label={t('common.status')}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
          options={[{ value: '', label: t('common.all') }, ...options.refundStatusOptions]}
        />
      </div>
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(d) => d.items.length === 0}
        emptyTitle={t('charges.refunds.empty')}
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
      <RefundFormDialog
        open={creating}
        onClose={() => setCreating(false)}
        onSubmit={async (body) => {
          const created = await createRefund(body).unwrap()
          navigate(`${appConfig.routes.refunds}/${created.id}`)
        }}
      />
    </>
  )
}
