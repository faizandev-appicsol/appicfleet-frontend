import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { LoadingState } from '@/components/feedback/LoadingState'
import { AppShell } from '@/components/layout/AppShell'
import { InvestorShell } from '@/components/layout/InvestorShell'
import { InternalOnlyRoute } from '@/app/router/InternalOnlyRoute'
import { InvestorOnlyRoute } from '@/app/router/InvestorOnlyRoute'
import { PermissionRoute } from '@/app/router/PermissionRoute'
import { ProtectedRoute } from '@/app/router/ProtectedRoute'
import { PublicOnlyRoute } from '@/app/router/PublicOnlyRoute'
import {
  accountingDirectoryRoles,
  accountingLedgerPermissions,
  accountingPermissions,
  accountingTrialBalancePermissions,
  einvoicePermissions,
  taxDirectoryRoles,
  taxPermissions,
  taxReportPermissions,
  reportsDirectoryRoles,
  reportsFinancialPermissions,
  reportsOperationalPermissions,
  reportsPermissions,
  investorsAdminPermissions,
  investorsAdminRoles,
  hrEmployeePermissions,
  hrDepartmentPermissions,
  hrPositionPermissions,
  hrDocumentPermissions,
  hrDirectoryRoles,
  payrollViewPermissions,
  payrollCompensationPermissions,
  payrollPayslipPermissions,
  payrollPaymentPermissions,
  payrollDirectoryRoles,
  attendanceViewPermissions,
  attendanceClockPermissions,
  scheduleViewPermissions,
  shiftViewPermissions,
  leaveViewPermissions,
  holidayViewPermissions,
  overtimeViewPermissions,
  workforceDirectoryRoles,
  recruitmentViewPermissions,
  requisitionViewPermissions,
  candidateViewPermissions,
  applicationViewPermissions,
  interviewViewPermissions,
  offerViewPermissions,
  onboardingViewPermissions,
  recruitmentDirectoryRoles,
  performanceAnalyticsPermissions,
  performanceCyclePermissions,
  performanceReviewPermissions,
  performanceGoalPermissions,
  performancePipPermissions,
  performanceDevelopmentPermissions,
  performanceDirectoryRoles,
  investorOverviewPermissions,
  investorFleetPermissions,
  investorPerformancePermissions,
  investorFinancialPermissions,
  investorContractsPermissions,
  investorReportsPermissions,
  investorPortalPermissions,
  branchPermissions,
  legalEntityPermissions,
  organizationPermissions,
  userDirectoryPermissions,
  bookingCalendarPermissions,
  bookingDirectoryRoles,
  bookingPermissions,
  chargesDirectoryRoles,
  contractDirectoryRoles,
  contractPermissions,
  creditNotePermissions,
  customerDirectoryRoles,
  customerPermissions,
  debitNotePermissions,
  depositPermissions,
  disputePermissions,
  expensePermissions,
  financeDirectoryRoles,
  fineImportPermissions,
  finePermissions,
  invoicePermissions,
  lpoPermissions,
  paymentPermissions,
  procurementDirectoryRoles,
  receiptPermissions,
  recoveryPermissions,
  refundPermissions,
  servicePermissions,
  serviceReminderPermissions,
  tollPermissions,
  vehicleDirectoryRoles,
  vehiclePermissions,
  vendorBillPermissions,
  vendorPermissions,
} from '@/app/router/access'
import { appConfig } from '@/config/app.config'
import { useTranslation } from '@/i18n'

