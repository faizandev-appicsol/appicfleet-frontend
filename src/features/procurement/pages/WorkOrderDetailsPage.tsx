import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { PERMISSIONS, procurementDirectoryRoles } from '@/app/router/access'
import { useAppSelector } from '@/app/hooks'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { appConfig } from '@/config/app.config'
import { hasAnyRole } from '@/features/auth/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useGetWorkOrderQuery, useWorkOrderActionMutation } from '@/features/procurement/api/procurementApi'
import { useProcurementOptions } from '@/features/procurement/hooks/useProcurementOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function WorkOrderDetailsPage() {
  const { t } = useTranslation()
  const { workOrderId = '' } = useParams()
  const options = useProcurementOptions()
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const query = useGetWorkOrderQuery(workOrderId, { skip: !workOrderId })
  const [action, actionState] = useWorkOrderActionMutation()
  const [scheduling, setScheduling] = useState(false)
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  useDocumentTitle(query.data?.documentNumber ?? t('procurement.service.title'))
  const roleOk = hasAnyRole(roles, procurementDirectoryRoles)

  return (
    <QueryState data={query.data} isLoading={query.isLoading} error={query.error} onRetry={query.refetch} isEmpty={(d) => !d.id} emptyTitle={t('procurement.service.notFound')}>
      {(order) => (
        <div className="space-y-6">
          <PageHeader
            title={order.documentNumber ?? t('procurement.draftLabel')}
            description={order.vehiclePlate}
            action={
              <div className="flex flex-wrap gap-2">
                {order.status === 'draft' && (can(PERMISSIONS.serviceEdit) || roleOk) ? (
                  <Button disabled={actionState.isLoading} onClick={() => void action({ id: order.id, action: 'request' })}>{t('procurement.actions.request')}</Button>
                ) : null}
                {order.status === 'requested' && (can(PERMISSIONS.serviceApprove) || roleOk) ? (
                  <Button disabled={actionState.isLoading} onClick={() => void action({ id: order.id, action: 'approve' })}>{t('procurement.actions.approve')}</Button>
                ) : null}
                {order.status === 'approved' && (can(PERMISSIONS.serviceSchedule) || roleOk) ? (
                  <Button disabled={actionState.isLoading} onClick={() => setScheduling(true)}>{t('procurement.actions.schedule')}</Button>
                ) : null}
                {order.status === 'scheduled' && (can(PERMISSIONS.serviceEdit) || roleOk) ? (
                  <Button disabled={actionState.isLoading} onClick={() => void action({ id: order.id, action: 'start' })}>{t('procurement.actions.start')}</Button>
                ) : null}
                {(order.status === 'in_progress' || order.status === 'waiting_for_parts') && (can(PERMISSIONS.serviceComplete) || roleOk) ? (
                  <Button disabled={actionState.isLoading} onClick={() => void action({ id: order.id, action: 'complete', body: {} })}>{t('procurement.actions.complete')}</Button>
                ) : null}
                <Link to={appConfig.routes.service} className="text-brand self-center text-sm font-medium">{t('common.back')}</Link>
              </div>
            }
          />
          <div className="grid gap-4 md:grid-cols-3">
            <div><p className="text-muted text-sm">{t('common.status')}</p><StatusBadge value={order.status} options={options.workOrderStatusOptions} /></div>
            <div><p className="text-muted text-sm">{t('procurement.fields.priority')}</p><StatusBadge value={order.priority} options={options.priorityOptions} /></div>
            <div><p className="text-muted text-sm">{t('procurement.fields.estimatedCost')}</p><p dir="ltr">{order.currency} {order.estimatedCost}</p></div>
          </div>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">{t('procurement.sections.timeline')}</h2>
            <ul className="space-y-2">
              {order.history.map((event) => (
                <li key={event.id} className="border-border border-b py-2 text-sm">
                  <StatusBadge value={event.toStatus} options={options.workOrderStatusOptions} />
                  <span className="text-muted ms-2" dir="ltr">{event.createdAt}</span>
                </li>
              ))}
            </ul>
          </section>
          <Modal open={scheduling} onClose={() => setScheduling(false)} title={t('procurement.actions.schedule')}>
            <div className="grid gap-3 md:grid-cols-2">
              <Input label={t('procurement.fields.downtimeStartsAt')} type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} dir="ltr" />
              <Input label={t('procurement.fields.downtimeEndsAt')} type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} dir="ltr" />
            </div>
            <ModalActions>
              <Button variant="ghost" onClick={() => setScheduling(false)}>{t('common.cancel')}</Button>
              <Button
                disabled={!startsAt || !endsAt || actionState.isLoading}
                onClick={() => {
                  const start = new Date(startsAt).toISOString()
                  const end = new Date(endsAt).toISOString()
                  void action({
                    id: order.id,
                    action: 'schedule',
                    body: { scheduledAt: start, downtimeStartsAt: start, downtimeEndsAt: end },
                  }).then(() => setScheduling(false))
                }}
              >
                {t('common.save')}
              </Button>
            </ModalActions>
          </Modal>
        </div>
      )}
    </QueryState>
  )
}
