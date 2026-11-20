import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { partsInZone, zonedLocalToUtc } from '@/features/bookings/utils/zonedTime'
import { useBranchOptions } from '@/features/branches/hooks/useBranchOptions'
import { useGetContractQuoteQuery } from '@/features/contracts/api/contractsApi'
import {
  contractTypes,
  type ContractDetail,
  type ContractWriteBody,
} from '@/features/contracts/schemas/contract.schema'
import { useGetCustomersQuery } from '@/features/customers/api/customersApi'
import { useOrganizationOptions } from '@/features/organizations/hooks/useOrganizationOptions'
import { useGetVehiclesQuery } from '@/features/vehicles/api/vehiclesApi'
import { API_MAX_PAGE_SIZE } from '@/config/constants'
import { useTranslation, type MessageKey } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'

type Props = {
  open: boolean
  contract?: ContractDetail
  organizationId?: string
  onClose: () => void
  onSubmit: (body: ContractWriteBody) => Promise<void>
}

const today = () => new Date().toISOString().slice(0, 10)

function defaultsFromContract(contract: ContractDetail | undefined, timeZone: string) {
  if (!contract) {
    return {
      type: 'b2c' as (typeof contractTypes)[number],
      organizationId: '',
      customerId: '',
      branchId: '',
      vehicleId: '',
      pickupDate: today(),
      pickupTime: '10:00',
      returnDate: today(),
      returnTime: '18:00',
      terms: '',
      signerName: '',
      driverName: '',
      authorizedContactName: '',
      lenderName: '',
      borrowCost: '',
      notes: '',
    }
  }
  const pickup = partsInZone(contract.startsAt, timeZone)
  const returning = partsInZone(contract.endsAt, timeZone)
  const type = (contractTypes.includes(contract.type as (typeof contractTypes)[number])
    ? contract.type
    : 'b2c') as (typeof contractTypes)[number]
  return {
    type,
    organizationId: contract.organizationId,
    customerId: contract.customerId,
    branchId: contract.branchId,
    vehicleId: contract.currentVehicleId ?? '',
    pickupDate: pickup.date || today(),
    pickupTime: pickup.time || '10:00',
    returnDate: returning.date || today(),
    returnTime: returning.time || '18:00',
    terms: contract.terms[0]?.content ?? '',
    signerName: '',
    driverName: contract.driverName ?? '',
    authorizedContactName: contract.authorizedContactName ?? '',
    lenderName: contract.lenderName ?? '',
    borrowCost: contract.borrowCost ?? '',
    notes: contract.notes ?? '',
  }
}

