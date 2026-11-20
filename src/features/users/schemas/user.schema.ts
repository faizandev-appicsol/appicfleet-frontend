import { z } from 'zod'
import { emailSchema, personNameSchema } from '@/schemas/common.schema'
import type { PageQuery } from '@/types/pagination'

/** Roles the API lets an administrator assign (`super_admin` is provisioned out of band). */
export const userRoles = ['admin', 'manager', 'dispatcher', 'viewer', 'user'] as const
/** `disabled` is the pre-Module-3 spelling of `inactive`; the API reads it as inactive. */
export const userStatuses = ['active', 'invited', 'inactive', 'suspended'] as const

export type UserRole = (typeof userRoles)[number]
export type UserStatus = (typeof userStatuses)[number]

export const userFormSchema = z.object({
  name: personNameSchema,
  email: emailSchema,
  role: z.enum(userRoles),
  /** Platform-wide accounts must pick the organization; others always use their own. */
  organizationId: z.string().optional().default(''),
  branchIds: z.array(z.string()).default([]),
  accessAllBranches: z.boolean().default(false),
})

export const userUpdateSchema = z.object({
  name: personNameSchema,
  email: emailSchema,
  role: z.enum(userRoles),
  status: z.enum(userStatuses),
})

export const userResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.string(),
  status: z.string(),
  createdAt: z.string(),
  phone: z.string().nullable().optional(),
  organizationId: z.string().nullable().optional().default(null),
  branchIds: z.array(z.string()).optional().default([]),
  legalEntityIds: z.array(z.string()).optional().default([]),
  accessAllBranches: z.boolean().optional().default(false),
  accessAllOrganizations: z.boolean().optional().default(false),
  lastLoginAt: z.string().nullable().optional(),
  updatedAt: z.string().optional(),
})

export const userListSchema = z.object({
  items: z.array(userResponseSchema),
  page: z.number().int().nonnegative(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
})

export type UserFormValues = z.infer<typeof userFormSchema>
export type UserUpdateValues = z.infer<typeof userUpdateSchema>
export type User = z.infer<typeof userResponseSchema>
export type UserListQuery = PageQuery

export type UserCreateBody = {
  name: string
  email: string
  role: UserRole
  organizationId?: string
  branchIds?: string[]
  accessAllBranches?: boolean
}

export function toUserCreateBody(values: UserFormValues): UserCreateBody {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    role: values.role,
    ...(values.organizationId ? { organizationId: values.organizationId } : {}),
    ...(values.branchIds.length > 0 && !values.accessAllBranches
      ? { branchIds: values.branchIds }
      : {}),
    ...(values.accessAllBranches ? { accessAllBranches: true } : {}),
  }
}

export function isUserRole(value: string): value is UserRole {
  return userRoles.some((role) => role === value)
}

export function isUserStatus(value: string): value is UserStatus {
  return userStatuses.some((status) => status === value)
}

/** Legacy `disabled` is shown and edited as `inactive`. */
export function normalizeUserStatus(value: string): string {
  return value === 'disabled' ? 'inactive' : value
}
