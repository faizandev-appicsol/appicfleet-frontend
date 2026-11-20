import { z } from 'zod'
import type { PageQuery } from '@/types/pagination'
import { isTodayOrFutureDate } from '@/utils/dates'

// ---------------------------------------------------------------------------------------------
// Enums (lowercase on the wire)
// ---------------------------------------------------------------------------------------------

export const vehicleStatuses = [
  'available',
  'reserved',
  'rented',
  'maintenance',
  'inspection',
  'out_of_service',
  'inactive',
] as const
export type VehicleStatus = (typeof vehicleStatuses)[number]

export const ownershipTypes = ['company', 'investor', 'borrowed', 'leased'] as const
export type OwnershipType = (typeof ownershipTypes)[number]

export const vehicleTransmissions = ['automatic', 'manual'] as const
export type VehicleTransmission = (typeof vehicleTransmissions)[number]

export const vehicleFuelTypes = ['petrol', 'diesel', 'hybrid', 'electric'] as const
export type VehicleFuelType = (typeof vehicleFuelTypes)[number]

export const complianceStates = ['valid', 'expiring', 'expired', 'missing'] as const
export type ComplianceState = (typeof complianceStates)[number]

export const rateTypes = ['daily', 'weekly', 'monthly'] as const
export type RateType = (typeof rateTypes)[number]

export const rateStatuses = ['active', 'superseded', 'cancelled'] as const
export type RateStatus = (typeof rateStatuses)[number]

export const documentTypes = [
  'registration',
  'insurance',
  'inspection',
  'ownership',
  'lease',
  'other',
] as const
export type DocumentType = (typeof documentTypes)[number]

export const documentStatuses = ['active', 'archived'] as const
export type DocumentStatus = (typeof documentStatuses)[number]

export const assignmentStatuses = ['active', 'released'] as const
export type AssignmentStatus = (typeof assignmentStatuses)[number]

// ---------------------------------------------------------------------------------------------
// Response schemas (enum values stay strings so an unknown server value never breaks a page)
// ---------------------------------------------------------------------------------------------

export const vehicleListItemSchema = z.object({
  id: z.string(),
  plateNumber: z.string(),
  make: z.string(),
  model: z.string(),
  year: z.number(),
  color: z.string().nullish(),
  category: z.string(),
  status: z.string(),
  ownershipType: z.string(),
  ownershipParty: z.string().nullish(),
  mileageKm: z.number().default(0),
  branchId: z.string(),
  legalEntityId: z.string(),
  complianceState: z.string(),
  hasPhoto: z.boolean().optional().default(false),
  createdAt: z.string(),
})

export const vehicleStatsSchema = z.object({
  total: z.number(),
  available: z.number(),
  rented: z.number(),
  maintenance: z.number(),
  byStatus: z.record(z.string(), z.number()).optional(),
})
export type VehicleStats = z.infer<typeof vehicleStatsSchema>

const ownershipSchema = z.object({
  investorName: z.string().nullish(),
  investorReference: z.string().nullish(),
  lenderName: z.string().nullish(),
  expectedReturnOn: z.string().nullish(),
  lessorName: z.string().nullish(),
  leaseStartsOn: z.string().nullish(),
  leaseEndsOn: z.string().nullish(),
  leaseAmount: z.string().nullish(),
  leaseCurrency: z.string().nullish(),
  purchasePrice: z.string().nullish(),
  downPayment: z.string().nullish(),
  financedAmount: z.string().nullish(),
  interestRate: z.string().nullish(),
  numberOfInstallments: z.number().int().nullish(),
})

const complianceItemSchema = z.object({
  expiresOn: z.string().nullable(),
  state: z.string(),
})

export const vehicleDetailSchema = vehicleListItemSchema
  .omit({ complianceState: true })
  .extend({
    organizationId: z.string(),
    vin: z.string().nullish(),
    color: z.string().nullish(),
    transmission: z.string(),
    fuelType: z.string(),
    seatingCapacity: z.number(),
    engineNumber: z.string().nullish(),
    mileageKm: z.number(),
    purchasedOn: z.string().nullish(),
    salikTagNumber: z.string().nullish(),
    mulkiyaNumber: z.string().nullish(),
    latitude: z.string().nullish(),
    longitude: z.string().nullish(),
    featureOnWebsite: z.boolean().optional().default(false),
    notes: z.string().nullish(),
    ownership: ownershipSchema.nullish(),
    compliance: z.object({
      registration: complianceItemSchema,
      insurance: complianceItemSchema,
      inspection: complianceItemSchema,
      overall: z.string(),
    }),
    createdBy: z.string(),
    updatedAt: z.string(),
  })

