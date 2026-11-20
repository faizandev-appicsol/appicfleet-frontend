import { z } from 'zod'
import {
  countryCodeSchema,
  currencyCodeSchema,
  entityStatusSchema,
  timezoneSchema,
  type EntityStatus,
} from '@/schemas/common.schema'
import type { PageQuery } from '@/types/pagination'

export const legalEntityFormSchema = z.object({
  /** Required in the UI for platform-wide accounts when creating; ignored otherwise. */
  organizationId: z.string(),
  legalName: z.string().trim().min(2, 'validation.nameMin').max(160, 'validation.tooLong'),
  displayName: z.string().trim().min(2, 'validation.nameMin').max(120, 'validation.nameMax120'),
  country: countryCodeSchema,
  taxIdentifier: z.string().trim().max(64, 'validation.tooLong'),
  defaultCurrency: currencyCodeSchema,
  timezone: timezoneSchema,
  status: entityStatusSchema,
})

export const legalEntityResponseSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  legalName: z.string(),
  displayName: z.string(),
  status: z.string(),
  country: z.string(),
  taxIdentifier: z.string().nullable().optional(),
  defaultCurrency: z.string(),
  timezone: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
})

export type LegalEntityFormValues = z.infer<typeof legalEntityFormSchema>
export type LegalEntity = z.infer<typeof legalEntityResponseSchema>
export type LegalEntityListQuery = PageQuery & {
  organizationId?: string
  status?: EntityStatus
}

export type LegalEntityCreateBody = {
  organizationId?: string
  legalName: string
  displayName: string
  country: string
  taxIdentifier?: string
  defaultCurrency: string
  timezone: string
  status: EntityStatus
}

export type LegalEntityUpdateBody = {
  legalName: string
  displayName: string
  country: string
  taxIdentifier: string | null
  defaultCurrency: string
  timezone: string
  status: EntityStatus
}

export function toLegalEntityCreateBody(values: LegalEntityFormValues): LegalEntityCreateBody {
  return {
    ...(values.organizationId ? { organizationId: values.organizationId } : {}),
    legalName: values.legalName.trim(),
    displayName: values.displayName.trim(),
    country: values.country.trim(),
    ...(values.taxIdentifier.trim() ? { taxIdentifier: values.taxIdentifier.trim() } : {}),
    defaultCurrency: values.defaultCurrency.trim(),
    timezone: values.timezone.trim(),
    status: values.status,
  }
}

export function toLegalEntityUpdateBody(values: LegalEntityFormValues): LegalEntityUpdateBody {
  return {
    legalName: values.legalName.trim(),
    displayName: values.displayName.trim(),
    country: values.country.trim(),
    taxIdentifier: values.taxIdentifier.trim() ? values.taxIdentifier.trim() : null,
    defaultCurrency: values.defaultCurrency.trim(),
    timezone: values.timezone.trim(),
    status: values.status,
  }
}