const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((module) => ({ default: module.LoginPage })),
)
const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  })),
)
const ProfilePage = lazy(() =>
  import('@/features/profile/pages/ProfilePage').then((module) => ({
    default: module.ProfilePage,
  })),
)
const UsersPage = lazy(() =>
  import('@/features/users/pages/UsersPage').then((module) => ({ default: module.UsersPage })),
)
const UserDetailsPage = lazy(() =>
  import('@/features/users/pages/UserDetailsPage').then((module) => ({
    default: module.UserDetailsPage,
  })),
)
const OrganizationsPage = lazy(() =>
  import('@/features/organizations/pages/OrganizationsPage').then((module) => ({
    default: module.OrganizationsPage,
  })),
)
const LegalEntitiesPage = lazy(() =>
  import('@/features/legal-entities/pages/LegalEntitiesPage').then((module) => ({
    default: module.LegalEntitiesPage,
  })),
)
const BranchesPage = lazy(() =>
  import('@/features/branches/pages/BranchesPage').then((module) => ({
    default: module.BranchesPage,
  })),
)
const VehiclesPage = lazy(() =>
  import('@/features/vehicles/pages/VehiclesPage').then((module) => ({
    default: module.VehiclesPage,
  })),
)
const VehicleDetailsPage = lazy(() =>
  import('@/features/vehicles/pages/VehicleDetailsPage').then((module) => ({
    default: module.VehicleDetailsPage,
  })),
)
const CustomersPage = lazy(() =>
  import('@/features/customers/pages/CustomersPage').then((module) => ({
    default: module.CustomersPage,
  })),
)
const CustomerDetailsPage = lazy(() =>
  import('@/features/customers/pages/CustomerDetailsPage').then((module) => ({
    default: module.CustomerDetailsPage,
  })),
)
const BookingsPage = lazy(() =>
  import('@/features/bookings/pages/BookingsPage').then((module) => ({
    default: module.BookingsPage,
  })),
)
const BookingCalendarPage = lazy(() =>
  import('@/features/bookings/pages/BookingCalendarPage').then((module) => ({
    default: module.BookingCalendarPage,
  })),
)
const BookingDetailsPage = lazy(() =>
  import('@/features/bookings/pages/BookingDetailsPage').then((module) => ({
    default: module.BookingDetailsPage,
  })),
)
const ContractsPage = lazy(() =>
  import('@/features/contracts/pages/ContractsPage').then((module) => ({
    default: module.ContractsPage,
  })),
)
const ContractDetailsPage = lazy(() =>
  import('@/features/contracts/pages/ContractDetailsPage').then((module) => ({
    default: module.ContractDetailsPage,
  })),
)
const InvoicesPage = lazy(() =>
  import('@/features/finance/pages/InvoicesPage').then((module) => ({ default: module.InvoicesPage })),
)
const InvoiceDetailsPage = lazy(() =>
  import('@/features/finance/pages/InvoiceDetailsPage').then((module) => ({
    default: module.InvoiceDetailsPage,
  })),
)
const PaymentsPage = lazy(() =>
  import('@/features/finance/pages/PaymentsPage').then((module) => ({ default: module.PaymentsPage })),
)
const PaymentDetailsPage = lazy(() =>
  import('@/features/finance/pages/PaymentDetailsPage').then((module) => ({
    default: module.PaymentDetailsPage,
  })),
)
const ReceiptsPage = lazy(() =>
  import('@/features/finance/pages/ReceiptsPage').then((module) => ({ default: module.ReceiptsPage })),
)
const ReceiptDetailsPage = lazy(() =>
  import('@/features/finance/pages/ReceiptDetailsPage').then((module) => ({
    default: module.ReceiptDetailsPage,
  })),
)
const CreditNotesPage = lazy(() =>
  import('@/features/finance/pages/CreditNotesPage').then((module) => ({ default: module.CreditNotesPage })),
)
const CreditNoteDetailsPage = lazy(() =>
  import('@/features/finance/pages/CreditNoteDetailsPage').then((module) => ({
    default: module.CreditNoteDetailsPage,
  })),
)
const DebitNotesPage = lazy(() =>
  import('@/features/finance/pages/DebitNotesPage').then((module) => ({ default: module.DebitNotesPage })),
)
const DebitNoteDetailsPage = lazy(() =>
  import('@/features/finance/pages/DebitNoteDetailsPage').then((module) => ({
    default: module.DebitNoteDetailsPage,
  })),
)
const DepositsPage = lazy(() =>
  import('@/features/finance/pages/DepositsPage').then((module) => ({ default: module.DepositsPage })),
)
const DepositDetailsPage = lazy(() =>
  import('@/features/finance/pages/DepositDetailsPage').then((module) => ({
    default: module.DepositDetailsPage,
  })),
)
const VendorsPage = lazy(() =>
  import('@/features/procurement/pages/VendorsPage').then((module) => ({ default: module.VendorsPage })),
)
const VendorDetailsPage = lazy(() =>
  import('@/features/procurement/pages/VendorDetailsPage').then((module) => ({
    default: module.VendorDetailsPage,
  })),
)
const LposPage = lazy(() =>
  import('@/features/procurement/pages/LposPage').then((module) => ({ default: module.LposPage })),
)
const LpoDetailsPage = lazy(() =>
  import('@/features/procurement/pages/LpoDetailsPage').then((module) => ({
    default: module.LpoDetailsPage,
  })),
)
const VendorBillsPage = lazy(() =>
  import('@/features/procurement/pages/VendorBillsPage').then((module) => ({
    default: module.VendorBillsPage,
  })),
)
const VendorBillDetailsPage = lazy(() =>
  import('@/features/procurement/pages/VendorBillDetailsPage').then((module) => ({
    default: module.VendorBillDetailsPage,
  })),
)
const ExpensesPage = lazy(() =>
  import('@/features/procurement/pages/ExpensesPage').then((module) => ({ default: module.ExpensesPage })),
)
const ExpenseDetailsPage = lazy(() =>
  import('@/features/procurement/pages/ExpenseDetailsPage').then((module) => ({
    default: module.ExpenseDetailsPage,
  })),
)
const ServicePage = lazy(() =>
  import('@/features/procurement/pages/ServicePage').then((module) => ({ default: module.ServicePage })),
)
const WorkOrderDetailsPage = lazy(() =>
  import('@/features/procurement/pages/WorkOrderDetailsPage').then((module) => ({
    default: module.WorkOrderDetailsPage,
  })),
)
const ServiceRemindersPage = lazy(() =>
  import('@/features/procurement/pages/ServiceRemindersPage').then((module) => ({
    default: module.ServiceRemindersPage,
  })),
)
const FinesPage = lazy(() =>
  import('@/features/charges/pages/FinesPage').then((module) => ({ default: module.FinesPage })),
)
const FineDetailsPage = lazy(() =>
  import('@/features/charges/pages/FineDetailsPage').then((module) => ({
    default: module.FineDetailsPage,
  })),
)
const TollsPage = lazy(() =>
  import('@/features/charges/pages/TollsPage').then((module) => ({ default: module.TollsPage })),
)
const TollDetailsPage = lazy(() =>
  import('@/features/charges/pages/TollDetailsPage').then((module) => ({
    default: module.TollDetailsPage,
  })),
)
const RefundsPage = lazy(() =>
  import('@/features/charges/pages/RefundsPage').then((module) => ({ default: module.RefundsPage })),
)
const RefundDetailsPage = lazy(() =>
  import('@/features/charges/pages/RefundDetailsPage').then((module) => ({
    default: module.RefundDetailsPage,
  })),
)
const ChargeImportPage = lazy(() =>
  import('@/features/charges/pages/ChargeImportPage').then((module) => ({
    default: module.ChargeImportPage,
  })),
)
const ChargeImportDetailsPage = lazy(() =>
  import('@/features/charges/pages/ChargeImportDetailsPage').then((module) => ({
    default: module.ChargeImportDetailsPage,
  })),
)
const DisputesPage = lazy(() =>
  import('@/features/charges/pages/DisputesPage').then((module) => ({ default: module.DisputesPage })),
)
const RecoveryPage = lazy(() =>
  import('@/features/charges/pages/RecoveryPage').then((module) => ({ default: module.RecoveryPage })),
)
const AccountingOverviewPage = lazy(() =>
  import('@/features/accounting/pages/AccountingOverviewPage').then((module) => ({
    default: module.AccountingOverviewPage,
  })),
)
const ChartOfAccountsPage = lazy(() =>
  import('@/features/accounting/pages/ChartOfAccountsPage').then((module) => ({
    default: module.ChartOfAccountsPage,
  })),
)
const JournalsPage = lazy(() =>
  import('@/features/accounting/pages/JournalsPage').then((module) => ({ default: module.JournalsPage })),
)
const JournalFormPage = lazy(() =>
  import('@/features/accounting/pages/JournalFormPage').then((module) => ({
    default: module.JournalFormPage,
  })),
)
const JournalDetailsPage = lazy(() =>
  import('@/features/accounting/pages/JournalDetailsPage').then((module) => ({
    default: module.JournalDetailsPage,
  })),
)
const GeneralLedgerPage = lazy(() =>
  import('@/features/accounting/pages/GeneralLedgerPage').then((module) => ({
    default: module.GeneralLedgerPage,
  })),
)
const TrialBalancePage = lazy(() =>
  import('@/features/accounting/pages/TrialBalancePage').then((module) => ({
    default: module.TrialBalancePage,
  })),
)
const FiscalPeriodsPage = lazy(() =>
  import('@/features/accounting/pages/FiscalPeriodsPage').then((module) => ({
    default: module.FiscalPeriodsPage,
  })),
)
const AccountingSettingsPage = lazy(() =>
  import('@/features/accounting/pages/AccountingSettingsPage').then((module) => ({
    default: module.AccountingSettingsPage,
  })),
)
const TaxOverviewPage = lazy(() =>
  import('@/features/tax/pages/TaxOverviewPage').then((module) => ({ default: module.TaxOverviewPage })),
)
const TaxCodesPage = lazy(() =>
  import('@/features/tax/pages/TaxCodesPage').then((module) => ({ default: module.TaxCodesPage })),
)
const TaxTransactionsPage = lazy(() =>
  import('@/features/tax/pages/TaxTransactionsPage').then((module) => ({ default: module.TaxTransactionsPage })),
)
const TaxPeriodsPage = lazy(() =>
  import('@/features/tax/pages/TaxPeriodsPage').then((module) => ({ default: module.TaxPeriodsPage })),
)
const VatReportsPage = lazy(() =>
  import('@/features/tax/pages/VatReportsPage').then((module) => ({ default: module.VatReportsPage })),
)
const EInvoicesPage = lazy(() =>
  import('@/features/tax/pages/EInvoicesPage').then((module) => ({ default: module.EInvoicesPage })),
)
const EInvoiceDetailsPage = lazy(() =>
  import('@/features/tax/pages/EInvoiceDetailsPage').then((module) => ({ default: module.EInvoiceDetailsPage })),
)
const TaxSettingsPage = lazy(() =>
  import('@/features/tax/pages/TaxSettingsPage').then((module) => ({ default: module.TaxSettingsPage })),
)
const ReportsOverviewPage = lazy(() =>
  import('@/features/reports/pages/ReportsOverviewPage').then((module) => ({
    default: module.ReportsOverviewPage,
  })),
)
const BookingReportPage = lazy(() =>
  import('@/features/reports/pages/reportPages').then((module) => ({ default: module.BookingReportPage })),
)
const VehicleReportPage = lazy(() =>
  import('@/features/reports/pages/reportPages').then((module) => ({ default: module.VehicleReportPage })),
)
const FleetUtilizationReportPage = lazy(() =>
  import('@/features/reports/pages/reportPages').then((module) => ({
    default: module.FleetUtilizationReportPage,
  })),
)
const CustomerReportPage = lazy(() =>
  import('@/features/reports/pages/reportPages').then((module) => ({ default: module.CustomerReportPage })),
)
const ContractReportPage = lazy(() =>
  import('@/features/reports/pages/reportPages').then((module) => ({ default: module.ContractReportPage })),
)
const PaymentReportPage = lazy(() =>
  import('@/features/reports/pages/reportPages').then((module) => ({ default: module.PaymentReportPage })),
)
const ReceivablesReportPage = lazy(() =>
  import('@/features/reports/pages/reportPages').then((module) => ({
    default: module.ReceivablesReportPage,
  })),
)
const ExpenseReportPage = lazy(() =>
  import('@/features/reports/pages/reportPages').then((module) => ({ default: module.ExpenseReportPage })),
)
const MaintenanceReportPage = lazy(() =>
  import('@/features/reports/pages/reportPages').then((module) => ({
    default: module.MaintenanceReportPage,
  })),
)
const FinesReportPage = lazy(() =>
  import('@/features/reports/pages/reportPages').then((module) => ({ default: module.FinesReportPage })),
)
const RefundsReportPage = lazy(() =>
  import('@/features/reports/pages/reportPages').then((module) => ({ default: module.RefundsReportPage })),
)
const AccountingReportsPage = lazy(() =>
  import('@/features/reports/pages/reportPages').then((module) => ({
    default: module.AccountingReportsPage,
  })),
)
const VatReportsLinkPage = lazy(() =>
  import('@/features/reports/pages/reportPages').then((module) => ({ default: module.VatReportsLinkPage })),
)
const EInvoiceReportPage = lazy(() =>
  import('@/features/reports/pages/reportPages').then((module) => ({ default: module.EInvoiceReportPage })),
)
const InvestorsPage = lazy(() =>
  import('@/features/investors/pages/InvestorsPage').then((module) => ({
    default: module.InvestorsPage,
  })),
)
const InvestorDetailsPage = lazy(() =>
  import('@/features/investors/pages/InvestorDetailsPage').then((module) => ({
    default: module.InvestorDetailsPage,
  })),
)
const InvestorOverviewPage = lazy(() =>
  import('@/features/investor-portal/pages/InvestorOverviewPage').then((module) => ({
    default: module.InvestorOverviewPage,
  })),
)
const InvestorFleetPage = lazy(() =>
  import('@/features/investor-portal/pages/InvestorFleetPage').then((module) => ({
    default: module.InvestorFleetPage,
  })),
)
const InvestorPerformancePage = lazy(() =>
  import('@/features/investor-portal/pages/InvestorPerformancePage').then((module) => ({
    default: module.InvestorPerformancePage,
  })),
)
const InvestorFinancialPage = lazy(() =>
  import('@/features/investor-portal/pages/InvestorFinancialPage').then((module) => ({
    default: module.InvestorFinancialPage,
  })),
)
const InvestorContractsPage = lazy(() =>
  import('@/features/investor-portal/pages/InvestorContractsPage').then((module) => ({
    default: module.InvestorContractsPage,
  })),
)
const InvestorReportsPage = lazy(() =>
  import('@/features/investor-portal/pages/InvestorReportsPage').then((module) => ({
    default: module.InvestorReportsPage,
  })),
)
const InvestorProfilePage = lazy(() =>
  import('@/features/investor-portal/pages/InvestorProfilePage').then((module) => ({
    default: module.InvestorProfilePage,
  })),
)
const AcceptInvestorInvitePage = lazy(() =>
  import('@/features/investor-portal/pages/AcceptInvestorInvitePage').then((module) => ({
    default: module.AcceptInvestorInvitePage,
  })),
)
const HrOverviewPage = lazy(() =>
  import('@/features/hr/pages/HrOverviewPage').then((module) => ({ default: module.HrOverviewPage })),
)
const PayrollOverviewPage = lazy(() =>
  import('@/features/payroll/pages/PayrollOverviewPage').then((module) => ({
    default: module.PayrollOverviewPage,
  })),
)
const PayrollPeriodsPage = lazy(() =>
  import('@/features/payroll/pages/PayrollPeriodsPage').then((module) => ({
    default: module.PayrollPeriodsPage,
  })),
)
const PayrollRunsPage = lazy(() =>
  import('@/features/payroll/pages/PayrollRunsPage').then((module) => ({
    default: module.PayrollRunsPage,
  })),
)
const PayrollRunDetailsPage = lazy(() =>
  import('@/features/payroll/pages/PayrollRunDetailsPage').then((module) => ({
    default: module.PayrollRunDetailsPage,
  })),
)
const CompensationPage = lazy(() =>
  import('@/features/payroll/pages/CompensationPage').then((module) => ({
    default: module.CompensationPage,
  })),
)
const AdjustmentsPage = lazy(() =>
  import('@/features/payroll/pages/AdjustmentsPage').then((module) => ({
    default: module.AdjustmentsPage,
  })),
)
const PayslipsPage = lazy(() =>
  import('@/features/payroll/pages/PayslipsPage').then((module) => ({
    default: module.PayslipsPage,
  })),
)
const PayrollPaymentsPage = lazy(() =>
  import('@/features/payroll/pages/PaymentsPage').then((module) => ({
    default: module.PaymentsPage,
  })),
)
const WorkforceOverviewPage = lazy(() =>
  import('@/features/workforce/pages/WorkforceOverviewPage').then((module) => ({
    default: module.WorkforceOverviewPage,
  })),
)
const AttendancePage = lazy(() =>
  import('@/features/workforce/pages/AttendancePage').then((module) => ({
    default: module.AttendancePage,
  })),
)
const SchedulesPage = lazy(() =>
  import('@/features/workforce/pages/SchedulesPage').then((module) => ({
    default: module.SchedulesPage,
  })),
)
const ShiftsPage = lazy(() =>
  import('@/features/workforce/pages/ShiftsPage').then((module) => ({
    default: module.ShiftsPage,
  })),
)
const LeavePage = lazy(() =>
  import('@/features/workforce/pages/LeavePage').then((module) => ({
    default: module.LeavePage,
  })),
)
const HolidaysPage = lazy(() =>
  import('@/features/workforce/pages/HolidaysPage').then((module) => ({
    default: module.HolidaysPage,
  })),
)
const OvertimePage = lazy(() =>
  import('@/features/workforce/pages/OvertimePage').then((module) => ({
    default: module.OvertimePage,
  })),
)
const RecruitmentOverviewPage = lazy(() =>
  import('@/features/recruitment/pages/RecruitmentOverviewPage').then((module) => ({
    default: module.RecruitmentOverviewPage,
  })),
)
const RequisitionsPage = lazy(() =>
  import('@/features/recruitment/pages/RequisitionsPage').then((module) => ({
    default: module.RequisitionsPage,
  })),
)
const PostingsPage = lazy(() =>
  import('@/features/recruitment/pages/PostingsPage').then((module) => ({
    default: module.PostingsPage,
  })),
)
const CandidatesPage = lazy(() =>
  import('@/features/recruitment/pages/CandidatesPage').then((module) => ({
    default: module.CandidatesPage,
  })),
)
const CandidateDetailPage = lazy(() =>
  import('@/features/recruitment/pages/CandidateDetailPage').then((module) => ({
    default: module.CandidateDetailPage,
  })),
)
const ApplicationsPage = lazy(() =>
  import('@/features/recruitment/pages/ApplicationsPage').then((module) => ({
    default: module.ApplicationsPage,
  })),
)
const InterviewsPage = lazy(() =>
  import('@/features/recruitment/pages/InterviewsPage').then((module) => ({
    default: module.InterviewsPage,
  })),
)
const OffersPage = lazy(() =>
  import('@/features/recruitment/pages/OffersPage').then((module) => ({
    default: module.OffersPage,
  })),
)
const OnboardingPage = lazy(() =>
  import('@/features/recruitment/pages/OnboardingPage').then((module) => ({
    default: module.OnboardingPage,
  })),
)
const PerformanceOverviewPage = lazy(() =>
  import('@/features/performance/pages/PerformanceOverviewPage').then((module) => ({
    default: module.PerformanceOverviewPage,
  })),
)
const CyclesPage = lazy(() =>
  import('@/features/performance/pages/CyclesPage').then((module) => ({
    default: module.CyclesPage,
  })),
)
const ReviewsPage = lazy(() =>
  import('@/features/performance/pages/ReviewsPage').then((module) => ({
    default: module.ReviewsPage,
  })),
)
const GoalsPage = lazy(() =>
  import('@/features/performance/pages/GoalsPage').then((module) => ({
    default: module.GoalsPage,
  })),
)
const PipsPage = lazy(() =>
  import('@/features/performance/pages/PipsPage').then((module) => ({
    default: module.PipsPage,
  })),
)
const DevelopmentPage = lazy(() =>
  import('@/features/performance/pages/DevelopmentPage').then((module) => ({
    default: module.DevelopmentPage,
  })),
)
const AnalyticsPage = lazy(() =>
  import('@/features/performance/pages/AnalyticsPage').then((module) => ({
    default: module.AnalyticsPage,
  })),
)
const EmployeesPage = lazy(() =>
  import('@/features/hr/pages/EmployeesPage').then((module) => ({ default: module.EmployeesPage })),
)
const EmployeeDetailsPage = lazy(() =>
  import('@/features/hr/pages/EmployeeDetailsPage').then((module) => ({
    default: module.EmployeeDetailsPage,
  })),
)
const DepartmentsPage = lazy(() =>
  import('@/features/hr/pages/DepartmentsPage').then((module) => ({
    default: module.DepartmentsPage,
  })),
)
const PositionsPage = lazy(() =>
  import('@/features/hr/pages/PositionsPage').then((module) => ({ default: module.PositionsPage })),
)
const DocumentExpiryPage = lazy(() =>
  import('@/features/hr/pages/DocumentExpiryPage').then((module) => ({
    default: module.DocumentExpiryPage,
  })),
)
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
)
const UnauthorizedPage = lazy(() =>
  import('@/pages/UnauthorizedPage').then((module) => ({ default: module.UnauthorizedPage })),
)