export const statusEventSchema = z.object({
  id: z.string(),
  vehicleId: z.string(),
  branchId: z.string(),
  fromStatus: z.string(),
  toStatus: z.string(),
  reason: z.string(),
  actorUserId: z.string(),
  createdAt: z.string(),
})

export const vehicleRateSchema = z.object({
  id: z.string(),
  vehicleId: z.string(),
  rateType: z.string(),
  amount: z.string(),
  currency: z.string(),
  effectiveFrom: z.string(),
  effectiveTo: z.string().nullable(),
  status: z.string(),
  createdBy: z.string(),
  createdAt: z.string(),
})

export const vehicleDocumentSchema = z.object({
  id: z.string(),
  vehicleId: z.string(),
  documentType: z.string(),
  documentNumber: z.string().nullish(),
  issuedOn: z.string().nullish(),
  expiresOn: z.string().nullish(),
  storageKey: z.string(),
  status: z.string(),
  uploadedBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const vehicleAssignmentSchema = z.object({
  id: z.string(),
  vehicleId: z.string(),
  branchId: z.string(),
  startsAt: z.string(),
  endsAt: z.string(),
  reason: z.string(),
  status: z.string(),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const availabilityResultSchema = z.object({
  available: z.boolean(),
  reasons: z.array(z.string()),
  conflicts: z.array(z.object({ id: z.string(), startsAt: z.string(), endsAt: z.string() })),
})

export type VehicleListItem = z.infer<typeof vehicleListItemSchema>
export type VehicleDetail = z.infer<typeof vehicleDetailSchema>
export type VehicleStatusEvent = z.infer<typeof statusEventSchema>
export type VehicleRate = z.infer<typeof vehicleRateSchema>
export type VehicleDocument = z.infer<typeof vehicleDocumentSchema>
export type VehicleAssignment = z.infer<typeof vehicleAssignmentSchema>
export type AvailabilityResult = z.infer<typeof availabilityResultSchema>

// ---------------------------------------------------------------------------------------------
// Query types
// ---------------------------------------------------------------------------------------------

export type VehicleListQuery = PageQuery & {
  organizationId?: string
  status?: string
  ownershipType?: string
  branchId?: string
  compliance?: string
  category?: string
  sort?: string
  order?: 'asc' | 'desc'
}

export type VehicleStatsQuery = {
  organizationId?: string
  ownershipType?: string
  branchId?: string
  compliance?: string
  category?: string
  search?: string
}

export type VehicleSubListQuery = { id: string; page?: number; pageSize?: number }

// ---------------------------------------------------------------------------------------------
// Form helpers
// ---------------------------------------------------------------------------------------------

const MONEY_PATTERN = /^\d{1,12}(\.\d{1,2})?$/
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const VIN_PATTERN = /^[A-Za-z0-9]{5,32}$/
const PLATE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 /\-]*$/
const STORAGE_KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._\-/]*$/

function isRealDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
}

/** Optional calendar date from `<input type="date">` (`''` or `YYYY-MM-DD`). */
const optionalDate = z
  .string()
  .trim()
  .refine((value) => value === '' || isRealDate(value), 'vehicles.validation.dateInvalid')

/** Optional expiry calendar date (future check applied in `createVehicleFormSchema`). */
const optionalExpiryDate = z
  .string()
  .trim()
  .refine((value) => value === '' || isRealDate(value), 'vehicles.validation.dateInvalid')

const requiredText = (max: number) =>
  z
    .string()
    .trim()
    .min(1, 'validation.required')
    .max(max, 'validation.tooLong')

const optionalText = (max: number) => z.string().trim().max(max, 'validation.tooLong')

const optionalMoney = z
  .string()
  .trim()
  .refine((value) => value === '' || MONEY_PATTERN.test(value), 'vehicles.validation.moneyInvalid')

const optionalCurrency = z
  .string()
  .trim()
  .refine((value) => value === '' || /^[A-Za-z]{3}$/.test(value), 'validation.currencyCode')

function integerInRange(min: number, max: number, requiredKey = 'validation.required') {
  return z
    .string()
    .trim()
    .min(1, requiredKey)
    .refine(
      (value) => /^\d+$/.test(value) && Number(value) >= min && Number(value) <= max,
      'vehicles.validation.integerRange',
    )
}

/** Money is validated and sent as a decimal string; it is never converted to a number. */
export const moneyField = z
  .string()
  .trim()
  .min(1, 'validation.required')
  .regex(MONEY_PATTERN, 'vehicles.validation.moneyInvalid')
  .refine((value) => !/^0+(\.0{1,2})?$/.test(value), 'vehicles.validation.moneyPositive')

const vehicleFormObjectSchema = z.object({
  /** Required in the UI for platform-wide accounts when creating; ignored otherwise. */
  organizationId: z.string(),
  branchId: z.string().trim().min(1, 'validation.selectRequired'),
  legalEntityId: z.string(),
  plateNumber: z
    .string()
    .trim()
    .min(2, 'vehicles.validation.plateRequired')
    .max(20, 'validation.tooLong')
    .regex(PLATE_PATTERN, 'vehicles.validation.plateFormat'),
  vin: z
    .string()
    .trim()
    .refine((value) => value === '' || VIN_PATTERN.test(value), 'vehicles.validation.vinFormat'),
  make: requiredText(60),
  model: requiredText(60),
  year: integerInRange(1980, 2100),
  color: optionalText(40),
  category: requiredText(60),
  transmission: z.enum(vehicleTransmissions),
  fuelType: z.enum(vehicleFuelTypes),
  seatingCapacity: integerInRange(1, 60),
  engineNumber: optionalText(60),
  mileageKm: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || (/^\d+$/.test(value) && Number(value) <= 5_000_000),
      'vehicles.validation.mileageRange',
    ),
  notes: optionalText(2000),
  ownershipType: z.enum(ownershipTypes),
  investorName: optionalText(120),
  investorReference: optionalText(80),
  lenderName: optionalText(120),
  expectedReturnOn: optionalDate,
  lessorName: optionalText(120),
  leaseStartsOn: optionalDate,
  leaseEndsOn: optionalDate,
  leaseAmount: optionalMoney,
  leaseCurrency: optionalCurrency,
  // Leased financing UI (maps into ownership lease fields on submit where possible).
  financingCompany: optionalText(120),
  purchasePrice: optionalMoney,
  downPayment: optionalMoney,
  financedAmount: optionalMoney,
  interestRate: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || (/^\d{1,3}(\.\d{1,4})?$/.test(value) && Number(value) <= 100),
      'vehicles.validation.interestRate',
    ),
  numberOfInstallments: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || (/^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 600),
      'vehicles.validation.integerRange',
    ),
  monthlyInstallment: optionalMoney,
  firstPaymentDate: optionalDate,
  lastPaymentDate: optionalDate,
  registrationExpiresOn: optionalExpiryDate,
  insuranceExpiresOn: optionalExpiryDate,
  inspectionExpiresOn: optionalExpiryDate,
  chassisNumber: optionalText(60),
  salikTagNumber: optionalText(40),
  mulkiyaNumber: optionalText(60),
  latitude: optionalText(24),
  longitude: optionalText(24),
  dailyRent: optionalMoney,
  weeklyRent: optionalMoney,
  monthlyRent: optionalMoney,
  dailyKmLimit: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || (/^\d+$/.test(value) && Number(value) <= 10_000),
      'vehicles.validation.integerRange',
    ),
  vehicleCost: optionalMoney,
  purchasingDate: optionalDate,
  featureOnWebsite: z.boolean(),
  photoName: z.string(),
  logoName: z.string(),
  registrationImageName: z.string(),
  insuranceImageName: z.string(),
  additionalImagesName: z.string(),
})

