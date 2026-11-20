/** Legacy role gate kept for backward compatibility. Prefer the permission constants below. */
export const userDirectoryRoles = ['admin', 'manager'] as const

/**
 * Permission keys used by route guards and navigation. These match the backend catalog.
 * Frontend checks are UX only; the API enforces every permission.
 */
export const PERMISSIONS = {
  usersView: 'users.view',
  usersCreate: 'users.create',
  usersUpdate: 'users.update',
  usersDeactivate: 'users.deactivate',
  organizationsView: 'organizations.view',
  organizationsManage: 'organizations.manage',
  legalEntitiesView: 'legal_entities.view',
  legalEntitiesManage: 'legal_entities.manage',
  branchesView: 'branches.view',
  branchesManage: 'branches.manage',
  rolesView: 'roles.view',
  rolesManage: 'roles.manage',
  auditView: 'audit.view',
  profileView: 'profile.view',
  profileUpdate: 'profile.update',
  vehicleView: 'vehicle.view',
  vehicleCreate: 'vehicle.create',
  vehicleUpdate: 'vehicle.update',
  vehicleDeactivate: 'vehicle.deactivate',
  vehicleChangeStatus: 'vehicle.change_status',
  vehicleManageRates: 'vehicle.manage_rates',
  vehicleManageDocuments: 'vehicle.manage_documents',
  vehicleViewHistory: 'vehicle.view_history',
  vehicleCheckAvailability: 'vehicle.check_availability',
  vehicleAllocate: 'vehicle.allocate',
  customerView: 'customer.view',
  customerCreate: 'customer.create',
  customerUpdate: 'customer.update',
  customerDeactivate: 'customer.deactivate',
  customerManageDocuments: 'customer.manage_documents',
  customerViewSensitive: 'customer.view_sensitive',
  customerUploadDocuments: 'customer.upload_documents',
  customerReviewOcr: 'customer.review_ocr',
  customerReviewDuplicates: 'customer.review_duplicates',
  bookingView: 'booking.view',
  bookingCreate: 'booking.create',
  bookingUpdate: 'booking.update',
  bookingConfirm: 'booking.confirm',
  bookingCancel: 'booking.cancel',
  bookingRelease: 'booking.release',
  bookingViewCalendar: 'booking.view_calendar',
  bookingManageHolds: 'booking.manage_holds',
  bookingConvert: 'booking.convert',
  contractView: 'contract.view',
  contractCreate: 'contract.create',
  contractUpdate: 'contract.update',
  contractApprove: 'contract.approve',
  contractActivate: 'contract.activate',
  contractCancel: 'contract.cancel',
  contractExtend: 'contract.extend',
  contractAmendPricing: 'contract.amend_pricing',
  contractReplaceVehicle: 'contract.replace_vehicle',
  contractHandover: 'contract.handover',
  contractReturn: 'contract.return',
  contractViewSensitive: 'contract.view_sensitive',
  invoiceView: 'invoice.view',
  invoiceCreate: 'invoice.create',
  invoiceEdit: 'invoice.edit',
  invoicePost: 'invoice.post',
  invoiceVoid: 'invoice.void',
  paymentView: 'payment.view',
  paymentCreate: 'payment.create',
  paymentComplete: 'payment.complete',
  paymentReverse: 'payment.reverse',
  receiptView: 'receipt.view',
  receiptIssue: 'receipt.issue',
  creditNoteView: 'credit_note.view',
  creditNoteCreate: 'credit_note.create',
  creditNotePost: 'credit_note.post',
  debitNoteView: 'debit_note.view',
  debitNoteCreate: 'debit_note.create',
  debitNotePost: 'debit_note.post',
  depositView: 'deposit.view',
  depositCreate: 'deposit.create',
  depositApply: 'deposit.apply',
  depositRelease: 'deposit.release',
  vendorView: 'vendor.view',
  vendorCreate: 'vendor.create',
  vendorEdit: 'vendor.edit',
  vendorDisable: 'vendor.disable',
  lpoView: 'lpo.view',
  lpoCreate: 'lpo.create',
  lpoEdit: 'lpo.edit',
  lpoSubmit: 'lpo.submit',
  lpoApprove: 'lpo.approve',
  lpoCancel: 'lpo.cancel',
  vendorBillView: 'vendor_bill.view',
  vendorBillCreate: 'vendor_bill.create',
  vendorBillEdit: 'vendor_bill.edit',
  vendorBillApprove: 'vendor_bill.approve',
  vendorBillPost: 'vendor_bill.post',
  expenseView: 'expense.view',
  expenseCreate: 'expense.create',
  expenseEdit: 'expense.edit',
  expenseSubmit: 'expense.submit',
  expenseApprove: 'expense.approve',
  expensePost: 'expense.post',
  serviceView: 'service.view',
  serviceCreate: 'service.create',
  serviceEdit: 'service.edit',
  serviceApprove: 'service.approve',
  serviceSchedule: 'service.schedule',
  serviceComplete: 'service.complete',
  serviceReminderView: 'service_reminder.view',
  serviceReminderCreate: 'service_reminder.create',
  serviceReminderManage: 'service_reminder.manage',
  fineView: 'fine.view',
  fineCreate: 'fine.create',
  fineEdit: 'fine.edit',
  fineReview: 'fine.review',
  fineApprove: 'fine.approve',
  fineDispute: 'fine.dispute',
  fineWaive: 'fine.waive',
  fineRecover: 'fine.recover',
  tollView: 'toll.view',
  tollCreate: 'toll.create',
  tollEdit: 'toll.edit',
  tollReview: 'toll.review',
  tollApprove: 'toll.approve',
  tollRecover: 'toll.recover',
  fineImportView: 'fine_import.view',
  fineImportCreate: 'fine_import.create',
  fineImportProcess: 'fine_import.process',
  refundView: 'refund.view',
  refundCreate: 'refund.create',
  refundApprove: 'refund.approve',
  refundReject: 'refund.reject',
  refundExecute: 'refund.execute',
  accountingView: 'accounting.view',
  accountingCreate: 'accounting.create',
  accountingEdit: 'accounting.edit',
  accountingPost: 'accounting.post',
  accountingReverse: 'accounting.reverse',
  accountingAdjust: 'accounting.adjust',
  accountingClosePeriod: 'accounting.close_period',
  accountingReopenPeriod: 'accounting.reopen_period',
  accountingManageAccounts: 'accounting.manage_accounts',
  accountingViewLedger: 'accounting.view_ledger',
  accountingViewTrialBalance: 'accounting.view_trial_balance',
  accountingViewReports: 'accounting.view_reports',
  taxView: 'tax.view',
  taxManageCodes: 'tax.manage_codes',
  taxManagePeriods: 'tax.manage_periods',
  taxViewReports: 'tax.view_reports',
  einvoiceView: 'einvoice.view',
  einvoiceGenerate: 'einvoice.generate',
  einvoiceSubmit: 'einvoice.submit',
  einvoiceRetry: 'einvoice.retry',
  einvoiceCancel: 'einvoice.cancel',
  einvoiceManageSettings: 'einvoice.manage_settings',
  dashboardView: 'dashboard.view',
  reportsView: 'reports.view',
  reportsExport: 'reports.export',
  reportsFinancial: 'reports.financial',
  reportsOperational: 'reports.operational',
  investorsView: 'investors.view',
  investorsManage: 'investors.manage',
  investorsInvite: 'investors.invite',
  investorsSuspend: 'investors.suspend',
  investorsRevoke: 'investors.revoke',
  investorsManageAccess: 'investors.manage_access',
  investorPortal: 'investor.portal',
  investorViewOverview: 'investor.view_overview',
  investorViewFleet: 'investor.view_fleet',
  investorViewPerformance: 'investor.view_performance',
  investorViewFinancial: 'investor.view_financial',
  investorViewContracts: 'investor.view_contracts',
  investorViewReports: 'investor.view_reports',
  investorExport: 'investor.export',
  hrEmployeeView: 'hr.employee.view',
  hrEmployeeCreate: 'hr.employee.create',
  hrEmployeeUpdate: 'hr.employee.update',
  hrEmployeeDelete: 'hr.employee.delete',
  hrEmployeeSensitiveView: 'hr.employee.sensitive.view',
  hrDepartmentView: 'hr.department.view',
  hrDepartmentManage: 'hr.department.manage',
  hrPositionView: 'hr.position.view',
  hrPositionManage: 'hr.position.manage',
  hrEmployeeDocumentView: 'hr.employee.document.view',
  hrEmployeeDocumentManage: 'hr.employee.document.manage',
  hrEmployeeStatusManage: 'hr.employee.status.manage',
  hrEmployeeTransferManage: 'hr.employee.transfer.manage',
  payrollView: 'payroll.view',
  payrollCreate: 'payroll.create',
  payrollCalculate: 'payroll.calculate',
  payrollAdjust: 'payroll.adjust',
  payrollApprove: 'payroll.approve',
  payrollPay: 'payroll.pay',
  payrollCancel: 'payroll.cancel',
  payrollCompensationView: 'payroll.compensation.view',
  payrollCompensationManage: 'payroll.compensation.manage',
  payrollPayslipView: 'payroll.payslip.view',
  payrollPayslipManage: 'payroll.payslip.manage',
  payrollPayslipDownload: 'payroll.payslip.download',
  payrollPaymentView: 'payroll.payment.view',
  payrollPaymentManage: 'payroll.payment.manage',
  payrollSensitiveView: 'payroll.sensitive.view',
  payrollSelfService: 'payroll.self_service',
  attendanceView: 'attendance.view',
  attendanceManage: 'attendance.manage',
  attendanceClock: 'attendance.clock',
  attendanceCorrect: 'attendance.correct',
  attendanceApprove: 'attendance.approve',
  attendanceExport: 'attendance.export',
  scheduleView: 'schedule.view',
  scheduleManage: 'schedule.manage',
  shiftView: 'shift.view',
  shiftManage: 'shift.manage',
  leaveView: 'leave.view',
  leaveRequest: 'leave.request',
  leaveApprove: 'leave.approve',
  leaveCancel: 'leave.cancel',
  leaveManage: 'leave.manage',
  leaveBalanceView: 'leave.balance.view',
  leaveBalanceManage: 'leave.balance.manage',
  holidayView: 'holiday.view',
  holidayManage: 'holiday.manage',
  overtimeView: 'overtime.view',
  overtimeManage: 'overtime.manage',
  overtimeApprove: 'overtime.approve',
  recruitmentView: 'recruitment.view',
  recruitmentManage: 'recruitment.manage',
  requisitionView: 'requisition.view',
  requisitionCreate: 'requisition.create',
  requisitionUpdate: 'requisition.update',
  requisitionApprove: 'requisition.approve',
  candidateView: 'candidate.view',
  candidateCreate: 'candidate.create',
  candidateUpdate: 'candidate.update',
  candidateDelete: 'candidate.delete',
  applicationView: 'application.view',
  applicationManage: 'application.manage',
  applicationStageManage: 'application.stage.manage',
  interviewView: 'interview.view',
  interviewManage: 'interview.manage',
  interviewFeedbackManage: 'interview.feedback.manage',
  offerView: 'offer.view',
  offerCreate: 'offer.create',
  offerUpdate: 'offer.update',
  offerApprove: 'offer.approve',
  offerSend: 'offer.send',
  onboardingView: 'onboarding.view',
  onboardingManage: 'onboarding.manage',
  onboardingComplete: 'onboarding.complete',
  onboardingTaskView: 'onboarding.task.view',
  onboardingTaskManage: 'onboarding.task.manage',
  performanceCycleView: 'performance.cycle.view',
  performanceCycleCreate: 'performance.cycle.create',
  performanceCycleUpdate: 'performance.cycle.update',
  performanceCycleManage: 'performance.cycle.manage',
  performanceReviewViewSelf: 'performance.review.view_self',
  performanceReviewViewTeam: 'performance.review.view_team',
  performanceReviewViewAll: 'performance.review.view_all',
  performanceReviewCreate: 'performance.review.create',
  performanceReviewSubmit: 'performance.review.submit',
  performanceReviewFinalize: 'performance.review.finalize',
  performanceGoalView: 'performance.goal.view',
  performanceGoalCreate: 'performance.goal.create',
  performanceGoalUpdate: 'performance.goal.update',
  performanceGoalManage: 'performance.goal.manage',
  performanceFeedbackCreate: 'performance.feedback.create',
  performanceFeedbackView: 'performance.feedback.view',
  performanceCalibrationView: 'performance.calibration.view',
  performanceCalibrationManage: 'performance.calibration.manage',
  performancePipView: 'performance.pip.view',
  performancePipCreate: 'performance.pip.create',
  performancePipManage: 'performance.pip.manage',
  performanceDevelopmentView: 'performance.development.view',
  performanceDevelopmentManage: 'performance.development.manage',
  performanceSuccessionView: 'performance.succession.view',
  performanceSuccessionManage: 'performance.succession.manage',
  performanceAnalyticsView: 'performance.analytics.view',
  performanceExport: 'performance.export',
} as const

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export const userDirectoryPermissions = [PERMISSIONS.usersView] as const
export const organizationPermissions = [PERMISSIONS.organizationsView] as const
export const legalEntityPermissions = [PERMISSIONS.legalEntitiesView] as const
export const branchPermissions = [PERMISSIONS.branchesView] as const
export const vehiclePermissions = [PERMISSIONS.vehicleView] as const
export const customerPermissions = [PERMISSIONS.customerView] as const
export const bookingPermissions = [PERMISSIONS.bookingView] as const
export const bookingCalendarPermissions = [PERMISSIONS.bookingViewCalendar] as const

