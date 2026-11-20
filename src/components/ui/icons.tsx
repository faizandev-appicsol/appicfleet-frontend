import type { SVGProps } from 'react'
import { cn } from '@/utils/cn'

type IconProps = SVGProps<SVGSVGElement>

function Icon({ className, children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn('size-5', className)}
      {...props}
    >
      {children}
    </svg>
  )
}

export function OverviewIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </Icon>
  )
}

export function UsersIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M16 20v-1.2a3.2 3.2 0 0 0-3.2-3.2H7.2A3.2 3.2 0 0 0 4 18.8V20" />
      <circle cx="10" cy="8" r="3" />
      <path d="M20 20v-1.1a2.8 2.8 0 0 0-2.1-2.7" />
      <path d="M16.2 5.1a3 3 0 0 1 0 5.8" />
    </Icon>
  )
}

export function MenuIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </Icon>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </Icon>
  )
}

export function SunIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3.25" />
      <path d="M12 3.5v1.8M12 18.7v1.8M3.5 12h1.8M18.7 12h1.8M6 6l1.3 1.3M16.7 16.7 18 18M18 6l-1.3 1.3M7.3 16.7 6 18" />
    </Icon>
  )
}

export function MoonIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M16.5 14.5A6.5 6.5 0 0 1 9.6 6 6.2 6.2 0 1 0 16.5 14.5Z" />
    </Icon>
  )
}

export function MonitorIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="4.5" width="17" height="12" rx="1.5" />
      <path d="M8 19.5h8" />
      <path d="M12 16.5v3" />
    </Icon>
  )
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
    </Icon>
  )
}

export function BellIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6.5 17.5h11" />
      <path d="M8 17.5V11a4 4 0 1 1 8 0v6.5" />
      <path d="M10 17.5a2 2 0 0 0 4 0" />
      <path d="M12 5.5V4.5" />
    </Icon>
  )
}

export function ChevronIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m9 6 6 6-6 6" />
    </Icon>
  )
}

export function DashboardIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 13.5V6.8A1.8 1.8 0 0 1 5.8 5h4.4A1.8 1.8 0 0 1 12 6.8v6.7" />
      <path d="M4 18.5h8" />
      <path d="M14 18.5V10.8A1.8 1.8 0 0 1 15.8 9h2.4A1.8 1.8 0 0 1 20 10.8v7.7" />
      <path d="M14 5h6" />
    </Icon>
  )
}

export function FleetIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.5 15.5h17" />
      <path d="M5 15.5V9.2A1.7 1.7 0 0 1 6.7 7.5h6.1L16 10.5h2.3A1.7 1.7 0 0 1 20 12.2v3.3" />
      <circle cx="7.5" cy="15.5" r="1.6" />
      <circle cx="16.5" cy="15.5" r="1.6" />
    </Icon>
  )
}

export function CalendarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="5.5" width="16" height="14" rx="1.5" />
      <path d="M8 3.5v4M16 3.5v4M4 10h16" />
    </Icon>
  )
}

export function CustomersIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="9" r="3" />
      <path d="M4.5 18.5c.6-2.6 2.7-4 4.5-4s3.9 1.4 4.5 4" />
      <path d="M16.2 8.2a2.5 2.5 0 1 1 0 4.6" />
      <path d="M19.5 18.5c-.3-1.8-1.4-3-2.8-3.5" />
    </Icon>
  )
}

export function DriverIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="3" />
      <path d="M5.5 19c.8-3 3.2-4.5 6.5-4.5s5.7 1.5 6.5 4.5" />
      <path d="M9 12.5h6" />
    </Icon>
  )
}

export function BookingsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="5" y="4" width="14" height="16" rx="1.5" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </Icon>
  )
}

export function ContractIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 4.5h7.5L18.5 8v11.5A1.5 1.5 0 0 1 17 21H7a1.5 1.5 0 0 1-1.5-1.5v-15A1.5 1.5 0 0 1 7 4.5Z" />
      <path d="M14.5 4.5V8h3.5" />
      <path d="M9 12h6M9 15.5h4" />
    </Icon>
  )
}

