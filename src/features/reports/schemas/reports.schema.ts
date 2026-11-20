import { z } from 'zod'

const money = z.string()
const iso = z.string()

export const reportFiltersSchema = z.object({
  preset: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  branchId: z.string().optional(),
  legalEntityId: z.string().optional(),
  organizationId: z.string().optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
  status: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  customerId: z.string().optional(),
  vehicleId: z.string().optional(),
  category: z.string().optional(),
  method: z.string().optional(),
  kind: z.string().optional(),
  upcomingWindow: z.string().optional(),
  groupBy: z.string().optional(),
  dimension: z.string().optional(),
  taxPeriodId: z.string().optional(),
})

export type ReportFilters = z.infer<typeof reportFiltersSchema>

export const kpiMoneySchema = z
  .object({
    amount: money.nullable().optional(),
    previousAmount: money.nullable().optional(),
    changePercent: z.number().nullable().optional(),
    currency: z.string().nullable().optional(),
    count: z.number().optional(),
    source: z.string().optional(),
    definition: z.string().optional(),
  })
  .nullable()
  .optional()

export const dashboardOverviewSchema = z.object({
  generatedAt: iso,
  filters: z.object({
    preset: z.string(),
    from: iso,
    toExclusive: iso,
    timezone: z.string(),
    organizationId: z.string(),
    branchId: z.string().nullable(),
    legalEntityId: z.string().nullable(),
  }),
  permissions: z.object({ financial: z.boolean() }),
  kpis: z.object({
    revenue: kpiMoneySchema,
    bookings: z.object({
      total: z.number(),
      previousTotal: z.number(),
      changePercent: z.number().nullable(),
      byStatus: z.record(z.string(), z.number()),
    }),
    activeContracts: z.object({
      count: z.number(),
      overdueCount: z.number(),
    }),
    fleetUtilization: z.object({
      rented: z.number(),
      eligible: z.number(),
      available: z.number(),
      utilizationPercent: z.number().nullable(),
      definition: z.string().optional(),
    }),
    outstandingReceivables: kpiMoneySchema,
    payments: z
      .object({
        amount: money.nullable().optional(),
        count: z.number(),
      })
      .nullable()
      .optional(),
  }),
  charts: z.object({
    groupBy: z.string(),
    revenueTrend: z.array(z.object({ period: z.string(), amount: money, count: z.number() })),
    bookingTrend: z.array(z.object({ period: z.string(), count: z.number() })),
    fleetStatus: z.record(z.string(), z.number()),
  }),
  operational: z.object({
    upcomingReturns: z.array(z.record(z.string(), z.unknown())),
    overdueContracts: z.array(z.record(z.string(), z.unknown())),
  }),
  recent: z.object({
    bookings: z.array(z.record(z.string(), z.unknown())),
    payments: z.array(z.record(z.string(), z.unknown())),
    contracts: z.array(z.record(z.string(), z.unknown())),
  }),
})

export type DashboardOverview = z.infer<typeof dashboardOverviewSchema>

export const reportRowSchema = z.record(z.string(), z.unknown())
