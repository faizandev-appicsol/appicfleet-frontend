import { z } from 'zod'

const money = z.string()
const iso = z.string()

export const accountSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  legalEntityId: z.string().optional(),
  code: z.string(),
  name: z.string(),
  accountType: z.string(),
  normalBalance: z.string(),
  parentAccountId: z.string().optional(),
  description: z.string().optional(),
  isSystem: z.boolean().optional(),
  systemRole: z.string().optional(),
  isActive: z.boolean(),
  createdAt: iso,
  updatedAt: iso,
})
export type Account = z.infer<typeof accountSchema>

export const journalLineSchema = z.object({
  id: z.string().optional(),
  lineNumber: z.number().optional(),
  accountId: z.string(),
  accountCode: z.string().optional(),
  accountName: z.string().optional(),
  debit: money,
  credit: money,
  description: z.string().optional(),
  customerId: z.string().optional(),
  vendorId: z.string().optional(),
})

export const journalSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  legalEntityId: z.string(),
  branchId: z.string(),
  journalNumber: z.string().optional(),
  journalType: z.string(),
  accountingDate: iso,
  postingDate: iso.optional(),
  description: z.string(),
  reference: z.string().optional(),
  sourceModule: z.string(),
  sourceType: z.string().optional(),
  sourceId: z.string().optional(),
  status: z.string(),
  currency: z.string(),
  totalDebit: money,
  totalCredit: money,
  reversedJournalId: z.string().optional(),
  reversalOfJournalId: z.string().optional(),
  createdAt: iso,
  updatedAt: iso,
})
export type Journal = z.infer<typeof journalSchema>

export const journalDetailSchema = journalSchema.extend({
  lines: z.array(journalLineSchema).optional(),
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
export type JournalDetail = z.infer<typeof journalDetailSchema>

export const fiscalPeriodSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  legalEntityId: z.string(),
  fiscalYearId: z.string(),
  name: z.string(),
  periodNumber: z.number(),
  startDate: iso,
  endDate: iso,
  status: z.string(),
  closeReason: z.string().optional(),
  reopenReason: z.string().optional(),
  createdAt: iso.optional(),
})
export type FiscalPeriod = z.infer<typeof fiscalPeriodSchema>

export const fiscalYearSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  legalEntityId: z.string(),
  name: z.string(),
  startDate: iso,
  endDate: iso,
  status: z.string(),
  createdAt: iso.optional(),
})
export type FiscalYear = z.infer<typeof fiscalYearSchema>

export const overviewSchema = z.object({
  currentPeriod: z
    .object({
      id: z.string(),
      name: z.string(),
      status: z.string(),
      startDate: iso,
      endDate: iso,
    })
    .nullable(),
  recentJournals: z.array(
    z.object({
      id: z.string(),
      journalNumber: z.string().optional(),
      description: z.string(),
      status: z.string(),
      totalDebit: money,
      totalCredit: money,
      accountingDate: iso,
    }),
  ),
  periodPostedDebit: money,
  periodPostedCredit: money,
  openPeriodCount: z.number(),
  closedPeriodCount: z.number(),
})

export type JournalWriteBody = {
  legalEntityId: string
  branchId: string
  journalType: string
  accountingDate: string
  description: string
  reference?: string
  lines: Array<{ accountId: string; debit?: string; credit?: string; description?: string }>
}

export type ListQuery = {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  accountType?: string
  journalType?: string
  legalEntityId?: string
  fiscalPeriodId?: string
  accountId?: string
  sort?: string
  order?: 'asc' | 'desc'
}