export function FinanceIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 8v8M9.5 10.2c.6-.8 1.5-1.2 2.5-1.2 1.6 0 2.5.8 2.5 1.9s-.9 1.8-2.5 2.1c-1.6.3-2.5 1-2.5 2.1s.9 1.9 2.5 1.9c1 0 1.9-.4 2.5-1.2" />
    </Icon>
  )
}

export function InvoiceIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 4h10a1.5 1.5 0 0 1 1.5 1.5v13l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2-2 1.2v-13A1.5 1.5 0 0 1 7 4Z" />
      <path d="M9.5 9h5M9.5 12.5h5" />
    </Icon>
  )
}

export function PaymentIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="6.5" width="17" height="11" rx="1.5" />
      <path d="M3.5 10h17" />
      <path d="M7 14.5h3" />
    </Icon>
  )
}

export function ExpenseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4v16" />
      <path d="m8 8 4-4 4 4" />
      <path d="M7 14h10" />
      <path d="M7 17.5h10" />
    </Icon>
  )
}

export function AccountingIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 19.5V6.5A1.5 1.5 0 0 1 6.5 5H14l5 5v9.5A1.5 1.5 0 0 1 17.5 21h-11A1.5 1.5 0 0 1 5 19.5Z" />
      <path d="M14 5v5h5" />
      <path d="m9 15 2 2 4-4" />
    </Icon>
  )
}

export function ProcurementIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 8.5h15l-1.4 8.2A1.8 1.8 0 0 1 16.3 18H7.7a1.8 1.8 0 0 1-1.8-1.3L4.5 8.5Z" />
      <path d="M9 8.5V6.8A2.8 2.8 0 0 1 11.8 4h.4A2.8 2.8 0 0 1 15 6.8v1.7" />
    </Icon>
  )
}

export function VendorIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 19.5V9l8-4.5L20 9v10.5" />
      <path d="M9.5 19.5v-5h5v5" />
    </Icon>
  )
}

export function PurchaseOrderIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 7h11" />
      <path d="M8 12h11" />
      <path d="M8 17h7" />
      <circle cx="5" cy="7" r="1" fill="currentColor" stroke="none" />
      <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="5" cy="17" r="1" fill="currentColor" stroke="none" />
    </Icon>
  )
}

export function ServiceIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14.5 6.5a3.5 3.5 0 0 1 3 3l2.2.6-3.7 3.7-2.1-.1-.1-2.1 3.7-3.7.6 2.2a3.5 3.5 0 0 1-3-3Z" />
      <path d="m5 19 5.5-5.5" />
      <path d="M8.5 8.5 5 5" />
    </Icon>
  )
}

export function ComplianceIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.5 19 6.5v5c0 4.3-2.9 7.4-7 8.8-4.1-1.4-7-4.5-7-8.8v-5L12 3.5Z" />
      <path d="m9.5 12 1.8 1.8 3.7-3.7" />
    </Icon>
  )
}

export function FineIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 8v5" />
      <path d="M12 16.5h.01" />
    </Icon>
  )
}

export function TollIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 17.5h16" />
      <path d="M7 17.5V9.5" />
      <path d="M17 17.5V9.5" />
      <path d="M5.5 9.5h13" />
      <path d="M9.5 6.5h5" />
    </Icon>
  )
}

export function TaxIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m7 17 10-10" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <circle cx="15.5" cy="15.5" r="1.5" />
    </Icon>
  )
}

export function EInvoiceIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="5" width="16" height="14" rx="1.5" />
      <path d="M8 10h8M8 13.5h5" />
      <path d="m14.5 16 1.5 1.5 3-3" />
    </Icon>
  )
}

export function ReportsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 19.5V8.5" />
      <path d="M5 19.5h14" />
      <path d="M8.5 15.5v-4" />
      <path d="M12.5 15.5v-7" />
      <path d="M16.5 15.5v-2.5" />
    </Icon>
  )
}

export function InvestorsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 16.5 9 11l3.5 3.5L19.5 7" />
      <path d="M14.5 7h5v5" />
    </Icon>
  )
}

export function HrIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="7" width="16" height="12" rx="1.5" />
      <path d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7" />
      <circle cx="12" cy="13" r="2" />
    </Icon>
  )
}

