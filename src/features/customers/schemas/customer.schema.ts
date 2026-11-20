import { z } from 'zod'
import { isTodayOrFutureDate } from '@/utils/dates'
import type { PageQuery } from '@/types/pagination'

export const customerTypes = ['individual', 'corporate'] as const
export const customerStatuses = ['active', 'inactive', 'suspended'] as const
export const customerDocumentStatuses = ['none', 'pending', 'verified', 'needs_review'] as const
export const contactRoles = ['driver', 'contact', 'other'] as const
export const contactStatuses = ['active', 'inactive'] as const
export const customerFileTypes = [
  'emirates_id',
  'passport',
  'driving_license',
  'trade_license',
  'vat_certificate',
  'other',
] as const
export const customerFileStatuses = ['active', 'archived'] as const
export const ocrStatuses = [
  'none',
  'pending',
  'processing',
  'completed',
  'needs_review',
  'failed',
] as const
export const ocrReviewStatuses = ['none', 'approved', 'rejected'] as const
export const duplicateStatuses = [
  'potential',
  'under_review',
  'confirmed',
  'not_duplicate',
] as const

/** Matches the backend OCR review threshold. Fields below this need a person to check them. */
export const OCR_REVIEW_THRESHOLD = 0.75

export const MAX_UPLOAD_BYTES = 5_000_000

const addressSchema = z.object({
  line1: z.string(),
  city: z.string(),
  country: z.string(),
})

export const customerListItemSchema = z.object({
  id: z.string(),
  customerNumber: z.string(),
  type: z.string(),
  status: z.string(),
  displayName: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  branchId: z.string(),
  legalEntityId: z.string(),
  documentStatus: z.string(),
  createdAt: z.string(),
})
export type CustomerListItem = z.infer<typeof customerListItemSchema>

