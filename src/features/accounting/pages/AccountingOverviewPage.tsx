import { Link } from 'react-router'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { appConfig } from '@/config/app.config'
import { useGetAccountingOverviewQuery } from '@/features/accounting/api/accountingApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function AccountingOverviewPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('accounting.overview.title'))
  const query = useGetAccountingOverviewQuery()

  return (
    <>
      <PageHeader title={t('accounting.overview.title')} description={t('accounting.overview.description')} />
      <QueryState data={query.data} isLoading={query.isLoading} error={query.error} onRetry={query.refetch} isEmpty={(d) => !d} emptyTitle={t('accounting.overview.empty')}>
        {(data) => (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-muted text-sm">{t('accounting.overview.currentPeriod')}</p>
                <p>{data.currentPeriod?.name ?? t('common.none')}</p>
                {data.currentPeriod ? <StatusBadge value={data.currentPeriod.status} options={[{ value: 'open', label: t('accounting.periodStatus.open') }, { value: 'closed', label: t('accounting.periodStatus.closed') }]} /> : null}
              </div>
              <div>
                <p className="text-muted text-sm">{t('accounting.overview.postedDebit')}</p>
                <p dir="ltr">{data.periodPostedDebit}</p>
              </div>
              <div>
                <p className="text-muted text-sm">{t('accounting.overview.postedCredit')}</p>
                <p dir="ltr">{data.periodPostedCredit}</p>
              </div>
            </div>
            <section className="space-y-2">
              <h2 className="text-lg font-semibold">{t('accounting.overview.recentJournals')}</h2>
              {data.recentJournals.length === 0 ? <p className="text-muted text-sm">{t('accounting.journals.empty')}</p> : null}
              <ul className="space-y-2">
                {data.recentJournals.map((journal) => (
                  <li key={journal.id} className="border-border flex flex-wrap items-center justify-between gap-2 border-b py-2 text-sm">
                    <Link to={`${appConfig.routes.accountingJournals}/${journal.id}`} className="text-brand font-medium" dir="ltr">
                      {journal.journalNumber ?? journal.id}
                    </Link>
                    <span>{journal.description}</span>
                    <span dir="ltr">{journal.totalDebit} / {journal.totalCredit}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </QueryState>
    </>
  )
}
