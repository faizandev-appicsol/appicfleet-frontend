import { z } from 'zod'
import type { PageQuery } from '@/types/pagination'

export const bookingStatuses = [
  'draft',
  'hold',
  'confirmed',
  'cancelled',
  'expired',
  'released',
  'converted',
] as const

export const bookingSources = [
  'admin',
  'website',
  'mobile',
  'api',
  'partner',
  'walk_in',
  'other',
] as const

const pricingSchema = z.object({
  currency: z.string(),
  unitAmount: z.string(),
  quantityDays: z.number(),
  totalAmount: z.string(),
  rateType: z.string(),
})

export const bookingSchema = z.object({
  id: z.string(),
  bookingNumber: z.string(),
  organizationId: z.string(),
  legalEntityId: z.string(),
  branchId: z.string(),
  returnBranchId: z.string(),
  customerId: z.string(),
  customerDisplayName: z.string(),
  vehicleId: z.string().optional(),
  vehiclePlate: z.string().optional(),
  vehicleCategory: z.string().optional(),
  startsAt: z.string(),
  endsAt: z.string(),
  status: z.string(),
  source: z.string(),
  sourceChannel: z.string().optional(),
  campaignReference: z.string().optional(),
  externalReference: z.string().optional(),
  notes: z.string().optional(),
  pricing: pricingSchema.optional(),
  holdExpiresAt: z.string().optional(),
  conversionKey: z.string().optional(),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type Booking = z.infer<typeof bookingSchema>

export const bookingHistorySchema = z.object({
  id: z.string(),
  fromStatus: z.string().optional(),
  toStatus: z.string(),
  reason: z.string().optional(),
  actorUserId: z.string().optional(),
  createdAt: z.string(),
})
export type BookingHistoryEvent = z.infer<typeof bookingHistorySchema>

export const availableVehicleSchema = z.object({
  id: z.string(),
  plateNumber: z.string(),
  make: z.string(),
  model: z.string(),
  year: z.number(),
  category: z.string(),
  status: z.string(),
  ownershipType: z.string(),
  branchId: z.string(),
})
export type AvailableVehicle = z.infer<typeof availableVehicleSchema>

export const availabilityResultSchema = z.object({
  items: z.array(availableVehicleSchema),
  startsAt: z.string(),
  endsAt: z.string(),
})

export const calendarResultSchema = z.object({
  items: z.array(bookingSchema),
  from: z.string(),
  to: z.string(),
  truncated: z.boolean(),
})
export type CalendarResult = z.infer<typeof calendarResultSchema>

export const intakeResultSchema = z.object({
  booking: bookingSchema,
  duplicate: z.boolean(),
})

export type BookingListQuery = PageQuery & {
  status?: string
  source?: string
  branchId?: string
  vehicleId?: string
  customerId?: string
  pickupFrom?: string
  pickupTo?: string
  sort?: 'bookingNumber' | 'startsAt' | 'endsAt' | 'createdAt' | 'status'
  order?: 'asc' | 'desc'
  organizationId?: string
  pickupFrom?: string
  pickupTo?: string
}

export type BookingWriteBody = {
  organizationId?: string
  customerId: string
  vehicleId?: string
  returnBranchId?: string
  startsAt: string
  endsAt: string
  source?: string
  notes?: string
}
