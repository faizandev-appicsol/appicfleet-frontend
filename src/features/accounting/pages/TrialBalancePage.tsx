import { useState } from 'react'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { Select } from '@/components/ui/Input'
import { useGetFiscalPeriodsQuery, useGetTrialBalanceQuery } from '@/features/accounting/api/accountingApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function TrialBalancePage() {
  const { t } = useTranslation()
  useDocumentTitle(t('accounting.trialBalance.title'))
  const periodsQuery = useGetFiscalPeriodsQuery()
  const [fiscalPeriodId, setFiscalPeriodId] = useState('')
  const query = useGetTrialBalanceQuery({ fiscalPeriodId }, { skip: !fiscalPeriodId })

  type Row = NonNullable<typeof query.data>['rows'][number]
  const columns: DataTableColumn<Row>[] = [
    { id: 'code', header: t('accounting.fields.code'), cell: (row) => <span dir="ltr">{row.accountCode}</span> },
    { id: 'name', header: t('accounting.fields.name'), cell: (row) => row.accountName },
    { id: 'debit', header: t('accounting.fields.debit'), cell: (row) => <span dir="ltr">{row.debitBalance}</span> },
    { id: 'credit', header: t('accounting.fields.credit'), cell: (row) => <span dir="ltr">{row.creditBalance}</span> },
  ]

  return (
    <>
      <PageHeader title={t('accounting.trialBalance.title')} description={t('accounting.trialBalance.description')} />
      <Select
        label={t('accounting.fields.fiscalPeriod')}
        value={fiscalPeriodId}
        onChange={(e) => setFiscalPeriodId(e.target.value)}
        options={[
          { value: '', label: t('common.none') },
          ...(periodsQuery.data ?? []).map((row) => ({ value: row.id, label: row.name })),
        ]}
      />
      {fiscalPeriodId ? (
        <QueryState data={query.data} isLoading={query.isLoading} error={query.error} onRetry={query.refetch} isEmpty={(d) => d.rows.length === 0} emptyTitle={t('accounting.trialBalance.empty')}>
          {(data) => (
            <div className="space-y-3">
              <div className="border-line bg-surface min-w-0 overflow-x-auto rounded-lg border">
                <DataTable columns={columns} rows={data.rows} rowKey={(row) => row.accountCode} />
              </div>
              <div className="grid gap-2 md:grid-cols-3">
                <p dir="ltr">{t('accounting.fields.totalDebit')}: {data.totalDebit}</p>
                <p dir="ltr">{t('accounting.fields.totalCredit')}: {data.totalCredit}</p>
                <p dir="ltr">{t('accounting.fields.difference')}: {data.difference} ({data.balanced ? t('accounting.trialBalance.balanced') : t('accounting.trialBalance.unbalanced')})</p>
              </div>
            </div>
          )}
        </QueryState>
      ) : (
        <p className="text-muted text-sm">{t('accounting.trialBalance.selectPeriod')}</p>
      )}
    </>
  )
}
