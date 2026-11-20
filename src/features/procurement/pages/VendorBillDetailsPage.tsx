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
import { useGetVendorBillQuery, useVendorBillActionMutation } from '@/features/procurement/api/procurementApi'
import { useProcurementOptions } from '@/features/procurement/hooks/useProcurementOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function VendorBillDetailsPage() {
  const { t } = useTranslation()
  const { billId = '' } = useParams()
  const options = useProcurementOptions()
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const query = useGetVendorBillQuery(billId, { skip: !billId })
  const [action, actionState] = useVendorBillActionMutation()
  useDocumentTitle(query.data?.documentNumber ?? t('procurement.vendorBills.title'))
  const roleOk = hasAnyRole(roles, procurementDirectoryRoles)

  return (
    <QueryState data={query.data} isLoading={query.isLoading} error={query.error} onRetry={query.refetch} isEmpty={(d) => !d.id} emptyTitle={t('procurement.vendorBills.notFound')}>
      {(bill) => (
        <div className="space-y-6">
          <PageHeader
            title={bill.documentNumber ?? t('procurement.draftLabel')}
            description={bill.vendorName}
            action={
              <div className="flex flex-wrap gap-2">
                {bill.status === 'draft' && (can(PERMISSIONS.vendorBillEdit) || roleOk) ? (
                  <Button disabled={actionState.isLoading} onClick={() => void action({ id: bill.id, action: 'submit' })}>{t('procurement.actions.submit')}</Button>
                ) : null}
                {bill.status === 'pending_review' && (can(PERMISSIONS.vendorBillApprove) || roleOk) ? (
                  <Button disabled={actionState.isLoading} onClick={() => void action({ id: bill.id, action: 'approve' })}>{t('procurement.actions.approve')}</Button>
                ) : null}
                {bill.status === 'approved' && (can(PERMISSIONS.vendorBillPost) || roleOk) ? (
                  <Button disabled={actionState.isLoading} onClick={() => void action({ id: bill.id, action: 'post' })}>{t('procurement.actions.post')}</Button>
                ) : null}
                <Link to={appConfig.routes.vendorBills} className="text-brand self-center text-sm font-medium">{t('common.back')}</Link>
              </div>
            }
          />
          <div className="grid gap-4 md:grid-cols-3">
            <div><p className="text-muted text-sm">{t('common.status')}</p><StatusBadge value={bill.status} options={options.billStatusOptions} /></div>
            <div><p className="text-muted text-sm">{t('procurement.columns.outstanding')}</p><p dir="ltr">{bill.outstandingAmount}</p></div>
            <div><p className="text-muted text-sm">{t('procurement.fields.paymentStatus')}</p><StatusBadge value={bill.paymentStatus} options={options.paymentStatusOptions} /></div>
          </div>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">{t('procurement.sections.lines')}</h2>
            <ul className="space-y-2">
              {bill.lines.map((line) => (
                <li key={line.id} className="border-border flex justify-between gap-3 border-b py-2">
                  <span>{line.description}</span>
                  <span dir="ltr">{line.lineTotal}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">{t('procurement.sections.timeline')}</h2>
            <ul className="space-y-2">
              {bill.history.map((event) => (
                <li key={event.id} className="border-border border-b py-2 text-sm">
                  <StatusBadge value={event.toStatus} options={options.billStatusOptions} />
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
