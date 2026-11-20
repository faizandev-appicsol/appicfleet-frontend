import { Link, useParams } from 'react-router'
import { PERMISSIONS, financeDirectoryRoles } from '@/app/router/access'
import { useAppSelector } from '@/app/hooks'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { appConfig } from '@/config/app.config'
import { hasAnyRole } from '@/features/auth/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useGetPaymentQuery, usePaymentActionMutation } from '@/features/finance/api/financeApi'
import { useFinanceOptions } from '@/features/finance/hooks/useFinanceOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function PaymentDetailsPage() {
  const { t } = useTranslation()
  const { paymentId = '' } = useParams()
  const options = useFinanceOptions()
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const query = useGetPaymentQuery(paymentId, { skip: !paymentId })
  const [action, actionState] = usePaymentActionMutation()
  useDocumentTitle(query.data?.paymentNumber ?? t('finance.payments.title'))
  const canComplete = can(PERMISSIONS.paymentComplete) || hasAnyRole(roles, financeDirectoryRoles)

  return (
    <QueryState
      data={query.data}
      isLoading={query.isLoading}
      error={query.error}
      onRetry={query.refetch}
      isEmpty={(data) => !data.id}
      emptyTitle={t('finance.payments.notFound')}
    >
      {(payment) => (
        <div className="space-y-6">
          <PageHeader
            title={payment.paymentNumber ?? t('finance.draftLabel')}
            description={payment.customerName}
            action={
              <div className="flex flex-wrap gap-2">
                {payment.status === 'pending' && canComplete ? (
                  <Button disabled={actionState.isLoading} onClick={() => void action({ id: payment.id, action: 'complete' })}>
                    {t('finance.actions.complete')}
                  </Button>
                ) : null}
                <Link to={appConfig.routes.payments} className="text-brand text-sm font-medium self-center">
                  {t('common.back')}
                </Link>
              </div>
            }
          />
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted">{t('common.status')}</p>
              <StatusBadge value={payment.status} options={options.paymentStatusOptions} />
            </div>
            <div>
              <p className="text-sm text-muted">{t('finance.fields.amount')}</p>
              <p dir="ltr">
                {payment.currency} {payment.amount}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted">{t('finance.fields.unallocated')}</p>
              <p dir="ltr">{payment.unallocatedAmount}</p>
            </div>
          </div>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">{t('finance.sections.allocations')}</h2>
            <ul className="space-y-2">
              {payment.allocations.map((row) => (
                <li key={row.id} className="flex justify-between gap-3 border-b border-border py-2">
                  <Link to={`${appConfig.routes.invoices}/${row.invoiceId}`} className="text-brand" dir="ltr">
                    {row.invoiceId}
                  </Link>
                  <span dir="ltr">{row.amount}</span>
                </li>
              ))}
            </ul>
          </section>
          {payment.receipt ? (
            <section>
              <h2 className="text-lg font-semibold">{t('finance.sections.receipt')}</h2>
              <Link to={`${appConfig.routes.receipts}/${payment.receipt.id}`} className="text-brand" dir="ltr">
                {payment.receipt.receiptNumber}
              </Link>
            </section>
          ) : null}
        </div>
      )}
    </QueryState>
  )
}
