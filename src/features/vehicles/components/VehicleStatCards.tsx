import type { ReactNode } from 'react'
import {
  CheckCircleIcon,
  FleetIcon,
  SteeringWheelIcon,
  WrenchIcon,
} from '@/components/ui/icons'
import type { VehicleStats } from '@/features/vehicles/schemas/vehicle.schema'
import { useTranslation } from '@/i18n'
import { cn } from '@/utils/cn'

function Sparkline({ tone }: { tone: 'up' | 'down' }) {
  const stroke = tone === 'up' ? '#3b82f6' : '#f97316'
  const fill = tone === 'up' ? 'url(#sparkUp)' : 'url(#sparkDown)'
  return (
    <svg viewBox="0 0 120 40" className="h-10 w-24" aria-hidden>
      <defs>
        <linearGradient id="sparkUp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sparkDown" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={
          tone === 'up'
            ? 'M0 28 C20 26, 30 22, 45 20 S70 10, 90 12 S110 8, 120 6 L120 40 L0 40 Z'
            : 'M0 12 C20 14, 35 18, 50 22 S75 30, 95 28 S110 32, 120 34 L120 40 L0 40 Z'
        }
        fill={fill}
      />
      <path
        d={
          tone === 'up'
            ? 'M0 28 C20 26, 30 22, 45 20 S70 10, 90 12 S110 8, 120 6'
            : 'M0 12 C20 14, 35 18, 50 22 S75 30, 95 28 S110 32, 120 34'
        }
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function StatCard({
  label,
  value,
  icon,
  tone,
  share,
}: {
  label: string
  value: number
  icon: ReactNode
  tone: 'up' | 'down'
  share?: string
}) {
  return (
    <article className="border-line bg-surface shadow-card relative overflow-hidden rounded-2xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-muted text-sm">{label}</p>
          <p className="text-ink mt-1 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
          {share ? (
            <p
              className={cn(
                'mt-2 text-xs font-medium',
                tone === 'up' ? 'text-success' : 'text-warning',
              )}
            >
              {share}
            </p>
          ) : null}
        </div>
        <div className="bg-brand-soft text-brand flex size-10 shrink-0 items-center justify-center rounded-xl">
          {icon}
        </div>
      </div>
      <div className="pointer-events-none absolute end-3 bottom-2 opacity-90">
        <Sparkline tone={tone} />
      </div>
    </article>
  )
}

function shareOf(part: number, total: number): string | undefined {
  if (total <= 0) return undefined
  return `${Math.round((part / total) * 100)}%`
}

export function VehicleStatCards({
  stats,
  isLoading,
}: {
  stats?: VehicleStats
  isLoading?: boolean
}) {
  const { t } = useTranslation()
  const total = stats?.total ?? 0
  const available = stats?.available ?? 0
  const rented = stats?.rented ?? 0
  const maintenance = stats?.maintenance ?? 0

  if (isLoading && !stats) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="border-line bg-surface h-28 animate-pulse rounded-2xl border"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label={t('vehicles.stats.total')}
        value={total}
        icon={<FleetIcon className="size-5" />}
        tone="up"
      />
      <StatCard
        label={t('vehicles.stats.available')}
        value={available}
        icon={<CheckCircleIcon className="size-5" />}
        tone="up"
        share={shareOf(available, total)}
      />
      <StatCard
        label={t('vehicles.stats.rented')}
        value={rented}
        icon={<SteeringWheelIcon className="size-5" />}
        tone="up"
        share={shareOf(rented, total)}
      />
      <StatCard
        label={t('vehicles.stats.maintenance')}
        value={maintenance}
        icon={<WrenchIcon className="size-5" />}
        tone="down"
        share={shareOf(maintenance, total)}
      />
    </div>
  )
}
