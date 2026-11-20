import { Link, useParams } from 'react-router'
import { PERMISSIONS, chargesDirectoryRoles } from '@/app/router/access'
import { useAppSelector } from '@/app/hooks'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { appConfig } from '@/config/app.config'
import { hasAnyRole } from '@/features/auth/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useGetTollQuery, useTollActionMutation } from '@/features/charges/api/chargesApi'
import { useChargesOptions } from '@/features/charges/hooks/useChargesOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function TollDetailsPage() {
  const { t } = useTranslation()
  const { tollId = '' } = useParams()
  const options = useChargesOptions()
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const query = useGetTollQuery(tollId, { skip: !tollId })
  const [action, actionState] = useTollActionMutation()
  useDocumentTitle(query.data?.documentNumber ?? t('charges.tolls.title'))
  const roleOk = hasAnyRole(roles, chargesDirectoryRoles)

  return (
    <QueryState data={query.data} isLoading={query.isLoading} error={query.error} onRetry={query.refetch} isEmpty={(d) => !d.id} emptyTitle={t('charges.tolls.notFound')}>
      {(toll) => (
        <div className="space-y-6">
          <PageHeader
            title={toll.documentNumber ?? toll.externalReference}
            description={toll.description}
            action={
              <div className="flex flex-wrap gap-2">
                {toll.status === 'assigned' && (can(PERMISSIONS.tollApprove) || roleOk) ? (
                  <Button disabled={actionState.isLoading} onClick={() => void action({ id: toll.id, action: 'approve' })}>{t('charges.actions.approve')}</Button>
                ) : null}
                {toll.status === 'approved' && (can(PERMISSIONS.tollRecover) || roleOk) ? (
                  <Button disabled={actionState.isLoading} onClick={() => void action({ id: toll.id, action: 'recover', body: { policy: 'exact' } })}>{t('charges.actions.recover')}</Button>
                ) : null}
                <Link to={appConfig.routes.tolls} className="text-brand self-center text-sm font-medium">{t('common.back')}</Link>
              </div>
            }
          />
          <div className="grid gap-4 md:grid-cols-3">
            <div><p className="text-muted text-sm">{t('common.status')}</p><StatusBadge value={toll.status} options={options.tollStatusOptions} /></div>
            <div><p className="text-muted text-sm">{t('charges.fields.amount')}</p><p dir="ltr">{toll.currency} {toll.amount}</p></div>
            <div><p className="text-muted text-sm">{t('charges.fields.provider')}</p><p>{toll.provider}</p></div>
            <div><p className="text-muted text-sm">{t('charges.fields.vehicle')}</p><p dir="ltr">{toll.vehiclePlate ?? '—'}</p></div>
            <div><p className="text-muted text-sm">{t('charges.fields.customer')}</p><p>{toll.customerName ?? '—'}</p></div>
            <div><p className="text-muted text-sm">{t('charges.fields.eventAt')}</p><p dir="ltr">{toll.eventAt}</p></div>
            <div><p className="text-muted text-sm">{t('charges.fields.externalReference')}</p><p dir="ltr">{toll.externalReference}</p></div>
            <div><p className="text-muted text-sm">{t('charges.fields.gate')}</p><p>{toll.gate ?? '—'}</p></div>
            <div><p className="text-muted text-sm">{t('charges.fields.assignmentResolution')}</p><p>{toll.assignmentResolution}</p></div>
          </div>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">{t('charges.sections.timeline')}</h2>
            <ul className="space-y-2">
              {(toll.history ?? []).map((event) => (
                <li key={event.id} className="border-border border-b py-2 text-sm">
                  <StatusBadge value={event.toStatus} options={options.tollStatusOptions} />
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
