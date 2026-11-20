import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { PERMISSIONS, financeDirectoryRoles, taxDirectoryRoles } from '@/app/router/access'
import { useAppSelector } from '@/app/hooks'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { appConfig } from '@/config/app.config'
import { hasAnyRole } from '@/features/auth/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useGetInvoiceQuery, useInvoiceActionMutation } from '@/features/finance/api/financeApi'
import { useFinanceOptions } from '@/features/finance/hooks/useFinanceOptions'
import { useGenerateEInvoiceMutation } from '@/features/tax/api/taxApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function InvoiceDetailsPage() {
  const { t } = useTranslation()
  const { invoiceId = '' } = useParams()
  const navigate = useNavigate()
  const options = useFinanceOptions()
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const query = useGetInvoiceQuery(invoiceId, { skip: !invoiceId })
  const [action, actionState] = useInvoiceActionMutation()
  const [generateEInvoice, generateState] = useGenerateEInvoiceMutation()
  const [generateError, setGenerateError] = useState('')
  useDocumentTitle(query.data?.documentNumber ?? t('finance.invoices.title'))

  const canPost = can(PERMISSIONS.invoicePost) || hasAnyRole(roles, financeDirectoryRoles)
  const canVoid = can(PERMISSIONS.invoiceVoid) || hasAnyRole(roles, financeDirectoryRoles)
  const canGenerateEInvoice =
    can(PERMISSIONS.einvoiceGenerate) || hasAnyRole(roles, taxDirectoryRoles) || hasAnyRole(roles, financeDirectoryRoles)

  return (
    <QueryState
      data={query.data}
      isLoading={query.isLoading}
      error={query.error}
      onRetry={query.refetch}
      isEmpty={(data) => !data.id}
      emptyTitle={t('finance.invoices.notFound')}
    >
      {(invoice) => (
        <div className="space-y-6">
          <PageHeader
            title={invoice.documentNumber ?? t('finance.draftLabel')}
            description={invoice.customerName}
            action={
              <div className="flex flex-wrap gap-2">
                {invoice.status === 'draft' && canPost ? (
                  <Button disabled={actionState.isLoading} onClick={() => void action({ id: invoice.id, action: 'post' })}>
                    {t('finance.actions.post')}
                  </Button>
                ) : null}
                {invoice.status === 'posted' && canGenerateEInvoice ? (
                  <Button
                    disabled={generateState.isLoading}
                    onClick={() => {
                      setGenerateError('')
                      void generateEInvoice({ invoiceId: invoice.id })
                        .unwrap()
                        .then((doc) => navigate(`${appConfig.routes.taxEinvoices}/${doc.id}`))
                        .catch(() => setGenerateError(t('finance.einvoice.generateFailed')))
                    }}
                  >
                    {generateState.isLoading ? t('common.updating') : t('finance.actions.generateEInvoice')}
                  </Button>
                ) : null}
                {invoice.status !== 'voided' && canVoid ? (
                  <Button
                    variant="ghost"
                    disabled={actionState.isLoading}
                    onClick={() => void action({ id: invoice.id, action: 'void', body: { reason: 'Voided from UI' } })}
                  >
                    {t('finance.actions.void')}
                  </Button>
                ) : null}
                <Link to={appConfig.routes.invoices} className="text-brand self-center text-sm font-medium">
                  {t('common.back')}
                </Link>
              </div>
            }
          />
          {generateError ? <p className="text-danger text-sm">{generateError}</p> : null}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-muted text-sm">{t('common.status')}</p>
              <StatusBadge value={invoice.status} options={options.docStatusOptions} />
            </div>
            <div>
              <p className="text-muted text-sm">{t('finance.fields.currency')}</p>
              <p dir="ltr">{invoice.currency}</p>
            </div>
            <div>
              <p className="text-muted text-sm">{t('finance.columns.outstanding')}</p>
              <p dir="ltr">{invoice.outstandingAmount}</p>
            </div>
          </div>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">{t('finance.sections.summary')}</h2>
            <dl className="grid gap-2 md:grid-cols-2" dir="ltr">
              <div>
                <dt>{t('finance.fields.subtotal')}</dt>
                <dd>{invoice.subtotal}</dd>
              </div>
              <div>
                <dt>{t('finance.fields.discount')}</dt>
                <dd>{invoice.discountTotal}</dd>
              </div>
              <div>
                <dt>{t('finance.fields.taxable')}</dt>
                <dd>{invoice.taxableAmount}</dd>
              </div>
              <div>
                <dt>{t('finance.fields.tax')}</dt>
                <dd>{invoice.taxAmount}</dd>
              </div>
              <div>
                <dt>{t('finance.fields.total')}</dt>
                <dd>{invoice.totalAmount}</dd>
              </div>
              <div>
                <dt>{t('finance.fields.paid')}</dt>
                <dd>{invoice.paidAmount}</dd>
              </div>
            </dl>
          </section>
          {(invoice.taxSummary?.length ?? 0) > 0 ? (
            <section className="space-y-2">
              <h2 className="text-lg font-semibold">{t('finance.sections.taxSummary')}</h2>
              <ul className="space-y-2">
                {invoice.taxSummary.map((row) => (
                  <li key={`${row.taxCode}-${row.taxRatePercent}`} className="border-border flex flex-wrap justify-between gap-2 border-b py-2 text-sm">
                    <span dir="ltr">
                      {row.taxCode} ({row.taxRatePercent}%)
                      {row.taxTreatment ? ` · ${row.taxTreatment}` : ''}
                    </span>
                    <span dir="ltr">
                      {t('finance.fields.taxable')}: {row.taxableAmount} · {t('finance.fields.tax')}: {row.taxAmount}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">{t('finance.sections.lines')}</h2>
            <ul className="space-y-2">
              {invoice.lines.map((line) => (
                <li key={line.id} className="border-border border-b py-2">
                  <div className="flex justify-between gap-3">
                    <span>
                      {line.description}
                      {line.taxCode ? (
                        <span className="text-muted ms-2 text-xs" dir="ltr">
                          {line.taxCode} · {line.taxRatePercent}%
                        </span>
                      ) : null}
                    </span>
                    <span dir="ltr">{line.lineTotal}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">{t('finance.sections.timeline')}</h2>
            <ul className="space-y-2">
              {invoice.history.map((event) => (
                <li key={event.id} className="text-sm">
                  <span dir="ltr">{event.createdAt}</span> — {event.fromStatus ? `${event.fromStatus} → ` : ''}
                  {event.toStatus}
                  {event.reason ? ` (${event.reason})` : ''}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </QueryState>
  )
}
