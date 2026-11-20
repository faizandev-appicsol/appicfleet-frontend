import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { PERMISSIONS, bookingDirectoryRoles } from '@/app/router/access'
import { useAppSelector } from '@/app/hooks'
import { QueryState } from '@/components/feedback/QueryState'
import { SearchField } from '@/components/common/SearchField'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { buttonClassName } from '@/components/ui/buttonStyles'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { Input, Select } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { appConfig } from '@/config/app.config'
import { hasAnyRole } from '@/features/auth/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useBranchOptions } from '@/features/branches/hooks/useBranchOptions'
import {
  useCreateBookingMutation,
  useExpireHoldsMutation,
  useGetBookingsQuery,
  useHoldBookingMutation,
} from '@/features/bookings/api/bookingsApi'
import { BookingFormDialog } from '@/features/bookings/components/BookingFormDialog'
import { useBookingOptions } from '@/features/bookings/hooks/useBookingOptions'
import type { Booking, BookingWriteBody } from '@/features/bookings/schemas/booking.schema'
import { formatInZone } from '@/features/bookings/utils/zonedTime'
import { useOrganizationOptions } from '@/features/organizations/hooks/useOrganizationOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'
import { formatDateTime } from '@/utils/formatDate'

const PAGE_SIZE = 20

