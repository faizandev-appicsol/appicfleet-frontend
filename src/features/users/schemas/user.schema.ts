import { z } from 'zod'
import { emailSchema, personNameSchema } from '@/schemas/common.schema'
import type { PageQuery } from '@/types/pagination'

export const userRoles = ['admin', 'manager', 'dispatcher', 'viewer'] as const
export const userStatuses = ['active', 'invited', 'disabled'] as const

export type UserRole = (typeof userRoles)[number]
export type UserStatus = (typeof userStatuses)[number]

export const userFormSchema = z.object({
  name: personNameSchema,
  email: emailSchema,
  role: z.enum(userRoles),
})

export const userUpdateSchema = userFormSchema.extend({
  status: z.enum(userStatuses),
})

export const userResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.string(),
  status: z.string(),
  createdAt: z.string(),
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

export function isUserRole(value: string): value is UserRole {
  return userRoles.some((role) => role === value)
}

export function isUserStatus(value: string): value is UserStatus {
  return userStatuses.some((status) => status === value)
}

export const USER_ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'dispatcher', label: 'Dispatcher' },
  { value: 'viewer', label: 'Viewer' },
] as const

export const USER_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'invited', label: 'Invited' },
  { value: 'disabled', label: 'Disabled' },
] as const
