import { useMemo } from 'react'
import type { StatusOption } from '@/components/ui/StatusBadge'
import { useTranslation } from '@/i18n'

export function useFinanceOptions() {
  const { t } = useTranslation()
  return useMemo(
    () => ({
      docStatusOptions: [
        { value: 'draft', label: t('finance.status.draft'), tone: 'neutral' },
        { value: 'posted', label: t('finance.status.posted'), tone: 'success' },
        { value: 'voided', label: t('finance.status.voided'), tone: 'danger' },
      ] as const satisfies readonly StatusOption[],
      paymentStatusOptions: [
        { value: 'pending', label: t('finance.paymentStatus.pending'), tone: 'warning' },
        { value: 'completed', label: t('finance.paymentStatus.completed'), tone: 'success' },
        { value: 'failed', label: t('finance.paymentStatus.failed'), tone: 'danger' },
        { value: 'cancelled', label: t('finance.paymentStatus.cancelled'), tone: 'neutral' },
        { value: 'reversed', label: t('finance.paymentStatus.reversed'), tone: 'danger' },
      ] as const satisfies readonly StatusOption[],
      paymentBalanceOptions: [
        { value: 'unpaid', label: t('finance.paymentBalance.unpaid') },
        { value: 'partial', label: t('finance.paymentBalance.partial') },
        { value: 'paid', label: t('finance.paymentBalance.paid') },
      ],
      methodOptions: [
        { value: 'cash', label: t('finance.methods.cash') },
        { value: 'card', label: t('finance.methods.card') },
        { value: 'bank_transfer', label: t('finance.methods.bankTransfer') },
        { value: 'online', label: t('finance.methods.online') },
        { value: 'cheque', label: t('finance.methods.cheque') },
        { value: 'other', label: t('finance.methods.other') },
      ],
      depositStatusOptions: [
        { value: 'held', label: t('finance.depositStatus.held'), tone: 'brand' },
        { value: 'partially_applied', label: t('finance.depositStatus.partiallyApplied'), tone: 'warning' },
        { value: 'applied', label: t('finance.depositStatus.applied'), tone: 'success' },
        { value: 'released', label: t('finance.depositStatus.released'), tone: 'neutral' },
      ] as const satisfies readonly StatusOption[],
      labelOf: (options: Array<{ value: string; label: string }>, value?: string) =>
        options.find((item) => item.value === value)?.label ?? value ?? '',
    }),
    [t],
  )
}
