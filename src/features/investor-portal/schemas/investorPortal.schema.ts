import { z } from 'zod'

export const investorProfileSchema = z.object({
  id: z.string(),
  investorNumber: z.string(),
  displayName: z.string(),
  legalName: z.string().nullable().optional(),
  contactEmail: z.string(),
  phone: z.string().nullable().optional(),
  status: z.string(),
  organizationId: z.string(),
  accessStartsAt: z.string().nullable().optional(),
  accessEndsAt: z.string().nullable().optional(),
})

export const investorOverviewSchema = z.object({
  generatedAt: z.string(),
  investor: investorProfileSchema,
  kpis: z.object({
    fleetSize: z.number(),
    activeVehicles: z.number(),
    utilizationPercent: z.number().nullable(),
    revenue: z.string().nullable(),
    currency: z.string().nullable(),
    activeContracts: z.number(),
    averageRevenuePerVehicle: z.string().nullable(),
  }),
  charts: z.object({
    fleetStatus: z.record(z.string(), z.number()),
    revenueTrend: z.array(
      z.object({
        period: z.string(),
        amount: z.string(),
        count: z.number(),
      }),
    ),
  }),
  permissions: z.object({
    financial: z.boolean(),
    reports: z.array(z.string()),
  }),
})

export type InvestorOverview = z.infer<typeof investorOverviewSchema>
export type InvestorProfile = z.infer<typeof investorProfileSchema>

export const investorFleetItemSchema = z.object({
  id: z.string(),
  plateNumber: z.string(),
  make: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  year: z.number().optional().nullable(),
  category: z.string(),
  status: z.string(),
  branchId: z.string(),
  legalEntityId: z.string(),
  currentContractNumber: z.string().nullable().optional(),
  available: z.boolean().optional(),
})

export const investorContractItemSchema = z.object({
  id: z.string(),
  contractNumber: z.string(),
  vehiclePlate: z.string().nullable().optional(),
  vehicleId: z.string().nullable().optional(),
  startsAt: z.string(),
  endsAt: z.string(),
  status: z.string(),
  branchId: z.string(),
  customerName: z.string().nullable().optional(),
  outstandingBalance: z.string().nullable().optional(),
  currency: z.string().nullable().optional(),
})

export const investorFinancialSchema = z.object({
  generatedAt: z.string(),
  revenue: z.string().nullable().optional(),
  currency: z.string().nullable().optional(),
  invoiceCount: z.number().optional(),
  payments: z.string().nullable().optional(),
  paymentCount: z.number().optional(),
  outstandingReceivables: z.string().nullable().optional(),
  note: z.string().optional(),
  expensesAvailable: z.boolean().optional(),
  netPerformanceAvailable: z.boolean().optional(),
})

export type InvestorFinancial = z.infer<typeof investorFinancialSchema>
