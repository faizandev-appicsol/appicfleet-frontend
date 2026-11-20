import { useMemo } from 'react'
import { useTranslation } from '@/i18n'

function opts(entries: Array<[string, string]>) {
  return entries.map(([value, label]) => ({ value, label }))
}

export function useChargesOptions() {
  const { t } = useTranslation()
  return useMemo(
    () => ({
      fineStatusOptions: opts([
        ['imported', t('charges.status.imported')],
        ['pending_review', t('charges.status.pendingReview')],
        ['assigned', t('charges.status.assigned')],
        ['disputed', t('charges.status.disputed')],
        ['approved', t('charges.status.approved')],
        ['recovery_pending', t('charges.status.recoveryPending')],
        ['recovered', t('charges.status.recovered')],
        ['waived', t('charges.status.waived')],
        ['cancelled', t('charges.status.cancelled')],
      ]),
      tollStatusOptions: opts([
        ['imported', t('charges.status.imported')],
        ['pending_review', t('charges.status.pendingReview')],
        ['assigned', t('charges.status.assigned')],
        ['approved', t('charges.status.approved')],
        ['recovery_pending', t('charges.status.recoveryPending')],
        ['recovered', t('charges.status.recovered')],
        ['disputed', t('charges.status.disputed')],
        ['waived', t('charges.status.waived')],
        ['cancelled', t('charges.status.cancelled')],
      ]),
      refundStatusOptions: opts([
        ['draft', t('charges.refundStatus.draft')],
        ['requested', t('charges.refundStatus.requested')],
        ['under_review', t('charges.refundStatus.underReview')],
        ['approved', t('charges.refundStatus.approved')],
        ['rejected', t('charges.refundStatus.rejected')],
        ['processing', t('charges.refundStatus.processing')],
        ['completed', t('charges.refundStatus.completed')],
        ['failed', t('charges.refundStatus.failed')],
        ['cancelled', t('charges.refundStatus.cancelled')],
      ]),
      fineTypeOptions: opts([
        ['speeding', t('charges.fineTypes.speeding')],
        ['parking', t('charges.fineTypes.parking')],
        ['red_light', t('charges.fineTypes.redLight')],
        ['traffic_violation', t('charges.fineTypes.trafficViolation')],
        ['road_violation', t('charges.fineTypes.roadViolation')],
        ['municipality', t('charges.fineTypes.municipality')],
        ['other', t('charges.fineTypes.other')],
      ]),
      tollProviderOptions: opts([
        ['salik', t('charges.providers.salik')],
        ['darb', t('charges.providers.darb')],
        ['other', t('charges.providers.other')],
      ]),
      refundSourceOptions: opts([
        ['deposit', t('charges.refundSources.deposit')],
        ['payment', t('charges.refundSources.payment')],
        ['overpayment', t('charges.refundSources.overpayment')],
        ['adjustment', t('charges.refundSources.adjustment')],
        ['other', t('charges.refundSources.other')],
      ]),
      importStatusOptions: opts([
        ['uploaded', t('charges.importStatus.uploaded')],
        ['processing', t('charges.importStatus.processing')],
        ['completed', t('charges.importStatus.completed')],
        ['completed_with_errors', t('charges.importStatus.completedWithErrors')],
        ['failed', t('charges.importStatus.failed')],
      ]),
    }),
    [t],
  )
}
