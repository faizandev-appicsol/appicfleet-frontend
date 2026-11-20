import { useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { PERMISSIONS } from '@/app/router/access'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Button } from '@/components/ui/Button'
import {
  ArrowLeftIcon,
  BookingsIcon,
  BuildingIcon,
  CalendarIcon,
  ExpenseIcon,
  FineIcon,
  FuelIcon,
  GaugeIcon,
  MapPinIcon,
  MoreHorizontalIcon,
  OverviewIcon,
  PencilIcon,
  ServiceIcon,
  TollIcon,
  TrashIcon,
} from '@/components/ui/icons'
import { appConfig } from '@/config/app.config'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useBranchOptions } from '@/features/branches/hooks/useBranchOptions'
import {
  useGetVehicleQuery,
  useGetVehicleRatesQuery,
  useGetVehicleStatusHistoryQuery,
} from '@/features/vehicles/api/vehiclesApi'
import { AvailabilityPanel } from '@/features/vehicles/components/AvailabilityPanel'
import { DeleteVehicleDialog } from '@/features/vehicles/components/DeleteVehicleDialog'
import { VehicleDocumentsSection } from '@/features/vehicles/components/VehicleDocumentsSection'
import { VehicleFormDialog } from '@/features/vehicles/components/VehicleFormDialog'
import { VehicleRatesSection } from '@/features/vehicles/components/VehicleRatesSection'
import { VehicleStatusSection } from '@/features/vehicles/components/VehicleStatusSection'
import { VehicleThumbnail } from '@/features/vehicles/components/VehicleThumbnail'
import { useVehicleOptions } from '@/features/vehicles/hooks/useVehicleOptions'
import type { VehicleDetail } from '@/features/vehicles/schemas/vehicle.schema'
import { formatDateOnly } from '@/features/vehicles/utils/format'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'
import { cn } from '@/utils/cn'
import { formatDateTime } from '@/utils/formatDate'

const NAV = [
  'overview',
  'assignments',
  'bookings',
  'maintenance',
  'fuel',
  'expenses',
  'fines',
  'documents',
  'history',
] as const
type NavId = (typeof NAV)[number]

const NAV_ICONS: Record<NavId, typeof OverviewIcon> = {
  overview: OverviewIcon,
  assignments: ServiceIcon,
  bookings: BookingsIcon,
  maintenance: ServiceIcon,
  fuel: FuelIcon,
  expenses: ExpenseIcon,
  fines: FineIcon,
  documents: TollIcon,
  history: CalendarIcon,
}

export function VehicleDetailsPage() {
  const { t, tm } = useTranslation()
  const { vehicleId } = useParams()
  const query = useGetVehicleQuery(vehicleId ?? '', { skip: !vehicleId })
  useDocumentTitle(
    query.data ? `${query.data.make} ${query.data.model}` : t('vehicles.detail.title'),
  )

  if (!vehicleId) {
    return <ErrorState error={new Error(tm('vehicles.detail.missingId'))} />
  }

  if (query.data) return <VehicleDetails vehicle={query.data} />

  return (
    <div className="grid gap-4">
      <BackLink />
      {query.isLoading ? <LoadingState label={t('vehicles.detail.loading')} /> : null}
      {query.error ? <ErrorState error={query.error} onRetry={query.refetch} /> : null}
    </div>
  )
}

function BackLink() {
  const { t } = useTranslation()
  return (
    <Link
      to={appConfig.routes.vehicles}
      className="text-brand hover:text-brand-strong inline-flex items-center gap-1.5 text-sm font-medium"
    >
      <ArrowLeftIcon className="size-4" />
      {t('vehicles.detail.back')}
    </Link>
  )
}

