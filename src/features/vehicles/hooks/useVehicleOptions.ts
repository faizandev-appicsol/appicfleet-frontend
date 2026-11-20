import type { StatusOption } from '@/components/ui/StatusBadge'
import { useTranslation } from '@/i18n'

type Option = { value: string; label: string }

/**
 * Localized option lists and badge presets for every vehicle enum. Labels for values the UI does
 * not know about fall back to the raw server value (see `labelOf`).
 */
export function useVehicleOptions() {
  const { t, tm } = useTranslation()

  const statusOptions: readonly StatusOption[] = [
    { value: 'available', label: t('vehicles.status.available'), tone: 'success' },
    { value: 'reserved', label: t('vehicles.status.reserved'), tone: 'brand' },
    { value: 'rented', label: t('vehicles.status.rented'), tone: 'brand' },
    { value: 'maintenance', label: t('vehicles.status.maintenance'), tone: 'warning' },
    { value: 'inspection', label: t('vehicles.status.inspection'), tone: 'warning' },
    { value: 'out_of_service', label: t('vehicles.status.out_of_service'), tone: 'danger' },
    { value: 'inactive', label: t('vehicles.status.inactive'), tone: 'neutral' },
  ]

  /** Full set for filters / badges (legacy investor & borrowed still display). */
  const ownershipOptions: readonly Option[] = [
    { value: 'company', label: t('vehicles.ownershipType.own') },
    { value: 'investor', label: t('vehicles.ownershipType.investor') },
    { value: 'borrowed', label: t('vehicles.ownershipType.borrowed') },
    { value: 'leased', label: t('vehicles.ownershipType.leased') },
  ]

  /** Add / edit form: only Own and Leased. */
  const formOwnershipOptions: readonly Option[] = [
    { value: 'company', label: t('vehicles.ownershipType.own') },
    { value: 'leased', label: t('vehicles.ownershipType.leased') },
  ]

  const complianceOptions: readonly StatusOption[] = [
    { value: 'valid', label: t('vehicles.compliance.valid'), tone: 'success' },
    { value: 'expiring', label: t('vehicles.compliance.expiring'), tone: 'warning' },
    { value: 'expired', label: t('vehicles.compliance.expired'), tone: 'danger' },
    { value: 'missing', label: t('vehicles.compliance.missing'), tone: 'neutral' },
  ]

  /** Booking filter enums (legacy). Vehicle form types are free-text via /vehicles/types. */
  const categoryOptions: readonly Option[] = [
    { value: 'sedan', label: t('vehicles.category.sedan') },
    { value: 'suv', label: t('vehicles.category.suv') },
    { value: 'van', label: t('vehicles.category.van') },
    { value: 'truck', label: t('vehicles.category.truck') },
    { value: 'other', label: t('vehicles.category.other') },
  ]

  const transmissionOptions: readonly Option[] = [
    { value: 'automatic', label: t('vehicles.transmission.automatic') },
    { value: 'manual', label: t('vehicles.transmission.manual') },
  ]

  const fuelTypeOptions: readonly Option[] = [
    { value: 'petrol', label: t('vehicles.fuelType.petrol') },
    { value: 'diesel', label: t('vehicles.fuelType.diesel') },
    { value: 'hybrid', label: t('vehicles.fuelType.hybrid') },
    { value: 'electric', label: t('vehicles.fuelType.electric') },
  ]

  const rateTypeOptions: readonly Option[] = [
    { value: 'daily', label: t('vehicles.rateType.daily') },
    { value: 'weekly', label: t('vehicles.rateType.weekly') },
    { value: 'monthly', label: t('vehicles.rateType.monthly') },
  ]

  const rateStatusOptions: readonly StatusOption[] = [
    { value: 'active', label: t('vehicles.rateStatus.active'), tone: 'success' },
    { value: 'superseded', label: t('vehicles.rateStatus.superseded'), tone: 'neutral' },
    { value: 'cancelled', label: t('vehicles.rateStatus.cancelled'), tone: 'danger' },
  ]

  const documentTypeOptions: readonly Option[] = [
    { value: 'registration', label: t('vehicles.documentType.registration') },
    { value: 'insurance', label: t('vehicles.documentType.insurance') },
    { value: 'inspection', label: t('vehicles.documentType.inspection') },
    { value: 'ownership', label: t('vehicles.documentType.ownership') },
    { value: 'lease', label: t('vehicles.documentType.lease') },
    { value: 'other', label: t('vehicles.documentType.other') },
  ]

  const documentStatusOptions: readonly StatusOption[] = [
    { value: 'active', label: t('vehicles.documentStatus.active'), tone: 'success' },
    { value: 'archived', label: t('vehicles.documentStatus.archived'), tone: 'neutral' },
  ]

  const assignmentStatusOptions: readonly StatusOption[] = [
    { value: 'active', label: t('vehicles.assignmentStatus.active'), tone: 'brand' },
    { value: 'released', label: t('vehicles.assignmentStatus.released'), tone: 'neutral' },
  ]

  const labelOf = (options: readonly Option[], value: string): string =>
    options.find((option) => option.value === value)?.label ?? value

  /** Known availability reason codes are localized; anything else is shown as the server sent it. */
  const reasonLabel = (reason: string): string => {
    const key = `vehicles.availability.reasons.${reason}`
    const translated = tm(key)
    return translated && translated !== key ? translated : (tm(reason) ?? reason)
  }

  return {
    statusOptions,
    ownershipOptions,
    formOwnershipOptions,
    complianceOptions,
    categoryOptions,
    transmissionOptions,
    fuelTypeOptions,
    rateTypeOptions,
    rateStatusOptions,
    documentTypeOptions,
    documentStatusOptions,
    assignmentStatusOptions,
    labelOf,
    reasonLabel,
  }
}
