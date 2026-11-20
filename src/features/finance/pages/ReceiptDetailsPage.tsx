import { Link, useParams } from 'react-router'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { appConfig } from '@/config/app.config'
import { useGetReceiptQuery } from '@/features/finance/api/financeApi'
import { useFinanceOptions } from '@/features/finance/hooks/useFinanceOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function ReceiptDetailsPage() {
  const { t } = useTranslation()
  const { receiptId = '' } = useParams()
  const options = useFinanceOptions()
  const query = useGetReceiptQuery(receiptId, { skip: !receiptId })
  useDocumentTitle(query.data?.receiptNumber ?? t('finance.receipts.title'))

  return (
    <QueryState
      data={query.data}
      isLoading={query.isLoading}
      error={query.error}
      onRetry={query.refetch}
      isEmpty={(data) => !data.id}
      emptyTitle={t('finance.receipts.notFound')}
    >
      {(receipt) => (
        <div className="space-y-6">
          <PageHeader
            title={receipt.receiptNumber}
            description={receipt.customerName}
            action={
              <Link to={appConfig.routes.receipts} className="text-brand text-sm font-medium">
                {t('common.back')}
              </Link>
            }
          />
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted">{t('common.status')}</p>
              <StatusBadge value={receipt.status} options={options.docStatusOptions} />
            </div>
            <div>
              <p className="text-sm text-muted">{t('finance.fields.amount')}</p>
              <p dir="ltr">
                {receipt.currency} {receipt.amount}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted">{t('finance.fields.payment')}</p>
              <Link to={`${appConfig.routes.payments}/${receipt.paymentId}`} className="text-brand" dir="ltr">
                {receipt.paymentId}
              </Link>
            </div>
          </div>
        </div>
      )}
    </QueryState>
  )
}
