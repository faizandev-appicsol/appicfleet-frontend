import type { StatusOption } from '@/components/ui/StatusBadge'
import { useTranslation } from '@/i18n'

export function useContractOptions() {
  const { t } = useTranslation()
  const statusOptions: readonly StatusOption[] = [
    { value: 'draft', label: t('contracts.status.draft'), tone: 'neutral' },
    { value: 'pending_approval', label: t('contracts.status.pending_approval'), tone: 'warning' },
    { value: 'approved', label: t('contracts.status.approved'), tone: 'brand' },
    { value: 'active', label: t('contracts.status.active'), tone: 'success' },
    { value: 'suspended', label: t('contracts.status.suspended'), tone: 'warning' },
    { value: 'completed', label: t('contracts.status.completed'), tone: 'neutral' },
    { value: 'cancelled', label: t('contracts.status.cancelled'), tone: 'danger' },
    { value: 'terminated', label: t('contracts.status.terminated'), tone: 'danger' },
  ]
  const typeOptions = [
    { value: 'b2c', label: t('contracts.type.b2c') },
    { value: 'b2b', label: t('contracts.type.b2b') },
    { value: 'borrow', label: t('contracts.type.borrow') },
    { value: 'old_contract', label: t('contracts.type.old_contract') },
    { value: 'draft_b2c', label: t('contracts.type.draft_b2c') },
    { value: 'draft_b2b', label: t('contracts.type.draft_b2b') },
    { value: 'non_revenue', label: t('contracts.type.non_revenue') },
  ]
  const labelOf = (options: readonly { value: string; label: string }[], value: string) =>
    options.find((option) => option.value === value)?.label ?? value
  return { statusOptions, typeOptions, labelOf }
}
