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
  useUpdateContractMutation,
} from '@/features/contracts/api/contractsApi'
import { ContractFormDialog } from '@/features/contracts/components/ContractFormDialog'
import { useContractOptions } from '@/features/contracts/hooks/useContractOptions'
import type { ContractWriteBody } from '@/features/contracts/schemas/contract.schema'
import { formatInZone } from '@/features/bookings/utils/zonedTime'
import { useBranchOptions } from '@/features/branches/hooks/useBranchOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'

const APPROVE_ROLES = ['admin', 'org_admin', 'super_admin'] as const

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
  const [editing, setEditing] = useState(false)
  const [dialog, setDialog] = useState<'cancel' | 'extend' | 'replace' | 'handover' | 'return' | 'amend' | 'sign' | 'terms' | null>(null)
  const [reason, setReason] = useState('')
  const [extra, setExtra] = useState('')
  const [mileage, setMileage] = useState('0')
  const [fuel, setFuel] = useState('50')
  const row = query.data
  useDocumentTitle(row?.contractNumber ?? t('contracts.title'))
  const zone = branches.items.find((branch) => branch.id === row?.branchId)?.timezone || 'UTC'
  const staff = hasAnyRole(roles, contractDirectoryRoles)
  const canUpdate = can(PERMISSIONS.contractUpdate) || staff
  const canApprove = can(PERMISSIONS.contractApprove) || hasAnyRole(roles, APPROVE_ROLES)

  async function run(action: string, body?: unknown) {
    setError(undefined)
    try {
      await act({ id: contractId, action, body }).unwrap()
      setDialog(null)
    } catch (caught) {
      setError(normalizeApiError(caught).message)
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
                {contract.status === 'draft' && canUpdate ? (
                  <Button type="button" variant="secondary" onClick={() => setEditing(true)}>
                    {t('common.edit')}
                  </Button>
                ) : null}
                {contract.status === 'draft' && staff ? <Button type="button" loading={state.isLoading} onClick={() => void run('/submit')}>{t('contracts.actions.submit')}</Button> : null}
                {contract.status === 'pending_approval' && canApprove ? <Button type="button" loading={state.isLoading} onClick={() => void run('/approve')}>{t('contracts.actions.approve')}</Button> : null}
                {contract.status === 'pending_approval' && canApprove ? <Button type="button" variant="danger" onClick={() => setDialog('cancel')}>{t('contracts.actions.reject')}</Button> : null}
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
          <p className="text-muted text-sm">{t('contracts.assignmentNote')}</p>
          <dl className="grid gap-3 sm:grid-cols-2">
            <Item label={t('common.status')}><StatusBadge value={contract.status} options={options.statusOptions} /></Item>
            <Item label={t('contracts.columns.type')}>{options.labelOf(options.typeOptions, contract.type)}</Item>
            <Item label={t('contracts.columns.customer')}>
              <Link className="text-brand" to={`${appConfig.routes.customers}/${encodeURIComponent(contract.customerId)}`}>{contract.customerName}</Link>
            </Item>
            <Item label={t('contracts.columns.vehicle')}>
              {contract.currentVehicleId ? (
                <Link className="text-brand" dir="ltr" to={`${appConfig.routes.vehicles}/${encodeURIComponent(contract.currentVehicleId)}`}>{contract.currentPlate}</Link>
              ) : t('common.notSet')}
            </Item>
            <Item label={t('contracts.columns.start')}><span dir="ltr">{formatInZone(contract.startsAt, zone, locale)}</span></Item>
            <Item label={t('contracts.columns.end')}><span dir="ltr">{formatInZone(contract.endsAt, zone, locale)}</span></Item>
            {contract.lenderName ? <Item label={t('contracts.form.lender')}>{contract.lenderName}</Item> : null}
            {contract.companyName ? <Item label={t('contracts.form.company')}>{contract.companyName}</Item> : null}
          </dl>

          <Section title={t('contracts.sections.assignments')}>
            <ul className="grid gap-2">
              {contract.assignments.map((assignment) => (
                <li key={assignment.id} className="border-line rounded-md border px-3 py-2 text-sm">
                  <span dir="ltr">{assignment.vehiclePlate ?? assignment.vehicleId}</span>
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
                await updateContract({ id: contract.id, body }).unwrap()
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
  return <div><dt className="text-muted text-xs">{label}</dt><dd>{children}</dd></div>
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="grid gap-2"><h2 className="text-base font-semibold">{title}</h2>{children}</section>
}
