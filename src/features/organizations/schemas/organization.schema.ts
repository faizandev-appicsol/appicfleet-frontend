import { z } from 'zod'
import {
  businessCodeSchema,
  entityNameSchema,
  entityStatusSchema,
  entityStatuses,
} from '@/schemas/common.schema'
import type { PageQuery } from '@/types/pagination'

export const organizationFormSchema = z.object({
  name: entityNameSchema,
  code: businessCodeSchema,
  status: entityStatusSchema,
})

export const organizationResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
})

export type OrganizationFormValues = z.infer<typeof organizationFormSchema>
export type Organization = z.infer<typeof organizationResponseSchema>
export type OrganizationListQuery = PageQuery & { status?: (typeof entityStatuses)[number] }

/** Body for PATCH. The code is immutable; status is only sent when the caller may change it. */
export type OrganizationUpdateBody = {
  name: string
  status?: (typeof entityStatuses)[number]
}
