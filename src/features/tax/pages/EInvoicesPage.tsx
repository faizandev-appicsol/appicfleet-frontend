import { useState } from 'react'
import { Link } from 'react-router'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { SearchField } from '@/components/common/SearchField'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { Select } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { appConfig } from '@/config/app.config'
import { useGetEInvoicesQuery } from '@/features/tax/api/taxApi'
import type { EInvoice } from '@/features/tax/schemas/tax.schema'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

const PAGE_SIZE = 20
const statusOptions = [
  { value: 'not_ready', label: 'Not ready' },
  { value: 'ready', label: 'Ready' },
  { value: 'generated', label: 'Generated' },
  { value: 'validating', label: 'Validating' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function EInvoicesPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('tax.einvoices.title'))
  const { searchInput, setSearchInput, search, page, setPage } = useSearchPagination()
  const [status, setStatus] = useState('')
  const query = useGetEInvoicesQuery({ page, pageSize: PAGE_SIZE, search: search || undefined, status: status || undefined, sort: 'issueDate', order: 'desc' })

  const columns: DataTableColumn<EInvoice>[] = [
    {
      id: 'doc',
      header: t('tax.fields.documentNumber'),
      cell: (row) => (
        <Link to={`${appConfig.routes.taxEinvoices}/${row.id}`} className="text-brand font-medium" dir="ltr">
          {row.documentNumber ?? row.id}
        </Link>
      ),
    },
    { id: 'customer', header: t('tax.fields.customer'), cell: (row) => row.customerDisplayName ?? '—' },
    { id: 'date', header: t('tax.fields.date'), cell: (row) => <span dir="ltr">{row.issueDate}</span> },
    { id: 'total', header: t('tax.fields.gross'), cell: (row) => <span dir="ltr">{row.totalAmount}</span> },
    { id: 'vat', header: t('tax.fields.vat'), cell: (row) => <span dir="ltr">{row.taxAmount}</span> },
    { id: 'provider', header: t('tax.fields.provider'), cell: (row) => row.provider ?? '—' },
    { id: 'status', header: t('common.status'), cell: (row) => <StatusBadge value={row.status} options={statusOptions} /> },
    { id: 'ref', header: t('tax.fields.providerReference'), cell: (row) => <span dir="ltr">{row.providerReference ?? '—'}</span> },
  ]

  return (
    <>
      <PageHeader title={t('tax.einvoices.title')} description={t('tax.einvoices.description')} />
      <div className="grid items-end gap-3 md:grid-cols-2">
        <SearchField value={searchInput} onChange={setSearchInput} label={t('tax.search.einvoices')} placeholder={t('tax.search.einvoices')} />
        <Select label={t('common.status')} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} options={[{ value: '', label: t('common.all') }, ...statusOptions]} />
      </div>
      <QueryState data={query.data} isLoading={query.isLoading} error={query.error} onRetry={query.refetch} isEmpty={(d) => d.items.length === 0} emptyTitle={t('tax.einvoices.empty')}>
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
