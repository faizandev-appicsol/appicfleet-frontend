import { Link } from 'react-router'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { appConfig } from '@/config/app.config'
import { useGetFinesQuery } from '@/features/charges/api/chargesApi'
import { useChargesOptions } from '@/features/charges/hooks/useChargesOptions'
import type { Fine } from '@/features/charges/schemas/charges.schema'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

const PAGE_SIZE = 20

export function DisputesPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('charges.disputes.title'))
  const options = useChargesOptions()
  const { page, setPage } = useSearchPagination()
  const query = useGetFinesQuery({ page, pageSize: PAGE_SIZE, status: 'disputed', sort: 'createdAt', order: 'desc' })

  const columns: DataTableColumn<Fine>[] = [
    {
      id: 'number',
      header: t('charges.columns.number'),
      cell: (row) => (
        <Link to={`${appConfig.routes.fines}/${row.id}`} className="text-brand font-medium" dir="ltr">
          {row.documentNumber ?? row.externalReference}
        </Link>
      ),
    },
    { id: 'customer', header: t('charges.fields.customer'), cell: (row) => row.customerName ?? '—' },
    { id: 'amount', header: t('charges.columns.amount'), cell: (row) => <span dir="ltr">{row.currency} {row.amount}</span> },
    { id: 'status', header: t('common.status'), cell: (row) => <StatusBadge value={row.status} options={options.fineStatusOptions} /> },
  ]

  return (
    <>
      <PageHeader title={t('charges.disputes.title')} description={t('charges.disputes.description')} />
      <QueryState data={query.data} isLoading={query.isLoading} isFetching={query.isFetching && !query.isLoading} error={query.error} onRetry={query.refetch} isEmpty={(d) => d.items.length === 0} emptyTitle={t('charges.disputes.empty')}>
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