function refineVehicleForm(
  values: z.infer<typeof vehicleFormObjectSchema>,
  ctx: z.RefinementCtx,
  allowedPastExpiries: ReadonlySet<string>,
) {
  const needs = (field: keyof typeof values) => {
    ctx.addIssue({ code: 'custom', path: [field], message: 'validation.required' })
  }
  if (values.ownershipType === 'investor' && !values.investorName) needs('investorName')
  if (values.ownershipType === 'borrowed' && !values.lenderName) needs('lenderName')
  if (values.ownershipType === 'leased') {
    if (!values.financingCompany && !values.lessorName) needs('financingCompany')
    const start = values.firstPaymentDate || values.leaseStartsOn
    const end = values.lastPaymentDate || values.leaseEndsOn
    if (start && end && end <= start) {
      ctx.addIssue({
        code: 'custom',
        path: ['lastPaymentDate'],
        message: 'vehicles.validation.leaseEndAfterStart',
      })
    }
  }

  const checkExpiry = (
    field: 'registrationExpiresOn' | 'insuranceExpiresOn' | 'inspectionExpiresOn',
  ) => {
    const value = values[field]
    if (!value) return
    if (isTodayOrFutureDate(value) || allowedPastExpiries.has(value)) return
    ctx.addIssue({
      code: 'custom',
      path: [field],
      message: 'vehicles.validation.expiryMustBeFuture',
    })
  }
  checkExpiry('registrationExpiresOn')
  checkExpiry('insuranceExpiresOn')
  checkExpiry('inspectionExpiresOn')
}

