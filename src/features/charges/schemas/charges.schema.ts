import { z } from 'zod'

const money = z.string()
const iso = z.string()

const historySchema = z.array(
  z.object({
    id: z.string(),
    fromStatus: z.string().optional(),
    toStatus: z.string(),
    reason: z.string().optional(),
    createdAt: iso.optional(),
  }),
)

const disputeSchema = z.array(
  z.object({
    id: z.string(),
    status: z.string(),
    reason: z.string(),
    description: z.string().optional(),
    resolution: z.string().optional(),
    createdAt: iso.optional(),
    resolvedAt: iso.optional(),
  }),
)

export const fineSchema = z.object({
  id: z.string(),
  documentNumber: z.string().optional(),
  organizationId: z.string(),
  legalEntityId: z.string(),
  branchId: z.string(),
  externalReference: z.string(),
  provider: z.string(),
  fineType: z.string(),
  source: z.string(),
  eventAt: iso,
  receivedAt: iso,
  vehicleId: z.string().optional(),
  vehiclePlate: z.string().optional(),
  assignmentId: z.string().optional(),
  contractId: z.string().optional(),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  assignmentResolution: z.string(),
  reviewReason: z.string().optional(),
  currency: z.string(),
  amount: money,
  description: z.string().optional(),
  location: z.string().optional(),
  authority: z.string().optional(),
  status: z.string(),
  recoveryId: z.string().optional(),
  recoveryAmount: money.optional(),
  createdAt: iso,
  updatedAt: iso,
})
export type Fine = z.infer<typeof fineSchema>

export const fineDetailSchema = fineSchema.extend({
  history: historySchema.optional(),
  disputes: disputeSchema.optional(),
})
export type FineDetail = z.infer<typeof fineDetailSchema>

export const tollSchema = z.object({
  id: z.string(),
  documentNumber: z.string().optional(),
  organizationId: z.string(),
  legalEntityId: z.string(),
  branchId: z.string(),
  externalReference: z.string(),
  provider: z.string(),
  source: z.string(),
  eventAt: iso,
  receivedAt: iso,
  vehicleId: z.string().optional(),
  vehiclePlate: z.string().optional(),
  assignmentId: z.string().optional(),
  contractId: z.string().optional(),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  assignmentResolution: z.string(),
  reviewReason: z.string().optional(),
  currency: z.string(),
  amount: money,
  location: z.string().optional(),
  gate: z.string().optional(),
  description: z.string().optional(),
  status: z.string(),
  recoveryId: z.string().optional(),
  recoveryAmount: money.optional(),
  createdAt: iso,
  updatedAt: iso,
})
export type Toll = z.infer<typeof tollSchema>

export const tollDetailSchema = tollSchema.extend({
  history: historySchema.optional(),
  disputes: disputeSchema.optional(),
})
export type TollDetail = z.infer<typeof tollDetailSchema>

export const refundSchema = z.object({
  id: z.string(),
  documentNumber: z.string().optional(),
  organizationId: z.string(),
  legalEntityId: z.string(),
  branchId: z.string(),
  customerId: z.string(),
  customerName: z.string().optional(),
  contractId: z.string().optional(),
  sourceKind: z.string(),
  depositId: z.string().optional(),
  paymentId: z.string().optional(),
  currency: z.string(),
  amount: money,
  reason: z.string(),
  notes: z.string().optional(),
  status: z.string(),
  evidenceKey: z.string().optional(),
  idempotencyKey: z.string().optional(),
  externalReference: z.string().optional(),
  createdAt: iso,
  updatedAt: iso,
})
export type Refund = z.infer<typeof refundSchema>

export const refundDetailSchema = refundSchema.extend({
  history: historySchema.optional(),
})
export type RefundDetail = z.infer<typeof refundDetailSchema>

export const importBatchSchema = z.object({
  id: z.string(),
  documentNumber: z.string().optional(),
  organizationId: z.string(),
  legalEntityId: z.string(),
  branchId: z.string(),
  provider: z.string(),
  kind: z.string(),
  fileName: z.string().optional(),
  status: z.string(),
  totalRows: z.number(),
  successRows: z.number(),
  duplicateRows: z.number(),
  failedRows: z.number(),
  reviewRows: z.number().optional(),
  errorSummary: z.string().optional(),
  createdAt: iso.optional(),
  updatedAt: iso.optional(),
})
export type ImportBatch = z.infer<typeof importBatchSchema>

export const importBatchDetailSchema = importBatchSchema.extend({
  rows: z
    .array(
      z.object({
        id: z.string(),
        rowNumber: z.number(),
        result: z.string(),
        externalReference: z.string().optional(),
        reason: z.string().optional(),
        createdRecordId: z.string().optional(),
        existingRecordId: z.string().optional(),
      }),
    )
    .optional(),
})
export type ImportBatchDetail = z.infer<typeof importBatchDetailSchema>

export type FineWriteBody = {
  legalEntityId?: string
  branchId?: string
  externalReference: string
  provider: string
  fineType: string
  source?: string
  eventAt: string
  vehicleId?: string
  vehiclePlate?: string
  amount: string
  currency?: string
  description?: string
  location?: string
  authority?: string
}

export type TollWriteBody = {
  legalEntityId?: string
  branchId?: string
  externalReference: string
  provider: string
  source?: string
  eventAt: string
  vehicleId?: string
  vehiclePlate?: string
  amount: string
  currency?: string
  location?: string
  gate?: string
  description?: string
}

export type RefundWriteBody = {
  legalEntityId: string
  branchId: string
  customerId: string
  contractId?: string
  sourceKind: string
  depositId?: string
  paymentId?: string
  amount: string
  currency?: string
  reason: string
  notes?: string
  idempotencyKey: string
}

export type ImportWriteBody = {
  legalEntityId: string
  branchId: string
  kind: string
  provider: string
  fileName?: string
  rows: Array<{
    externalReference: string
    vehicleRegistration?: string
    vehicleId?: string
    eventAt: string
    amount: string
    currency?: string
    type?: string
    provider?: string
    location?: string
    description?: string
    gate?: string
  }>
}

export type ListQuery = {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  fineType?: string
  provider?: string
  sort?: string
  order?: 'asc' | 'desc'
}
