import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { PERMISSIONS, contractDirectoryRoles } from '@/app/router/access'
import { useAppSelector } from '@/app/hooks'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { appConfig } from '@/config/app.config'
import { hasAnyRole } from '@/features/auth/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import {
  useContractActionMutation,
  useGetContractQuery,
  useLazyGetContractDocumentContentQuery,
  useUpdateContractMutation,
} from '@/features/contracts/api/contractsApi'
import { ContractFormDialog } from '@/features/contracts/components/ContractFormDialog'
import { useContractOptions } from '@/features/contracts/hooks/useContractOptions'
import type { ContractWriteBody } from '@/features/contracts/schemas/contract.schema'
import { formatInZone } from '@/features/bookings/utils/zonedTime'
import { useBranchOptions } from '@/features/branches/hooks/useBranchOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation, type MessageKey } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'

export function ContractDetailsPage() {
  const { contractId = '' } = useParams()
  const { t, locale, tm } = useTranslation()
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const options = useContractOptions()
  const branches = useBranchOptions()
  const query = useGetContractQuery(contractId, { skip: !contractId })
  const [act, state] = useContractActionMutation()
  const [updateContract] = useUpdateContractMutation()
  const [error, setError] = useState<string>()
  const [documentError, setDocumentError] = useState<string>()
  const [editing, setEditing] = useState(false)
  const [dialog, setDialog] = useState<'cancel' | 'extend' | 'replace' | 'handover' | 'return' | 'amend' | 'sign' | 'terms' | null>(null)
  const [reason, setReason] = useState('')
  const [extra, setExtra] = useState('')
  const [mileage, setMileage] = useState('0')
  const [fuel, setFuel] = useState('50')
  const [downloadDocument, downloadState] = useLazyGetContractDocumentContentQuery()
  const row = query.data
  useDocumentTitle(row?.contractNumber ?? t('contracts.title'))
  const zone = branches.items.find((branch) => branch.id === row?.branchId)?.timezone || 'UTC'
  const staff = hasAnyRole(roles, contractDirectoryRoles)
  const canUpdate = can(PERMISSIONS.contractUpdate) || staff

  async function run(action: string, body?: unknown) {
    setError(undefined)
    try {
      await act({ id: contractId, action, body }).unwrap()
      setDialog(null)
    } catch (caught) {
      setError(normalizeApiError(caught).message)
    }
  }

  async function downloadAttachment(attachment: NonNullable<typeof row>['documents'][number]) {
    setDocumentError(undefined)
    try {
      const blob = await downloadDocument({ id: contractId, documentId: attachment.id }).unwrap()
      const objectUrl = URL.createObjectURL(blob)
      const link = window.document.createElement('a')
      link.href = objectUrl
      link.download = attachment.originalFilename
      window.document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
    } catch (caught) {
      setDocumentError(normalizeApiError(caught).message)
    }
  }

  return (
    <QueryState
      data={query.data}
      isLoading={query.isLoading}
      error={query.error}
      onRetry={query.refetch}
      isEmpty={(data) => !data.id}
      emptyTitle={t('contracts.emptyTitle')}
      emptyDescription={t('contracts.emptyDescription')}
    >
      {(contract) => (
        <section className="grid gap-6">
          <PageHeader
            title={contract.contractNumber}
            description={contract.customerName}
            action={
              <div className="flex flex-wrap gap-2">
                {(contract.status === 'draft' && canUpdate && can(PERMISSIONS.contractActivate)) ||
                (contract.status === 'active' && canUpdate) ? (
                  <Button type="button" variant="secondary" onClick={() => setEditing(true)}>
                    {t('common.edit')}
                  </Button>
                ) : null}
                {contract.status === 'approved' && staff ? <Button type="button" loading={state.isLoading} onClick={() => void run('/activate')}>{t('contracts.actions.activate')}</Button> : null}
                {contract.status === 'active' && staff ? <Button type="button" variant="secondary" onClick={() => void run('/suspend')}>{t('contracts.actions.suspend')}</Button> : null}
                {contract.status === 'suspended' && staff ? <Button type="button" onClick={() => void run('/resume')}>{t('contracts.actions.resume')}</Button> : null}
                {contract.status === 'active' && staff ? <Button type="button" variant="secondary" onClick={() => setDialog('extend')}>{t('contracts.actions.extend')}</Button> : null}
                {contract.status === 'active' && can(PERMISSIONS.contractAmendPricing) ? <Button type="button" variant="secondary" onClick={() => setDialog('amend')}>{t('contracts.actions.amend')}</Button> : null}
                {contract.status === 'active' && staff ? <Button type="button" variant="secondary" onClick={() => setDialog('replace')}>{t('contracts.actions.replace')}</Button> : null}
                {(contract.status === 'active' || contract.status === 'suspended') && staff ? <Button type="button" variant="secondary" onClick={() => setDialog('handover')}>{t('contracts.actions.handover')}</Button> : null}
                {(contract.status === 'active' || contract.status === 'suspended') && staff ? <Button type="button" variant="secondary" onClick={() => setDialog('return')}>{t('contracts.actions.return')}</Button> : null}
                {contract.status === 'active' && contract.vehicleReturn && staff ? <Button type="button" onClick={() => void run('/complete')}>{t('contracts.actions.complete')}</Button> : null}
                {['draft', 'pending_approval', 'approved'].includes(contract.status) && staff ? <Button type="button" variant="danger" onClick={() => setDialog('cancel')}>{t('contracts.actions.cancel')}</Button> : null}
              </div>
            }
          />
          {error ? <Alert tone="danger">{tm(error)}</Alert> : null}
          <section className="border-line bg-surface shadow-card grid gap-5 rounded-2xl border p-5 sm:p-6">
            <p className="text-muted text-sm">{t('contracts.assignmentNote')}</p>
            <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Item label={t('common.status')}><StatusBadge value={contract.status} options={options.statusOptions} /></Item>
              <Item label={t('contracts.columns.type')}>{options.labelOf(options.typeOptions, contract.type)}</Item>
              <Item label={t('contracts.columns.customer')}>
                <Link className="text-brand font-medium hover:underline" to={`${appConfig.routes.customers}/${encodeURIComponent(contract.customerId)}`}>{contract.customerName}</Link>
              </Item>
              <Item label={t('contracts.columns.vehicle')}>
                {contract.currentVehicleId ? (
                  <Link className="text-brand font-medium hover:underline" dir="ltr" to={`${appConfig.routes.vehicles}/${encodeURIComponent(contract.currentVehicleId)}`}>{contract.currentPlate}</Link>
                ) : t('common.notSet')}
              </Item>
              <Item label={t('contracts.columns.start')}><span dir="ltr">{formatInZone(contract.startsAt, zone, locale)}</span></Item>
              <Item label={t('contracts.columns.end')}><span dir="ltr">{formatInZone(contract.endsAt, zone, locale)}</span></Item>
              {contract.driverName ? <Item label={t('contracts.form.driver')}>{contract.driverName}</Item> : null}
              {contract.details?.grandTotal ? (
                <Item label={t('contracts.form.total')}>
                  <span dir="ltr">
                    {displayDetail(contract.details.grandTotal)}
                    {contract.details.currency ? ` ${displayDetail(contract.details.currency)}` : ''}
                  </span>
                </Item>
              ) : null}
              {contract.lenderName ? <Item label={t('contracts.form.lender')}>{contract.lenderName}</Item> : null}
              {contract.companyName ? <Item label={t('contracts.form.company')}>{contract.companyName}</Item> : null}
              {contract.notes ? <Item label={t('contracts.form.notes')}>{contract.notes}</Item> : null}
            </dl>
          </section>

          <Section title={t('contracts.sections.assignments')}>
            <ul className="grid gap-2">
              {contract.assignments.map((assignment) => (
                <li key={assignment.id} className="border-line rounded-md border px-3 py-2 text-sm">
                  <Link className="text-brand font-medium hover:underline" dir="ltr" to={`${appConfig.routes.vehicles}/${encodeURIComponent(assignment.vehicleId)}`}>
                    {assignment.vehiclePlate ?? assignment.vehicleId}
                  </Link>
                  <span className="text-muted ms-2" dir="ltr">{formatInZone(assignment.startsAt, zone, locale)} – {formatInZone(assignment.endsAt, zone, locale)}</span>
                  <span className="ms-2">{assignment.status}</span>
                </li>
              ))}
            </ul>
          </Section>
          <Section title={t('contracts.sections.pricing')}>
            <ul className="grid gap-2 text-sm">
              {contract.charges.map((charge) => (
                <li key={charge.id} dir="ltr">
                  {charge.kind} {charge.totalAmount} {charge.currency}
                  {charge.supersededBy ? ` (${t('contracts.superseded')})` : ''}
                </li>
              ))}
            </ul>
          </Section>
          <Section title={t('contracts.sections.documents')}>
            {documentError ? <Alert tone="danger">{tm(documentError)}</Alert> : null}
            {contract.documents.length ? (
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {contract.documents.map((attachment) => (
                  <li
                    key={attachment.id}
                    className="border-line bg-surface grid min-w-0 gap-2 rounded-xl border p-3"
                  >
                    <p className="text-sm font-semibold">
                      {t(`contracts.documents.types.${attachment.documentType}` as MessageKey)}
                    </p>
                    <p className="text-muted truncate text-sm" title={attachment.originalFilename}>
                      {attachment.originalFilename}
                    </p>
                    <p className="text-muted text-xs" dir="ltr">
                      {(attachment.byteSize / 1024).toFixed(0)} KB · {formatInZone(attachment.createdAt, zone, locale)}
                    </p>
                    {can(PERMISSIONS.contractViewSensitive) ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="w-fit"
                        loading={downloadState.isLoading}
                        onClick={() => void downloadAttachment(attachment)}
                      >
                        {t('contracts.documents.download')}
                      </Button>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted text-sm">{t('contracts.documents.empty')}</p>
            )}
          </Section>
          <Section title={t('contracts.sections.terms')}>
            {contract.terms.map((version) => (
              <article key={version.id} className="border-line rounded-md border px-3 py-2 text-sm">
                <p className="font-medium">{t('contracts.version', { version: version.version })} · {version.status}</p>
                <p className="mt-1 whitespace-pre-wrap">{version.content}</p>
              </article>
            ))}
            {staff ? <Button type="button" variant="secondary" onClick={() => setDialog('terms')}>{t('contracts.actions.newTerms')}</Button> : null}
          </Section>
          <Section title={t('contracts.sections.signatures')}>
            {contract.signatures.map((signature) => (
              <p key={signature.id} className="text-sm">{signature.signerName} · {signature.status} · {signature.provider}</p>
            ))}
            {staff ? <Button type="button" variant="secondary" onClick={() => setDialog('sign')}>{t('contracts.actions.sign')}</Button> : null}
          </Section>
          <Section title={t('contracts.sections.handover')}>
            {contract.handover ? <p className="text-sm" dir="ltr">{contract.handover.mileageKm} km · {contract.handover.fuelPercent}% · {contract.handover.condition}</p> : <p className="text-muted text-sm">{t('common.notSet')}</p>}
            {contract.vehicleReturn ? <p className="text-sm" dir="ltr">{t('contracts.sections.return')}: {contract.vehicleReturn.mileageKm} km · {contract.vehicleReturn.condition}</p> : null}
          </Section>
          <Section title={t('contracts.sections.extensions')}>
            {contract.extensions.map((extension) => (
              <p key={extension.id} className="text-sm" dir="ltr">{extension.totalAmount} {extension.currency} · {extension.quantityDays}</p>
            ))}
          </Section>
          <Section title={t('contracts.sections.replacements')}>
            {contract.replacements.map((event) => (
              <p key={event.id} className="text-sm" dir="ltr">{event.previousPlate} → {event.replacementPlate} · {event.reason}</p>
            ))}
          </Section>
          <Section title={t('contracts.sections.timeline')}>
            <ol className="grid gap-2">
              {contract.history.map((event) => (
                <li key={event.id} className="text-sm">
                  <StatusBadge value={event.toStatus} options={options.statusOptions} />
                  {event.createdAt ? <span className="text-muted ms-2" dir="ltr">{formatInZone(event.createdAt, zone, locale)}</span> : null}
                  {event.reason ? <span className="ms-2">{event.reason}</span> : null}
                </li>
              ))}
            </ol>
          </Section>

          {editing ? (
            <ContractFormDialog
              open
              contract={contract}
              onClose={() => setEditing(false)}
              onSubmit={async (body: ContractWriteBody) => {
                return updateContract({ id: contract.id, body }).unwrap()
              }}
            />
          ) : null}
          <Modal open={dialog !== null} title={t('contracts.actions.more')} onClose={() => setDialog(null)}>
            <form
              className="grid gap-3"
              onSubmit={(event) => {
                event.preventDefault()
                if (dialog === 'cancel') void run(contract.status === 'pending_approval' ? '/reject' : '/cancel', { reason })
                if (dialog === 'extend') void run('/extend', { startsAt: contract.endsAt, endsAt: new Date(extra).toISOString() })
                if (dialog === 'replace') {
                  const open = contract.assignments.find((assignment) => assignment.status === 'active')
                  const start = open ? new Date(open.startsAt).getTime() : Date.now()
                  const end = open ? new Date(open.endsAt).getTime() : Date.now() + 3_600_000
                  const occurredAt = new Date(Math.min(end - 60_000, Math.max(start + 60_000, Date.now()))).toISOString()
                  void run('/replace-vehicle', { vehicleId: extra, occurredAt, reason })
                }
                if (dialog === 'amend') void run('/amend-pricing', { unitAmount: extra, reason, effectiveAt: new Date().toISOString() })
                if (dialog === 'sign') void run('/sign', { signerName: extra || contract.customerName, provider: 'internal' })
                if (dialog === 'terms') void run('/terms', { content: extra })
                if (dialog === 'handover' || dialog === 'return') {
                  void run(dialog === 'handover' ? '/handover' : '/return', {
                    occurredAt: new Date().toISOString(),
                    mileageKm: Number(mileage),
                    fuelPercent: Number(fuel),
                    condition: reason || 'Recorded',
                    acknowledged: true,
                  })
                }
              }}
            >
              {dialog === 'extend' ? <Input label={t('contracts.form.returnDate')} type="datetime-local" value={extra} onChange={(event) => setExtra(event.target.value)} required /> : null}
              {dialog === 'replace' || dialog === 'amend' || dialog === 'sign' || dialog === 'terms' ? (
                <Input label={dialog === 'replace' ? t('contracts.form.vehicleId') : dialog === 'amend' ? t('contracts.form.unitAmount') : dialog === 'sign' ? t('contracts.form.signer') : t('contracts.form.terms')} value={extra} onChange={(event) => setExtra(event.target.value)} required />
              ) : null}
              {dialog === 'cancel' || dialog === 'replace' || dialog === 'amend' || dialog === 'handover' || dialog === 'return' ? (
                <Input label={t('contracts.form.reason')} value={reason} onChange={(event) => setReason(event.target.value)} required={dialog !== 'handover' && dialog !== 'return'} />
              ) : null}
              {dialog === 'handover' || dialog === 'return' ? (
                <>
                  <Input label={t('contracts.form.mileage')} value={mileage} onChange={(event) => setMileage(event.target.value)} />
                  <Input label={t('contracts.form.fuel')} value={fuel} onChange={(event) => setFuel(event.target.value)} />
                </>
              ) : null}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setDialog(null)}>{t('common.close')}</Button>
                <Button type="submit" loading={state.isLoading}>{t('common.save')}</Button>
              </div>
            </form>
          </Modal>
        </section>
      )}
    </QueryState>
  )
}

function Item({ label, children }: { label: string; children: ReactNode }) {
  return <div className="grid min-w-0 content-start gap-1"><dt className="text-muted text-xs font-medium">{label}</dt><dd className="min-w-0 break-words text-sm font-medium">{children}</dd></div>
}

function displayDetail(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : ''
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="border-line bg-surface shadow-card grid gap-3 rounded-2xl border p-5"><h2 className="text-base font-semibold">{title}</h2>{children}</section>
}
