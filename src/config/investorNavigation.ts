import type { MessageKey } from '@/i18n'
import type { NavIconName } from '@/config/navIcons'
import { appConfig } from '@/config/app.config'
import {
  investorContractsPermissions,
  investorFinancialPermissions,
  investorFleetPermissions,
  investorOverviewPermissions,
  investorPerformancePermissions,
  investorPortalPermissions,
  investorReportsPermissions,
} from '@/app/router/access'
import type { NavLeaf } from '@/config/navigation'

export const investorNavigationEntries: readonly NavLeaf[] = [
  {
    id: 'investor-overview',
    labelKey: 'investorPortal.nav.overview',
    icon: 'dashboard',
    status: 'active',
    to: appConfig.routes.investor,
    end: true,
    permissions: investorOverviewPermissions,
    breadcrumbKey: 'investorPortal.nav.overview',
  },
  {
    id: 'investor-fleet',
    labelKey: 'investorPortal.nav.fleet',
    icon: 'fleet',
    status: 'active',
    to: appConfig.routes.investorFleet,
    permissions: investorFleetPermissions,
    breadcrumbKey: 'investorPortal.nav.fleet',
  },
  {
    id: 'investor-performance',
    labelKey: 'investorPortal.nav.performance',
    icon: 'reports',
    status: 'active',
    to: appConfig.routes.investorPerformance,
    permissions: investorPerformancePermissions,
    breadcrumbKey: 'investorPortal.nav.performance',
  },
  {
    id: 'investor-financial',
    labelKey: 'investorPortal.nav.financial',
    icon: 'finance',
    status: 'active',
    to: appConfig.routes.investorFinancial,
    permissions: investorFinancialPermissions,
    breadcrumbKey: 'investorPortal.nav.financial',
  },
  {
    id: 'investor-contracts',
    labelKey: 'investorPortal.nav.contracts',
    icon: 'contracts',
    status: 'active',
    to: appConfig.routes.investorContracts,
    permissions: investorContractsPermissions,
    breadcrumbKey: 'investorPortal.nav.contracts',
  },
  {
    id: 'investor-reports',
    labelKey: 'investorPortal.nav.reports',
    icon: 'reports',
    status: 'active',
    to: appConfig.routes.investorReports,
    permissions: investorReportsPermissions,
    breadcrumbKey: 'investorPortal.nav.reports',
  },
  {
    id: 'investor-profile',
    labelKey: 'investorPortal.nav.profile',
    icon: 'users',
    status: 'active',
    to: appConfig.routes.investorProfile,
    permissions: investorPortalPermissions,
    breadcrumbKey: 'investorPortal.nav.profile',
  },
]

export const investorRouteBreadcrumbs: Record<string, MessageKey[]> = {
  '/investor': ['investorPortal.nav.overview'],
  '/investor/fleet': ['investorPortal.nav.fleet'],
  '/investor/performance': ['investorPortal.nav.performance'],
  '/investor/financial': ['investorPortal.nav.financial'],
  '/investor/contracts': ['investorPortal.nav.contracts'],
  '/investor/reports': ['investorPortal.nav.reports'],
  '/investor/profile': ['investorPortal.nav.profile'],
}

export function investorBreadcrumbsForPath(pathname: string): MessageKey[] {
  if (investorRouteBreadcrumbs[pathname]) return investorRouteBreadcrumbs[pathname]
  if (pathname.startsWith('/investor/fleet/')) return ['investorPortal.nav.fleet']
  if (pathname.startsWith('/investor/reports/')) return ['investorPortal.nav.reports']
  return ['investorPortal.nav.overview']
}

export type { NavIconName }
