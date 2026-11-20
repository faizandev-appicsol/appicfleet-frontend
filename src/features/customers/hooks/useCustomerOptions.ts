import type { StatusOption } from '@/components/ui/StatusBadge'
import { useTranslation } from '@/i18n'

type Option = { value: string; label: string }

/** Localized labels for customer enums. Unknown server values fall back to the raw value. */
export function useCustomerOptions() {
  const { t } = useTranslation()

  const typeOptions: readonly Option[] = [
    { value: 'individual', label: t('customers.types.individual') },
    { value: 'corporate', label: t('customers.types.corporate') },
  ]

  const statusOptions: readonly StatusOption[] = [
    { value: 'active', label: t('customers.status.active'), tone: 'success' },
    { value: 'inactive', label: t('customers.status.inactive'), tone: 'neutral' },
    { value: 'suspended', label: t('customers.status.suspended'), tone: 'danger' },
  ]

  const documentStatusOptions: readonly StatusOption[] = [
    { value: 'none', label: t('customers.documentStatus.none'), tone: 'neutral' },
    { value: 'pending', label: t('customers.documentStatus.pending'), tone: 'warning' },
    { value: 'verified', label: t('customers.documentStatus.verified'), tone: 'success' },
    { value: 'needs_review', label: t('customers.documentStatus.needs_review'), tone: 'warning' },
  ]

  const fileTypeOptions: readonly Option[] = [
    { value: 'emirates_id', label: t('customers.fileTypes.emirates_id') },
    { value: 'passport', label: t('customers.fileTypes.passport') },
    { value: 'driving_license', label: t('customers.fileTypes.driving_license') },
    { value: 'trade_license', label: t('customers.fileTypes.trade_license') },
    { value: 'vat_certificate', label: t('customers.fileTypes.vat_certificate') },
    { value: 'other', label: t('customers.fileTypes.other') },
  ]

  const fileStatusOptions: readonly StatusOption[] = [
    { value: 'active', label: t('customers.fileStatus.active'), tone: 'success' },
    { value: 'archived', label: t('customers.fileStatus.archived'), tone: 'neutral' },
  ]

  const ocrStatusOptions: readonly StatusOption[] = [
    { value: 'none', label: t('customers.ocrStatus.none'), tone: 'neutral' },
    { value: 'pending', label: t('customers.ocrStatus.pending'), tone: 'warning' },
    { value: 'processing', label: t('customers.ocrStatus.processing'), tone: 'brand' },
    { value: 'completed', label: t('customers.ocrStatus.completed'), tone: 'success' },
    { value: 'needs_review', label: t('customers.ocrStatus.needs_review'), tone: 'warning' },
    { value: 'failed', label: t('customers.ocrStatus.failed'), tone: 'danger' },
  ]

  const reviewStatusOptions: readonly StatusOption[] = [
    { value: 'none', label: t('customers.reviewStatus.none'), tone: 'neutral' },
    { value: 'approved', label: t('customers.reviewStatus.approved'), tone: 'success' },
    { value: 'rejected', label: t('customers.reviewStatus.rejected'), tone: 'danger' },
  ]

  const contactRoleOptions: readonly Option[] = [
    { value: 'driver', label: t('customers.contactRoles.driver') },
    { value: 'contact', label: t('customers.contactRoles.contact') },
    { value: 'other', label: t('customers.contactRoles.other') },
  ]

  const contactStatusOptions: readonly StatusOption[] = [
    { value: 'active', label: t('customers.contactStatus.active'), tone: 'success' },
    { value: 'inactive', label: t('customers.contactStatus.inactive'), tone: 'neutral' },
  ]

  const duplicateStatusOptions: readonly StatusOption[] = [
    { value: 'potential', label: t('customers.duplicateStatus.potential'), tone: 'warning' },
    { value: 'under_review', label: t('customers.duplicateStatus.under_review'), tone: 'brand' },
    { value: 'confirmed', label: t('customers.duplicateStatus.confirmed'), tone: 'danger' },
    { value: 'not_duplicate', label: t('customers.duplicateStatus.not_duplicate'), tone: 'success' },
  ]

  const labelOf = (options: readonly Option[], value: string) =>
    options.find((option) => option.value === value)?.label ?? value

  return {
    typeOptions,
    statusOptions,
    documentStatusOptions,
    fileTypeOptions,
    fileStatusOptions,
    ocrStatusOptions,
    reviewStatusOptions,
    contactRoleOptions,
    contactStatusOptions,
    duplicateStatusOptions,
    labelOf,
  }
}