/** Create form: expiry dates must be today or future. */
export const vehicleFormSchema = vehicleFormObjectSchema.superRefine((values, ctx) =>
  refineVehicleForm(values, ctx, new Set()),
)

/** Edit form: previously saved expiry dates may be kept even when they are in the past. */
export function createVehicleFormSchema(allowedPastExpiries: readonly string[] = []) {
  const allowed = new Set(allowedPastExpiries.filter(Boolean))
  return vehicleFormObjectSchema.superRefine((values, ctx) => refineVehicleForm(values, ctx, allowed))
}

export type VehicleFormValues = z.infer<typeof vehicleFormObjectSchema>

/** Field names the form owns; API field errors are mapped onto these by their last path segment. */
export const vehicleFormFields: ReadonlySet<string> = new Set([
  'organizationId',
  'branchId',
  'legalEntityId',
  'plateNumber',
  'vin',
  'make',
  'model',
  'year',
  'color',
  'category',
  'transmission',
  'fuelType',
  'seatingCapacity',
  'engineNumber',
  'mileageKm',
  'notes',
  'ownershipType',
  'investorName',
  'investorReference',
  'lenderName',
  'expectedReturnOn',
  'lessorName',
  'leaseStartsOn',
  'leaseEndsOn',
  'leaseAmount',
  'leaseCurrency',
  'financingCompany',
  'purchasePrice',
  'downPayment',
  'financedAmount',
  'interestRate',
  'numberOfInstallments',
  'monthlyInstallment',
  'firstPaymentDate',
  'lastPaymentDate',
  'registrationExpiresOn',
  'insuranceExpiresOn',
  'inspectionExpiresOn',
  'chassisNumber',
  'salikTagNumber',
  'mulkiyaNumber',
  'latitude',
  'longitude',
  'dailyRent',
  'weeklyRent',
  'monthlyRent',
  'dailyKmLimit',
  'vehicleCost',
  'purchasingDate',
  'featureOnWebsite',
  'photoName',
  'logoName',
  'registrationImageName',
  'insuranceImageName',
  'additionalImagesName',
])

export const changeStatusFormSchema = z.object({
  status: z.enum(vehicleStatuses),
  reason: z.string().trim().min(3, 'vehicles.validation.reasonMin').max(500, 'validation.tooLong'),
})
export type ChangeStatusFormValues = z.infer<typeof changeStatusFormSchema>

/** `<input type="datetime-local">` value (`YYYY-MM-DDTHH:mm`), interpreted in local time. */
const localDateTime = z
  .string()
  .trim()
  .min(1, 'validation.required')
  .refine((value) => !Number.isNaN(new Date(value).getTime()), 'vehicles.validation.dateTimeInvalid')

/** Converts a `datetime-local` value to an ISO instant with `Z`, as the API requires. */
export function localDateTimeToIso(value: string): string {
  return new Date(value).toISOString()
}

