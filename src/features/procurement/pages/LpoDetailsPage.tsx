import { Link, useParams } from 'react-router'
import { PERMISSIONS, procurementDirectoryRoles } from '@/app/router/access'
import { useAppSelector } from '@/app/hooks'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { appConfig } from '@/config/app.config'
import { hasAnyRole } from '@/features/auth/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useGetLpoQuery, useLpoActionMutation } from '@/features/procurement/api/procurementApi'
import { useProcurementOptions } from '@/features/procurement/hooks/useProcurementOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function LpoDetailsPage() {
  const { t } = useTranslation()
  const { lpoId = '' } = useParams()
  const options = useProcurementOptions()
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const query = useGetLpoQuery(lpoId, { skip: !lpoId })
  const [action, actionState] = useLpoActionMutation()
  useDocumentTitle(query.data?.documentNumber ?? t('procurement.lpos.title'))
  const roleOk = hasAnyRole(roles, procurementDirectoryRoles)

  return (
    <QueryState data={query.data} isLoading={query.isLoading} error={query.error} onRetry={query.refetch} isEmpty={(d) => !d.id} emptyTitle={t('procurement.lpos.notFound')}>
      {(lpo) => (
        <div className="space-y-6">
          <PageHeader
            title={lpo.documentNumber ?? t('procurement.draftLabel')}
            description={lpo.vendorName}
            action={
              <div className="flex flex-wrap gap-2">
                {lpo.status === 'draft' && (can(PERMISSIONS.lpoSubmit) || roleOk) ? (
                  <Button disabled={actionState.isLoading} onClick={() => void action({ id: lpo.id, action: 'submit' })}>{t('procurement.actions.submit')}</Button>
                ) : null}
                {lpo.status === 'pending_approval' && (can(PERMISSIONS.lpoApprove) || roleOk) ? (
                  <Button disabled={actionState.isLoading} onClick={() => void action({ id: lpo.id, action: 'approve' })}>{t('procurement.actions.approve')}</Button>
                ) : null}
                {lpo.status !== 'cancelled' && lpo.status !== 'closed' && (can(PERMISSIONS.lpoCancel) || roleOk) ? (
                  <Button variant="ghost" disabled={actionState.isLoading} onClick={() => void action({ id: lpo.id, action: 'cancel', body: { reason: 'Cancelled from UI' } })}>{t('procurement.actions.cancel')}</Button>
                ) : null}
                <Link to={appConfig.routes.lpos} className="text-brand self-center text-sm font-medium">{t('common.back')}</Link>
              </div>
            }
          />
          <div className="grid gap-4 md:grid-cols-3">
            <div><p className="text-muted text-sm">{t('common.status')}</p><StatusBadge value={lpo.status} options={options.lpoStatusOptions} /></div>
            <div><p className="text-muted text-sm">{t('procurement.columns.total')}</p><p dir="ltr">{lpo.currency} {lpo.totalAmount}</p></div>
            <div><p className="text-muted text-sm">{t('procurement.fields.approvalLevel')}</p><p>{lpo.approvalLevel ?? t('common.notSet')}</p></div>
          </div>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">{t('procurement.sections.lines')}</h2>
            <ul className="space-y-2">
              {lpo.lines.map((line) => (
                <li key={line.id} className="border-border flex justify-between gap-3 border-b py-2">
                  <span>{line.description} × {line.quantity}</span>
                  <span dir="ltr">{line.lineTotal}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">{t('procurement.sections.timeline')}</h2>
            <ul className="space-y-2">
              {lpo.history.map((event) => (
                <li key={event.id} className="border-border border-b py-2 text-sm">
                  <StatusBadge value={event.toStatus} options={options.lpoStatusOptions} />
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
