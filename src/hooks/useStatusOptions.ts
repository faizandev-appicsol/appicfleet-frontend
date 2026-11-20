import type { StatusOption } from '@/components/ui/StatusBadge'
import { useTranslation } from '@/i18n'

/** Localized status badges shared by users and tenancy records. */
export function useStatusOptions(): readonly StatusOption[] {
  const { t } = useTranslation()

  return [
    { value: 'active', label: t('status.active'), tone: 'success' },
    { value: 'inactive', label: t('status.inactive'), tone: 'neutral' },
    { value: 'suspended', label: t('status.suspended'), tone: 'danger' },
    { value: 'invited', label: t('status.invited'), tone: 'warning' },
    { value: 'disabled', label: t('status.disabled'), tone: 'danger' },
  ]
}
