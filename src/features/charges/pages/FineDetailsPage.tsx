import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { PERMISSIONS, chargesDirectoryRoles } from '@/app/router/access'
import { useAppSelector } from '@/app/hooks'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Textarea } from '@/components/ui/Textarea'
import { appConfig } from '@/config/app.config'
import { hasAnyRole } from '@/features/auth/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useFineActionMutation, useGetFineQuery } from '@/features/charges/api/chargesApi'
import { useChargesOptions } from '@/features/charges/hooks/useChargesOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function FineDetailsPage() {
  const { t } = useTranslation()
  const { fineId = '' } = useParams()
  const options = useChargesOptions()
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const query = useGetFineQuery(fineId, { skip: !fineId })
  const [action, actionState] = useFineActionMutation()
  const [reviewOpen, setReviewOpen] = useState(false)
  const [contractId, setContractId] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [disputeReason, setDisputeReason] = useState('')
  const [waiveReason, setWaiveReason] = useState('')
  useDocumentTitle(query.data?.documentNumber ?? t('charges.fines.title'))
  const roleOk = hasAnyRole(roles, chargesDirectoryRoles)

  return (
    <QueryState data={query.data} isLoading={query.isLoading} error={query.error} onRetry={query.refetch} isEmpty={(d) => !d.id} emptyTitle={t('charges.fines.notFound')}>
      {(fine) => (
        <div className="space-y-6">
          <PageHeader
            title={fine.documentNumber ?? fine.externalReference}
            description={fine.description}
            action={
              <div className="flex flex-wrap gap-2">
                {['imported', 'pending_review'].includes(fine.status) && (can(PERMISSIONS.fineReview) || roleOk) ? (
                  <Button disabled={actionState.isLoading} onClick={() => setReviewOpen(true)}>{t('charges.actions.review')}</Button>
                ) : null}
                {fine.status === 'assigned' && (can(PERMISSIONS.fineApprove) || roleOk) ? (
                  <Button disabled={actionState.isLoading} onClick={() => void action({ id: fine.id, action: 'approve' })}>{t('charges.actions.approve')}</Button>
                ) : null}
                {fine.status === 'approved' && (can(PERMISSIONS.fineRecover) || roleOk) ? (
                  <Button disabled={actionState.isLoading} onClick={() => void action({ id: fine.id, action: 'recover', body: { policy: 'exact' } })}>{t('charges.actions.recover')}</Button>
                ) : null}
                {['assigned', 'approved', 'recovery_pending'].includes(fine.status) && (can(PERMISSIONS.fineDispute) || roleOk) ? (
                  <Button
                    variant="ghost"
                    disabled={actionState.isLoading || !disputeReason}
                    onClick={() => void action({ id: fine.id, action: 'dispute', body: { reason: disputeReason } })}
                  >
                    {t('charges.actions.dispute')}
                  </Button>
                ) : null}
                {['assigned', 'approved', 'recovery_pending', 'disputed'].includes(fine.status) && (can(PERMISSIONS.fineWaive) || roleOk) ? (
                  <Button
                    variant="ghost"
                    disabled={actionState.isLoading || !waiveReason}
                    onClick={() => void action({ id: fine.id, action: 'waive', body: { reason: waiveReason } })}
                  >
                    {t('charges.actions.waive')}
                  </Button>
                ) : null}
                <Link to={appConfig.routes.fines} className="text-brand self-center text-sm font-medium">{t('common.back')}</Link>
              </div>
            }
          />
          <div className="grid gap-4 md:grid-cols-3">
            <div><p className="text-muted text-sm">{t('common.status')}</p><StatusBadge value={fine.status} options={options.fineStatusOptions} /></div>
            <div><p className="text-muted text-sm">{t('charges.fields.amount')}</p><p dir="ltr">{fine.currency} {fine.amount}</p></div>
            <div><p className="text-muted text-sm">{t('charges.fields.recoveryAmount')}</p><p dir="ltr">{fine.recoveryAmount ? `${fine.currency} ${fine.recoveryAmount}` : '—'}</p></div>
            <div><p className="text-muted text-sm">{t('charges.fields.vehicle')}</p><p dir="ltr">{fine.vehiclePlate ?? '—'}</p></div>
            <div><p className="text-muted text-sm">{t('charges.fields.customer')}</p><p>{fine.customerName ?? '—'}</p></div>
            <div><p className="text-muted text-sm">{t('charges.fields.contract')}</p><p dir="ltr">{fine.contractId ?? '—'}</p></div>
            <div><p className="text-muted text-sm">{t('charges.fields.eventAt')}</p><p dir="ltr">{fine.eventAt}</p></div>
            <div><p className="text-muted text-sm">{t('charges.fields.externalReference')}</p><p dir="ltr">{fine.externalReference}</p></div>
            <div><p className="text-muted text-sm">{t('charges.fields.assignmentResolution')}</p><p>{fine.assignmentResolution}</p></div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Input label={t('charges.fields.disputeReason')} value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} />
            <Input label={t('charges.fields.waiveReason')} value={waiveReason} onChange={(e) => setWaiveReason(e.target.value)} />
          </div>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">{t('charges.sections.timeline')}</h2>
            <ul className="space-y-2">
              {(fine.history ?? []).map((event) => (
                <li key={event.id} className="border-border border-b py-2 text-sm">
                  <StatusBadge value={event.toStatus} options={options.fineStatusOptions} />
                  <span className="text-muted ms-2" dir="ltr">{event.createdAt}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">{t('charges.sections.disputes')}</h2>
            <ul className="space-y-2">
              {(fine.disputes ?? []).length === 0 ? <li className="text-muted text-sm">{t('charges.disputes.empty')}</li> : null}
              {(fine.disputes ?? []).map((dispute) => (
                <li key={dispute.id} className="border-border border-b py-2 text-sm">
                  <span>{dispute.reason}</span>
                  <span className="text-muted ms-2">{dispute.status}</span>
                </li>
              ))}
            </ul>
          </section>
          <Modal open={reviewOpen} onClose={() => setReviewOpen(false)} title={t('charges.actions.review')}>
            <div className="grid gap-3">
              <Input label={t('charges.fields.contractId')} value={contractId} onChange={(e) => setContractId(e.target.value)} dir="ltr" />
              <Input label={t('charges.fields.customerId')} value={customerId} onChange={(e) => setCustomerId(e.target.value)} dir="ltr" />
            </div>
            <ModalActions>
              <Button variant="ghost" onClick={() => setReviewOpen(false)}>{t('common.cancel')}</Button>
              <Button
                disabled={!contractId || !customerId || actionState.isLoading}
                onClick={() => {
                  void action({ id: fine.id, action: 'review', body: { contractId, customerId } }).then(() => setReviewOpen(false))
                }}
              >
                {t('charges.actions.review')}
              </Button>
            </ModalActions>
          </Modal>
        </div>
      )}
    </QueryState>
  )
}