/** Single modal with sections for create and edit. Draft only — activation stays on the detail page. */
export function ContractFormDialog({ open, contract, organizationId: initialOrg, onClose, onSubmit }: Props) {
  const { t, tm } = useTranslation()
  const isEdit = Boolean(contract)
  const organizations = useOrganizationOptions()
  const [organizationId, setOrganizationId] = useState(initialOrg ?? '')
  const branches = useBranchOptions({ organizationId: organizationId || undefined })
  const [type, setType] = useState<(typeof contractTypes)[number]>('b2c')
  const [customerId, setCustomerId] = useState('')
  const [branchId, setBranchId] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [pickupDate, setPickupDate] = useState(today())
  const [pickupTime, setPickupTime] = useState('10:00')
  const [returnDate, setReturnDate] = useState(today())
  const [returnTime, setReturnTime] = useState('18:00')
  const [terms, setTerms] = useState('')
  const [signerName, setSignerName] = useState('')
  const [driverName, setDriverName] = useState('')
  const [authorizedContactName, setAuthorizedContactName] = useState('')
  const [lenderName, setLenderName] = useState('')
  const [borrowCost, setBorrowCost] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState(false)

  const timeZone = branches.items.find((item) => item.id === branchId)?.timezone || 'UTC'
  const needsOrganization = !isEdit && organizations.required && !organizationId

  useEffect(() => {
    if (!open) return
    const zone =
      branches.items.find((item) => item.id === (contract?.branchId ?? branchId))?.timezone || 'UTC'
    const next = defaultsFromContract(contract, zone)
    setType(next.type)
    setOrganizationId(initialOrg || next.organizationId)
    setCustomerId(next.customerId)
    setBranchId(next.branchId)
    setVehicleId(next.vehicleId)
    setPickupDate(next.pickupDate)
    setPickupTime(next.pickupTime)
    setReturnDate(next.returnDate)
    setReturnTime(next.returnTime)
    setTerms(next.terms)
    setSignerName(next.signerName)
    setDriverName(next.driverName)
    setAuthorizedContactName(next.authorizedContactName)
    setLenderName(next.lenderName)
    setBorrowCost(next.borrowCost)
    setNotes(next.notes)
    setError(undefined)
    // Reset only when the dialog opens or the contract being edited changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [open, contract, initialOrg])

  const customers = useGetCustomersQuery(
    {
      page: 1,
      pageSize: API_MAX_PAGE_SIZE,
      organizationId: organizationId || undefined,
      sort: 'displayName',
      order: 'asc',
    },
    { skip: !open || needsOrganization },
  )
  const vehicles = useGetVehiclesQuery(
    {
      page: 1,
      pageSize: API_MAX_PAGE_SIZE,
      organizationId: organizationId || undefined,
      sort: 'plateNumber',
      order: 'asc',
    },
    { skip: !open || needsOrganization },
  )

  const window = useMemo(() => {
    if (!pickupDate || !returnDate || !pickupTime || !returnTime) return undefined
    const starts = zonedLocalToUtc(pickupDate, pickupTime, timeZone)
    const ends = zonedLocalToUtc(returnDate, returnTime, timeZone)
    if (!(ends > starts)) return undefined
    return { startsAt: starts.toISOString(), endsAt: ends.toISOString() }
  }, [pickupDate, pickupTime, returnDate, returnTime, timeZone])

  const quote = useGetContractQuoteQuery(
    {
      vehicleId,
      startsAt: window?.startsAt ?? '',
      endsAt: window?.endsAt ?? '',
      organizationId: organizationId || undefined,
    },
    { skip: !open || !vehicleId || !window },
  )

  const customerOptions = [
    { value: '', label: t('contracts.form.customerPlaceholder') },
    ...(customers.data?.items ?? []).map((customer) => ({
      value: customer.id,
      label: `${customer.displayName} (${customer.customerNumber})`,
    })),
  ]
  const vehicleOptions = [
    { value: '', label: t('contracts.form.vehiclePlaceholder') },
    ...(vehicles.data?.items ?? []).map((vehicle) => ({
      value: vehicle.id,
      label: `${vehicle.plateNumber} — ${vehicle.make} ${vehicle.model}`,
    })),
  ]

  async function save(event: FormEvent) {
    event.preventDefault()
    if (needsOrganization || !customerId || !window || terms.trim().length < 3) {
      setError(t('contracts.form.required'))
      return
    }
    setPending(true)
    setError(undefined)
    try {
      await onSubmit({
        organizationId: organizationId || undefined,
        type,
        customerId,
        vehicleId: vehicleId || undefined,
        startsAt: window.startsAt,
        endsAt: window.endsAt,
        terms: terms.trim(),
        driverName: driverName.trim() || signerName.trim() || undefined,
        authorizedContactName: authorizedContactName.trim() || undefined,
        lenderName: lenderName.trim() || undefined,
        borrowCost: borrowCost.trim() || undefined,
        notes: notes.trim() || undefined,
      })
      onClose()
    } catch (caught) {
      setError(normalizeApiError(caught).message)
    } finally {
      setPending(false)
    }
  }

  return (
    <Modal
      open={open}
      size="wide"
      title={isEdit ? t('contracts.edit') : t('contracts.add')}
      description={t('contracts.form.description', { timezone: timeZone })}
      onClose={onClose}
    >
      <form className="grid gap-4" onSubmit={(event) => void save(event)} noValidate>
        <div className="grid gap-4 md:grid-cols-2 md:items-start">
          <Section title={t('contracts.steps.type')}>
            <Select
              label={t('contracts.form.type')}
              value={type}
              required
              onChange={(event) => setType(event.target.value as (typeof contractTypes)[number])}
              options={contractTypes.map((value) => ({
                value,
                label: t(`contracts.type.${value}` as MessageKey),
              }))}
            />
            {!isEdit && organizations.required ? (
              <Select
                label={t('contracts.form.organization')}
                value={organizationId}
                required
                onChange={(event) => setOrganizationId(event.target.value)}
                options={[
                  { value: '', label: t('contracts.form.organizationPlaceholder') },
                  ...organizations.options,
                ]}
              />
            ) : null}
          </Section>

          <Section title={t('contracts.steps.customer')}>
            <Select
              label={t('contracts.form.customer')}
              value={customerId}
              required
              onChange={(event) => {
                const id = event.target.value
                setCustomerId(id)
                const selected = customers.data?.items.find((customer) => customer.id === id)
                if (selected && !branchId) setBranchId(selected.branchId)
              }}
              options={customerOptions}
            />
            {customers.isLoading ? <p className="text-muted text-sm">{t('common.loading')}</p> : null}
            {type === 'b2c' ? (
              <Input
                label={t('contracts.form.driver')}
                value={driverName}
                onChange={(event) => setDriverName(event.target.value)}
              />
            ) : null}
            {type === 'b2b' ? (
              <Input
                label={t('contracts.form.contact')}
                value={authorizedContactName}
                onChange={(event) => setAuthorizedContactName(event.target.value)}
              />
            ) : null}
          </Section>

          <Section title={t('contracts.steps.vehicle')}>
            {branches.allowed ? (
              <Select
                label={t('contracts.form.branch')}
                value={branchId}
                onChange={(event) => setBranchId(event.target.value)}
                options={[
                  { value: '', label: t('contracts.form.branchAny') },
                  ...branches.items.map((branch) => ({ value: branch.id, label: branch.name })),
                ]}
              />
            ) : null}
            <Select
              label={t('contracts.columns.vehicle')}
              value={vehicleId}
              onChange={(event) => setVehicleId(event.target.value)}
              options={vehicleOptions}
            />
            {vehicles.isLoading ? <p className="text-muted text-sm">{t('common.loading')}</p> : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label={t('contracts.form.pickupDate')}
                type="date"
                value={pickupDate}
                required
                onChange={(event) => setPickupDate(event.target.value)}
              />
              <Input
                label={t('contracts.form.pickupTime')}
                type="time"
                value={pickupTime}
                required
                onChange={(event) => setPickupTime(event.target.value)}
              />
              <Input
                label={t('contracts.form.returnDate')}
                type="date"
                value={returnDate}
                required
                onChange={(event) => setReturnDate(event.target.value)}
              />
              <Input
                label={t('contracts.form.returnTime')}
                type="time"
                value={returnTime}
                required
                onChange={(event) => setReturnTime(event.target.value)}
              />
            </div>
            {type === 'borrow' ? (
              <>
                <Input
                  label={t('contracts.form.lender')}
                  value={lenderName}
                  onChange={(event) => setLenderName(event.target.value)}
                />
                <Input
                  label={t('contracts.form.borrowCost')}
                  value={borrowCost}
                  onChange={(event) => setBorrowCost(event.target.value)}
                  dir="ltr"
                />
              </>
            ) : null}
          </Section>

          <Section title={t('contracts.steps.pricing')}>
            <p className="text-sm" dir="ltr">
              {quote.isFetching
                ? t('common.loading')
                : quote.data
                  ? `${quote.data.totalAmount} ${quote.data.currency} · ${quote.data.quantityDays} ${t('contracts.form.days')}`
                  : t('contracts.form.noQuote')}
            </p>
          </Section>

          <Section title={t('contracts.steps.terms')}>
            <label className="grid gap-1.5 text-sm font-medium">
              {t('contracts.form.terms')}
              <textarea
                className="border-line bg-surface focus-visible:border-brand focus-visible:ring-brand/30 min-h-28 rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"
                value={terms}
                required
                minLength={3}
                onChange={(event) => setTerms(event.target.value)}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              {t('contracts.form.notes')}
              <textarea
                className="border-line bg-surface focus-visible:border-brand focus-visible:ring-brand/30 min-h-16 rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"
                value={notes}
                maxLength={2000}
                onChange={(event) => setNotes(event.target.value)}
              />
            </label>
          </Section>

          <Section title={t('contracts.steps.signature')}>
            <p className="text-muted text-sm">{t('contracts.form.signatureLater')}</p>
            <Input
              label={t('contracts.form.signer')}
              value={signerName}
              onChange={(event) => setSignerName(event.target.value)}
            />
          </Section>
        </div>

        {error ? <Alert tone="danger">{tm(error)}</Alert> : null}
        <p className="text-muted text-sm">{t('contracts.form.draftHint')}</p>
        <ModalActions>
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={pending}>
            {isEdit ? t('common.saveChanges') : t('contracts.form.saveDraft')}
          </Button>
        </ModalActions>
      </form>
    </Modal>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-line grid h-full content-start gap-3 rounded-lg border p-4">
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      <div className="grid gap-3">{children}</div>
    </section>
  )
}
