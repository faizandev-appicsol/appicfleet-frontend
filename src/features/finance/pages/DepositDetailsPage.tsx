import { Link, useParams } from 'react-router'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { appConfig } from '@/config/app.config'
import { useGetDepositQuery } from '@/features/finance/api/financeApi'
import { useFinanceOptions } from '@/features/finance/hooks/useFinanceOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function DepositDetailsPage() {
  const { t } = useTranslation()
  const { depositId = '' } = useParams()
  const options = useFinanceOptions()
  const query = useGetDepositQuery(depositId, { skip: !depositId })
  useDocumentTitle(query.data?.depositNumber ?? t('finance.deposits.title'))

  return (
    <QueryState
      data={query.data}
      isLoading={query.isLoading}
      error={query.error}
      onRetry={query.refetch}
      isEmpty={(data) => !data.id}
      emptyTitle={t('finance.deposits.notFound')}
    >
      {(deposit) => (
        <div className="space-y-6">
          <PageHeader
            title={deposit.depositNumber}
            description={deposit.customerName}
            action={
              <Link to={appConfig.routes.deposits} className="text-brand text-sm font-medium">
                {t('common.back')}
              </Link>
            }
          />
          <StatusBadge value={deposit.status} options={options.depositStatusOptions} />
          <dl className="grid gap-2 md:grid-cols-3" dir="ltr">
            <div>
              <dt>{t('finance.fields.amount')}</dt>
              <dd>
                {deposit.currency} {deposit.amount}
              </dd>
            </div>
            <div>
              <dt>{t('finance.fields.applied')}</dt>
              <dd>{deposit.appliedAmount}</dd>
            </div>
            <div>
              <dt>{t('finance.columns.remaining')}</dt>
              <dd>{deposit.remainingAmount}</dd>
            </div>
          </dl>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">{t('finance.sections.timeline')}</h2>
            <ul className="space-y-2">
              {deposit.events.map((event) => (
                <li key={event.id} className="text-sm">
                  <span dir="ltr">{event.createdAt}</span> — {event.kind} ({event.amount})
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </QueryState>
  )
}