const individualSchema = z.object({
  firstName: z.string(),
  middleName: z.string().optional(),
  lastName: z.string(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
})

const corporateSchema = z.object({
  legalName: z.string(),
  tradeName: z.string().optional(),
  registrationNumber: z.string().optional(),
  taxNumber: z.string().optional(),
})

export const customerDetailSchema = customerListItemSchema.extend({
  organizationId: z.string(),
  alternatePhone: z.string().optional(),
  address: addressSchema.optional(),
  notes: z.string().optional(),
  individual: individualSchema.optional(),
  corporate: corporateSchema.optional(),
  createdBy: z.string(),
  updatedAt: z.string(),
})
export type CustomerDetail = z.infer<typeof customerDetailSchema>

export const customerContactSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  name: z.string(),
  phone: z.string().optional(),
  email: z.string().optional(),
  role: z.string(),
  licenseNumber: z.string().optional(),
  licenseExpiresOn: z.string().optional(),
  isPrimary: z.boolean(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type CustomerContact = z.infer<typeof customerContactSchema>

export const customerDocumentSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  branchId: z.string(),
  documentType: z.string(),
  originalFilename: z.string(),
  byteSize: z.number(),
  mimeType: z.string(),
  sha256Prefix: z.string(),
  duplicateFileFlag: z.boolean(),
  issuedOn: z.string().optional(),
  expiresOn: z.string().optional(),
  status: z.string(),
  ocrStatus: z.string(),
  uploadedBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type CustomerDocument = z.infer<typeof customerDocumentSchema>

const ocrFieldSchema = z.object({
  key: z.string(),
  value: z.string(),
  confidence: z.number(),
})

export const ocrRunSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  customerId: z.string(),
  provider: z.string(),
  modelVersion: z.string(),
  detectedType: z.string(),
  typeConfidence: z.number(),
  fields: z.array(ocrFieldSchema),
  status: z.string(),
  reviewedFields: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
  reviewStatus: z.string(),
  reviewedBy: z.string().optional(),
  reviewedAt: z.string().optional(),
  errorCode: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type OcrRun = z.infer<typeof ocrRunSchema>

export const duplicateReviewSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  candidateId: z.string(),
  status: z.string(),
  signals: z.array(z.string()),
  reviewedBy: z.string().optional(),
  reviewedAt: z.string().optional(),
  note: z.string().optional(),
  candidate: z.object({
    id: z.string(),
    customerNumber: z.string(),
    displayName: z.string(),
    type: z.string(),
    status: z.string(),
    branchId: z.string(),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type DuplicateReview = z.infer<typeof duplicateReviewSchema>

export type CustomerListQuery = PageQuery & {
  organizationId?: string
  type?: string
  status?: string
  branchId?: string
  documentStatus?: string
  sort?: 'displayName' | 'createdAt' | 'customerNumber'
  order?: 'asc' | 'desc'
}

export type CustomerScope = {
  customerId: string
  page?: number
  pageSize?: number
  reveal?: boolean
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^\+?[0-9 ()\-.]{6,30}$/
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function isRealDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
}

const optionalText = (max: number) => z.string().trim().max(max, 'validation.tooLong')

const optionalEmail = z
  .string()
  .trim()
  .max(200, 'validation.tooLong')
  .refine((value) => value === '' || EMAIL_PATTERN.test(value), 'validation.emailInvalid')

const optionalPhone = z
  .string()
  .trim()
  .max(30, 'validation.tooLong')
  .refine(
    (value) => value === '' || (PHONE_PATTERN.test(value) && value.replace(/\D/g, '').length >= 6),
    'validation.phoneInvalid',
  )

const optionalDate = z
  .string()
  .trim()
  .refine((value) => value === '' || isRealDate(value), 'customers.validation.date')

/** Optional expiry date — empty, or today / a future calendar day. */
const optionalExpiryDate = z
  .string()
  .trim()
  .refine((value) => value === '' || isRealDate(value), 'customers.validation.date')
  .refine(
    (value) => value === '' || isTodayOrFutureDate(value),
    'customers.validation.expiryMustBeFuture',
  )

export const customerFormSchema = z
  .object({
    organizationId: z.string(),
    branchId: z.string().trim().min(1, 'validation.required'),
    type: z.enum(customerTypes),
    displayName: optionalText(200),
    email: optionalEmail,
    phone: optionalPhone,
    alternatePhone: optionalPhone,
    line1: optionalText(200),
    city: optionalText(100),
    country: optionalText(60),
    notes: optionalText(2000),
    firstName: optionalText(80),
    middleName: optionalText(80),
    lastName: optionalText(80),
    dateOfBirth: optionalDate,
    nationality: optionalText(60),
    legalName: optionalText(160),
    tradeName: optionalText(160),
    registrationNumber: optionalText(60),
    taxNumber: optionalText(60),
  })
  .superRefine((value, ctx) => {
    const address = [value.line1, value.city, value.country]
    const started = address.some((part) => part.length > 0)
    if (started && address.some((part) => part.length === 0)) {
      ctx.addIssue({ code: 'custom', message: 'customers.validation.address', path: ['line1'] })
    }
    if (started && value.country.length > 0 && value.country.length < 2) {
      ctx.addIssue({ code: 'custom', message: 'validation.countryCode', path: ['country'] })
    }
    if (value.type === 'individual' && (!value.firstName || !value.lastName)) {
      ctx.addIssue({
        code: 'custom',
        message: 'customers.validation.individualName',
        path: ['firstName'],
      })
    }
    if (value.type === 'corporate' && !value.legalName) {
      ctx.addIssue({
        code: 'custom',
        message: 'customers.validation.corporateName',
        path: ['legalName'],
      })
    }
  })

export type CustomerFormValues = z.infer<typeof customerFormSchema>

function omitEmpty(value: string): string | undefined {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export function toCustomerCreateBody(values: CustomerFormValues) {
  const address = omitEmpty(values.line1)
    ? { line1: values.line1.trim(), city: values.city.trim(), country: values.country.trim() }
    : undefined
  return {
    organizationId: omitEmpty(values.organizationId),
    branchId: values.branchId.trim(),
    type: values.type,
    displayName: omitEmpty(values.displayName),
    email: omitEmpty(values.email),
    phone: omitEmpty(values.phone),
    alternatePhone: omitEmpty(values.alternatePhone),
    address,
    notes: omitEmpty(values.notes),
    individual:
      values.type === 'individual'
        ? {
            firstName: values.firstName.trim(),
            middleName: omitEmpty(values.middleName),
            lastName: values.lastName.trim(),
            dateOfBirth: omitEmpty(values.dateOfBirth),
            nationality: omitEmpty(values.nationality),
          }
        : undefined,
    corporate:
      values.type === 'corporate'
        ? {
            legalName: values.legalName.trim(),
            tradeName: omitEmpty(values.tradeName),
            registrationNumber: omitEmpty(values.registrationNumber),
            taxNumber: omitEmpty(values.taxNumber),
          }
        : undefined,
  }
}

export function toCustomerUpdateBody(values: CustomerFormValues) {
  const address = omitEmpty(values.line1)
    ? { line1: values.line1.trim(), city: values.city.trim(), country: values.country.trim() }
    : null
  return {
    displayName: omitEmpty(values.displayName),
    email: emptyToNull(values.email),
    phone: emptyToNull(values.phone),
    alternatePhone: emptyToNull(values.alternatePhone),
    address,
    notes: emptyToNull(values.notes),
    individual:
      values.type === 'individual'
        ? {
            firstName: values.firstName.trim(),
            middleName: emptyToNull(values.middleName),
            lastName: values.lastName.trim(),
            dateOfBirth: emptyToNull(values.dateOfBirth),
            nationality: emptyToNull(values.nationality),
          }
        : undefined,
    corporate:
      values.type === 'corporate'
        ? {
            legalName: values.legalName.trim(),
            tradeName: emptyToNull(values.tradeName),
            registrationNumber: values.registrationNumber.includes('*')
              ? undefined
              : emptyToNull(values.registrationNumber),
            taxNumber: values.taxNumber.includes('*')
              ? undefined
              : emptyToNull(values.taxNumber),
          }
        : undefined,
  }
}

export function customerToFormValues(customer?: CustomerDetail): CustomerFormValues {
  return {
    organizationId: customer?.organizationId ?? '',
    branchId: customer?.branchId ?? '',
    type: customer?.type === 'corporate' ? 'corporate' : 'individual',
    displayName: customer?.displayName ?? '',
    email: customer?.email ?? '',
    phone: customer?.phone ?? '',
    alternatePhone: customer?.alternatePhone ?? '',
    line1: customer?.address?.line1 ?? '',
    city: customer?.address?.city ?? '',
    country: customer?.address?.country ?? '',
    notes: customer?.notes ?? '',
    firstName: customer?.individual?.firstName ?? '',
    middleName: customer?.individual?.middleName ?? '',
    lastName: customer?.individual?.lastName ?? '',
    dateOfBirth: customer?.individual?.dateOfBirth ?? '',
    nationality: customer?.individual?.nationality ?? '',
    legalName: customer?.corporate?.legalName ?? '',
    tradeName: customer?.corporate?.tradeName ?? '',
    registrationNumber: customer?.corporate?.registrationNumber ?? '',
    taxNumber: customer?.corporate?.taxNumber ?? '',
  }
}

export const contactFormSchema = z.object({
  name: z.string().trim().min(1, 'validation.required').max(120, 'validation.tooLong'),
  phone: optionalPhone,
  email: optionalEmail,
  role: z.enum(contactRoles),
  licenseNumber: optionalText(60),
  licenseExpiresOn: optionalExpiryDate,
  isPrimary: z.boolean(),
})
export type ContactFormValues = z.infer<typeof contactFormSchema>

export function contactToFormValues(contact?: CustomerContact): ContactFormValues {
  return {
    name: contact?.name ?? '',
    phone: contact?.phone ?? '',
    email: contact?.email ?? '',
    role: contact?.role === 'contact' || contact?.role === 'other' ? contact.role : 'driver',
    licenseNumber: contact?.licenseNumber ?? '',
    licenseExpiresOn: contact?.licenseExpiresOn ?? '',
    isPrimary: contact?.isPrimary ?? false,
  }
}

/** A masked value contains asterisks. Sending it back would store the mask. */
export function isMasked(value: string): boolean {
  return value.includes('*')
}

export function toContactCreateBody(values: ContactFormValues) {
  return {
    name: values.name.trim(),
    phone: omitEmpty(values.phone),
    email: omitEmpty(values.email),
    role: values.role,
    licenseNumber: omitEmpty(values.licenseNumber),
    licenseExpiresOn: omitEmpty(values.licenseExpiresOn),
    isPrimary: values.isPrimary,
  }
}

export type CustomerCreatePayload = ReturnType<typeof toCustomerCreateBody>
export type CustomerUpdatePayload = ReturnType<typeof toCustomerUpdateBody>
export type ContactCreatePayload = ReturnType<typeof toContactCreateBody>

export function toContactUpdateBody(values: ContactFormValues) {
  return {
    name: values.name.trim(),
    phone: emptyToNull(values.phone),
    email: emptyToNull(values.email),
    role: values.role,
    licenseNumber: isMasked(values.licenseNumber) ? undefined : emptyToNull(values.licenseNumber),
    licenseExpiresOn: emptyToNull(values.licenseExpiresOn),
    isPrimary: values.isPrimary,
  }
}

export type ContactUpdatePayload = ReturnType<typeof toContactUpdateBody>

export const uploadDocumentSchema = z.object({
  documentType: z.enum(customerFileTypes),
  filename: z.string().trim().min(1).max(255),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  contentBase64: z.string().min(1),
  issuedOn: z.string().optional(),
  expiresOn: z.string().optional(),
})
export type UploadDocumentBody = z.infer<typeof uploadDocumentSchema>
