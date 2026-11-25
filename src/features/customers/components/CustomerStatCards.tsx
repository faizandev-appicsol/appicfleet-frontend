import type { ReactNode } from 'react'
import {
  BuildingIcon,
  CheckCircleIcon,
  MapPinIcon,
  UsersIcon,
} from '@/components/ui/icons'
import type { CustomerStats } from '@/features/customers/schemas/customer.schema'
import { useTranslation } from '@/i18n'

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string
  value: number
  icon: ReactNode
  tone: 'brand' | 'success' | 'violet' | 'amber'
}) {
  const toneClass = {
    brand: 'bg-brand-soft text-brand',
    success: 'bg-success-soft text-success',
    violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-300',
    amber: 'bg-warning-soft text-warning',
  }[tone]

  return (
    <article className="border-line bg-surface shadow-card rounded-2xl border p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-muted text-sm">{label}</p>
          <p className="text-ink mt-1 text-3xl font-semibold tracking-tight tabular-nums">
            {value.toLocaleString()}
          </p>
        </div>
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${toneClass}`}>
          {icon}
        </div>
      </div>
    </article>
  )
}

export function CustomerStatCards({ stats }: { stats: CustomerStats }) {
  const { t } = useTranslation()

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label={t('customers.stats.total')}
        value={stats.total}
        icon={<UsersIcon className="size-5" />}
        tone="brand"
      />
      <StatCard
        label={t('customers.stats.active')}
        value={stats.active}
        icon={<CheckCircleIcon className="size-5" />}
        tone="success"
      />
      <StatCard
        label={t('customers.stats.organizations')}
        value={stats.organization}
        icon={<BuildingIcon className="size-5" />}
        tone="violet"
      />
      <StatCard
        label={t('customers.stats.tourists')}
        value={stats.tourist}
        icon={<MapPinIcon className="size-5" />}
        tone="amber"
      />
    </div>
  )
}
