import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { buttonClassName } from '@/components/ui/buttonStyles'
import { Select } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { appConfig } from '@/config/app.config'
import { useBranchOptions } from '@/features/branches/hooks/useBranchOptions'
import { useGetBookingCalendarQuery } from '@/features/bookings/api/bookingsApi'
import { useBookingOptions } from '@/features/bookings/hooks/useBookingOptions'
import type { Booking } from '@/features/bookings/schemas/booking.schema'
import { formatInZone } from '@/features/bookings/utils/zonedTime'
import { useOrganizationOptions } from '@/features/organizations/hooks/useOrganizationOptions'
import { useVehicleOptions } from '@/features/vehicles/hooks/useVehicleOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation, type MessageKey } from '@/i18n'

type Mode = 'month' | 'week' | 'day'

const DAY = 24 * 60 * 60 * 1000

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

export function BookingCalendarPage() {
  const { t, locale } = useTranslation()
  useDocumentTitle(t('bookings.calendar.title'))
  const options = useBookingOptions()
  const vehicles = useVehicleOptions()
  const organizations = useOrganizationOptions()
  const [organizationId, setOrganizationId] = useState('')
  const branches = useBranchOptions({ organizationId: organizationId || undefined })
  const [anchor, setAnchor] = useState(() => startOfUtcDay(new Date()))
  const [mode, setMode] = useState<Mode>('week')
  const [branchId, setBranchId] = useState('')
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')

  const range = useMemo(() => {
    if (mode === 'day') return { from: anchor, to: new Date(anchor.getTime() + DAY) }
    if (mode === 'week') return { from: anchor, to: new Date(anchor.getTime() + 7 * DAY) }
    const monthStart = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1))
    const monthEnd = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + 1, 1))
    return { from: monthStart, to: monthEnd }
  }, [anchor, mode])

  const needsOrganization = organizations.required && !organizationId
  const query = useGetBookingCalendarQuery(
    {
      from: range.from.toISOString(),
      to: range.to.toISOString(),
      branchId: branchId || undefined,
      status: status || undefined,
      category: category || undefined,
      organizationId: organizationId || undefined,
    },
    { skip: needsOrganization },
  )

  const days = useMemo(() => {
    const count = Math.round((range.to.getTime() - range.from.getTime()) / DAY)
    return Array.from({ length: count }, (_, index) => new Date(range.from.getTime() + index * DAY))
  }, [range])

  function shift(direction: -1 | 1) {
    const step = mode === 'month' ? 32 : mode === 'week' ? 7 : 1
    const next = new Date(anchor.getTime() + direction * step * DAY)
    setAnchor(mode === 'month' ? new Date(Date.UTC(next.getUTCFullYear(), next.getUTCMonth(), 1)) : next)
  }

  const zone = (booking: Booking) => branches.items.find((branch) => branch.id === booking.branchId)?.timezone || 'UTC'

  return (
    <>
      <PageHeader
        title={t('bookings.calendar.title')}
        description={t('bookings.calendar.description')}
        action={
          <Link className={buttonClassName({ variant: 'secondary' })} to={appConfig.routes.bookings}>
            {t('bookings.calendar.list')}
          </Link>
        }
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex gap-2" role="group" aria-label={t('bookings.calendar.mode')}>
          {(['day', 'week', 'month'] as const).map((value) => (
            <Button
              key={value}
              type="button"
              variant={mode === value ? 'primary' : 'secondary'}
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
            >
              {t(`bookings.calendar.${value}` as MessageKey)}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => shift(-1)}>
            {t('bookings.calendar.previous')}
          </Button>
          <Button type="button" variant="secondary" onClick={() => shift(1)}>
            {t('bookings.calendar.next')}
          </Button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {organizations.required ? (
          <Select
            label={t('bookings.form.organization')}
            value={organizationId}
            onChange={(event) => setOrganizationId(event.target.value)}
            options={[{ value: '', label: t('bookings.form.organizationPlaceholder') }, ...organizations.options]}
          />
        ) : null}
        {branches.allowed ? (
          <Select
            label={t('bookings.columns.branch')}
            value={branchId}
            onChange={(event) => setBranchId(event.target.value)}
            options={[
              { value: '', label: t('bookings.filters.allBranches') },
              ...branches.items.map((branch) => ({ value: branch.id, label: branch.name })),
            ]}
          />
        ) : null}
        <Select
          label={t('common.status')}
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          options={[{ value: '', label: t('bookings.filters.allStatuses') }, ...options.statusOptions]}
        />
        <Select
          label={t('bookings.filters.category')}
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          options={[{ value: '', label: t('bookings.filters.allCategories') }, ...vehicles.categoryOptions]}
        />
      </div>
      {query.data?.truncated ? <Alert tone="warning">{t('bookings.calendar.truncated')}</Alert> : null}
      {needsOrganization ? (
        <p className="text-muted text-sm">{t('bookings.form.organizationPlaceholder')}</p>
      ) : (
        <QueryState
          data={query.data}
          isLoading={query.isLoading}
          isFetching={query.isFetching && !query.isLoading}
          error={query.error}
          onRetry={query.refetch}
          isEmpty={(data) => data.items.length === 0}
          emptyTitle={t('bookings.calendar.empty')}
          emptyDescription={t('bookings.calendar.emptyDescription')}
        >
          {(data) => (
            <>
              <div className="grid gap-3 md:hidden">
                {data.items.map((booking) => (
                  <BookingChip key={booking.id} booking={booking} zone={zone(booking)} locale={locale} />
                ))}
              </div>
              <div className={`hidden gap-2 md:grid ${mode === 'day' ? 'md:grid-cols-1' : 'md:grid-cols-7'}`}>
                {days.map((day) => {
                  const next = new Date(day.getTime() + DAY)
                  const items = data.items.filter((booking) => {
                    const start = new Date(booking.startsAt).getTime()
                    return start >= day.getTime() && start < next.getTime()
                  })
                  return (
                    <section key={day.toISOString()} className="border-line grid content-start gap-2 rounded-lg border p-2">
                      <h2 className="text-sm font-medium" dir="ltr">
                        {day.toISOString().slice(0, 10)}
                      </h2>
                      {items.length === 0 ? (
                        <p className="text-muted text-xs">{t('bookings.calendar.none')}</p>
                      ) : (
                        items.map((booking) => (
                          <BookingChip key={booking.id} booking={booking} zone={zone(booking)} locale={locale} />
                        ))
                      )}
                    </section>
                  )
                })}
              </div>
            </>
          )}
        </QueryState>
      )}
    </>
  )
}

function BookingChip({ booking, zone, locale }: { booking: Booking; zone: string; locale: string }) {
  const options = useBookingOptions()
  return (
    <Link
      to={`${appConfig.routes.bookings}/${encodeURIComponent(booking.id)}`}
      className="border-line bg-surface hover:bg-canvas focus-visible:outline-brand grid gap-1 rounded-md border p-2 text-start text-sm focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <span className="font-medium" dir="ltr">
        {booking.bookingNumber}
      </span>
      <span>{booking.customerDisplayName}</span>
      {booking.vehiclePlate ? <span dir="ltr">{booking.vehiclePlate}</span> : null}
      <span dir="ltr">{formatInZone(booking.startsAt, zone, locale)}</span>
      <StatusBadge value={booking.status} options={options.statusOptions} />
      <span className="text-muted text-xs">{options.labelOf(options.sourceOptions, booking.source)}</span>
    </Link>
  )
}
