import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { KpiCard } from '@/features/reports/components/KpiCard'
import { useGetInvestorFinancialQuery } from '@/features/investor-portal/api/investorPortalApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function InvestorFinancialPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('investorPortal.financial.title'))
  const query = useGetInvestorFinancialQuery({ preset: 'this_month' })

  return (
    <>
      <PageHeader
        title={t('investorPortal.financial.title')}
        description={t('investorPortal.financial.description')}
      />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={() => false}
        emptyTitle={t('investorPortal.emptyTitle')}
        emptyDescription={t('investorPortal.emptyDescription')}
      >
        {(data) => (
          <div className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <KpiCard
                label={t('investorPortal.kpis.revenue')}
                value={data.revenue ?? '—'}
                hint={data.currency ?? undefined}
              />
              <KpiCard
                label={t('investorPortal.financial.payments')}
                value={data.payments ?? '—'}
              />
              <KpiCard
                label={t('investorPortal.financial.receivables')}
                value={data.outstandingReceivables ?? '—'}
              />
            </div>
            {data.note ? <p className="text-muted text-sm">{data.note}</p> : null}
          </div>
        )}
      </QueryState>
    </>
  )
}
