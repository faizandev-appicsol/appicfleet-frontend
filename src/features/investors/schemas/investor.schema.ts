import { z } from 'zod'

export const investorScopeSchema = z.object({
  legalEntityIds: z.array(z.string()),
  branchIds: z.array(z.string()),
  vehicleIds: z.array(z.string()),
  reportKeys: z.array(z.string()),
})

export const investorAccessPreviewSchema = z.object({
  legalEntityCount: z.number(),
  branchCount: z.number(),
  vehicleCount: z.number(),
  reportCount: z.number(),
})

export const investorSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  userId: z.string(),
  investorNumber: z.string(),
  displayName: z.string(),
  legalName: z.string().nullable().optional(),
  contactEmail: z.string(),
  phone: z.string().nullable().optional(),
  status: z.string(),
  accessStartsAt: z.string().nullable().optional(),
  accessEndsAt: z.string().nullable().optional(),
  scope: investorScopeSchema,
  accessPreview: investorAccessPreviewSchema,
  notes: z.string().nullable().optional(),
  invitedAt: z.string().nullable().optional(),
  activatedAt: z.string().nullable().optional(),
  suspendedAt: z.string().nullable().optional(),
  revokedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Investor = z.infer<typeof investorSchema>

export const INVESTOR_REPORT_OPTIONS = [
  'fleet_performance',
  'revenue_summary',
  'utilization',
  'contract_performance',
  'vehicle_performance',
  'financial_summary',
] as const