export function BookingsPage() {
  const { t, locale } = useTranslation()
  useDocumentTitle(t('bookings.title'))
  const navigate = useNavigate()
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const options = useBookingOptions()
  const organizations = useOrganizationOptions()
  const [organizationId, setOrganizationId] = useState('')
  const branches = useBranchOptions({ organizationId: organizationId || undefined })
  const { searchInput, setSearchInput, search, page, setPage } = useSearchPagination()
  const [status, setStatus] = useState('')
  const [source, setSource] = useState('')
  const [branchId, setBranchId] = useState('')
  const [pickupFrom, setPickupFrom] = useState('')
  const [pickupTo, setPickupTo] = useState('')
  const [sort, setSort] = useState<'startsAt' | 'endsAt' | 'createdAt' | 'bookingNumber' | 'status'>('startsAt')
  const [creating, setCreating] = useState(false)
  const [createBooking] = useCreateBookingMutation()
  const [holdBooking] = useHoldBookingMutation()
  const [expireHolds, expireState] = useExpireHoldsMutation()

  const canCreate = can(PERMISSIONS.bookingCreate) || hasAnyRole(roles, bookingDirectoryRoles)
  const canRelease = can(PERMISSIONS.bookingRelease) || hasAnyRole(roles, bookingDirectoryRoles)
  const needsOrganization = organizations.required && !organizationId

  const query = useGetBookingsQuery(
    {
      search: search || undefined,
      page,
      pageSize: PAGE_SIZE,
      status: status || undefined,
      source: source || undefined,
      branchId: branchId || undefined,
      organizationId: organizationId || undefined,
      pickupFrom: pickupFrom ? new Date(`${pickupFrom}T00:00:00.000Z`).toISOString() : undefined,
      pickupTo: pickupTo ? new Date(new Date(`${pickupTo}T00:00:00.000Z`).getTime() + 86_400_000).toISOString() : undefined,
      sort,
      order: sort === 'createdAt' ? 'desc' : 'asc',
    },
    { skip: needsOrganization },
  )

  const onFilter = (apply: (value: string) => void) => (value: string) => {
    apply(value)
    setPage(1)
  }

  const zoneFor = (id: string) => branches.items.find((branch) => branch.id === id)?.timezone || 'UTC'
  const detailPath = (id: string) => `${appConfig.routes.bookings}/${encodeURIComponent(id)}`

  const columns: DataTableColumn<Booking>[] = [
    {
      id: 'reference',
      header: t('bookings.columns.reference'),
      cell: (row) => (
        <Link to={detailPath(row.id)} className="text-brand hover:text-brand-strong font-medium" dir="ltr">
          {row.bookingNumber}
        </Link>
      ),
    },
    { id: 'customer', header: t('bookings.columns.customer'), cell: (row) => row.customerDisplayName },
    {
      id: 'vehicle',
      header: t('bookings.columns.vehicle'),
      cell: (row) => (row.vehiclePlate ? <span dir="ltr">{row.vehiclePlate}</span> : t('common.notSet')),
    },
    {
      id: 'pickup',
      header: t('bookings.columns.pickup'),
      className: 'whitespace-nowrap',
      cell: (row) => <span dir="ltr">{formatInZone(row.startsAt, zoneFor(row.branchId), locale)}</span>,
    },
    {
      id: 'return',
      header: t('bookings.columns.return'),
      className: 'whitespace-nowrap',
      cell: (row) => <span dir="ltr">{formatInZone(row.endsAt, zoneFor(row.returnBranchId), locale)}</span>,
    },
    {
      id: 'status',
      header: t('common.status'),
      cell: (row) => <StatusBadge value={row.status} options={options.statusOptions} />,
    },
    {
      id: 'source',
      header: t('bookings.columns.source'),
      cell: (row) => options.labelOf(options.sourceOptions, row.source),
    },
    {
      id: 'branch',
      header: t('bookings.columns.branch'),
      cell: (row) => branches.nameById.get(row.branchId) ?? <span dir="ltr">{row.branchId}</span>,
    },
    {
      id: 'created',
      header: t('common.created'),
      className: 'whitespace-nowrap',
      cell: (row) => <span dir="ltr">{formatDateTime(row.createdAt)}</span>,
    },
    {
      id: 'actions',
      header: t('common.actions'),
      className: 'text-end',
      cell: (row) => (
        <Link to={detailPath(row.id)} className="text-brand hover:text-brand-strong text-sm font-medium">
          {t('bookings.actions.view')}
        </Link>
      ),
    },
  ]

  async function save(body: BookingWriteBody, hold: boolean) {
    const created = await createBooking(body).unwrap()
    if (hold) await holdBooking({ id: created.id }).unwrap()
    navigate(detailPath(created.id))
  }

  return (
    <>
      <PageHeader
        title={t('bookings.title')}
        description={t('bookings.description')}
        action={
          <div className="flex flex-wrap gap-2">
            <Link className={buttonClassName({ variant: 'secondary' })} to={appConfig.routes.bookingCalendar}>
              {t('bookings.calendar.open')}
            </Link>
            {canRelease ? (
              <Button
                type="button"
                variant="secondary"
                loading={expireState.isLoading}
                onClick={() => void expireHolds()}
              >
                {t('bookings.actions.expire')}
              </Button>
            ) : null}
            {canCreate ? (
              <Button type="button" onClick={() => setCreating(true)}>
                {t('bookings.add')}
              </Button>
            ) : null}
          </div>
        }
      />
      <div className="grid min-w-0 gap-3">
        <SearchField
          value={searchInput}
          onChange={setSearchInput}
          label={t('bookings.searchLabel')}
          placeholder={t('bookings.searchPlaceholder')}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {organizations.required ? (
            <Select
              label={t('bookings.form.organization')}
              value={organizationId}
              onChange={(event) => onFilter(setOrganizationId)(event.target.value)}
              options={[{ value: '', label: t('bookings.form.organizationPlaceholder') }, ...organizations.options]}
            />
          ) : null}
          <Select
            label={t('common.status')}
            value={status}
            onChange={(event) => onFilter(setStatus)(event.target.value)}
            options={[{ value: '', label: t('bookings.filters.allStatuses') }, ...options.statusOptions]}
          />
          <Select
            label={t('bookings.columns.source')}
            value={source}
            onChange={(event) => onFilter(setSource)(event.target.value)}
            options={[{ value: '', label: t('bookings.filters.allSources') }, ...options.sourceOptions]}
          />
          {branches.allowed ? (
            <Select
              label={t('bookings.columns.branch')}
              value={branchId}
              onChange={(event) => onFilter(setBranchId)(event.target.value)}
              options={[
                { value: '', label: t('bookings.filters.allBranches') },
                ...branches.items.map((branch) => ({ value: branch.id, label: branch.name })),
              ]}
            />
          ) : null}
          <Input
            label={t('bookings.filters.pickupFrom')}
            type="date"
            value={pickupFrom}
            onChange={(event) => onFilter(setPickupFrom)(event.target.value)}
          />
          <Input
            label={t('bookings.filters.pickupTo')}
            type="date"
            value={pickupTo}
            onChange={(event) => onFilter(setPickupTo)(event.target.value)}
          />
          <Select
            label={t('bookings.filters.sort')}
            value={sort}
            onChange={(event) => {
              const value = event.target.value
              if (
                value === 'startsAt' ||
                value === 'endsAt' ||
                value === 'createdAt' ||
                value === 'bookingNumber' ||
                value === 'status'
              ) {
                setSort(value)
                setPage(1)
              }
            }}
            options={[
              { value: 'startsAt', label: t('bookings.sort.startsAt') },
              { value: 'endsAt', label: t('bookings.sort.endsAt') },
              { value: 'createdAt', label: t('bookings.sort.createdAt') },
              { value: 'bookingNumber', label: t('bookings.sort.bookingNumber') },
              { value: 'status', label: t('bookings.sort.status') },
            ]}
          />
        </div>
      </div>
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
          emptyTitle={t('bookings.emptyTitle')}
          emptyDescription={search || status || source || branchId ? t('bookings.emptyFiltered') : t('bookings.emptyDescription')}
        >
          {(data) => (
            <div className="grid min-w-0 gap-3">
              <div className="border-line bg-surface min-w-0 overflow-x-auto rounded-lg border">
                <DataTable columns={columns} rows={data.items} rowKey={(row) => row.id} />
              </div>
              <Pagination data={data} page={page} onPageChange={setPage} disabled={query.isFetching} />
            </div>
          )}
        </QueryState>
      )}
      {creating ? (
        <BookingFormDialog
          open
          title={t('bookings.add')}
          initial={{ organizationId }}
          onClose={() => setCreating(false)}
          onSubmit={save}
        />
      ) : null}
    </>
  )
}