export const rateFormSchema = z
  .object({
    rateType: z.enum(rateTypes),
    amount: moneyField,
    currency: z
      .string()
      .trim()
      .regex(/^[A-Za-z]{3}$/, 'validation.currencyCode'),
    effectiveFrom: localDateTime,
    effectiveTo: z
      .string()
      .trim()
      .refine(
        (value) => value === '' || !Number.isNaN(new Date(value).getTime()),
        'vehicles.validation.dateTimeInvalid',
      ),
  })
  .superRefine((values, ctx) => {
    if (!values.effectiveTo) return
    const from = new Date(values.effectiveFrom).getTime()
    const to = new Date(values.effectiveTo).getTime()
    if (!Number.isNaN(from) && !Number.isNaN(to) && to <= from) {
      ctx.addIssue({
        code: 'custom',
        path: ['effectiveTo'],
        message: 'vehicles.validation.endAfterStart',
      })
    }
  })
export type RateFormValues = z.infer<typeof rateFormSchema>

export const documentFormSchema = z
  .object({
    documentType: z.enum(documentTypes),
    documentNumber: optionalText(80),
    issuedOn: optionalDate,
    expiresOn: optionalExpiryDate,
    storageKey: z
      .string()
      .trim()
      .min(1, 'validation.required')
      .max(300, 'validation.tooLong')
      .regex(STORAGE_KEY_PATTERN, 'vehicles.validation.storageKeyFormat')
      .refine((value) => !value.includes('..'), 'vehicles.validation.storageKeyFormat'),
  })
  .superRefine((values, ctx) => {
    if (values.issuedOn && values.expiresOn && values.expiresOn < values.issuedOn) {
      ctx.addIssue({
        code: 'custom',
        path: ['expiresOn'],
        message: 'vehicles.validation.expiryBeforeIssue',
      })
    }
  })
export type DocumentFormValues = z.infer<typeof documentFormSchema>

function endsAfterStart(values: { startsAt: string; endsAt: string }): boolean {
  const from = new Date(values.startsAt).getTime()
  const to = new Date(values.endsAt).getTime()
  return Number.isNaN(from) || Number.isNaN(to) || to > from
}

const endAfterStartIssue = { message: 'vehicles.validation.endAfterStart', path: ['endsAt'] }

export const availabilityFormSchema = z
  .object({ startsAt: localDateTime, endsAt: localDateTime })
  .refine(endsAfterStart, endAfterStartIssue)
export type AvailabilityFormValues = z.infer<typeof availabilityFormSchema>

export const assignmentFormSchema = z
  .object({
    startsAt: localDateTime,
    endsAt: localDateTime,
    reason: z
      .string()
      .trim()
      .min(3, 'vehicles.validation.reasonMin')
      .max(200, 'validation.tooLong'),
  })
  .refine(endsAfterStart, endAfterStartIssue)
export type AssignmentFormValues = z.infer<typeof assignmentFormSchema>

// ---------------------------------------------------------------------------------------------
// Request bodies
// ---------------------------------------------------------------------------------------------

export type VehicleOwnershipBody = {
  investorName?: string
  investorReference?: string
  lenderName?: string
  expectedReturnOn?: string
  lessorName?: string
  leaseStartsOn?: string
  leaseEndsOn?: string
  leaseAmount?: string
  leaseCurrency?: string
  purchasePrice?: string
  downPayment?: string
  financedAmount?: string
  interestRate?: string
  numberOfInstallments?: number
}

export type VehicleCreateBody = {
  organizationId?: string
  branchId: string
  legalEntityId?: string
  plateNumber: string
  vin?: string
  make: string
  model: string
  year: number
  color?: string
  category: string
  transmission: VehicleTransmission
  fuelType: VehicleFuelType
  seatingCapacity: number
  engineNumber?: string
  mileageKm?: number
  purchasedOn?: string
  salikTagNumber?: string
  mulkiyaNumber?: string
  latitude?: string
  longitude?: string
  featureOnWebsite?: boolean
  notes?: string
  ownershipType: OwnershipType
  ownership?: VehicleOwnershipBody
  compliance?: {
    registrationExpiresOn?: string
    insuranceExpiresOn?: string
    inspectionExpiresOn?: string
  }
}

/** Optional text fields are cleared with `null`; status is never part of the update body. */
export type VehicleUpdateBody = {
  branchId: string
  legalEntityId?: string
  plateNumber: string
  vin: string | null
  make: string
  model: string
  year: number
  color: string | null
  category: string
  transmission: VehicleTransmission
  fuelType: VehicleFuelType
  seatingCapacity: number
  engineNumber: string | null
  mileageKm?: number
  purchasedOn: string | null
  salikTagNumber: string | null
  mulkiyaNumber: string | null
  latitude: string | null
  longitude: string | null
  featureOnWebsite: boolean
  notes: string | null
  ownershipType: OwnershipType
  ownership?: VehicleOwnershipBody
  compliance: {
    registrationExpiresOn: string | null
    insuranceExpiresOn: string | null
    inspectionExpiresOn: string | null
  }
}

