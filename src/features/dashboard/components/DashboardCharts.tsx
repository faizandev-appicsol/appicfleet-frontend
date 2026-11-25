import type { ReactNode } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DashboardOverview } from '@/features/reports/schemas/reports.schema'

const BRAND = 'var(--ui-brand)'
const GREEN = '#16a34a'
const AMBER = '#f59e0b'
const BLUE = '#38bdf8'
const PURPLE = '#8b5cf6'
const PINK = '#ec4899'

const AXIS_STYLE = { fontSize: 11, fill: 'var(--ui-muted)' }
const GRID_STYLE = { stroke: 'var(--ui-line)', strokeDasharray: '3 3' }
const TOOLTIP_STYLE = {
  backgroundColor: 'var(--ui-surface)',
  border: '1px solid var(--ui-line)',
  borderRadius: 12,
  color: 'var(--ui-ink)',
  boxShadow: '0 12px 32px rgb(15 23 42 / 12%)',
}

type RevenuePoint = DashboardOverview['charts']['revenueTrend'][number]
type CountPoint = DashboardOverview['charts']['contractTrend'][number]
type PaymentPoint = DashboardOverview['charts']['paymentTrend'][number]
export type DonutPoint = { name: string; value: number; color: string }

function formatCurrency(value: unknown, currency: string | null, locale: string) {
  const formatted = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(Number(value) || 0)
  return currency ? `${currency} ${formatted}` : formatted
}

function ChartPanel({
  title,
  emptyLabel,
  empty,
  children,
}: {
  title: string
  emptyLabel: string
  empty: boolean
  children: ReactNode
}) {
  return (
    <section className="border-line bg-surface shadow-card min-w-0 rounded-2xl border p-4 sm:p-5">
      <h2 className="text-ink text-sm font-semibold">{title}</h2>
      {empty ? (
        <p className="text-muted grid min-h-60 place-items-center text-sm">{emptyLabel}</p>
      ) : (
        <div className="mt-4 h-60 min-w-0 sm:h-72">{children}</div>
      )}
    </section>
  )
}

export function RevenueLineChart({
  title,
  data,
  currency,
  locale,
  emptyLabel,
}: {
  title: string
  data: RevenuePoint[]
  currency: string | null
  locale: string
  emptyLabel: string
}) {
  const points = data.map((row) => ({ period: row.period, amount: Number(row.amount) || 0 }))
  return (
    <ChartPanel title={title} emptyLabel={emptyLabel} empty={points.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid {...GRID_STYLE} vertical={false} />
          <XAxis dataKey="period" tick={AXIS_STYLE} axisLine={false} tickLine={false} minTickGap={20} />
          <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={48} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value) => formatCurrency(value, currency, locale)}
          />
          <Line
            type="monotone"
            dataKey="amount"
            name={title}
            stroke={BRAND}
            strokeWidth={3}
            dot={{ r: 3, fill: BRAND, strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartPanel>
  )
}

export function RevenueAreaChart({
  title,
  data,
  currency,
  locale,
  emptyLabel,
}: {
  title: string
  data: RevenuePoint[]
  currency: string | null
  locale: string
  emptyLabel: string
}) {
  const points = data.map((row) => ({ period: row.period, amount: Number(row.amount) || 0 }))
  return (
    <ChartPanel title={title} emptyLabel={emptyLabel} empty={points.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="dashboardRevenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND} stopOpacity={0.3} />
              <stop offset="95%" stopColor={BRAND} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid {...GRID_STYLE} vertical={false} />
          <XAxis dataKey="period" tick={AXIS_STYLE} axisLine={false} tickLine={false} minTickGap={20} />
          <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={48} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value) => formatCurrency(value, currency, locale)}
          />
          <Area
            type="monotone"
            dataKey="amount"
            name={title}
            stroke={BRAND}
            strokeWidth={2}
            fill="url(#dashboardRevenueFill)"
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartPanel>
  )
}

export function CountBarChart({
  title,
  data,
  emptyLabel,
}: {
  title: string
  data: CountPoint[]
  emptyLabel: string
}) {
  return (
    <ChartPanel title={title} emptyLabel={emptyLabel} empty={data.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid {...GRID_STYLE} vertical={false} />
          <XAxis dataKey="period" tick={AXIS_STYLE} axisLine={false} tickLine={false} minTickGap={20} />
          <YAxis allowDecimals={false} tick={AXIS_STYLE} axisLine={false} tickLine={false} width={38} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'var(--ui-muted)', opacity: 0.1 }} />
          <Bar dataKey="count" name={title} fill={BRAND} radius={[7, 7, 0, 0]} maxBarSize={38} />
        </BarChart>
      </ResponsiveContainer>
    </ChartPanel>
  )
}

export function DonutChart({
  title,
  data,
  emptyLabel,
}: {
  title: string
  data: DonutPoint[]
  emptyLabel: string
}) {
  return (
    <ChartPanel title={title} emptyLabel={emptyLabel} empty={data.length === 0 || data.every((item) => item.value === 0)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="58%"
            outerRadius="82%"
            paddingAngle={3}
            stroke="none"
          >
            {data.map((item, index) => (
              <Cell key={`${item.name}-${index}`} fill={item.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartPanel>
  )
}

export function VehicleUtilizationChart({
  title,
  label,
  percentage,
  emptyLabel,
}: {
  title: string
  label: string
  percentage: number | null
  emptyLabel: string
}) {
  const value = percentage == null ? 0 : Math.max(0, Math.min(100, percentage))
  return (
    <ChartPanel title={title} emptyLabel={emptyLabel} empty={percentage == null}>
      <div className="relative h-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            data={[{ name: label, value, fill: BRAND }]}
            innerRadius="72%"
            outerRadius="96%"
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" background={{ fill: 'var(--ui-muted)', opacity: 0.14 }} cornerRadius={18} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
          <span className="text-ink text-3xl font-semibold tabular-nums">{value}%</span>
          <span className="text-muted mt-1 text-xs">{label}</span>
        </div>
      </div>
    </ChartPanel>
  )
}

export function PaymentStackedChart({
  title,
  paidLabel,
  pendingLabel,
  data,
  currency,
  locale,
  emptyLabel,
}: {
  title: string
  paidLabel: string
  pendingLabel: string
  data: PaymentPoint[]
  currency: string | null
  locale: string
  emptyLabel: string
}) {
  const points = data.map((row) => ({
    period: row.period,
    paid: Number(row.paid) || 0,
    pending: Number(row.pending) || 0,
  }))
  return (
    <ChartPanel title={title} emptyLabel={emptyLabel} empty={points.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={points} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid {...GRID_STYLE} vertical={false} />
          <XAxis dataKey="period" tick={AXIS_STYLE} axisLine={false} tickLine={false} minTickGap={20} />
          <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={48} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ fill: 'var(--ui-muted)', opacity: 0.1 }}
            formatter={(value) => formatCurrency(value, currency, locale)}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="paid" name={paidLabel} stackId="payments" fill={GREEN} radius={[0, 0, 0, 0]} />
          <Bar dataKey="pending" name={pendingLabel} stackId="payments" fill={AMBER} radius={[7, 7, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartPanel>
  )
}

export const dashboardChartColors = {
  available: GREEN,
  rented: BRAND,
  maintenance: AMBER,
  reserved: BLUE,
  other: PURPLE,
  b2c: BRAND,
  b2b: BLUE,
  borrow: GREEN,
  oldContract: PINK,
  contractsOther: AMBER,
}
