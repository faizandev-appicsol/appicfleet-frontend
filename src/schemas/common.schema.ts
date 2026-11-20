import { z } from 'zod'

/**
 * Validation messages are i18n keys (see `validation.*` in the message catalogs).
 * Forms translate them at render time with `tm()` from `useTranslation`.
 */
export const emailSchema = z.email('validation.emailInvalid')

export const passwordSchema = z
  .string()
  .min(8, 'validation.passwordMin')
  .regex(/[A-Za-z]/, 'validation.passwordLetter')
  .regex(/[0-9]/, 'validation.passwordNumber')

export const personNameSchema = z
  .string()
  .trim()
  .min(2, 'validation.nameMin')
  .max(80, 'validation.nameMax80')

export const entityNameSchema = z
  .string()
  .trim()
  .min(2, 'validation.nameMin')
  .max(120, 'validation.nameMax120')

/** Business code, same rule as the API (case is normalized by the server). */
export const businessCodeSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9][A-Za-z0-9_-]{1,31}$/, 'validation.codeFormat')

export const countryCodeSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z]{2}$/, 'validation.countryCode')

export const currencyCodeSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z]{3}$/, 'validation.currencyCode')

export function isValidTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value })
    return true
  } catch {
    return false
  }
}

export const timezoneSchema = z
  .string()
  .trim()
  .min(1, 'validation.required')
  .max(64, 'validation.tooLong')
  .refine(isValidTimeZone, 'validation.timezoneInvalid')

export const entityStatuses = ['active', 'inactive'] as const
export const entityStatusSchema = z.enum(entityStatuses)
export type EntityStatus = (typeof entityStatuses)[number]

/** Mongo-style object id, as used for tenancy references. */
export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'validation.selectRequired')
