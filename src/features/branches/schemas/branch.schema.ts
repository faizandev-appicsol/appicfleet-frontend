import { z } from 'zod'
import {
  businessCodeSchema,
  entityNameSchema,
  entityStatusSchema,
  timezoneSchema,
  type EntityStatus,
} from '@/schemas/common.schema'
import type { PageQuery } from '@/types/pagination'

const optionalLine = z.string().trim().max(160, 'validation.tooLong')

export const branchFormSchema = z.object({
  /** Required in the UI for platform-wide accounts when creating; ignored otherwise. */
  organizationId: z.string(),
  legalEntityId: z.string().min(1, 'validation.selectRequired'),
  name: entityNameSchema,
  code: businessCodeSchema,
  timezone: timezoneSchema,
  status: entityStatusSchema,
  line1: optionalLine,
  line2: optionalLine,
  city: z.string().trim().max(80, 'validation.tooLong'),
  region: z.string().trim().max(80, 'validation.tooLong'),
  postalCode: z.string().trim().max(20, 'validation.tooLong'),
  country: z
    .string()
    .trim()
    .refine((value) => value === '' || /^[A-Za-z]{2}$/.test(value), 'validation.countryCode'),
})

const addressSchema = z.object({
  line1: z.string().nullable().optional(),
  line2: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
})

export const branchResponseSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  legalEntityId: z.string(),
  name: z.string(),
  code: z.string(),
  address: addressSchema.nullable().optional(),
  timezone: z.string(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
})

export type BranchFormValues = z.infer<typeof branchFormSchema>
export type Branch = z.infer<typeof branchResponseSchema>
export type BranchListQuery = PageQuery & {
  organizationId?: string
  legalEntityId?: string
  status?: EntityStatus
}

export type BranchAddressBody = Partial<
  Record<'line1' | 'line2' | 'city' | 'region' | 'postalCode' | 'country', string>
>

export type BranchCreateBody = {
  organizationId?: string
  legalEntityId: string
  name: string
  code: string
  address?: BranchAddressBody
  timezone: string
  status: EntityStatus
}

/** `code` is immutable once created, so it is never sent on update. */
export type BranchUpdateBody = {
  legalEntityId: string
  name: string
  address: BranchAddressBody
  timezone: string
  status: EntityStatus
}

function toAddress(values: BranchFormValues): BranchAddressBody {
  const address: BranchAddressBody = {}
  const entries: Array<[keyof BranchAddressBody, string]> = [
    ['line1', values.line1],
    ['line2', values.line2],
    ['city', values.city],
    ['region', values.region],
    ['postalCode', values.postalCode],
    ['country', values.country],
  ]
  for (const [key, value] of entries) {
    const trimmed = value.trim()
    if (trimmed) address[key] = trimmed
  }
  return address
}

export function toBranchCreateBody(values: BranchFormValues): BranchCreateBody {
  const address = toAddress(values)
  return {
    ...(values.organizationId ? { organizationId: values.organizationId } : {}),
    legalEntityId: values.legalEntityId,
    name: values.name.trim(),
    code: values.code.trim(),
    ...(Object.keys(address).length > 0 ? { address } : {}),
    timezone: values.timezone.trim(),
    status: values.status,
  }
}

export function toBranchUpdateBody(values: BranchFormValues): BranchUpdateBody {
  return {
    legalEntityId: values.legalEntityId,
    name: values.name.trim(),
    address: toAddress(values),
    timezone: values.timezone.trim(),
    status: values.status,
  }
}
