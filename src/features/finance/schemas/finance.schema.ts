import { z } from 'zod'

const money = z.string()
const iso = z.string()

export const invoiceSchema = z.object({
  id: z.string(),
  documentNumber: z.string().optional(),
  organizationId: z.string(),
  legalEntityId: z.string(),
  branchId: z.string(),
  customerId: z.string(),
  customerName: z.string().optional(),
  contractId: z.string().optional(),
  currency: z.string(),
  documentDate: iso,
  dueDate: iso,
  status: z.string(),
  paymentStatus: z.string().optional(),
  subtotal: money,
  discountTotal: money,
  taxableAmount: money,
  taxAmount: money,
  totalAmount: money,
  paidAmount: money,
  creditedAmount: money.optional(),
  outstandingAmount: money,
  notes: z.string().optional(),
  postedAt: iso.optional(),
  createdAt: iso,
  updatedAt: iso,
})

export const invoiceLineSchema = z.object({
  id: z.string(),
  description: z.string(),
  quantity: z.number(),
  unitPrice: money,
  discountAmount: money,
  taxRatePercent: money,
  taxCode: z.string().optional(),
  taxCodeId: z.string().optional(),
  taxTreatment: z.string().optional(),
  taxCategory: z.string().optional(),
  pricingMode: z.string().optional(),
  lineSubtotal: money,
  taxableAmount: money,
  taxAmount: money,
  lineTotal: money,
  sourceType: z.string().optional(),
  sourceId: z.string().optional(),
  sortOrder: z.number(),
})

export const taxSummaryRowSchema = z.object({
  taxCode: z.string(),
  taxRatePercent: money,
  taxTreatment: z.string().optional(),
  taxableAmount: money,
  taxAmount: money,
})

export const invoiceDetailSchema = invoiceSchema.extend({
  lines: z.array(invoiceLineSchema).default([]),
  taxSummary: z.array(taxSummaryRowSchema).default([]),
  allocations: z
    .array(z.object({ id: z.string(), paymentId: z.string(), amount: money, createdAt: iso.optional() }))
    .default([]),
  history: z
    .array(
      z.object({
        id: z.string(),
        fromStatus: z.string().optional(),
        toStatus: z.string(),
        reason: z.string().optional(),
        createdAt: iso.optional(),
      }),
    )
    .default([]),
})

export const paymentSchema = z.object({
  id: z.string(),
  paymentNumber: z.string().optional(),
  organizationId: z.string(),
  legalEntityId: z.string(),
  branchId: z.string(),
  customerId: z.string(),
  customerName: z.string().optional(),
  currency: z.string(),
  amount: money,
  allocatedAmount: money,
  unallocatedAmount: money,
  method: z.string(),
  paymentDate: iso,
  status: z.string(),
  externalReference: z.string().optional(),
  notes: z.string().optional(),
  completedAt: iso.optional(),
  createdAt: iso,
  updatedAt: iso,
})

export const paymentDetailSchema = paymentSchema.extend({
  allocations: z
    .array(z.object({ id: z.string(), invoiceId: z.string(), amount: money, createdAt: iso.optional() }))
    .default([]),
  receipt: z
    .object({
      id: z.string(),
      receiptNumber: z.string(),
      amount: money,
      status: z.string(),
    })
    .nullable()
    .optional(),
  history: z
    .array(
      z.object({
        id: z.string(),
        fromStatus: z.string().optional(),
        toStatus: z.string(),
        reason: z.string().optional(),
        createdAt: iso.optional(),
      }),
    )
    .default([]),
})

export const receiptSchema = z.object({
  id: z.string(),
  receiptNumber: z.string(),
  organizationId: z.string(),
  legalEntityId: z.string(),
  branchId: z.string(),
  paymentId: z.string(),
  customerId: z.string(),
  customerName: z.string().optional(),
  currency: z.string(),
  amount: money,
  method: z.string(),
  issuedAt: iso,
  status: z.string(),
  notes: z.string().optional(),
  createdAt: iso,
  updatedAt: iso,
})

export const noteSchema = z.object({
  id: z.string(),
  documentNumber: z.string().optional(),
  organizationId: z.string(),
  legalEntityId: z.string(),
  branchId: z.string(),
  customerId: z.string(),
  customerName: z.string().optional(),
  invoiceId: z.string().optional(),
  contractId: z.string().optional(),
  currency: z.string(),
  documentDate: iso,
  reason: z.string(),
  status: z.string(),
  subtotal: money,
  discountTotal: money,
  taxableAmount: money,
  taxAmount: money,
  totalAmount: money,
  notes: z.string().optional(),
  postedAt: iso.optional(),
  createdAt: iso,
  updatedAt: iso,
})

export const noteDetailSchema = noteSchema.extend({
  lines: z.array(invoiceLineSchema).default([]),
  history: z
    .array(
      z.object({
        id: z.string(),
        fromStatus: z.string().optional(),
        toStatus: z.string(),
        reason: z.string().optional(),
        createdAt: iso.optional(),
      }),
    )
    .default([]),
})

export const depositSchema = z.object({
  id: z.string(),
  depositNumber: z.string(),
  organizationId: z.string(),
  legalEntityId: z.string(),
  branchId: z.string(),
  customerId: z.string(),
  customerName: z.string().optional(),
  contractId: z.string(),
  currency: z.string(),
  amount: money,
  appliedAmount: money,
  releasedAmount: money,
  remainingAmount: money,
  status: z.string(),
  paymentId: z.string().optional(),
  heldAt: iso,
  releasedAt: iso.optional(),
  notes: z.string().optional(),
  createdAt: iso,
  updatedAt: iso,
})

export const depositDetailSchema = depositSchema.extend({
  events: z
    .array(
      z.object({
        id: z.string(),
        kind: z.string(),
        amount: money,
        invoiceId: z.string().optional(),
        reason: z.string().optional(),
        createdAt: iso.optional(),
      }),
    )
    .default([]),
})

export type Invoice = z.infer<typeof invoiceSchema>
export type InvoiceDetail = z.infer<typeof invoiceDetailSchema>
export type Payment = z.infer<typeof paymentSchema>
export type PaymentDetail = z.infer<typeof paymentDetailSchema>
export type Receipt = z.infer<typeof receiptSchema>
export type CreditNote = z.infer<typeof noteSchema>
export type DebitNote = z.infer<typeof noteSchema>
export type NoteDetail = z.infer<typeof noteDetailSchema>
export type Deposit = z.infer<typeof depositSchema>
export type DepositDetail = z.infer<typeof depositDetailSchema>

export type InvoiceListQuery = {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  paymentStatus?: string
  branchId?: string
  customerId?: string
  contractId?: string
  sort?: string
  order?: 'asc' | 'desc'
}

export type PaymentListQuery = {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  method?: string
  branchId?: string
  customerId?: string
  invoiceId?: string
  sort?: string
  order?: 'asc' | 'desc'
}

export type DepositListQuery = {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  branchId?: string
  customerId?: string
  contractId?: string
  sort?: string
  order?: 'asc' | 'desc'
}

export type InvoiceWriteBody = {
  customerId: string
  contractId?: string
  currency?: string
  documentDate: string
  dueDate: string
  notes?: string
  lines: Array<{
    description: string
    quantity: number
    unitPrice: string
    discountAmount?: string
    taxRatePercent?: string
  }>
  chargeIds?: string[]
}

export type PaymentWriteBody = {
  customerId: string
  currency?: string
  amount: string
  method: string
  paymentDate: string
  externalReference?: string
  notes?: string
  idempotencyKey?: string
  allocations?: Array<{ invoiceId: string; amount: string }>
}
