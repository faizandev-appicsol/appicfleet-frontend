import { useState } from 'react'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { Select } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { useGetAccountTreeQuery, useGetLedgerQuery } from '@/features/accounting/api/accountingApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

const PAGE_SIZE = 50

export function GeneralLedgerPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('accounting.ledger.title'))
  const accountsQuery = useGetAccountTreeQuery()
  const { page, setPage } = useSearchPagination()
  const [accountId, setAccountId] = useState('')
  const query = useGetLedgerQuery({ accountId, page, pageSize: PAGE_SIZE }, { skip: !accountId })

  type Row = NonNullable<typeof query.data>['items'][number]
  const columns: DataTableColumn<Row>[] = [
    { id: 'date', header: t('accounting.fields.accountingDate'), cell: (row) => <span dir="ltr">{row.accountingDate ?? '—'}</span> },
    { id: 'journal', header: t('accounting.fields.journalNumber'), cell: (row) => <span dir="ltr">{row.journalNumber ?? '—'}</span> },
    { id: 'description', header: t('accounting.fields.description'), cell: (row) => row.description ?? '—' },
    { id: 'debit', header: t('accounting.fields.debit'), cell: (row) => <span dir="ltr">{row.debit}</span> },
    { id: 'credit', header: t('accounting.fields.credit'), cell: (row) => <span dir="ltr">{row.credit}</span> },
    { id: 'balance', header: t('accounting.fields.runningBalance'), cell: (row) => <span dir="ltr">{row.runningBalance}</span> },
  ]

  return (
    <>
      <PageHeader title={t('accounting.ledger.title')} description={t('accounting.ledger.description')} />
      <Select
        label={t('accounting.fields.account')}
        value={accountId}
        onChange={(e) => { setAccountId(e.target.value); setPage(1) }}
        options={[
          { value: '', label: t('common.none') },
          ...(accountsQuery.data ?? []).map((row) => ({ value: row.id, label: `${row.code} — ${row.name}` })),
        ]}
      />
      {!accountId ? <p className="text-muted text-sm">{t('accounting.ledger.selectAccount')}</p> : null}
      {accountId ? (
        <QueryState data={query.data} isLoading={query.isLoading} error={query.error} onRetry={query.refetch} isEmpty={(d) => d.items.length === 0} emptyTitle={t('accounting.ledger.empty')}>
          {(data) => (
            <div className="grid min-w-0 gap-3">
              <p className="text-sm" dir="ltr">{data.account.code} — {data.account.name}</p>
              <div className="border-line bg-surface min-w-0 overflow-x-auto rounded-lg border">
                <DataTable columns={columns} rows={data.items} rowKey={(row) => row.id} />
              </div>
              <Pagination data={data} page={page} onPageChange={setPage} disabled={query.isFetching} />
            </div>
          )}
        </QueryState>
      ) : null}
    </>
  )
}
