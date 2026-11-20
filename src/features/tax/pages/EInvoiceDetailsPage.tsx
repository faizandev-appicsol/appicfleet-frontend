import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { PERMISSIONS, taxDirectoryRoles } from '@/app/router/access'
import { useAppSelector } from '@/app/hooks'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { appConfig } from '@/config/app.config'
import { hasAnyRole } from '@/features/auth/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useEinvoiceActionMutation, useGetEInvoiceQuery } from '@/features/tax/api/taxApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

const statusOptions = [
  { value: 'not_ready', label: 'Not ready' },
  { value: 'generated', label: 'Generated' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function EInvoiceDetailsPage() {
  const { t } = useTranslation()
  const { einvoiceId = '' } = useParams()
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const query = useGetEInvoiceQuery(einvoiceId, { skip: !einvoiceId })
  const [action, actionState] = useEinvoiceActionMutation()
  const [reason, setReason] = useState('')
  useDocumentTitle(query.data?.documentNumber ?? t('tax.einvoices.title'))
  const roleOk = hasAnyRole(roles, taxDirectoryRoles)

  return (
    <QueryState data={query.data} isLoading={query.isLoading} error={query.error} onRetry={query.refetch} isEmpty={(d) => !d.id} emptyTitle={t('tax.einvoices.notFound')}>
      {(doc) => (
        <div className="space-y-6">
          <PageHeader
            title={doc.documentNumber ?? doc.id}
            description={doc.customerDisplayName}
            action={
              <div className="flex flex-wrap gap-2">
                {['generated', 'ready', 'failed', 'rejected'].includes(doc.status) && (can(PERMISSIONS.einvoiceSubmit) || roleOk) ? (
                  <Button disabled={actionState.isLoading} onClick={() => void action({ id: doc.id, action: 'submit' })}>{t('tax.actions.submit')}</Button>
                ) : null}
                {['failed', 'rejected'].includes(doc.status) && doc.failureClass !== 'validation' && (can(PERMISSIONS.einvoiceRetry) || roleOk) ? (
                  <Button variant="ghost" disabled={actionState.isLoading} onClick={() => void action({ id: doc.id, action: 'retry' })}>{t('tax.actions.retry')}</Button>
                ) : null}
                {!['accepted', 'cancelled'].includes(doc.status) && (can(PERMISSIONS.einvoiceCancel) || roleOk) ? (
                  <Button variant="ghost" disabled={actionState.isLoading || !reason} onClick={() => void action({ id: doc.id, action: 'cancel', body: { reason } })}>{t('tax.actions.cancel')}</Button>
                ) : null}
                <Link to={appConfig.routes.taxEinvoices} className="text-brand self-center text-sm font-medium">{t('common.back')}</Link>
              </div>
            }
          />
          <div className="grid gap-4 md:grid-cols-3">
            <div><p className="text-muted text-sm">{t('common.status')}</p><StatusBadge value={doc.status} options={statusOptions} /></div>
            <div><p className="text-muted text-sm">{t('tax.fields.provider')}</p><p>{doc.provider ?? '—'}</p></div>
            <div><p className="text-muted text-sm">{t('tax.fields.providerReference')}</p><p dir="ltr">{doc.providerReference ?? '—'}</p></div>
            <div><p className="text-muted text-sm">{t('tax.fields.vat')}</p><p dir="ltr">{doc.taxAmount}</p></div>
            <div><p className="text-muted text-sm">{t('tax.fields.gross')}</p><p dir="ltr">{doc.totalAmount}</p></div>
            <div><p className="text-muted text-sm">{t('tax.fields.environment')}</p><p>{doc.environment ?? '—'}</p></div>
          </div>
          {doc.failureReason ? <p className="text-danger text-sm">{doc.failureReason}</p> : null}
          {(doc.validationErrors?.length ?? 0) > 0 ? (
            <ul className="text-danger list-disc space-y-1 ps-5 text-sm">
              {doc.validationErrors!.map((err, index) => (
                <li key={`${err.code}-${index}`}>{err.message ?? err.code}</li>
              ))}
            </ul>
          ) : null}
          <Input label={t('tax.fields.reason')} value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
      )}
    </QueryState>
  )
}
