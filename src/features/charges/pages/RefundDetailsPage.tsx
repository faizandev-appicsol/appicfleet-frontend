import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { PERMISSIONS, chargesDirectoryRoles } from '@/app/router/access'
import { useAppSelector } from '@/app/hooks'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { appConfig } from '@/config/app.config'
import { hasAnyRole } from '@/features/auth/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useGetRefundQuery, useRefundActionMutation } from '@/features/charges/api/chargesApi'
import { useChargesOptions } from '@/features/charges/hooks/useChargesOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function RefundDetailsPage() {
  const { t } = useTranslation()
  const { refundId = '' } = useParams()
  const options = useChargesOptions()
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const query = useGetRefundQuery(refundId, { skip: !refundId })
  const [action, actionState] = useRefundActionMutation()
  const [rejectReason, setRejectReason] = useState('')
  useDocumentTitle(query.data?.documentNumber ?? t('charges.refunds.title'))
  const roleOk = hasAnyRole(roles, chargesDirectoryRoles)

  return (
    <QueryState data={query.data} isLoading={query.isLoading} error={query.error} onRetry={query.refetch} isEmpty={(d) => !d.id} emptyTitle={t('charges.refunds.notFound')}>
      {(refund) => (
        <div className="space-y-6">
          <PageHeader
            title={refund.documentNumber ?? refund.id}
            description={refund.reason}
            action={
              <div className="flex flex-wrap gap-2">
                {refund.status === 'draft' && (can(PERMISSIONS.refundCreate) || roleOk) ? (
                  <Button disabled={actionState.isLoading} onClick={() => void action({ id: refund.id, action: 'request' })}>{t('charges.actions.request')}</Button>
                ) : null}
                {['requested', 'under_review'].includes(refund.status) && (can(PERMISSIONS.refundApprove) || roleOk) ? (
                  <Button disabled={actionState.isLoading} onClick={() => void action({ id: refund.id, action: 'approve' })}>{t('charges.actions.approve')}</Button>
                ) : null}
                {['requested', 'under_review'].includes(refund.status) && (can(PERMISSIONS.refundReject) || roleOk) ? (
                  <Button
                    variant="ghost"
                    disabled={actionState.isLoading || !rejectReason}
                    onClick={() => void action({ id: refund.id, action: 'reject', body: { reason: rejectReason } })}
                  >
                    {t('charges.actions.reject')}
                  </Button>
                ) : null}
                {['approved', 'failed'].includes(refund.status) && (can(PERMISSIONS.refundExecute) || roleOk) ? (
                  <Button disabled={actionState.isLoading} onClick={() => void action({ id: refund.id, action: 'execute' })}>{t('charges.actions.execute')}</Button>
                ) : null}
                <Link to={appConfig.routes.refunds} className="text-brand self-center text-sm font-medium">{t('common.back')}</Link>
              </div>
            }
          />
          <div className="grid gap-4 md:grid-cols-3">
            <div><p className="text-muted text-sm">{t('common.status')}</p><StatusBadge value={refund.status} options={options.refundStatusOptions} /></div>
            <div><p className="text-muted text-sm">{t('charges.fields.amount')}</p><p dir="ltr">{refund.currency} {refund.amount}</p></div>
            <div><p className="text-muted text-sm">{t('charges.fields.sourceKind')}</p><p>{refund.sourceKind}</p></div>
            <div><p className="text-muted text-sm">{t('charges.fields.customer')}</p><p>{refund.customerName ?? refund.customerId}</p></div>
            <div><p className="text-muted text-sm">{t('charges.fields.depositId')}</p><p dir="ltr">{refund.depositId ?? '—'}</p></div>
            <div><p className="text-muted text-sm">{t('charges.fields.externalReference')}</p><p dir="ltr">{refund.externalReference ?? '—'}</p></div>
          </div>
          {['requested', 'under_review'].includes(refund.status) ? (
            <Input label={t('charges.fields.rejectReason')} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          ) : null}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">{t('charges.sections.timeline')}</h2>
            <ul className="space-y-2">
              {(refund.history ?? []).map((event) => (
                <li key={event.id} className="border-border border-b py-2 text-sm">
                  <StatusBadge value={event.toStatus} options={options.refundStatusOptions} />
                  <span className="text-muted ms-2" dir="ltr">{event.createdAt}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </QueryState>
  )
}
