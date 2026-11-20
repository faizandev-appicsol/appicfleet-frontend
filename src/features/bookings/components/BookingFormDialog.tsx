import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useGetBookingAvailabilityQuery } from '@/features/bookings/api/bookingsApi'
import { bookingSources, type BookingWriteBody } from '@/features/bookings/schemas/booking.schema'
import { zonedLocalToUtc } from '@/features/bookings/utils/zonedTime'
import { useBranchOptions } from '@/features/branches/hooks/useBranchOptions'
import { useGetCustomersQuery } from '@/features/customers/api/customersApi'
import { useOrganizationOptions } from '@/features/organizations/hooks/useOrganizationOptions'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useTranslation, type MessageKey } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'

export type BookingFormInitial = {
  customerId?: string
  customerName?: string
  branchId?: string
  vehicleId?: string
  source?: string
  notes?: string
  pickupDate?: string
  pickupTime?: string
  returnDate?: string
  returnTime?: string
  organizationId?: string
}

type Props = {
  open: boolean
  title: string
  initial?: BookingFormInitial
  onClose: () => void
  onSubmit: (body: BookingWriteBody, hold: boolean) => Promise<void>
}

const today = () => new Date().toISOString().slice(0, 10)

export function BookingFormDialog({ open, title, initial, onClose, onSubmit }: Props) {
  const { t, tm } = useTranslation()
  const organizations = useOrganizationOptions()
  const [organizationId, setOrganizationId] = useState(initial?.organizationId ?? '')
  const branches = useBranchOptions({ organizationId: organizationId || undefined })
  const [customerQuery, setCustomerQuery] = useState(initial?.customerName ?? '')
  const [customerId, setCustomerId] = useState(initial?.customerId ?? '')
  const [branchId, setBranchId] = useState(initial?.branchId ?? '')
  const [pickupDate, setPickupDate] = useState(initial?.pickupDate ?? today())
  const [pickupTime, setPickupTime] = useState(initial?.pickupTime ?? '10:00')
  const [returnDate, setReturnDate] = useState(initial?.returnDate ?? today())
  const [returnTime, setReturnTime] = useState(initial?.returnTime ?? '12:00')
  const [vehicleId, setVehicleId] = useState(initial?.vehicleId ?? '')
  const [source, setSource] = useState(initial?.source ?? 'admin')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [hold, setHold] = useState(false)
  const [formError, setFormError] = useState<string>()
  const [pending, setPending] = useState(false)

  const debouncedCustomer = useDebouncedValue(customerQuery, 300)
  const customers = useGetCustomersQuery(
    { search: debouncedCustomer, pageSize: 8 },
    { skip: !open || debouncedCustomer.trim().length < 2 || Boolean(customerId) },
  )

  const timeZone = branches.items.find((item) => item.id === branchId)?.timezone || 'UTC'
  const needsOrganization = organizations.required && !organizationId

  const window = useMemo(() => {
    if (!pickupDate || !returnDate || !pickupTime || !returnTime) return undefined
    const starts = zonedLocalToUtc(pickupDate, pickupTime, timeZone)
    const ends = zonedLocalToUtc(returnDate, returnTime, timeZone)
    if (!(ends > starts)) return undefined
    return { startsAt: starts.toISOString(), endsAt: ends.toISOString() }
  }, [pickupDate, pickupTime, returnDate, returnTime, timeZone])

  const availability = useGetBookingAvailabilityQuery(
    {
      startsAt: window?.startsAt ?? '',
      endsAt: window?.endsAt ?? '',
      branchId: branchId || undefined,
      organizationId: organizationId || undefined,
    },
    { skip: !open || !window || needsOrganization },
  )

  const vehicles = availability.data?.items ?? []
  const selectedStillAvailable = !vehicleId || vehicles.some((vehicle) => vehicle.id === vehicleId)
  useEffect(() => {
    if (availability.isFetching || !availability.data || !vehicleId) return
    if (!selectedStillAvailable) setVehicleId('')
  }, [availability.data, availability.isFetching, vehicleId, selectedStillAvailable])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (needsOrganization || !customerId || !window) {
      setFormError(t('bookings.form.required'))
      return
    }
    if (hold && !vehicleId) {
      setFormError(t('bookings.form.vehicleRequired'))
      return
    }
    if (vehicleId && availability.data && !selectedStillAvailable) {
      setFormError(t('bookings.form.staleVehicle'))
      setVehicleId('')
      return
    }
    setPending(true)
    setFormError(undefined)
    try {
      await onSubmit(
        {
          organizationId: organizationId || undefined,
          customerId,
          vehicleId: vehicleId || undefined,
          returnBranchId: branchId || undefined,
          startsAt: window.startsAt,
          endsAt: window.endsAt,
          source,
          notes: notes.trim() || undefined,
        },
        hold,
      )
      onClose()
    } catch (error) {
      setFormError(normalizeApiError(error).message)
    } finally {
      setPending(false)
    }
  }

  return (
    <Modal
      open={open}
      title={title}
      description={t('bookings.form.description', { timezone: timeZone })}
      size="wide"
      onClose={onClose}
    >
      <form className="grid gap-4" onSubmit={(event) => void submit(event)} noValidate>
        {organizations.required ? (
          <Select
            label={t('bookings.form.organization')}
            value={organizationId}
            required
            onChange={(event) => setOrganizationId(event.target.value)}
            options={[{ value: '', label: t('bookings.form.organizationPlaceholder') }, ...organizations.options]}
          />
        ) : null}
        <Input
          label={t('bookings.form.customer')}
          value={customerQuery}
          onChange={(event) => {
            setCustomerQuery(event.target.value)
            setCustomerId('')
          }}
          placeholder={t('bookings.form.customerSearch')}
          autoComplete="off"
          required
        />
        {customers.data && customers.data.items.length > 0 && !customerId ? (
          <ul className="border-line max-h-40 overflow-auto rounded-md border">
            {customers.data.items.map((customer) => (
              <li key={customer.id}>
                <button
                  type="button"
                  className="hover:bg-canvas flex w-full flex-col px-3 py-2 text-start"
                  onClick={() => {
                    setCustomerId(customer.id)
                    setCustomerQuery(customer.displayName)
                    if (!branchId) setBranchId(customer.branchId)
                  }}
                >
                  <span>{customer.displayName}</span>
                  <span className="text-muted text-xs" dir="ltr">
                    {customer.customerNumber}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {branches.allowed ? (
          <Select
            label={t('bookings.form.branch')}
            value={branchId}
            onChange={(event) => setBranchId(event.target.value)}
            options={[
              { value: '', label: t('bookings.form.branchAny') },
              ...branches.items.map((item) => ({ value: item.id, label: item.name })),
            ]}
          />
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t('bookings.form.pickupDate')} type="date" value={pickupDate} required onChange={(event) => setPickupDate(event.target.value)} />
          <Input label={t('bookings.form.pickupTime')} type="time" value={pickupTime} required onChange={(event) => setPickupTime(event.target.value)} />
          <Input label={t('bookings.form.returnDate')} type="date" value={returnDate} required onChange={(event) => setReturnDate(event.target.value)} />
          <Input label={t('bookings.form.returnTime')} type="time" value={returnTime} required onChange={(event) => setReturnTime(event.target.value)} />
        </div>
        <fieldset className="grid gap-2">
          <legend className="text-ink text-sm font-medium">{t('bookings.form.vehicle')}</legend>
          {!window ? (
            <p className="text-muted text-sm">{t('bookings.form.datesFirst')}</p>
          ) : availability.isFetching ? (
            <p className="text-muted text-sm">{t('bookings.form.checking')}</p>
          ) : availability.isError ? (
            <Alert tone="danger">{t('bookings.loadError')}</Alert>
          ) : vehicles.length === 0 ? (
            <p className="text-muted text-sm">{t('bookings.form.noVehicles')}</p>
          ) : (
            <ul className="grid max-h-48 gap-1 overflow-auto">
              {vehicles.map((vehicle) => (
                <li key={vehicle.id}>
                  <label className="hover:bg-canvas flex items-center gap-2 rounded-md px-2 py-1">
                    <input
                      type="radio"
                      name="booking-vehicle"
                      checked={vehicleId === vehicle.id}
                      onChange={() => setVehicleId(vehicle.id)}
                    />
                    <span dir="ltr">{vehicle.plateNumber}</span>
                    <span className="text-muted text-sm">
                      {vehicle.make} {vehicle.model}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
          {vehicleId && availability.data && !selectedStillAvailable ? (
            <Alert tone="warning">{t('bookings.form.staleVehicle')}</Alert>
          ) : null}
        </fieldset>
        <Select
          label={t('bookings.form.source')}
          value={source}
          onChange={(event) => setSource(event.target.value)}
          options={bookingSources.map((value) => ({
            value,
            label: t(`bookings.source.${value}` as MessageKey),
          }))}
        />
        <label className="grid gap-1.5 text-sm font-medium">
          {t('bookings.form.notes')}
          <textarea
            className="border-line bg-surface text-ink focus-visible:border-brand focus-visible:ring-brand/30 min-h-20 rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"
            value={notes}
            maxLength={2000}
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={hold} onChange={(event) => setHold(event.target.checked)} />
          {t('bookings.form.holdNow')}
        </label>
        {formError ? <Alert tone="danger">{tm(formError)}</Alert> : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={pending}>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
