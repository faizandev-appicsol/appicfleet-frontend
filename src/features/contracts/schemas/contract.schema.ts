import { z } from 'zod'
import type { PageQuery } from '@/types/pagination'

export const contractTypes = ['b2c', 'b2b', 'borrow'] as const
export const contractStatuses = [
  'draft',
  'pending_approval',
  'approved',
  'active',
  'suspended',
  'completed',
  'cancelled',
  'terminated',
] as const

const chargeSchema = z.object({
  id: z.string(),
  kind: z.string(),
  sourceId: z.string(),
  supersededBy: z.string().optional(),
  currency: z.string(),
  unitAmount: z.string(),
  quantityDays: z.number(),
  totalAmount: z.string(),
  rateType: z.string(),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
})

export const contractSchema = z.object({
  id: z.string(),
  contractNumber: z.string(),
  organizationId: z.string(),
  legalEntityId: z.string(),
  branchId: z.string(),
  type: z.string(),
  status: z.string(),
  customerId: z.string(),
  customerName: z.string().optional(),
  customerType: z.string().optional(),
  companyName: z.string().optional(),
  bookingId: z.string().optional(),
  currentVehicleId: z.string().optional(),
  currentPlate: z.string().optional(),
  startsAt: z.string(),
  endsAt: z.string(),
  originalEndsAt: z.string().optional(),
  driverName: z.string().optional(),
  authorizedContactName: z.string().optional(),
  lenderName: z.string().optional(),
  borrowCost: z.string().optional(),
  notes: z.string().optional(),
  acceptedTermsVersionId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type Contract = z.infer<typeof contractSchema>

const assignmentSchema = z.object({
  id: z.string(),
  vehicleId: z.string(),
  vehiclePlate: z.string().optional(),
  startsAt: z.string(),
  endsAt: z.string(),
  closedAt: z.string().optional(),
  status: z.string(),
  assignmentType: z.string().optional(),
  sourceAssignmentId: z.string().optional(),
  reason: z.string(),
})

export const contractDetailSchema = contractSchema.extend({
  assignments: z.array(assignmentSchema),
  charges: z.array(chargeSchema),
  billableCharges: z.array(chargeSchema),
  terms: z.array(z.object({
    id: z.string(),
    version: z.number(),
    content: z.string(),
    status: z.string(),
    createdAt: z.string().optional(),
  })),
  signatures: z.array(z.object({
    id: z.string(),
    termsVersionId: z.string(),
    signerName: z.string(),
    status: z.string(),
    provider: z.string(),
    signedAt: z.string().optional(),
  })),
  extensions: z.array(z.object({
    id: z.string(),
    startsAt: z.string().optional(),
    endsAt: z.string().optional(),
    totalAmount: z.string(),
    currency: z.string(),
    quantityDays: z.number(),
  })),
  replacements: z.array(z.object({
    id: z.string(),
    previousPlate: z.string(),
    replacementPlate: z.string(),
    previousVehicleId: z.string(),
    replacementVehicleId: z.string(),
    reason: z.string(),
    status: z.string(),
    occurredAt: z.string().optional(),
  })),
  amendments: z.array(z.object({
    id: z.string(),
    previousTotal: z.string(),
    newTotal: z.string(),
    newUnitAmount: z.string(),
    currency: z.string(),
    reason: z.string(),
    effectiveAt: z.string().optional(),
  })),
  handover: z.object({
    occurredAt: z.string().optional(),
    mileageKm: z.number(),
    fuelPercent: z.number(),
    condition: z.string(),
    notes: z.string().optional(),
    acknowledged: z.boolean(),
  }).optional(),
  vehicleReturn: z.object({
    occurredAt: z.string().optional(),
    mileageKm: z.number(),
    fuelPercent: z.number(),
    condition: z.string(),
    damageNotes: z.string().optional(),
    acknowledged: z.boolean(),
  }).optional(),
  history: z.array(z.object({
    id: z.string(),
    fromStatus: z.string().optional(),
    toStatus: z.string(),
    reason: z.string().optional(),
    createdAt: z.string().optional(),
  })),
})
export type ContractDetail = z.infer<typeof contractDetailSchema>

export const quoteSchema = z.object({
  currency: z.string(),
  unitAmount: z.string(),
  quantityDays: z.number(),
  totalAmount: z.string(),
  rateType: z.string(),
  kind: z.string(),
}).nullable()

export type ContractListQuery = PageQuery & {
  status?: string
  type?: string
  branchId?: string
  organizationId?: string
  sort?: 'contractNumber' | 'startsAt' | 'endsAt' | 'createdAt' | 'status'
  order?: 'asc' | 'desc'
  activeOnly?: 'true' | 'false'
}

export type ContractWriteBody = {
  organizationId?: string
  type: string
  customerId: string
  vehicleId?: string
  startsAt: string
  endsAt: string
  terms: string
  driverName?: string
  authorizedContactName?: string
  lenderName?: string
  borrowCost?: string
  notes?: string
}
