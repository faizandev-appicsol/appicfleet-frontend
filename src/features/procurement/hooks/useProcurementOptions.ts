import { useMemo } from 'react'
import { useTranslation } from '@/i18n'

function opts(entries: Array<[string, string]>) {
  return entries.map(([value, label]) => ({ value, label }))
}

export function useProcurementOptions() {
  const { t } = useTranslation()
  return useMemo(
    () => ({
      vendorStatusOptions: opts([
        ['active', t('procurement.status.active')],
        ['inactive', t('procurement.status.inactive')],
        ['blocked', t('procurement.status.blocked')],
      ]),
      vendorTypeOptions: opts([
        ['vehicle_supplier', t('procurement.vendorTypes.vehicleSupplier')],
        ['maintenance', t('procurement.vendorTypes.maintenance')],
        ['insurance', t('procurement.vendorTypes.insurance')],
        ['parts', t('procurement.vendorTypes.parts')],
        ['fuel', t('procurement.vendorTypes.fuel')],
        ['tyre', t('procurement.vendorTypes.tyre')],
        ['towing', t('procurement.vendorTypes.towing')],
        ['cleaning', t('procurement.vendorTypes.cleaning')],
        ['technology', t('procurement.vendorTypes.technology')],
        ['general', t('procurement.vendorTypes.general')],
        ['borrow_supplier', t('procurement.vendorTypes.borrowSupplier')],
        ['other', t('procurement.vendorTypes.other')],
      ]),
      paymentTermsOptions: opts([
        ['immediate', t('procurement.paymentTerms.immediate')],
        ['net_7', t('procurement.paymentTerms.net7')],
        ['net_15', t('procurement.paymentTerms.net15')],
        ['net_30', t('procurement.paymentTerms.net30')],
        ['net_45', t('procurement.paymentTerms.net45')],
        ['net_60', t('procurement.paymentTerms.net60')],
        ['custom', t('procurement.paymentTerms.custom')],
      ]),
      lpoStatusOptions: opts([
        ['draft', t('procurement.lpoStatus.draft')],
        ['pending_approval', t('procurement.lpoStatus.pendingApproval')],
        ['approved', t('procurement.lpoStatus.approved')],
        ['sent', t('procurement.lpoStatus.sent')],
        ['partially_received', t('procurement.lpoStatus.partiallyReceived')],
        ['received', t('procurement.lpoStatus.received')],
        ['cancelled', t('procurement.lpoStatus.cancelled')],
        ['closed', t('procurement.lpoStatus.closed')],
      ]),
      billStatusOptions: opts([
        ['draft', t('procurement.billStatus.draft')],
        ['pending_review', t('procurement.billStatus.pendingReview')],
        ['approved', t('procurement.billStatus.approved')],
        ['posted', t('procurement.billStatus.posted')],
        ['cancelled', t('procurement.billStatus.cancelled')],
      ]),
      paymentStatusOptions: opts([
        ['unpaid', t('procurement.paymentStatus.unpaid')],
        ['partial', t('procurement.paymentStatus.partial')],
        ['paid', t('procurement.paymentStatus.paid')],
      ]),
      expenseStatusOptions: opts([
        ['draft', t('procurement.expenseStatus.draft')],
        ['submitted', t('procurement.expenseStatus.submitted')],
        ['approved', t('procurement.expenseStatus.approved')],
        ['posted', t('procurement.expenseStatus.posted')],
        ['cancelled', t('procurement.expenseStatus.cancelled')],
      ]),
      workOrderStatusOptions: opts([
        ['draft', t('procurement.workOrderStatus.draft')],
        ['requested', t('procurement.workOrderStatus.requested')],
        ['approved', t('procurement.workOrderStatus.approved')],
        ['scheduled', t('procurement.workOrderStatus.scheduled')],
        ['in_progress', t('procurement.workOrderStatus.inProgress')],
        ['waiting_for_parts', t('procurement.workOrderStatus.waitingForParts')],
        ['completed', t('procurement.workOrderStatus.completed')],
        ['cancelled', t('procurement.workOrderStatus.cancelled')],
      ]),
      priorityOptions: opts([
        ['low', t('procurement.priority.low')],
        ['normal', t('procurement.priority.normal')],
        ['high', t('procurement.priority.high')],
        ['urgent', t('procurement.priority.urgent')],
      ]),
      serviceTypeOptions: opts([
        ['scheduled_maintenance', t('procurement.serviceTypes.scheduledMaintenance')],
        ['oil_change', t('procurement.serviceTypes.oilChange')],
        ['tyre_replacement', t('procurement.serviceTypes.tyreReplacement')],
        ['brake_service', t('procurement.serviceTypes.brakeService')],
        ['engine_repair', t('procurement.serviceTypes.engineRepair')],
        ['ac_service', t('procurement.serviceTypes.acService')],
        ['electrical', t('procurement.serviceTypes.electrical')],
        ['body_repair', t('procurement.serviceTypes.bodyRepair')],
        ['accident_repair', t('procurement.serviceTypes.accidentRepair')],
        ['inspection', t('procurement.serviceTypes.inspection')],
        ['cleaning', t('procurement.serviceTypes.cleaning')],
        ['other', t('procurement.serviceTypes.other')],
      ]),
      reminderStatusOptions: opts([
        ['upcoming', t('procurement.reminderStatus.upcoming')],
        ['due', t('procurement.reminderStatus.due')],
        ['overdue', t('procurement.reminderStatus.overdue')],
        ['completed', t('procurement.reminderStatus.completed')],
        ['dismissed', t('procurement.reminderStatus.dismissed')],
      ]),
      reminderBasisOptions: opts([
        ['date', t('procurement.reminderBasis.date')],
        ['mileage', t('procurement.reminderBasis.mileage')],
        ['interval_days', t('procurement.reminderBasis.intervalDays')],
        ['interval_km', t('procurement.reminderBasis.intervalKm')],
      ]),
    }),
    [t],
  )
}