export type ChangeStatusBody = { status: VehicleStatus; reason: string }

export type RateCreateBody = {
  rateType: RateType
  amount: string
  currency: string
  effectiveFrom: string
  effectiveTo?: string
}

export type DocumentCreateBody = {
  documentType: DocumentType
  documentNumber?: string
  issuedOn?: string
  expiresOn?: string
  storageKey: string
}

export type TimeWindowBody = { startsAt: string; endsAt: string }
export type AssignmentCreateBody = TimeWindowBody & { reason: string }

/** Only the fields that belong to the ownership type are sent (company sends nothing). */
export function toOwnershipBody(values: VehicleFormValues): VehicleOwnershipBody | undefined {
  const body: VehicleOwnershipBody = {}
  const put = (key: keyof VehicleOwnershipBody, value: string) => {
    const trimmed = value.trim()
    if (trimmed) body[key] = trimmed
  }

  switch (values.ownershipType) {
    case 'investor':
      put('investorName', values.investorName)
      put('investorReference', values.investorReference)
      break
    case 'borrowed':
      put('lenderName', values.lenderName)
      put('expectedReturnOn', values.expectedReturnOn)
      break
    case 'leased': {
      const company = values.financingCompany || values.lessorName
      const firstPayment = values.firstPaymentDate || values.leaseStartsOn
      let lastPayment = values.lastPaymentDate || values.leaseEndsOn
      if (!lastPayment && firstPayment && values.numberOfInstallments.trim()) {
        lastPayment = addMonthsToDate(firstPayment, Number(values.numberOfInstallments))
      }
      const installment = values.monthlyInstallment || values.leaseAmount
      put('lessorName', company)
      put('leaseStartsOn', firstPayment)
      put('leaseEndsOn', lastPayment)
      put('leaseAmount', installment)
      if (installment) put('leaseCurrency', (values.leaseCurrency || 'AED').toUpperCase())
      put('purchasePrice', values.purchasePrice)
      put('downPayment', values.downPayment)
      put('financedAmount', values.financedAmount)
      put('interestRate', values.interestRate)
      if (values.numberOfInstallments.trim() && /^\d+$/.test(values.numberOfInstallments.trim())) {
        body.numberOfInstallments = Number(values.numberOfInstallments.trim())
      }
      break
    }
    default:
      return undefined
  }
  return Object.keys(body).length > 0 ? body : undefined
}

