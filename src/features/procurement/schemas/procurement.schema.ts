import { z } from 'zod'

const money = z.string()
const iso = z.string()

export const vendorSchema = z.object({
  id: z.string(),
  vendorCode: z.string(),
  name: z.string(),
  organizationId: z.string(),
  legalEntityId: z.string(),
  branchId: z.string(),
  vendorType: z.string(),
  partyKind: z.string(),
  status: z.string(),
  phone: z.string().optional(),
  email: z.string().optional(),
  paymentTerms: z.string(),
  taxRegistration: z.string().optional(),
  notes: z.string().optional(),
  createdAt: iso,
  updatedAt: iso,
})
export type Vendor = z.infer<typeof vendorSchema>

export const vendorDetailSchema = vendorSchema.extend({
  contacts: z
    .array(
      z.object({
        id: z.string().optional(),
        role: z.string(),
        name: z.string(),
        phone: z.string().optional(),
        email: z.string().optional(),
        isPrimary: z.boolean().optional(),
      }),
    )
    .optional(),
  documents: z
    .array(
      z.object({
        id: z.string(),
        documentType: z.string(),
        fileName: z.string(),
        createdAt: iso.optional(),
      }),
    )
    .optional(),
  financial: z
    .object({
      totalBilled: money,
      totalPaid: money,
    })
    .optional(),
  lpos: z.array(z.record(z.string(), z.unknown())).optional(),
  workOrders: z.array(z.record(z.string(), z.unknown())).optional(),
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
    .optional(),
})
export type VendorDetail = z.infer<typeof vendorDetailSchema>

export const lpoSchema = z.object({
  id: z.string(),
  documentNumber: z.string().optional(),
  organizationId: z.string(),
  legalEntityId: z.string(),
  branchId: z.string(),
  vendorId: z.string(),
  vendorName: z.string(),
  orderDate: iso,
  expectedAt: iso.optional(),
  currency: z.string(),
  paymentTerms: z.string(),
  status: z.string(),
  subtotal: money,
  discountTotal: money,
  taxableAmount: money,
  taxAmount: money,
  totalAmount: money,
  approvalLevel: z.string().optional(),
  notes: z.string().optional(),
  workOrderId: z.string().optional(),
  createdAt: iso,
  updatedAt: iso,
})
export type Lpo = z.infer<typeof lpoSchema>

export const lpoDetailSchema = lpoSchema.extend({
  lines: z.array(
    z.object({
      id: z.string(),
      description: z.string(),
      quantity: z.number(),
      unitPrice: money,
      discountAmount: money,
      taxRatePercent: money,
      lineSubtotal: money,
      taxableAmount: money,
      taxAmount: money,
      lineTotal: money,
      billedQuantity: z.number(),
      vehicleId: z.string().optional(),
      sortOrder: z.number(),
    }),
  ),
  history: z.array(
    z.object({
      id: z.string(),
      fromStatus: z.string().optional(),
      toStatus: z.string(),
      reason: z.string().optional(),
      createdAt: iso.optional(),
    }),
  ),
})
export type LpoDetail = z.infer<typeof lpoDetailSchema>

export const vendorBillSchema = z.object({
  id: z.string(),
  documentNumber: z.string().optional(),
  organizationId: z.string(),
  legalEntityId: z.string(),
  branchId: z.string(),
  vendorId: z.string(),
  vendorName: z.string(),
  vendorInvoiceNumber: z.string(),
  lpoId: z.string().optional(),
  workOrderId: z.string().optional(),
  currency: z.string(),
  billDate: iso,
  dueDate: iso,
  status: z.string(),
  matchResult: z.string().optional(),
  subtotal: money,
  discountTotal: money,
  taxableAmount: money,
  taxAmount: money,
  totalAmount: money,
  paidAmount: money,
  outstandingAmount: money,
  paymentStatus: z.string(),
  notes: z.string().optional(),
  createdAt: iso,
  updatedAt: iso,
})
export type VendorBill = z.infer<typeof vendorBillSchema>

export const vendorBillDetailSchema = vendorBillSchema.extend({
  lines: z.array(
    z.object({
      id: z.string(),
      description: z.string(),
      quantity: z.number(),
      unitPrice: money,
      discountAmount: money,
      taxRatePercent: money,
      lineSubtotal: money,
      taxableAmount: money,
      taxAmount: money,
      lineTotal: money,
      lpoLineId: z.string().optional(),
      sortOrder: z.number(),
    }),
  ),
  history: z.array(
    z.object({
      id: z.string(),
      fromStatus: z.string().optional(),
      toStatus: z.string(),
      reason: z.string().optional(),
      createdAt: iso.optional(),
    }),
  ),
})
export type VendorBillDetail = z.infer<typeof vendorBillDetailSchema>

