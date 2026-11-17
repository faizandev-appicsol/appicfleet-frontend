import { NavLink } from 'react-router'
import { BrandMark } from '@/components/common/BrandMark'
import { CloseIcon, OverviewIcon, UsersIcon } from '@/components/ui/icons'
import { appConfig } from '@/config/app.config'
import { hasAnyRole } from '@/features/auth/access'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setMobileNavOpen, setSidebarCollapsed } from '@/features/ui/slices/uiSlice'
import { cn } from '@/utils/cn'
import { userDirectoryRoles } from '@/app/router/access'
import type { ComponentType, SVGProps } from 'react'

type NavItem = {
  to: string
  label: string
  end?: boolean
  icon: ComponentType<SVGProps<SVGSVGElement>>
  roles?: readonly string[]
}

const navigation: NavItem[] = [
  { to: appConfig.routes.home, label: 'Overview', icon: OverviewIcon, end: true },
  { to: appConfig.routes.users, label: 'Users', icon: UsersIcon, roles: userDirectoryRoles },
]

export function Sidebar() {
  const dispatch = useAppDispatch()
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed)
  const mobileOpen = useAppSelector((state) => state.ui.mobileNavOpen)
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const items = navigation.filter((item) => !item.roles || hasAnyRole(roles, item.roles))

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="bg-ink/40 fixed inset-0 z-20 lg:hidden"
          aria-label="Close navigation"
          onClick={() => dispatch(setMobileNavOpen(false))}
        />
      ) : null}
      <aside
        className={cn(
          'bg-sidebar text-sidebar-ink fixed inset-y-0 left-0 z-30 flex w-64 flex-col transition-transform lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed && 'lg:w-16',
        )}
      >
        <div
          className={cn(
            'flex h-16 items-center justify-between px-4',
            collapsed && 'lg:justify-center lg:px-2',
          )}
        >
          <BrandMark className={cn(collapsed && 'lg:[&>span:last-child]:hidden')} />
          <button
            type="button"
            className="text-sidebar-ink inline-flex size-9 items-center justify-center rounded-md hover:bg-white/10 lg:hidden"
            aria-label="Close navigation"
            onClick={() => dispatch(setMobileNavOpen(false))}
          >
            <CloseIcon />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-2" aria-label="Primary">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={item.label}
                onClick={() => dispatch(setMobileNavOpen(false))}
                className={({ isActive }) =>
                  cn(
                    'text-sidebar-muted hover:text-sidebar-ink flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-white/8',
                    isActive && 'text-sidebar-ink bg-white/12',
                    collapsed && 'lg:justify-center lg:px-2',
                  )
                }
              >
                <Icon />
                <span className={cn(collapsed && 'lg:sr-only')}>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
        <div className="p-3">
          <button
            type="button"
            className="text-sidebar-muted hover:text-sidebar-ink hidden w-full rounded-md px-3 py-2 text-left text-xs font-medium hover:bg-white/8 lg:block"
            onClick={() => dispatch(setSidebarCollapsed(!collapsed))}
          >
            {collapsed ? <span className="sr-only">Expand sidebar</span> : 'Collapse'}
            {collapsed ? <span aria-hidden="true">»</span> : null}
          </button>
        </div>
      </aside>
    </>
  )
}