/** Roles that receive vehicle.view on the server. Used when a session predates that permission. */
export const vehicleDirectoryRoles = [
  'admin',
  'org_admin',
  'super_admin',
  'manager',
  'branch_manager',
] as const

/** Roles that receive customer.view on the server. Used when a session predates that permission. */
export const customerDirectoryRoles = vehicleDirectoryRoles

/** Roles that receive booking.view on the server. Used when a session predates that permission. */
export const bookingDirectoryRoles = vehicleDirectoryRoles

/** Roles that receive contract.view on the server. Used when a session predates that permission. */
export const contractDirectoryRoles = vehicleDirectoryRoles
export const contractPermissions = [PERMISSIONS.contractView] as const
export const financeDirectoryRoles = vehicleDirectoryRoles
export const invoicePermissions = [PERMISSIONS.invoiceView] as const
export const paymentPermissions = [PERMISSIONS.paymentView] as const
export const receiptPermissions = [PERMISSIONS.receiptView] as const
export const creditNotePermissions = [PERMISSIONS.creditNoteView] as const
export const debitNotePermissions = [PERMISSIONS.debitNoteView] as const
export const depositPermissions = [PERMISSIONS.depositView] as const
export const procurementDirectoryRoles = vehicleDirectoryRoles
export const vendorPermissions = [PERMISSIONS.vendorView] as const
export const lpoPermissions = [PERMISSIONS.lpoView] as const
export const vendorBillPermissions = [PERMISSIONS.vendorBillView] as const
export const expensePermissions = [PERMISSIONS.expenseView] as const
export const servicePermissions = [PERMISSIONS.serviceView] as const
export const serviceReminderPermissions = [PERMISSIONS.serviceReminderView] as const
export const chargesDirectoryRoles = vehicleDirectoryRoles
export const finePermissions = [PERMISSIONS.fineView] as const
export const tollPermissions = [PERMISSIONS.tollView] as const
export const refundPermissions = [PERMISSIONS.refundView] as const
export const fineImportPermissions = [PERMISSIONS.fineImportView] as const
export const disputePermissions = [PERMISSIONS.fineView] as const
export const recoveryPermissions = [PERMISSIONS.fineView, PERMISSIONS.tollView] as const
export const accountingDirectoryRoles = vehicleDirectoryRoles
export const accountingPermissions = [PERMISSIONS.accountingView] as const
export const accountingLedgerPermissions = [PERMISSIONS.accountingViewLedger] as const
export const accountingTrialBalancePermissions = [PERMISSIONS.accountingViewTrialBalance] as const
export const accountingManagePermissions = [PERMISSIONS.accountingManageAccounts] as const
export const taxDirectoryRoles = vehicleDirectoryRoles
export const taxPermissions = [PERMISSIONS.taxView] as const
export const taxReportPermissions = [PERMISSIONS.taxViewReports] as const
export const einvoicePermissions = [PERMISSIONS.einvoiceView] as const
export const dashboardPermissions = [PERMISSIONS.dashboardView] as const
export const reportsPermissions = [PERMISSIONS.reportsView] as const
export const reportsOperationalPermissions = [PERMISSIONS.reportsOperational] as const
export const reportsFinancialPermissions = [PERMISSIONS.reportsFinancial] as const
export const reportsDirectoryRoles = vehicleDirectoryRoles
export const investorsAdminPermissions = [PERMISSIONS.investorsView] as const
export const investorsAdminRoles = ['admin', 'org_admin', 'super_admin'] as const
export const investorPortalPermissions = [PERMISSIONS.investorPortal] as const
export const investorOverviewPermissions = [PERMISSIONS.investorViewOverview] as const
export const investorFleetPermissions = [PERMISSIONS.investorViewFleet] as const
export const investorPerformancePermissions = [PERMISSIONS.investorViewPerformance] as const
export const investorFinancialPermissions = [PERMISSIONS.investorViewFinancial] as const
export const investorContractsPermissions = [PERMISSIONS.investorViewContracts] as const
export const investorReportsPermissions = [PERMISSIONS.investorViewReports] as const
export const investorRole = 'investor' as const
export const hrEmployeePermissions = [PERMISSIONS.hrEmployeeView] as const
export const hrDepartmentPermissions = [PERMISSIONS.hrDepartmentView] as const
export const hrPositionPermissions = [PERMISSIONS.hrPositionView] as const
export const hrDocumentPermissions = [PERMISSIONS.hrEmployeeDocumentView] as const
export const hrDirectoryRoles = ['admin', 'org_admin', 'super_admin', 'manager', 'branch_manager'] as const
export const payrollViewPermissions = [PERMISSIONS.payrollView] as const
export const payrollCompensationPermissions = [PERMISSIONS.payrollCompensationView] as const
export const payrollPayslipPermissions = [PERMISSIONS.payrollPayslipView] as const
export const payrollPaymentPermissions = [PERMISSIONS.payrollPaymentView] as const
export const payrollDirectoryRoles = ['admin', 'org_admin', 'super_admin', 'manager', 'branch_manager'] as const
export const attendanceViewPermissions = [PERMISSIONS.attendanceView] as const
export const attendanceClockPermissions = [PERMISSIONS.attendanceClock] as const
export const scheduleViewPermissions = [PERMISSIONS.scheduleView] as const
export const shiftViewPermissions = [PERMISSIONS.shiftView] as const
export const leaveViewPermissions = [PERMISSIONS.leaveView] as const
export const holidayViewPermissions = [PERMISSIONS.holidayView] as const
export const overtimeViewPermissions = [PERMISSIONS.overtimeView] as const
export const workforceDirectoryRoles = [
  'admin',
  'org_admin',
  'super_admin',
  'manager',
  'branch_manager',
] as const
export const recruitmentViewPermissions = [PERMISSIONS.recruitmentView] as const
export const requisitionViewPermissions = [PERMISSIONS.requisitionView] as const
export const candidateViewPermissions = [PERMISSIONS.candidateView] as const
export const applicationViewPermissions = [PERMISSIONS.applicationView] as const
export const interviewViewPermissions = [PERMISSIONS.interviewView] as const
export const offerViewPermissions = [PERMISSIONS.offerView] as const
export const onboardingViewPermissions = [PERMISSIONS.onboardingView] as const
export const recruitmentDirectoryRoles = [
  'admin',
  'org_admin',
  'super_admin',
  'manager',
  'branch_manager',
] as const
export const performanceAnalyticsPermissions = [PERMISSIONS.performanceAnalyticsView] as const
export const performanceCyclePermissions = [PERMISSIONS.performanceCycleView] as const
export const performanceReviewPermissions = [PERMISSIONS.performanceReviewViewSelf] as const
export const performanceGoalPermissions = [PERMISSIONS.performanceGoalView] as const
export const performancePipPermissions = [PERMISSIONS.performancePipView] as const
export const performanceDevelopmentPermissions = [PERMISSIONS.performanceDevelopmentView] as const
export const performanceDirectoryRoles = [
  'admin',
  'org_admin',
  'super_admin',
  'manager',
  'branch_manager',
] as const
