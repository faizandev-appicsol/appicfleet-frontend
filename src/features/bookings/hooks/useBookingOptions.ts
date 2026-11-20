import type { StatusOption } from '@/components/ui/StatusBadge'
import { useTranslation } from '@/i18n'

type Option = { value: string; label: string }

export function useBookingOptions() {
  const { t } = useTranslation()

  const statusOptions: readonly StatusOption[] = [
    { value: 'draft', label: t('bookings.status.draft'), tone: 'neutral' },
    { value: 'hold', label: t('bookings.status.hold'), tone: 'warning' },
    { value: 'confirmed', label: t('bookings.status.confirmed'), tone: 'success' },
    { value: 'cancelled', label: t('bookings.status.cancelled'), tone: 'danger' },
    { value: 'expired', label: t('bookings.status.expired'), tone: 'neutral' },
    { value: 'released', label: t('bookings.status.released'), tone: 'neutral' },
    { value: 'converted', label: t('bookings.status.converted'), tone: 'brand' },
  ]

  const sourceOptions: readonly Option[] = [
    { value: 'admin', label: t('bookings.source.admin') },
    { value: 'website', label: t('bookings.source.website') },
    { value: 'mobile', label: t('bookings.source.mobile') },
    { value: 'api', label: t('bookings.source.api') },
    { value: 'partner', label: t('bookings.source.partner') },
    { value: 'walk_in', label: t('bookings.source.walk_in') },
    { value: 'other', label: t('bookings.source.other') },
  ]

  const labelOf = (options: readonly Option[], value: string) =>
    options.find((option) => option.value === value)?.label ?? value

  return { statusOptions, sourceOptions, labelOf }
}
