import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { PERMISSIONS, bookingDirectoryRoles } from '@/app/router/access'
import { useAppSelector } from '@/app/hooks'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { buttonClassName } from '@/components/ui/buttonStyles'
import { Modal } from '@/components/ui/Modal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { appConfig } from '@/config/app.config'
import { hasAnyRole } from '@/features/auth/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useBranchOptions } from '@/features/branches/hooks/useBranchOptions'
import {
  useCancelBookingMutation,
  useConfirmBookingMutation,
  useGetBookingHistoryQuery,
  useGetBookingQuery,
  useHoldBookingMutation,
  useReleaseBookingMutation,
  useUpdateBookingMutation,
} from '@/features/bookings/api/bookingsApi'
import { useConvertBookingToContractMutation } from '@/features/contracts/api/contractsApi'
import { BookingFormDialog } from '@/features/bookings/components/BookingFormDialog'
import { useBookingOptions } from '@/features/bookings/hooks/useBookingOptions'
import type { BookingWriteBody } from '@/features/bookings/schemas/booking.schema'
import { formatInZone, partsInZone } from '@/features/bookings/utils/zonedTime'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'

const CONVERT_ROLES = ['admin', 'org_admin', 'super_admin'] as const

export function BookingDetailsPage() {
  const { bookingId = '' } = useParams()
  const navigate = useNavigate()
  const { t, locale, tm } = useTranslation()
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const options = useBookingOptions()
  const branches = useBranchOptions()
  const booking = useGetBookingQuery(bookingId, { skip: !bookingId })
  const history = useGetBookingHistoryQuery(bookingId, { skip: !bookingId })
  const [hold] = useHoldBookingMutation()
  const [confirm] = useConfirmBookingMutation()
  const [release] = useReleaseBookingMutation()
  const [convertToContract] = useConvertBookingToContractMutation()
  const [cancel] = useCancelBookingMutation()
  const [updateBooking] = useUpdateBookingMutation()
  const [reason, setReason] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [editing, setEditing] = useState(false)
  const [actionError, setActionError] = useState<string>()
  const [pending, setPending] = useState(false)

  const row = booking.data
  useDocumentTitle(row?.bookingNumber ?? t('bookings.title'))
  const zone = branches.items.find((branch) => branch.id === row?.branchId)?.timezone || 'UTC'
  const staff = hasAnyRole(roles, bookingDirectoryRoles)
  const canHold = can(PERMISSIONS.bookingManageHolds) || staff
  const canConfirm = can(PERMISSIONS.bookingConfirm) || staff
  const canRelease = can(PERMISSIONS.bookingRelease) || staff
  const canCancel = can(PERMISSIONS.bookingCancel) || staff
  const canUpdate = can(PERMISSIONS.bookingUpdate) || staff
  const canConvert = can(PERMISSIONS.bookingConvert) || hasAnyRole(roles, CONVERT_ROLES)

  async function run(action: () => Promise<unknown>) {
    setPending(true)
    setActionError(undefined)
    try {
      await action()
    } catch (error) {
      setActionError(normalizeApiError(error).message)
    } finally {
      setPending(false)
    }
  }

  const pickup = row ? partsInZone(row.startsAt, zone) : undefined
  const returning = row ? partsInZone(row.endsAt, zone) : undefined

  return (
    <QueryState
      data={booking.data}
      isLoading={booking.isLoading}
      error={booking.error}
      onRetry={booking.refetch}
      isEmpty={(data) => !data.id}
      emptyTitle={t('bookings.emptyTitle')}
      emptyDescription={t('bookings.emptyDescription')}
    >
      {(row) => (
        <section className="grid gap-6">
          <PageHeader
            title={row.bookingNumber}
            description={row.customerDisplayName}
            action={
              <div className="flex flex-wrap gap-2">
                {row.status === 'draft' && canUpdate ? (
                  <Button type="button" variant="secondary" onClick={() => setEditing(true)}>
                    {t('common.edit')}
                  </Button>
                ) : null}
                {row.status === 'draft' && canHold ? (
                  <Button type="button" loading={pending} onClick={() => void run(() => hold({ id: row.id }).unwrap())}>
                    {t('bookings.actions.hold')}
                  </Button>
                ) : null}
                {row.status === 'hold' && canConfirm ? (
                  <Button type="button" loading={pending} onClick={() => void run(() => confirm(row.id).unwrap())}>
                    {t('bookings.actions.confirm')}
                  </Button>
                ) : null}
                {row.status === 'hold' && canRelease ? (
                  <Button type="button" variant="secondary" loading={pending} onClick={() => void run(() => release(row.id).unwrap())}>
                    {t('bookings.actions.release')}
                  </Button>
                ) : null}
                {['draft', 'hold', 'confirmed'].includes(row.status) && canCancel ? (
                  <Button type="button" variant="danger" onClick={() => setCancelling(true)}>
                    {t('bookings.actions.cancel')}
                  </Button>
                ) : null}
                {row.status === 'confirmed' && canConvert ? (
                  <Button
                    type="button"
                    variant="secondary"
                    loading={pending}
                    onClick={() =>
                      void run(async () => {
                        const contract = await convertToContract(row.id).unwrap()
                        navigate(`${appConfig.routes.contracts}/${encodeURIComponent(contract.id)}`)
                      })
                    }
                  >
                    {t('bookings.actions.convert')}
                  </Button>
                ) : null}
                {row.status === 'converted' && row.conversionKey ? (
                  <Link className={buttonClassName({ variant: 'secondary' })} to={appConfig.routes.contracts}>
                    {t('bookings.actions.viewContract')}
                  </Link>
                ) : null}
              </div>
            }
          />
          {actionError ? <Alert tone="danger">{tm(actionError)}</Alert> : null}
          {row.conversionKey ? (
            <p className="text-muted text-sm">
              {t('bookings.convertNote')} <span dir="ltr">{row.conversionKey}</span>
            </p>
          ) : null}
          <dl className="grid gap-3 sm:grid-cols-2">
            <Item label={t('common.status')}>
              <StatusBadge value={row.status} options={options.statusOptions} />
            </Item>
            <Item label={t('bookings.columns.source')}>{options.labelOf(options.sourceOptions, row.source)}</Item>
            <Item label={t('bookings.columns.customer')}>
              <Link className="text-brand" to={`${appConfig.routes.customers}/${encodeURIComponent(row.customerId)}`}>
                {row.customerDisplayName}
              </Link>
            </Item>
            <Item label={t('bookings.columns.vehicle')}>
              {row.vehicleId ? (
                <Link className="text-brand" to={`${appConfig.routes.vehicles}/${encodeURIComponent(row.vehicleId)}`} dir="ltr">
                  {row.vehiclePlate}
                </Link>
              ) : (
                t('common.notSet')
              )}
            </Item>
            <Item label={t('bookings.columns.pickup')}>
              <span dir="ltr">{formatInZone(row.startsAt, zone, locale)}</span>
            </Item>
            <Item label={t('bookings.columns.return')}>
              <span dir="ltr">{formatInZone(row.endsAt, zone, locale)}</span>
            </Item>
            <Item label={t('bookings.columns.branch')}>
              {branches.nameById.get(row.branchId) ?? row.branchId}
            </Item>
            {row.holdExpiresAt ? (
              <Item label={t('bookings.fields.holdExpires')}>
                <span dir="ltr">{formatInZone(row.holdExpiresAt, zone, locale)}</span>
              </Item>
            ) : null}
            {row.pricing ? (
              <Item label={t('bookings.fields.quote')}>
                <span dir="ltr">
                  {row.pricing.totalAmount} {row.pricing.currency}
                </span>
              </Item>
            ) : null}
            {row.externalReference ? (
              <Item label={t('bookings.fields.externalReference')}>
                <span dir="ltr">{row.externalReference}</span>
              </Item>
            ) : null}
            {row.notes ? <Item label={t('bookings.form.notes')}>{row.notes}</Item> : null}
          </dl>
          <p className="text-muted text-sm">{t('bookings.availabilityNote')}</p>
          <section className="grid gap-2">
            <h2 className="text-base font-semibold">{t('bookings.timeline')}</h2>
            {history.isLoading ? <p className="text-muted text-sm">{t('common.loading')}</p> : null}
            <ol className="grid gap-2">
              {(history.data ?? []).map((event) => (
                <li key={event.id} className="border-line rounded-md border px-3 py-2 text-sm">
                  <StatusBadge value={event.toStatus} options={options.statusOptions} />
                  <span className="text-muted ms-2" dir="ltr">
                    {formatInZone(event.createdAt, zone, locale)}
                  </span>
                  {event.reason ? <p className="mt-1">{event.reason}</p> : null}
                </li>
              ))}
            </ol>
          </section>
          <Modal open={cancelling} title={t('bookings.actions.cancel')} onClose={() => setCancelling(false)}>
            <form
              className="grid gap-3"
              onSubmit={(event) => {
                event.preventDefault()
                void run(async () => {
                  await cancel({ id: row.id, reason }).unwrap()
                  setCancelling(false)
                })
              }}
            >
              <label className="grid gap-1.5 text-sm font-medium" htmlFor="cancel-reason">
                {t('bookings.cancelReason')}
                <textarea
                  id="cancel-reason"
                  className="border-line bg-surface text-ink focus-visible:border-brand min-h-20 rounded-md border px-3 py-2 text-sm outline-none"
                  value={reason}
                  minLength={3}
                  required
                  onChange={(event) => setReason(event.target.value)}
                />
              </label>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setCancelling(false)}>
                  {t('common.close')}
                </Button>
                <Button type="submit" variant="danger" loading={pending}>
                  {t('bookings.actions.cancel')}
                </Button>
              </div>
            </form>
          </Modal>
          {editing && pickup && returning ? (
            <BookingFormDialog
              open
              title={t('common.edit')}
              initial={{
                customerId: row.customerId,
                customerName: row.customerDisplayName,
                branchId: row.branchId,
                vehicleId: row.vehicleId,
                source: row.source,
                notes: row.notes,
                pickupDate: pickup.date,
                pickupTime: pickup.time,
                returnDate: returning.date,
                returnTime: returning.time,
                organizationId: row.organizationId,
              }}
              onClose={() => setEditing(false)}
              onSubmit={async (body: BookingWriteBody, holdAfter: boolean) => {
                await updateBooking({ id: row.id, body }).unwrap()
                if (holdAfter) await holdBooking({ id: row.id }).unwrap()
              }}
            />
          ) : null}
        </section>
      )}
    </QueryState>
  )
}

function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-muted text-xs">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}
