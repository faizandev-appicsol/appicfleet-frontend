import type { ComponentType, SVGProps } from 'react'
import {
  AccountingIcon,
  AvailabilityIcon,
  BookingsIcon,
  BranchIcon,
  CalendarIcon,
  ComplianceIcon,
  ContractIcon,
  CustomersIcon,
  DashboardIcon,
  DriverIcon,
  EInvoiceIcon,
  ExpenseIcon,
  FinanceIcon,
  FineIcon,
  FleetIcon,
  HrIcon,
  InvoiceIcon,
  InvestorsIcon,
  LegalEntityIcon,
  OrganizationIcon,
  PaymentIcon,
  ProcurementIcon,
  PurchaseOrderIcon,
  ReportsIcon,
  ServiceIcon,
  SettingsIcon,
  TaxIcon,
  TollIcon,
  UsersIcon,
  VendorIcon,
} from '@/components/ui/icons'

export type NavIconName =
  | 'dashboard'
  | 'fleet'
  | 'vehicles'
  | 'availability'
  | 'customers'
  | 'drivers'
  | 'operations'
  | 'bookings'
  | 'contracts'
  | 'finance'
  | 'invoices'
  | 'payments'
  | 'expenses'
  | 'accounting'
  | 'procurement'
  | 'vendors'
  | 'purchaseOrders'
  | 'service'
  | 'compliance'
  | 'fines'
  | 'tolls'
  | 'vat'
  | 'eInvoicing'
  | 'reports'
  | 'investors'
  | 'hr'
  | 'payroll'
  | 'workforce'
  | 'recruitment'
  | 'performance'
  | 'settings'
  | 'users'
  | 'organizations'
  | 'legalEntities'
  | 'branches'

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

const NAV_ICONS: Record<NavIconName, IconComponent> = {
  dashboard: DashboardIcon,
  fleet: FleetIcon,
  vehicles: FleetIcon,
  availability: AvailabilityIcon,
  customers: CustomersIcon,
  drivers: DriverIcon,
  operations: CalendarIcon,
  bookings: BookingsIcon,
  contracts: ContractIcon,
  finance: FinanceIcon,
  invoices: InvoiceIcon,
  payments: PaymentIcon,
  expenses: ExpenseIcon,
  accounting: AccountingIcon,
  procurement: ProcurementIcon,
  vendors: VendorIcon,
  purchaseOrders: PurchaseOrderIcon,
  service: ServiceIcon,
  compliance: ComplianceIcon,
  fines: FineIcon,
  tolls: TollIcon,
  vat: TaxIcon,
  eInvoicing: EInvoiceIcon,
  reports: ReportsIcon,
  investors: InvestorsIcon,
  hr: HrIcon,
  payroll: HrIcon,
  workforce: HrIcon,
  recruitment: HrIcon,
  performance: HrIcon,
  settings: SettingsIcon,
  users: UsersIcon,
  organizations: OrganizationIcon,
  legalEntities: LegalEntityIcon,
  branches: BranchIcon,
}

export function NavIcon({
  name,
  className,
}: {
  name: NavIconName
  className?: string
}) {
  const Icon = NAV_ICONS[name]
  return <Icon className={className} />
}