/** Adds whole months to a `YYYY-MM-DD` calendar date (used when last payment is blank). */
export function addMonthsToDate(dateValue: string, months: number): string {
  const [yearText = '0', monthText = '1', dayText = '1'] = dateValue.split('-')
  const year = Number(yearText)
  const monthIndex = Number(monthText) - 1
  const day = Number(dayText)
  const date = new Date(Date.UTC(year, monthIndex + months, day))
  const yyyy = date.getUTCFullYear()
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(date.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function optional(value: string): string | undefined {
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

function clearable(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export function toVehicleCreateBody(values: VehicleFormValues): VehicleCreateBody {
  const ownership = toOwnershipBody(values)
  const compliance: NonNullable<VehicleCreateBody['compliance']> = {}
  const registration = optional(values.registrationExpiresOn)
  const insurance = optional(values.insuranceExpiresOn)
  const inspection = optional(values.inspectionExpiresOn)
  if (registration) compliance.registrationExpiresOn = registration
  if (insurance) compliance.insuranceExpiresOn = insurance
  if (inspection) compliance.inspectionExpiresOn = inspection

  const vin = optional(values.vin)
  const color = optional(values.color)
  const engineNumber = optional(values.engineNumber) ?? optional(values.chassisNumber)
  const notes = optional(values.notes)
  const mileage = optional(values.mileageKm)
  const purchasedOn = optional(values.purchasingDate)
  const salikTagNumber = optional(values.salikTagNumber)
  const mulkiyaNumber = optional(values.mulkiyaNumber)
  const latitude = optional(values.latitude)
  const longitude = optional(values.longitude)
  const organizationId = optional(values.organizationId)
  const legalEntityId = optional(values.legalEntityId)

  return {
    ...(organizationId ? { organizationId } : {}),
    branchId: values.branchId,
    ...(legalEntityId ? { legalEntityId } : {}),
    plateNumber: values.plateNumber.trim(),
    ...(vin ? { vin } : {}),
    make: values.make.trim(),
    model: values.model.trim(),
    year: Number(values.year),
    ...(color ? { color } : {}),
    category: values.category.trim(),
    transmission: values.transmission,
    fuelType: values.fuelType,
    seatingCapacity: Number(values.seatingCapacity),
    ...(engineNumber ? { engineNumber } : {}),
    ...(mileage !== undefined ? { mileageKm: Number(mileage) } : {}),
    ...(purchasedOn ? { purchasedOn } : {}),
    ...(salikTagNumber ? { salikTagNumber } : {}),
    ...(mulkiyaNumber ? { mulkiyaNumber } : {}),
    ...(latitude ? { latitude } : {}),
    ...(longitude ? { longitude } : {}),
    featureOnWebsite: values.featureOnWebsite,
    ...(notes ? { notes } : {}),
    ownershipType: values.ownershipType,
    ...(ownership ? { ownership } : {}),
    ...(Object.keys(compliance).length > 0 ? { compliance } : {}),
  }
}

export function toVehicleUpdateBody(values: VehicleFormValues): VehicleUpdateBody {
  const ownership = toOwnershipBody(values)
  const legalEntityId = optional(values.legalEntityId)
  const mileage = optional(values.mileageKm)

  return {
    branchId: values.branchId,
    ...(legalEntityId ? { legalEntityId } : {}),
    plateNumber: values.plateNumber.trim(),
    vin: clearable(values.vin),
    make: values.make.trim(),
    model: values.model.trim(),
    year: Number(values.year),
    color: clearable(values.color),
    category: values.category.trim(),
    transmission: values.transmission,
    fuelType: values.fuelType,
    seatingCapacity: Number(values.seatingCapacity),
    engineNumber: clearable(values.engineNumber || values.chassisNumber),
    ...(mileage !== undefined ? { mileageKm: Number(mileage) } : {}),
    purchasedOn: clearable(values.purchasingDate),
    salikTagNumber: clearable(values.salikTagNumber),
    mulkiyaNumber: clearable(values.mulkiyaNumber),
    latitude: clearable(values.latitude),
    longitude: clearable(values.longitude),
    featureOnWebsite: values.featureOnWebsite,
    notes: clearable(values.notes),
    ownershipType: values.ownershipType,
    ...(ownership ? { ownership } : {}),
    compliance: {
      registrationExpiresOn: clearable(values.registrationExpiresOn),
      insuranceExpiresOn: clearable(values.insuranceExpiresOn),
      inspectionExpiresOn: clearable(values.inspectionExpiresOn),
    },
  }
}

export function toRateCreateBody(values: RateFormValues): RateCreateBody {
  return {
    rateType: values.rateType,
    amount: values.amount.trim(),
    currency: values.currency.trim().toUpperCase(),
    effectiveFrom: localDateTimeToIso(values.effectiveFrom),
    ...(values.effectiveTo ? { effectiveTo: localDateTimeToIso(values.effectiveTo) } : {}),
  }
}

export function toDocumentCreateBody(values: DocumentFormValues): DocumentCreateBody {
  const documentNumber = optional(values.documentNumber)
  const issuedOn = optional(values.issuedOn)
  const expiresOn = optional(values.expiresOn)
  return {
    documentType: values.documentType,
    ...(documentNumber ? { documentNumber } : {}),
    ...(issuedOn ? { issuedOn } : {}),
    ...(expiresOn ? { expiresOn } : {}),
    storageKey: values.storageKey.trim(),
  }
}

export function toTimeWindowBody(values: { startsAt: string; endsAt: string }): TimeWindowBody {
  return {
    startsAt: localDateTimeToIso(values.startsAt),
    endsAt: localDateTimeToIso(values.endsAt),
  }
}

export function isVehicleStatus(value: string): value is VehicleStatus {
  return (vehicleStatuses as readonly string[]).includes(value)
}
