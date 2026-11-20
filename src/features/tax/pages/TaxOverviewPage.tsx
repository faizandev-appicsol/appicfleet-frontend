import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useGetTaxOverviewQuery } from '@/features/tax/api/taxApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function TaxOverviewPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('tax.overview.title'))
  const query = useGetTaxOverviewQuery()

  return (
    <>
      <PageHeader title={t('tax.overview.title')} description={t('tax.overview.description')} />
      <QueryState data={query.data} isLoading={query.isLoading} error={query.error} onRetry={query.refetch} isEmpty={(d) => !d} emptyTitle={t('tax.overview.empty')}>
        {(data) => (
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-muted text-sm">{t('tax.overview.currentPeriod')}</p>
              <p>{data.currentPeriod?.name ?? t('common.none')}</p>
              {data.currentPeriod ? (
                <StatusBadge
                  value={data.currentPeriod.status}
                  options={[
                    { value: 'open', label: t('tax.periodStatus.open') },
                    { value: 'locked', label: t('tax.periodStatus.locked') },
                    { value: 'filed', label: t('tax.periodStatus.filed') },
                  ]}
                />
              ) : null}
            </div>
            <div>
              <p className="text-muted text-sm">{t('tax.overview.taxableSales')}</p>
              <p dir="ltr">{data.taxableSales}</p>
            </div>
            <div>
              <p className="text-muted text-sm">{t('tax.overview.outputVat')}</p>
              <p dir="ltr">{data.outputVat}</p>
            </div>
            <div>
              <p className="text-muted text-sm">{t('tax.overview.adjustments')}</p>
              <p dir="ltr">{data.adjustments}</p>
            </div>
            <div>
              <p className="text-muted text-sm">{t('tax.overview.transactions')}</p>
              <p dir="ltr">{data.transactionCount}</p>
            </div>
            <div>
              <p className="text-muted text-sm">{t('tax.overview.einvoices')}</p>
              <p dir="ltr">{Object.entries(data.einvoiceStatusCounts).map(([k, v]) => `${k}: ${v}`).join(', ') || t('common.none')}</p>
            </div>
          </div>
        )}
      </QueryState>
    </>
  )
}