export function SettingsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4.5v1.6M12 17.9v1.6M4.5 12h1.6M17.9 12h1.6M6.4 6.4l1.1 1.1M16.5 16.5l1.1 1.1M17.6 6.4l-1.1 1.1M7.5 16.5l-1.1 1.1" />
    </Icon>
  )
}

export function OrganizationIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="9" width="6" height="11" rx="1" />
      <rect x="14" y="4" width="6" height="16" rx="1" />
      <path d="M6.5 12h1M6.5 15h1M16.5 8h1M16.5 11h1M16.5 14h1" />
    </Icon>
  )
}

export function LegalEntityIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 20h14" />
      <path d="M7 20V8.5L12 5l5 3.5V20" />
      <path d="M10 12h4M10 15.5h4" />
    </Icon>
  )
}

export function BranchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="6.5" cy="6.5" r="2" />
      <circle cx="17.5" cy="8.5" r="2" />
      <circle cx="12" cy="17.5" r="2" />
      <path d="M8.2 7.6 15.5 9M8 8.2 10.8 15.4M14.2 16.4 15.8 10.4" />
    </Icon>
  )
}

export function AvailabilityIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 8v4.2l2.8 1.6" />
    </Icon>
  )
}

export function EyeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </Icon>
  )
}

export function MoreHorizontalIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="5" cy="12" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.25" fill="currentColor" stroke="none" />
    </Icon>
  )
}

export function PencilIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 20h4.2L19 9.2a2.1 2.1 0 0 0 0-3L17.8 5a2.1 2.1 0 0 0-3 0L4 15.8V20Z" />
      <path d="M13.5 6.5 17.5 10.5" />
    </Icon>
  )
}

export function TrashIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 7h15" />
      <path d="M9.5 7V5.8A1.3 1.3 0 0 1 10.8 4.5h2.4A1.3 1.3 0 0 1 14.5 5.8V7" />
      <path d="M6.5 7l.8 11.2A1.5 1.5 0 0 0 8.8 19.5h6.4a1.5 1.5 0 0 0 1.5-1.3L17.5 7" />
      <path d="M10 10.5v5.5M14 10.5v5.5" />
    </Icon>
  )
}

export function DownloadIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4v10" />
      <path d="m8 10 4 4 4-4" />
      <path d="M5 18h14" />
    </Icon>
  )
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Icon>
  )
}

export function GaugeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5.5 17.5a8 8 0 1 1 13 0" />
      <path d="M12 14.5 15.5 9" />
      <circle cx="12" cy="14.5" r="1.2" fill="currentColor" stroke="none" />
    </Icon>
  )
}

export function FuelIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 19V7.5A1.5 1.5 0 0 1 7.5 6h5A1.5 1.5 0 0 1 14 7.5V19" />
      <path d="M5 19h10" />
      <path d="M14 10h1.8a1.7 1.7 0 0 1 1.7 1.7V15a1.5 1.5 0 0 0 3 0V9.2L17.5 6.5" />
      <path d="M8 9h4" />
    </Icon>
  )
}

export function MapPinIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10Z" />
      <circle cx="12" cy="11" r="2" />
    </Icon>
  )
}

export function BuildingIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 20h16" />
      <path d="M6 20V6.5A1.5 1.5 0 0 1 7.5 5h6A1.5 1.5 0 0 1 15 6.5V20" />
      <path d="M15 10h2.5A1.5 1.5 0 0 1 19 11.5V20" />
      <path d="M9 9h2M9 12h2M9 15h2" />
    </Icon>
  )
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="m8.5 12.2 2.3 2.3 4.7-4.8" />
    </Icon>
  )
}

export function WrenchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14.5 6.5a3.5 3.5 0 0 0-4.7 4.7L5 16v3h3l4.8-4.8a3.5 3.5 0 0 0 4.7-4.7l-2.2 2.2-1.8-1.8 2-2.1Z" />
    </Icon>
  )
}

export function SteeringWheelIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2.2" />
      <path d="M12 4.2V9.8M5.4 15.2 9.5 12.8M18.6 15.2 14.5 12.8" />
    </Icon>
  )
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M15 6 9 12l6 6" />
    </Icon>
  )
}

export function CalendarDaysIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
    </Icon>
  )
}
