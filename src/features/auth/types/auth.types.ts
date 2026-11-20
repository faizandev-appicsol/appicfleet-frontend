import { z } from 'zod'

/**
 * Principal stored in the client session. Module 3 fields default so sessions cached
 * before the tenancy/RBAC upgrade still parse (they just carry no permissions).
 */
export const sessionUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().min(1),
  name: z.string().min(1),
  roles: z.array(z.string()).default([]),
  permissions: z.array(z.string()).default([]),
  organizationId: z.string().nullable().optional().default(null),
  branchIds: z.array(z.string()).default([]),
  legalEntityIds: z.array(z.string()).default([]),
  accessAllBranches: z.boolean().optional().default(false),
  accessAllOrganizations: z.boolean().optional().default(false),
})

const organizationSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
})

const branchSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
})

/** GET /auth/me */
export const profileSchema = sessionUserSchema.extend({
  phone: z.string().nullable().optional(),
  status: z.string().optional().default('active'),
  lastLoginAt: z.string().nullable().optional().default(null),
  organization: organizationSummarySchema.nullable().optional().default(null),
  branches: z.array(branchSummarySchema).optional().default([]),
})

export const sessionResponseSchema = z.object({
  accessToken: z.string().min(1),
  expiresIn: z.number().positive().optional(),
  refreshToken: z.string().min(1).optional(),
  user: sessionUserSchema,
})

export type SessionUser = z.infer<typeof sessionUserSchema>
export type ProfileResource = z.infer<typeof profileSchema>

export type AuthSession = {
  accessToken: string
  expiresAt: string
  refreshToken?: string
  user: SessionUser
}

export type LoginRequest = {
  email: string
  password: string
}

const DEFAULT_ACCESS_TOKEN_SECONDS = 900

export function parseAuthSession(data: unknown): AuthSession | null {
  const parsed = sessionResponseSchema.safeParse(data)
  if (!parsed.success) return null

  const expiresIn = parsed.data.expiresIn ?? DEFAULT_ACCESS_TOKEN_SECONDS

  return {
    accessToken: parsed.data.accessToken,
    expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    refreshToken: parsed.data.refreshToken,
    user: parsed.data.user,
  }
}