export const expenseSchema = z.object({
  id: z.string(),
  documentNumber: z.string().optional(),
  organizationId: z.string(),
  legalEntityId: z.string(),
  branchId: z.string(),
  categoryCode: z.string(),
  vendorId: z.string().optional(),
  vendorName: z.string().optional(),
  vehicleId: z.string().optional(),
  vehiclePlate: z.string().optional(),
  contractId: z.string().optional(),
  currency: z.string(),
  expenseDate: iso,
  description: z.string(),
  status: z.string(),
  amount: money,
  taxRatePercent: money,
  taxAmount: money,
  totalAmount: money,
  notes: z.string().optional(),
  createdAt: iso,
  updatedAt: iso,
})
export type Expense = z.infer<typeof expenseSchema>

export const expenseDetailSchema = expenseSchema.extend({
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
    .optional(),
})
export type ExpenseDetail = z.infer<typeof expenseDetailSchema>

export const workOrderSchema = z.object({
  id: z.string(),
  documentNumber: z.string().optional(),
  organizationId: z.string(),
  legalEntityId: z.string(),
  branchId: z.string(),
  vehicleId: z.string(),
  vehiclePlate: z.string(),
  vendorId: z.string().optional(),
  vendorName: z.string().optional(),
  lpoId: z.string().optional(),
  serviceType: z.string(),
  priority: z.string(),
  status: z.string(),
  description: z.string(),
  issue: z.string().optional(),
  requestedAt: iso.optional(),
  scheduledAt: iso.optional(),
  startedAt: iso.optional(),
  completedAt: iso.optional(),
  downtimeStartsAt: iso.optional(),
  downtimeEndsAt: iso.optional(),
  estimatedCost: money,
  actualCost: money.optional(),
  currency: z.string(),
  notes: z.string().optional(),
  createdAt: iso,
  updatedAt: iso,
})
export type WorkOrder = z.infer<typeof workOrderSchema>

export const workOrderDetailSchema = workOrderSchema.extend({
  lines: z.array(
    z.object({
      id: z.string(),
      kind: z.string(),
      description: z.string(),
      quantity: z.number(),
      unitPrice: money,
      lineTotal: money,
      sortOrder: z.number(),
    }),
  ),
  history: z.array(
    z.object({
      id: z.string(),
      fromStatus: z.string().optional(),
      toStatus: z.string(),
      reason: z.string().optional(),
      createdAt: iso.optional(),
    }),
  ),
})
export type WorkOrderDetail = z.infer<typeof workOrderDetailSchema>

export const reminderSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  legalEntityId: z.string(),
  branchId: z.string(),
  vehicleId: z.string(),
  vehiclePlate: z.string(),
  serviceType: z.string(),
  basis: z.string(),
  dueAt: iso.optional(),
  dueMileage: z.number().optional(),
  intervalDays: z.number().optional(),
  intervalKm: z.number().optional(),
  status: z.string(),
  notes: z.string().optional(),
  completedAt: iso.optional(),
  workOrderId: z.string().optional(),
  createdAt: iso.optional(),
})
export type Reminder = z.infer<typeof reminderSchema>

export type ListQuery = {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  sort?: string
  order?: 'asc' | 'desc'
  vendorId?: string
  vehicleId?: string
  branchId?: string
  categoryCode?: string
  paymentStatus?: string
  priority?: string
  serviceType?: string
  vendorType?: string
}

export type VendorWriteBody = {
  legalEntityId: string
  branchId: string
  name: string
  vendorType: string
  partyKind?: string
  phone?: string
  email?: string
  paymentTerms?: string
  taxRegistration?: string
  notes?: string
  contacts?: Array<{ role: string; name: string; phone?: string; email?: string; isPrimary?: boolean }>
}

export type LpoWriteBody = {
  vendorId: string
  orderDate: string
  expectedAt?: string
  currency?: string
  paymentTerms?: string
  notes?: string
  workOrderId?: string
  lines: Array<{
    description: string
    quantity: number
    unitPrice: string
    discountAmount?: string
    taxRatePercent?: string
    vehicleId?: string
  }>
}

export type VendorBillWriteBody = {
  vendorId: string
  vendorInvoiceNumber: string
  lpoId?: string
  workOrderId?: string
  billDate: string
  dueDate: string
  currency?: string
  notes?: string
  lines: Array<{
    description: string
    quantity: number
    unitPrice: string
    discountAmount?: string
    taxRatePercent?: string
    lpoLineId?: string
  }>
}

export type ExpenseWriteBody = {
  legalEntityId: string
  branchId: string
  categoryCode: string
  vendorId?: string
  vehicleId?: string
  contractId?: string
  currency?: string
  expenseDate: string
  description: string
  amount: string
  taxRatePercent?: string
  notes?: string
}

export type WorkOrderWriteBody = {
  vehicleId: string
  vendorId?: string
  lpoId?: string
  serviceType: string
  priority?: string
  description: string
  issue?: string
  estimatedCost?: string
  currency?: string
  notes?: string
  lines?: Array<{ kind: string; description: string; quantity: number; unitPrice: string }>
}

export type ReminderWriteBody = {
  vehicleId: string
  serviceType: string
  basis: string
  dueAt?: string
  dueMileage?: number
  intervalDays?: number
  intervalKm?: number
  notes?: string
}
