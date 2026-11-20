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
import { useGetVendorQuery, useVendorActionMutation } from '@/features/procurement/api/procurementApi'
import { useProcurementOptions } from '@/features/procurement/hooks/useProcurementOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function VendorDetailsPage() {
  const { t } = useTranslation()
  const { vendorId = '' } = useParams()
  const options = useProcurementOptions()
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const query = useGetVendorQuery(vendorId, { skip: !vendorId })
  const [action, actionState] = useVendorActionMutation()
  useDocumentTitle(query.data?.name ?? t('procurement.vendors.title'))
  const canDisable = can(PERMISSIONS.vendorDisable) || hasAnyRole(roles, procurementDirectoryRoles)

  return (
    <QueryState data={query.data} isLoading={query.isLoading} error={query.error} onRetry={query.refetch} isEmpty={(data) => !data.id} emptyTitle={t('procurement.vendors.notFound')}>
      {(vendor) => (
        <div className="space-y-6">
          <PageHeader
            title={vendor.name}
            description={vendor.vendorCode}
            action={
              <div className="flex flex-wrap gap-2">
                {vendor.status === 'active' && canDisable ? (
                  <Button variant="ghost" disabled={actionState.isLoading} onClick={() => void action({ id: vendor.id, action: 'disable', body: { reason: 'Disabled from UI' } })}>
                    {t('procurement.actions.disable')}
                  </Button>
                ) : null}
                <Link to={appConfig.routes.vendors} className="text-brand self-center text-sm font-medium">{t('common.back')}</Link>
              </div>
            }
          />
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-muted text-sm">{t('common.status')}</p>
              <StatusBadge value={vendor.status} options={options.vendorStatusOptions} />
            </div>
            <div>
              <p className="text-muted text-sm">{t('procurement.fields.vendorType')}</p>
              <StatusBadge value={vendor.vendorType} options={options.vendorTypeOptions} />
            </div>
            <div>
              <p className="text-muted text-sm">{t('procurement.fields.paymentTerms')}</p>
              <StatusBadge value={vendor.paymentTerms} options={options.paymentTermsOptions} />
            </div>
          </div>
          {vendor.financial ? (
            <section className="space-y-2">
              <h2 className="text-lg font-semibold">{t('procurement.sections.financial')}</h2>
              <dl className="grid gap-2 md:grid-cols-2" dir="ltr">
                <div><dt>{t('procurement.fields.totalBilled')}</dt><dd>{vendor.financial.totalBilled}</dd></div>
                <div><dt>{t('procurement.fields.totalPaid')}</dt><dd>{vendor.financial.totalPaid}</dd></div>
              </dl>
            </section>
          ) : null}
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">{t('procurement.sections.timeline')}</h2>
            <ul className="space-y-2">
              {(vendor.history ?? []).map((event) => (
                <li key={event.id} className="border-border border-b py-2 text-sm">
                  <StatusBadge value={event.toStatus} options={options.vendorStatusOptions} />
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
