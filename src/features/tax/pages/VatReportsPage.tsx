import { useState } from 'react'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { Select } from '@/components/ui/Input'
import { useGetTaxPeriodsQuery, useGetVatReportQuery } from '@/features/tax/api/taxApi'
import { useLegalEntityOptions } from '@/features/legal-entities/hooks/useLegalEntityOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function VatReportsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('tax.reports.title'))
  const legalEntities = useLegalEntityOptions()
  const [legalEntityId, setLegalEntityId] = useState('')
  const [taxPeriodId, setTaxPeriodId] = useState('')
  const periodsQuery = useGetTaxPeriodsQuery({ legalEntityId }, { skip: !legalEntityId })
  const query = useGetVatReportQuery({ legalEntityId, taxPeriodId: taxPeriodId || undefined }, { skip: !legalEntityId })

  type Row = { taxCode: string; taxTreatment: string; sourceType: string; taxableAmount: string; taxAmount: string; grossAmount: string; count: number }
  const columns: DataTableColumn<Row>[] = [
    { id: 'code', header: t('tax.fields.taxCode'), cell: (row) => <span dir="ltr">{row.taxCode}</span> },
    { id: 'treatment', header: t('tax.fields.treatment'), cell: (row) => row.taxTreatment },
    { id: 'source', header: t('tax.fields.source'), cell: (row) => row.sourceType },
    { id: 'taxable', header: t('tax.fields.taxable'), cell: (row) => <span dir="ltr">{String(row.taxableAmount)}</span> },
    { id: 'vat', header: t('tax.fields.vat'), cell: (row) => <span dir="ltr">{String(row.taxAmount)}</span> },
    { id: 'gross', header: t('tax.fields.gross'), cell: (row) => <span dir="ltr">{String(row.grossAmount)}</span> },
    { id: 'count', header: t('tax.fields.count'), cell: (row) => String(row.count) },
  ]

  return (
    <>
      <PageHeader title={t('tax.reports.title')} description={t('tax.reports.description')} />
      <div className="grid gap-3 md:grid-cols-2">
        <Select label={t('tax.fields.legalEntity')} value={legalEntityId} onChange={(e) => { setLegalEntityId(e.target.value); setTaxPeriodId('') }} options={[{ value: '', label: t('common.none') }, ...legalEntities.options]} />
        <Select
          label={t('tax.fields.taxPeriod')}
          value={taxPeriodId}
          onChange={(e) => setTaxPeriodId(e.target.value)}
          options={[{ value: '', label: t('common.all') }, ...(periodsQuery.data ?? []).map((p) => ({ value: p.id, label: p.name }))]}
        />
      </div>
      {legalEntityId ? (
        <QueryState data={query.data} isLoading={query.isLoading} error={query.error} onRetry={query.refetch} isEmpty={(d) => d.rows.length === 0} emptyTitle={t('tax.reports.empty')}>
          {(data) => (
            <div className="space-y-3">
              <div className="border-line bg-surface min-w-0 overflow-x-auto rounded-lg border">
                <DataTable columns={columns} rows={data.rows as unknown as Row[]} rowKey={(row, i) => `${row.taxCode}-${row.sourceType}-${i}`} />
              </div>
              {data.note ? <p className="text-muted text-sm">{data.note}</p> : null}
            </div>
          )}
        </QueryState>
      ) : (
        <p className="text-muted text-sm">{t('tax.reports.selectEntity')}</p>
      )}
    </>
  )
}