export function AppRoutes() {
  const { t } = useTranslation()

  return (
    <Suspense fallback={<LoadingState fullscreen label={t('feedback.loadingPage')} />}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="login" element={<LoginPage />} />
        </Route>
        <Route path="investor/invitations/accept" element={<AcceptInvestorInvitePage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<InvestorOnlyRoute />}>
            <Route element={<InvestorShell />}>
              <Route
                element={<PermissionRoute allow={investorOverviewPermissions} />}
              >
                <Route path="investor" element={<InvestorOverviewPage />} />
              </Route>
              <Route element={<PermissionRoute allow={investorFleetPermissions} />}>
                <Route path="investor/fleet" element={<InvestorFleetPage />} />
              </Route>
              <Route element={<PermissionRoute allow={investorPerformancePermissions} />}>
                <Route path="investor/performance" element={<InvestorPerformancePage />} />
              </Route>
              <Route element={<PermissionRoute allow={investorFinancialPermissions} />}>
                <Route path="investor/financial" element={<InvestorFinancialPage />} />
              </Route>
              <Route element={<PermissionRoute allow={investorContractsPermissions} />}>
                <Route path="investor/contracts" element={<InvestorContractsPage />} />
              </Route>
              <Route element={<PermissionRoute allow={investorReportsPermissions} />}>
                <Route path="investor/reports" element={<InvestorReportsPage />} />
              </Route>
              <Route element={<PermissionRoute allow={investorPortalPermissions} />}>
                <Route path="investor/profile" element={<InvestorProfilePage />} />
              </Route>
            </Route>
          </Route>

          <Route element={<InternalOnlyRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<Navigate to={appConfig.routes.home} replace />} />
            <Route path="profile" element={<ProfilePage />} />
            {/* Route guards are UX only; the API enforces every permission. */}
            <Route element={<PermissionRoute allow={userDirectoryPermissions} />}>
              <Route path="users" element={<UsersPage />} />
              <Route path="users/:userId" element={<UserDetailsPage />} />
            </Route>
            <Route
              element={
                <PermissionRoute allow={investorsAdminPermissions} roles={investorsAdminRoles} />
              }
            >
              <Route path="investors" element={<InvestorsPage />} />
              <Route path="investors/:investorId" element={<InvestorDetailsPage />} />
            </Route>
            <Route
              element={
                <PermissionRoute allow={hrEmployeePermissions} roles={hrDirectoryRoles} />
              }
            >
              <Route path="hr" element={<HrOverviewPage />} />
              <Route path="hr/employees" element={<EmployeesPage />} />
              <Route path="hr/employees/:employeeId" element={<EmployeeDetailsPage />} />
            </Route>
            <Route
              element={
                <PermissionRoute allow={hrDepartmentPermissions} roles={hrDirectoryRoles} />
              }
            >
              <Route path="hr/departments" element={<DepartmentsPage />} />
            </Route>
            <Route
              element={
                <PermissionRoute allow={hrPositionPermissions} roles={hrDirectoryRoles} />
              }
            >
              <Route path="hr/positions" element={<PositionsPage />} />
            </Route>
            <Route
              element={
                <PermissionRoute allow={hrDocumentPermissions} roles={hrDirectoryRoles} />
              }
            >
              <Route path="hr/document-expiry" element={<DocumentExpiryPage />} />
            </Route>
            <Route
              element={
                <PermissionRoute allow={payrollViewPermissions} roles={payrollDirectoryRoles} />
              }
            >
              <Route path="payroll" element={<PayrollOverviewPage />} />
              <Route path="payroll/periods" element={<PayrollPeriodsPage />} />
              <Route path="payroll/runs" element={<PayrollRunsPage />} />
              <Route path="payroll/runs/:runId" element={<PayrollRunDetailsPage />} />
              <Route path="payroll/adjustments" element={<AdjustmentsPage />} />
            </Route>
            <Route
              element={
                <PermissionRoute
                  allow={payrollCompensationPermissions}
                  roles={payrollDirectoryRoles}
                />
              }
            >
              <Route path="payroll/compensation" element={<CompensationPage />} />
            </Route>
            <Route
              element={
                <PermissionRoute allow={payrollPayslipPermissions} roles={payrollDirectoryRoles} />
              }
            >
              <Route path="payroll/payslips" element={<PayslipsPage />} />
            </Route>
            <Route
              element={
                <PermissionRoute allow={payrollPaymentPermissions} roles={payrollDirectoryRoles} />
              }
            >
              <Route path="payroll/payments" element={<PayrollPaymentsPage />} />
            </Route>
            <Route
              element={
                <PermissionRoute
                  allow={attendanceViewPermissions}
                  roles={workforceDirectoryRoles}
                />
              }
            >
              <Route path="workforce" element={<WorkforceOverviewPage />} />
            </Route>
            <Route
              element={
                <PermissionRoute
                  allow={[...attendanceViewPermissions, ...attendanceClockPermissions]}
                  roles={workforceDirectoryRoles}
                />
              }
            >
              <Route path="workforce/attendance" element={<AttendancePage />} />
            </Route>
            <Route
              element={
                <PermissionRoute allow={scheduleViewPermissions} roles={workforceDirectoryRoles} />
              }
            >
              <Route path="workforce/schedules" element={<SchedulesPage />} />
            </Route>
            <Route
              element={
                <PermissionRoute allow={shiftViewPermissions} roles={workforceDirectoryRoles} />
              }
            >
              <Route path="workforce/shifts" element={<ShiftsPage />} />
            </Route>
            <Route
              element={
                <PermissionRoute allow={leaveViewPermissions} roles={workforceDirectoryRoles} />
              }
            >
              <Route path="workforce/leave" element={<LeavePage />} />
            </Route>
            <Route
              element={
                <PermissionRoute allow={holidayViewPermissions} roles={workforceDirectoryRoles} />
              }
            >
              <Route path="workforce/holidays" element={<HolidaysPage />} />
            </Route>
            <Route
              element={
                <PermissionRoute allow={overtimeViewPermissions} roles={workforceDirectoryRoles} />
              }
            >
              <Route path="workforce/overtime" element={<OvertimePage />} />
            </Route>
            <Route
              element={
                <PermissionRoute
                  allow={recruitmentViewPermissions}
                  roles={recruitmentDirectoryRoles}
                />
              }
            >
              <Route path="recruitment" element={<RecruitmentOverviewPage />} />
            </Route>
            <Route
              element={
                <PermissionRoute
                  allow={requisitionViewPermissions}
                  roles={recruitmentDirectoryRoles}
                />
              }
            >
              <Route path="recruitment/requisitions" element={<RequisitionsPage />} />
              <Route path="recruitment/postings" element={<PostingsPage />} />
            </Route>
            <Route
              element={
                <PermissionRoute
                  allow={candidateViewPermissions}
                  roles={recruitmentDirectoryRoles}
                />
              }
            >
              <Route path="recruitment/candidates" element={<CandidatesPage />} />
              <Route path="recruitment/candidates/:candidateId" element={<CandidateDetailPage />} />
            </Route>
            <Route
              element={
                <PermissionRoute
                  allow={applicationViewPermissions}
                  roles={recruitmentDirectoryRoles}
                />
              }
            >
              <Route path="recruitment/applications" element={<ApplicationsPage />} />
            </Route>
            <Route
              element={
                <PermissionRoute
                  allow={interviewViewPermissions}
                  roles={recruitmentDirectoryRoles}
                />
              }
            >
              <Route path="recruitment/interviews" element={<InterviewsPage />} />
            </Route>
            <Route
              element={
                <PermissionRoute allow={offerViewPermissions} roles={recruitmentDirectoryRoles} />
              }
            >
              <Route path="recruitment/offers" element={<OffersPage />} />
            </Route>
            <Route
              element={
                <PermissionRoute
                  allow={onboardingViewPermissions}
                  roles={recruitmentDirectoryRoles}
                />
              }
            >
              <Route path="recruitment/onboarding" element={<OnboardingPage />} />
            </Route>
            <Route
              element={
                <PermissionRoute
                  allow={performanceAnalyticsPermissions}
                  roles={performanceDirectoryRoles}
                />
              }
            >
              <Route path="performance" element={<PerformanceOverviewPage />} />
              <Route path="performance/analytics" element={<AnalyticsPage />} />
            </Route>
            <Route
              element={
                <PermissionRoute
                  allow={performanceCyclePermissions}
                  roles={performanceDirectoryRoles}
                />
              }
            >
              <Route path="performance/cycles" element={<CyclesPage />} />
            </Route>
            <Route
              element={
                <PermissionRoute
                  allow={performanceReviewPermissions}
                  roles={performanceDirectoryRoles}
                />
              }
            >
              <Route path="performance/reviews" element={<ReviewsPage />} />
            </Route>
            <Route
              element={
                <PermissionRoute
                  allow={performanceGoalPermissions}
                  roles={performanceDirectoryRoles}
                />
              }
            >
              <Route path="performance/goals" element={<GoalsPage />} />
            </Route>
            <Route
              element={
                <PermissionRoute
                  allow={performancePipPermissions}
                  roles={performanceDirectoryRoles}
                />
              }
            >
              <Route path="performance/pips" element={<PipsPage />} />
            </Route>
            <Route
              element={
                <PermissionRoute
                  allow={performanceDevelopmentPermissions}
                  roles={performanceDirectoryRoles}
                />
              }
            >
              <Route path="performance/development" element={<DevelopmentPage />} />
            </Route>
            <Route element={<PermissionRoute allow={organizationPermissions} />}>
              <Route path="organizations" element={<OrganizationsPage />} />
            </Route>
            <Route element={<PermissionRoute allow={legalEntityPermissions} />}>
              <Route path="legal-entities" element={<LegalEntitiesPage />} />
            </Route>
            <Route element={<PermissionRoute allow={branchPermissions} />}>
              <Route path="branches" element={<BranchesPage />} />
            </Route>
            <Route element={<PermissionRoute allow={vehiclePermissions} roles={vehicleDirectoryRoles} />}>
              <Route path="vehicles" element={<VehiclesPage />} />
              <Route path="vehicles/:vehicleId" element={<VehicleDetailsPage />} />
            </Route>
            <Route element={<PermissionRoute allow={customerPermissions} roles={customerDirectoryRoles} />}>
              <Route path="customers" element={<CustomersPage />} />
              <Route path="customers/:customerId" element={<CustomerDetailsPage />} />
            </Route>
            <Route
              element={
                <PermissionRoute
                  allow={[...bookingPermissions, ...bookingCalendarPermissions]}
                  roles={bookingDirectoryRoles}
                />
              }
            >
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="bookings/calendar" element={<BookingCalendarPage />} />
              <Route path="bookings/:bookingId" element={<BookingDetailsPage />} />
            </Route>
            <Route element={<PermissionRoute allow={contractPermissions} roles={contractDirectoryRoles} />}>
              <Route path="contracts" element={<ContractsPage />} />
              <Route path="contracts/:contractId" element={<ContractDetailsPage />} />
            </Route>
            <Route element={<PermissionRoute allow={invoicePermissions} roles={financeDirectoryRoles} />}>
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="invoices/:invoiceId" element={<InvoiceDetailsPage />} />
            </Route>
            <Route element={<PermissionRoute allow={paymentPermissions} roles={financeDirectoryRoles} />}>
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="payments/:paymentId" element={<PaymentDetailsPage />} />
            </Route>
            <Route element={<PermissionRoute allow={receiptPermissions} roles={financeDirectoryRoles} />}>
              <Route path="receipts" element={<ReceiptsPage />} />
              <Route path="receipts/:receiptId" element={<ReceiptDetailsPage />} />
            </Route>
            <Route element={<PermissionRoute allow={creditNotePermissions} roles={financeDirectoryRoles} />}>
              <Route path="credit-notes" element={<CreditNotesPage />} />
              <Route path="credit-notes/:creditNoteId" element={<CreditNoteDetailsPage />} />
            </Route>
            <Route element={<PermissionRoute allow={debitNotePermissions} roles={financeDirectoryRoles} />}>
              <Route path="debit-notes" element={<DebitNotesPage />} />
              <Route path="debit-notes/:debitNoteId" element={<DebitNoteDetailsPage />} />
            </Route>
            <Route element={<PermissionRoute allow={depositPermissions} roles={financeDirectoryRoles} />}>
              <Route path="deposits" element={<DepositsPage />} />
              <Route path="deposits/:depositId" element={<DepositDetailsPage />} />
            </Route>
            <Route element={<PermissionRoute allow={expensePermissions} roles={procurementDirectoryRoles} />}>
              <Route path="expenses" element={<ExpensesPage />} />
              <Route path="expenses/:expenseId" element={<ExpenseDetailsPage />} />
            </Route>
            <Route element={<PermissionRoute allow={vendorPermissions} roles={procurementDirectoryRoles} />}>
              <Route path="vendors" element={<VendorsPage />} />
              <Route path="vendors/:vendorId" element={<VendorDetailsPage />} />
            </Route>
            <Route element={<PermissionRoute allow={lpoPermissions} roles={procurementDirectoryRoles} />}>
              <Route path="lpos" element={<LposPage />} />
              <Route path="lpos/:lpoId" element={<LpoDetailsPage />} />
            </Route>
            <Route element={<PermissionRoute allow={vendorBillPermissions} roles={procurementDirectoryRoles} />}>
              <Route path="vendor-bills" element={<VendorBillsPage />} />
              <Route path="vendor-bills/:billId" element={<VendorBillDetailsPage />} />
            </Route>
            <Route element={<PermissionRoute allow={servicePermissions} roles={procurementDirectoryRoles} />}>
              <Route path="service" element={<ServicePage />} />
              <Route path="service/:workOrderId" element={<WorkOrderDetailsPage />} />
            </Route>
            <Route element={<PermissionRoute allow={serviceReminderPermissions} roles={procurementDirectoryRoles} />}>
              <Route path="service-reminders" element={<ServiceRemindersPage />} />
            </Route>
            <Route element={<PermissionRoute allow={finePermissions} roles={chargesDirectoryRoles} />}>
              <Route path="fines" element={<FinesPage />} />
              <Route path="fines/:fineId" element={<FineDetailsPage />} />
            </Route>
            <Route element={<PermissionRoute allow={tollPermissions} roles={chargesDirectoryRoles} />}>
              <Route path="tolls" element={<TollsPage />} />
              <Route path="tolls/:tollId" element={<TollDetailsPage />} />
            </Route>
            <Route element={<PermissionRoute allow={refundPermissions} roles={chargesDirectoryRoles} />}>
              <Route path="refunds" element={<RefundsPage />} />
              <Route path="refunds/:refundId" element={<RefundDetailsPage />} />
            </Route>
            <Route element={<PermissionRoute allow={fineImportPermissions} roles={chargesDirectoryRoles} />}>
              <Route path="charge-imports" element={<ChargeImportPage />} />
              <Route path="charge-imports/:importId" element={<ChargeImportDetailsPage />} />
            </Route>
            <Route element={<PermissionRoute allow={disputePermissions} roles={chargesDirectoryRoles} />}>
              <Route path="charge-disputes" element={<DisputesPage />} />
            </Route>
            <Route element={<PermissionRoute allow={recoveryPermissions} roles={chargesDirectoryRoles} />}>
              <Route path="charge-recovery" element={<RecoveryPage />} />
            </Route>
            <Route element={<PermissionRoute allow={accountingPermissions} roles={accountingDirectoryRoles} />}>
              <Route path="accounting" element={<AccountingOverviewPage />} />
              <Route path="accounting/accounts" element={<ChartOfAccountsPage />} />
              <Route path="accounting/journals" element={<JournalsPage />} />
              <Route path="accounting/journals/new" element={<JournalFormPage />} />
              <Route path="accounting/journals/:journalId" element={<JournalDetailsPage />} />
              <Route path="accounting/periods" element={<FiscalPeriodsPage />} />
              <Route path="accounting/settings" element={<AccountingSettingsPage />} />
            </Route>
            <Route
              element={
                <PermissionRoute allow={accountingLedgerPermissions} roles={accountingDirectoryRoles} />
              }
            >
              <Route path="accounting/ledger" element={<GeneralLedgerPage />} />
            </Route>
            <Route
              element={
                <PermissionRoute
                  allow={accountingTrialBalancePermissions}
                  roles={accountingDirectoryRoles}
                />
              }
            >
              <Route path="accounting/trial-balance" element={<TrialBalancePage />} />
            </Route>
            <Route element={<PermissionRoute allow={taxPermissions} roles={taxDirectoryRoles} />}>
              <Route path="tax" element={<TaxOverviewPage />} />
              <Route path="tax/codes" element={<TaxCodesPage />} />
              <Route path="tax/transactions" element={<TaxTransactionsPage />} />
              <Route path="tax/periods" element={<TaxPeriodsPage />} />
              <Route path="tax/settings" element={<TaxSettingsPage />} />
            </Route>
            <Route element={<PermissionRoute allow={taxReportPermissions} roles={taxDirectoryRoles} />}>
              <Route path="tax/reports" element={<VatReportsPage />} />
            </Route>
            <Route element={<PermissionRoute allow={einvoicePermissions} roles={taxDirectoryRoles} />}>
              <Route path="tax/einvoices" element={<EInvoicesPage />} />
              <Route path="tax/einvoices/:einvoiceId" element={<EInvoiceDetailsPage />} />
            </Route>
            <Route element={<PermissionRoute allow={reportsPermissions} roles={reportsDirectoryRoles} />}>
              <Route path="reports" element={<ReportsOverviewPage />} />
            </Route>
            <Route
              element={
                <PermissionRoute allow={reportsOperationalPermissions} roles={reportsDirectoryRoles} />
              }
            >
              <Route path="reports/bookings" element={<BookingReportPage />} />
              <Route path="reports/vehicles" element={<VehicleReportPage />} />
              <Route path="reports/fleet-utilization" element={<FleetUtilizationReportPage />} />
              <Route path="reports/customers" element={<CustomerReportPage />} />
              <Route path="reports/contracts" element={<ContractReportPage />} />
              <Route path="reports/maintenance" element={<MaintenanceReportPage />} />
              <Route path="reports/fines" element={<FinesReportPage />} />
            </Route>
            <Route
              element={
                <PermissionRoute allow={reportsFinancialPermissions} roles={reportsDirectoryRoles} />
              }
            >
              <Route path="reports/payments" element={<PaymentReportPage />} />
              <Route path="reports/receivables" element={<ReceivablesReportPage />} />
              <Route path="reports/expenses" element={<ExpenseReportPage />} />
              <Route path="reports/refunds" element={<RefundsReportPage />} />
              <Route path="reports/accounting" element={<AccountingReportsPage />} />
              <Route path="reports/vat" element={<VatReportsLinkPage />} />
              <Route path="reports/e-invoices" element={<EInvoiceReportPage />} />
            </Route>
            <Route path="unauthorized" element={<UnauthorizedPage />} />
          </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
