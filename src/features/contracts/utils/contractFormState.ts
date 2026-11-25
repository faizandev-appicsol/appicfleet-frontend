/**
 * Extra contract fields captured by the form.
 * Flat on purpose: every key maps to exactly one control, so the dialog can bind them with
 * `text('key')` / `flag('key')` helpers. Sent to the API as `details`.
 */
export type ContractDetails = {
    // Tax report
    emirate: string
  
    // Customer / driver
    custName: string
    custMobile: string
    custEmail: string
    custNationality: string
    custDob: string
    custAddress: string
    custIdNumber: string
    custIdExpiry: string
    custIdIssueDate: string
    custIdIssuePlace: string
    custLicenseNumber: string
    custLicenseIssue: string
    custLicenseExpiry: string
    customerKind: string
    vatNumber: string
    residency: string
  
    // Staff / source
    chauffeur: boolean
    staffDriver: string
    source: string
    salesAgent: string
    rentalType: string
  
    // Additional driver
    addDriver: boolean
    addDriverName: string
    addDriverMobile: string
    addDriverLicense: string
    addDriverLicenseExpiry: string
  
    // Vehicle condition at handover
    mileage: string
    fuel: string
    extraKmCharge: string
    dailyKmLimit: string
    weeklyKmLimit: string
    monthlyKmLimit: string
  
    // Booking / pricing
    cardooRent: boolean
    recurring: boolean
    autoRentalUpdate: boolean
    rentalPeriod: string
    dailyRate: string
    amountOverride: string
    addVat: boolean
    amountContainsVat: boolean
  
    // Payments
    advanceMethod: string
    advanceType: string
    advanceAmount: string
    depositMethod: string
    depositAmount: string
  
    // Add-ons
    deliver: boolean
    deliveryAddress: string
    deliveryFee: string
    babySeats: boolean
    babySeatCount: string
    babySeatFee: string
    insurance: boolean
    insuranceFee: string
    protection: string[]
  }
  
  export type TextKey = { [K in keyof ContractDetails]: ContractDetails[K] extends string ? K : never }[keyof ContractDetails]
  export type FlagKey = { [K in keyof ContractDetails]: ContractDetails[K] extends boolean ? K : never }[keyof ContractDetails]
  
  export const emptyDetails = (): ContractDetails => ({
    emirate: '',
    custName: '',
    custMobile: '',
    custEmail: '',
    custNationality: '',
    custDob: '',
    custAddress: '',
    custIdNumber: '',
    custIdExpiry: '',
    custIdIssueDate: '',
    custIdIssuePlace: '',
    custLicenseNumber: '',
    custLicenseIssue: '',
    custLicenseExpiry: '',
    customerKind: 'individual',
    vatNumber: '',
    residency: 'residential',
    chauffeur: false,
    staffDriver: '',
    source: '',
    salesAgent: '',
    rentalType: '',
    addDriver: false,
    addDriverName: '',
    addDriverMobile: '',
    addDriverLicense: '',
    addDriverLicenseExpiry: '',
    mileage: '',
    fuel: '50',
    extraKmCharge: '',
    dailyKmLimit: '',
    weeklyKmLimit: '',
    monthlyKmLimit: '',
    cardooRent: false,
    recurring: false,
    autoRentalUpdate: false,
    rentalPeriod: 'daily',
    dailyRate: '',
    amountOverride: '',
    addVat: true,
    amountContainsVat: false,
    advanceMethod: 'Cash',
    advanceType: 'full',
    advanceAmount: '',
    depositMethod: 'Cash',
    depositAmount: '',
    deliver: false,
    deliveryAddress: '',
    deliveryFee: '',
    babySeats: false,
    babySeatCount: '1',
    babySeatFee: '',
    insurance: false,
    insuranceFee: '',
    protection: [],
  })
  
  /** Merge details saved on a contract over the defaults (edit mode). Unknown keys are ignored. */
  export function hydrateDetails(saved: Record<string, unknown> | undefined): ContractDetails {
    const base = emptyDetails()
    if (!saved) return base
    const next = { ...base } as Record<string, unknown>
    for (const key of Object.keys(base) as (keyof ContractDetails)[]) {
      const value = saved[key]
      if (Array.isArray(base[key])) {
        if (Array.isArray(value)) next[key] = value.filter((item) => typeof item === 'string')
      } else if (value !== null && value !== undefined && typeof value === typeof base[key]) {
        next[key] = value
      }
    }
    return next as ContractDetails
  }
  
  /** File-field keys mapped to document categories when uploading contract attachments. */
  export const fileKeys = {
    idImage: 'idImage',
    idExpiryImage: 'idExpiryImage',
    licenseImage: 'licenseImage',
    licenseExpiryImage: 'licenseExpiryImage',
    signature: 'signature',
    mileageImage: 'mileageImage',
    fuelImage: 'fuelImage',
    documents: 'documents',
  } as const