import { Link, useParams } from 'react-router'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { appConfig } from '@/config/app.config'
import { useGetFineTollImportQuery } from '@/features/charges/api/chargesApi'
import { useChargesOptions } from '@/features/charges/hooks/useChargesOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

type ImportRow = {
  id: string
  rowNumber: number
  result: string
  externalReference?: string
  reason?: string
  createdRecordId?: string
  existingRecordId?: string
}

export function ChargeImportDetailsPage() {
  const { t } = useTranslation()
  const { importId = '' } = useParams()
  const options = useChargesOptions()
  const query = useGetFineTollImportQuery(importId, { skip: !importId })
  useDocumentTitle(query.data?.documentNumber ?? t('charges.import.title'))

  const columns: DataTableColumn<ImportRow>[] = [
    { id: 'row', header: t('charges.import.rowNumber'), cell: (row) => String(row.rowNumber) },
    { id: 'ref', header: t('charges.fields.externalReference'), cell: (row) => <span dir="ltr">{row.externalReference ?? '—'}</span> },
    { id: 'result', header: t('charges.import.result'), cell: (row) => row.result },
    { id: 'reason', header: t('charges.fields.reason'), cell: (row) => row.reason ?? '—' },
  ]

  return (
    <QueryState data={query.data} isLoading={query.isLoading} error={query.error} onRetry={query.refetch} isEmpty={(d) => !d.id} emptyTitle={t('charges.import.notFound')}>
      {(batch) => (
        <div className="space-y-6">
          <PageHeader
            title={batch.documentNumber ?? batch.id}
            description={batch.fileName}
            action={<Link to={appConfig.routes.chargeImports} className="text-brand text-sm font-medium">{t('common.back')}</Link>}
          />
          <div className="grid gap-4 md:grid-cols-4">
            <div><p className="text-muted text-sm">{t('common.status')}</p><StatusBadge value={batch.status} options={options.importStatusOptions} /></div>
            <div><p className="text-muted text-sm">{t('charges.import.totalRows')}</p><p>{batch.totalRows}</p></div>
            <div><p className="text-muted text-sm">{t('charges.import.successRows')}</p><p>{batch.successRows}</p></div>
            <div><p className="text-muted text-sm">{t('charges.import.duplicateRows')}</p><p>{batch.duplicateRows}</p></div>
            <div><p className="text-muted text-sm">{t('charges.import.failedRows')}</p><p>{batch.failedRows}</p></div>
            <div><p className="text-muted text-sm">{t('charges.import.reviewRows')}</p><p>{batch.reviewRows ?? 0}</p></div>
            <div className="md:col-span-2"><p className="text-muted text-sm">{t('charges.import.errorSummary')}</p><p className="whitespace-pre-wrap text-sm">{batch.errorSummary ?? '—'}</p></div>
          </div>
          <div className="border-line bg-surface min-w-0 overflow-x-auto rounded-lg border">
            <DataTable columns={columns} rows={batch.rows ?? []} rowKey={(row) => row.id} />
          </div>
        </div>
      )}
    </QueryState>
  )
}