function VehicleDetails({ vehicle }: { vehicle: VehicleDetail }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { can } = usePermissions()
  const { statusOptions } = useVehicleOptions()
  const [nav, setNav] = useState<NavId>('overview')
  const [editOpen, setEditOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const canUpdate = can(PERMISSIONS.vehicleUpdate)
  const canDelete = can(PERMISSIONS.vehicleDeactivate)
  const canSoftDelete =
    canDelete && vehicle.status !== 'rented' && vehicle.status !== 'reserved'

  return (
    <div className="grid min-w-0 gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackLink />
        <div className="relative flex flex-wrap items-center gap-2">
          {canUpdate ? (
            <Button type="button" variant="outline" onClick={() => setEditOpen(true)}>
              <PencilIcon className="size-4" />
              {t('vehicles.actions.edit')}
            </Button>
          ) : null}
          <Button type="button" variant="secondary" onClick={() => setMoreOpen((open) => !open)}>
            {t('vehicles.actions.more')}
            <MoreHorizontalIcon className="size-4" />
          </Button>
          {moreOpen ? (
            <div className="border-line bg-surface absolute end-0 top-full z-20 mt-1 min-w-44 overflow-hidden rounded-xl border py-1 shadow-md">
              <button
                type="button"
                className="text-ink hover:bg-control block w-full cursor-pointer px-3 py-2 text-start text-sm"
                onClick={() => {
                  setMoreOpen(false)
                  setNav('history')
                }}
              >
                {t('vehicles.detail.nav.history')}
              </button>
              <button
                type="button"
                className="text-ink hover:bg-control block w-full cursor-pointer px-3 py-2 text-start text-sm"
                onClick={() => {
                  setMoreOpen(false)
                  setNav('documents')
                }}
              >
                {t('vehicles.detail.nav.documents')}
              </button>
              {canSoftDelete ? (
                <button
                  type="button"
                  className="text-danger hover:bg-danger-soft flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-start text-sm"
                  onClick={() => {
                    setMoreOpen(false)
                    setDeleteOpen(true)
                  }}
                >
                  <TrashIcon className="size-4 shrink-0" />
                  {t('vehicles.actions.delete')}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="border-line bg-surface shadow-card h-fit rounded-2xl border p-2">
          <nav aria-label={t('vehicles.detail.navLabel')} className="grid gap-1">
            {NAV.map((id) => {
              const Icon = NAV_ICONS[id]
              const active = nav === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setNav(id)}
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-start text-sm font-medium transition-colors',
                    active
                      ? 'bg-brand-soft text-brand'
                      : 'text-muted hover:bg-control hover:text-ink',
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {t(`vehicles.detail.nav.${id}`)}
                </button>
              )
            })}
          </nav>
        </aside>

        <div className="grid min-w-0 gap-5">
          {nav === 'overview' ? (
            <OverviewPanel
              vehicle={vehicle}
              statusOptions={statusOptions}
              onViewHistory={() => setNav('history')}
            />
          ) : null}
          {nav === 'assignments' ? (
            <AvailabilityPanel
              vehicle={vehicle}
              canCheck={can(PERMISSIONS.vehicleCheckAvailability)}
              canAllocate={can(PERMISSIONS.vehicleAllocate)}
            />
          ) : null}
          {nav === 'bookings' ? <ComingSoon title={t('vehicles.detail.nav.bookings')} /> : null}
          {nav === 'maintenance' ? (
            <ComingSoon title={t('vehicles.detail.nav.maintenance')} />
          ) : null}
          {nav === 'fuel' ? <ComingSoon title={t('vehicles.detail.nav.fuel')} /> : null}
          {nav === 'expenses' ? <ComingSoon title={t('vehicles.detail.nav.expenses')} /> : null}
          {nav === 'fines' ? <ComingSoon title={t('vehicles.detail.nav.fines')} /> : null}
          {nav === 'documents' ? <VehicleDocumentsSection vehicle={vehicle} /> : null}
          {nav === 'history' ? (
            <div className="grid gap-4">
              <VehicleStatusSection vehicle={vehicle} />
              <VehicleRatesSection vehicle={vehicle} />
            </div>
          ) : null}
        </div>
      </div>

      <VehicleFormDialog
        key={vehicle.id}
        open={editOpen}
        vehicle={vehicle}
        onClose={() => setEditOpen(false)}
        onSaved={() => {
          setEditOpen(false)
          navigate(appConfig.routes.vehicles)
        }}
      />

      <DeleteVehicleDialog
        open={deleteOpen}
        vehicleId={vehicle.id}
        vehicleName={`${vehicle.make} ${vehicle.model}`.trim() || vehicle.plateNumber}
        onClose={() => setDeleteOpen(false)}
        onDeleted={() => navigate(appConfig.routes.vehicles)}
      />
    </div>
  )
}

function ComingSoon({ title }: { title: string }) {
  const { t } = useTranslation()
  return (
    <section className="border-line bg-surface shadow-card rounded-2xl border p-6">
      <h2 className="text-ink text-base font-semibold">{title}</h2>
      <p className="text-muted mt-2 text-sm">{t('vehicles.detail.comingSoon')}</p>
    </section>
  )
}

function OverviewPanel({
  vehicle,
  statusOptions,
  onViewHistory,
}: {
  vehicle: VehicleDetail
  statusOptions: ReturnType<typeof useVehicleOptions>['statusOptions']
  onViewHistory: () => void
}) {
  const { t, locale } = useTranslation()
  const options = useVehicleOptions()
  const branches = useBranchOptions()
  const ratesQuery = useGetVehicleRatesQuery({ id: vehicle.id, page: 1, pageSize: 20 })
  const historyQuery = useGetVehicleStatusHistoryQuery({
    id: vehicle.id,
    page: 1,
    pageSize: 5,
  })

  const dailyRate = useMemo(() => {
    const rates = ratesQuery.data?.items ?? []
    return rates.find((rate) => rate.rateType === 'daily' && rate.status === 'active')
  }, [ratesQuery.data])

  const branchName = branches.nameById.get(vehicle.branchId)
  const statusLabel =
    statusOptions.find((option) => option.value === vehicle.status)?.label ?? vehicle.status
  const statusTone =
    statusOptions.find((option) => option.value === vehicle.status)?.tone ?? 'neutral'
  const activity = historyQuery.data?.items ?? []

  const ownershipTitle =
    vehicle.ownershipType === 'company'
      ? t('vehicles.ownershipBadge.owned')
      : vehicle.ownershipType === 'leased'
        ? t('vehicles.ownershipBadge.finance')
        : vehicle.ownershipType === 'borrowed'
          ? t('vehicles.ownershipBadge.borrowed')
          : vehicle.ownershipType === 'investor'
            ? t('vehicles.ownershipBadge.investor')
            : options.labelOf(options.ownershipOptions, vehicle.ownershipType)

  const ownershipCaption =
    vehicle.ownershipType === 'company'
      ? t('vehicles.ownershipDetails.company')
      : vehicle.ownership?.lessorName ||
        vehicle.ownership?.investorName ||
        vehicle.ownership?.lenderName ||
        options.labelOf(options.ownershipOptions, vehicle.ownershipType)

  const specParts = [
    String(vehicle.year),
    vehicle.category || null,
    vehicle.color || null,
  ].filter(Boolean)

  return (
    <div className="grid gap-5">
      {/* Hero — image + identity + ownership card */}
      <section className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div className="flex min-w-0 flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
          <VehicleThumbnail
            size="hero"
            className="mx-auto sm:mx-0"
            vehicleId={vehicle.id}
            hasPhoto={vehicle.hasPhoto}
            alt={`${vehicle.make} ${vehicle.model}`.trim()}
          />
          <div className="flex min-w-0 flex-col items-start gap-3">
            <h1 className="text-ink text-[1.75rem] leading-tight font-bold tracking-tight sm:text-[2rem]">
              {vehicle.make} {vehicle.model}
            </h1>
            <span className="bg-brand-soft text-brand inline-flex rounded-full px-3.5 py-1 text-sm font-semibold tracking-wide">
              <span dir="ltr">{vehicle.plateNumber}</span>
            </span>
            <p className="text-muted text-[0.95rem] font-medium">
              {specParts.map((part, index) => (
                <span key={`${part}-${index}`}>
                  {index > 0 ? <span className="text-muted/80 mx-1.5">•</span> : null}
                  {part}
                </span>
              ))}
            </p>
            <DetailStatusPill label={statusLabel} tone={statusTone} />
          </div>
        </div>

        <OwnershipTypeCard title={ownershipTitle} caption={ownershipCaption} />
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<GaugeIcon className="size-5" />}
          label={t('vehicles.detail.metrics.mileage')}
          value={`${vehicle.mileageKm.toLocaleString(locale)} KM`}
        />
        <MetricCard
          icon={<CalendarIcon className="size-5" />}
          label={t('vehicles.detail.metrics.dailyRate')}
          value={
            dailyRate ? `${dailyRate.currency} ${dailyRate.amount}` : t('common.notSet')
          }
        />
        <MetricCard
          icon={<MapPinIcon className="size-5" />}
          label={t('vehicles.detail.metrics.branch')}
          value={branchName ?? vehicle.branchId}
        />
        <MetricCard
          icon={<FuelIcon className="size-5" />}
          label={t('vehicles.detail.metrics.fuel')}
          value={options.labelOf(options.fuelTypeOptions, vehicle.fuelType)}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <InfoCard title={t('vehicles.detail.panels.vehicleDetails')}>
          <InfoRow label={t('vehicles.form.make')} value={`${vehicle.make} ${vehicle.model}`} />
          <InfoRow label={t('vehicles.form.year')} value={String(vehicle.year)} ltr />
          <InfoRow label={t('vehicles.form.vin')} value={vehicle.vin ?? '—'} ltr />
          <InfoRow
            label={t('vehicles.form.engineNumber')}
            value={vehicle.engineNumber ?? '—'}
            ltr
          />
          <InfoRow label={t('vehicles.form.color')} value={vehicle.color ?? '—'} />
        </InfoCard>

        <InfoCard title={t('vehicles.detail.panels.registrationInsurance')}>
          <InfoRow label={t('vehicles.form.plateNumber')} value={vehicle.plateNumber} ltr />
          <InfoRow
            label={t('vehicles.form.mulkiyaExpiresOn')}
            value={
              vehicle.compliance.inspection.expiresOn
                ? formatDateOnly(vehicle.compliance.inspection.expiresOn, locale)
                : '—'
            }
          />
          <InfoRow
            label={t('vehicles.form.insuranceExpiresOn')}
            value={
              vehicle.compliance.insurance.expiresOn
                ? formatDateOnly(vehicle.compliance.insurance.expiresOn, locale)
                : '—'
            }
          />
          <InfoRow
            label={t('vehicles.form.registrationExpiresOn')}
            value={
              vehicle.compliance.registration.expiresOn
                ? formatDateOnly(vehicle.compliance.registration.expiresOn, locale)
                : '—'
            }
          />
        </InfoCard>

        <InfoCard
          title={t('vehicles.detail.panels.recentActivity')}
          action={
            <button
              type="button"
              className="text-brand hover:text-brand-strong cursor-pointer text-xs font-medium"
              onClick={onViewHistory}
            >
              {t('vehicles.detail.viewAll')}
            </button>
          }
        >
          {activity.length === 0 ? (
            <p className="text-muted text-sm">{t('vehicles.detail.noActivity')}</p>
          ) : (
            <ul className="grid gap-3">
              {activity.map((event) => (
                <li key={event.id} className="flex gap-3">
                  <div className="bg-brand-soft text-brand flex size-9 shrink-0 items-center justify-center rounded-xl">
                    <CalendarIcon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-ink text-sm font-medium">
                      {t('vehicles.detail.activity.statusChange', {
                        from: options.labelOf(options.statusOptions, event.fromStatus),
                        to: options.labelOf(options.statusOptions, event.toStatus),
                      })}
                    </p>
                    <p className="text-muted text-xs">
                      {formatDateTime(event.createdAt, locale)}
                      {event.reason ? ` • ${event.reason}` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </InfoCard>
      </div>
    </div>
  )
}

function OwnershipTypeCard({ title, caption }: { title: string; caption: string }) {
  const { t } = useTranslation()
  return (
    <article className="border-line bg-surface w-full shrink-0 rounded-2xl border p-4 shadow-[0_1px_3px_rgba(0,26,65,0.06)] lg:w-64">
      <p className="text-brand flex items-center gap-2 text-sm font-medium">
        <span className="bg-brand-soft text-brand inline-flex size-6 items-center justify-center rounded-full">
          <BuildingIcon className="size-3.5" />
        </span>
        {t('vehicles.detail.ownershipType')}
      </p>
      <div className="mt-3 flex items-center gap-3">
        <div className="bg-brand-soft text-brand flex size-11 shrink-0 items-center justify-center rounded-xl">
          <BuildingIcon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-ink text-lg font-bold tracking-tight">{title}</p>
          <p className="text-muted mt-0.5 text-xs leading-snug">{caption}</p>
        </div>
      </div>
    </article>
  )
}

function DetailStatusPill({
  label,
  tone,
}: {
  label: string
  tone: 'neutral' | 'brand' | 'success' | 'warning' | 'danger'
}) {
  const toneClass = {
    neutral: 'bg-control text-ink',
    brand: 'bg-brand-soft text-brand',
    success: 'bg-success-soft text-success',
    warning: 'bg-warning-soft text-warning',
    danger: 'bg-danger-soft text-danger',
  }[tone]
  const dotClass = {
    neutral: 'bg-muted',
    brand: 'bg-brand',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
  }[tone]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold',
        toneClass,
      )}
    >
      <span className={cn('size-2 shrink-0 rounded-full', dotClass)} aria-hidden />
      {label}
    </span>
  )
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <article className="border-line bg-surface flex items-center gap-3.5 rounded-2xl border px-4 py-4 shadow-[0_1px_2px_rgba(0,26,65,0.04)]">
      <div className="bg-brand-soft text-brand flex size-11 shrink-0 items-center justify-center rounded-xl">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-muted text-sm font-medium">{label}</p>
        <p className="text-ink mt-0.5 truncate text-lg font-bold tracking-tight">{value}</p>
      </div>
    </article>
  )
}

function InfoCard({
  title,
  action,
  children,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="border-line bg-surface shadow-card rounded-2xl border p-4">
      <header className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-ink text-sm font-semibold">{title}</h2>
        {action}
      </header>
      <div className="grid gap-3">{children}</div>
    </section>
  )
}

function InfoRow({
  label,
  value,
  ltr,
}: {
  label: string
  value: string
  ltr?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-muted shrink-0">{label}</span>
      <span className="text-ink text-end font-medium" dir={ltr ? 'ltr' : undefined}>
        {value}
      </span>
    </div>
  )
}
