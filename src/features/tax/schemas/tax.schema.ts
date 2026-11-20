import { z } from 'zod'

const money = z.string()
const iso = z.string()

export const taxCodeSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  legalEntityId: z.string().optional(),
  code: z.string(),
  name: z.string(),
  description: z.string().optional(),
  treatment: z.string(),
  isActive: z.boolean(),
  isSystem: z.boolean().optional(),
  createdAt: iso.optional(),
  updatedAt: iso.optional(),
})
export type TaxCode = z.infer<typeof taxCodeSchema>

export const taxPeriodSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  legalEntityId: z.string(),
  taxYear: z.number(),
  name: z.string(),
  periodNumber: z.number(),
  startDate: iso,
  endDate: iso,
  status: z.string(),
  lockReason: z.string().optional(),
  createdAt: iso.optional(),
})
export type TaxPeriod = z.infer<typeof taxPeriodSchema>

export const taxTransactionSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  legalEntityId: z.string(),
  branchId: z.string(),
  sourceType: z.string(),
  sourceId: z.string(),
  documentNumber: z.string().optional(),
  customerId: z.string().optional(),
  customerDisplayName: z.string().optional(),
  transactionDate: iso,
  taxCode: z.string(),
  taxRatePercent: money,
  taxTreatment: z.string(),
  taxableAmount: money,
  taxAmount: money,
  grossAmount: money,
  currency: z.string(),
  taxPeriodId: z.string().optional(),
  pricingMode: z.string(),
  createdAt: iso.optional(),
})
export type TaxTransaction = z.infer<typeof taxTransactionSchema>

export const einvoiceSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  legalEntityId: z.string(),
  branchId: z.string(),
  sourceType: z.string(),
  sourceId: z.string(),
  documentNumber: z.string().optional(),
  customerId: z.string().optional(),
  customerDisplayName: z.string().optional(),
  issueDate: iso,
  currency: z.string(),
  taxableAmount: money,
  taxAmount: money,
  totalAmount: money,
  status: z.string(),
  provider: z.string().optional(),
  environment: z.string().optional(),
  providerReference: z.string().optional(),
  documentVersion: z.number().optional(),
  failureClass: z.string().optional(),
  failureReason: z.string().optional(),
  validationErrors: z.array(z.object({ code: z.string().optional(), message: z.string().optional(), field: z.string().optional() })).optional(),
  submittedAt: iso.optional(),
  acceptedAt: iso.optional(),
  rejectedAt: iso.optional(),
  createdAt: iso.optional(),
  updatedAt: iso.optional(),
})
export type EInvoice = z.infer<typeof einvoiceSchema>

export const taxOverviewSchema = z.object({
  currentPeriod: taxPeriodSchema.nullable(),
  taxableSales: money,
  outputVat: money,
  adjustments: money,
  transactionCount: z.number(),
  openIssues: z.number(),
  einvoiceStatusCounts: z.record(z.string(), z.number()),
})

export type ListQuery = {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  legalEntityId?: string
  taxPeriodId?: string
  taxCode?: string
  sort?: string
  order?: 'asc' | 'desc'
}
