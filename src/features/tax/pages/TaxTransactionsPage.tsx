import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { SearchField } from '@/components/common/SearchField'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { useGetTaxTransactionsQuery } from '@/features/tax/api/taxApi'
import type { TaxTransaction } from '@/features/tax/schemas/tax.schema'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

const PAGE_SIZE = 20

export function TaxTransactionsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('tax.transactions.title'))
  const { searchInput, setSearchInput, search, page, setPage } = useSearchPagination()
  const query = useGetTaxTransactionsQuery({ page, pageSize: PAGE_SIZE, search: search || undefined, sort: 'transactionDate', order: 'desc' })

  const columns: DataTableColumn<TaxTransaction>[] = [
    { id: 'doc', header: t('tax.fields.documentNumber'), cell: (row) => <span dir="ltr">{row.documentNumber ?? '—'}</span> },
    { id: 'date', header: t('tax.fields.date'), cell: (row) => <span dir="ltr">{row.transactionDate}</span> },
    { id: 'source', header: t('tax.fields.source'), cell: (row) => row.sourceType },
    { id: 'customer', header: t('tax.fields.customer'), cell: (row) => row.customerDisplayName ?? '—' },
    { id: 'code', header: t('tax.fields.taxCode'), cell: (row) => <span dir="ltr">{row.taxCode}</span> },
    { id: 'rate', header: t('tax.fields.rate'), cell: (row) => <span dir="ltr">{row.taxRatePercent}</span> },
    { id: 'taxable', header: t('tax.fields.taxable'), cell: (row) => <span dir="ltr">{row.taxableAmount}</span> },
    { id: 'vat', header: t('tax.fields.vat'), cell: (row) => <span dir="ltr">{row.taxAmount}</span> },
    { id: 'gross', header: t('tax.fields.gross'), cell: (row) => <span dir="ltr">{row.grossAmount}</span> },
  ]

  return (
    <>
      <PageHeader title={t('tax.transactions.title')} description={t('tax.transactions.description')} />
      <SearchField value={searchInput} onChange={setSearchInput} label={t('tax.search.transactions')} placeholder={t('tax.search.transactions')} />
      <QueryState data={query.data} isLoading={query.isLoading} error={query.error} onRetry={query.refetch} isEmpty={(d) => d.items.length === 0} emptyTitle={t('tax.transactions.empty')}>
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
