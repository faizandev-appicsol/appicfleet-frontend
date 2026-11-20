import { Link } from 'react-router'
import { SearchField } from '@/components/common/SearchField'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { appConfig } from '@/config/app.config'
import { useGetDebitNotesQuery } from '@/features/finance/api/financeApi'
import { useFinanceOptions } from '@/features/finance/hooks/useFinanceOptions'
import type { DebitNote } from '@/features/finance/schemas/finance.schema'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

const PAGE_SIZE = 20

export function DebitNotesPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('finance.debitNotes.title'))
  const options = useFinanceOptions()
  const { searchInput, setSearchInput, search, page, setPage } = useSearchPagination()
  const query = useGetDebitNotesQuery({ page, pageSize: PAGE_SIZE, search: search || undefined })

  const columns: DataTableColumn<DebitNote>[] = [
    {
      id: 'number',
      header: t('finance.columns.number'),
      cell: (row) => (
        <Link to={`${appConfig.routes.debitNotes}/${row.id}`} className="text-brand font-medium" dir="ltr">
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
      id: 'status',
      header: t('common.status'),
      cell: (row) => <StatusBadge value={row.status} options={options.docStatusOptions} />,
    },
  ]

  return (
    <>
      <PageHeader title={t('finance.debitNotes.title')} description={t('finance.debitNotes.description')} />
      <SearchField
        value={searchInput}
        onChange={setSearchInput}
        label={t('finance.search.debitNotes')}
        placeholder={t('finance.search.debitNotes')}
      />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => data.items.length === 0}
        emptyTitle={t('finance.debitNotes.empty')}
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
    </>
  )
}
