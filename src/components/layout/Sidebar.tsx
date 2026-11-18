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
  { to: appConfig.routes.home, label: 'Dashboard', icon: OverviewIcon, end: true },
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
          'bg-sidebar text-sidebar-ink fixed inset-y-0 left-0 z-[var(--z-sidebar)] flex h-svh w-[var(--sidebar-width)] flex-col overflow-hidden motion-safe:transition-[width,transform] motion-safe:duration-moderate motion-safe:ease-emphasized lg:sticky lg:top-0 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed && 'lg:w-[var(--sidebar-width-collapsed)]',
        )}
      >
        <div
          className={cn(
            'flex h-16 items-center justify-between px-4 motion-safe:transition-[padding,justify-content] motion-safe:duration-300',
            collapsed && 'lg:justify-center lg:px-2',
          )}
        >
          <BrandMark
            className={cn(
              'min-w-0',
              collapsed && 'lg:gap-0 lg:[&>span:last-child]:max-w-0 lg:[&>span:last-child]:opacity-0',
              'lg:[&>span:last-child]:overflow-hidden lg:[&>span:last-child]:whitespace-nowrap lg:[&>span:last-child]:motion-safe:transition-[max-width,opacity,margin] lg:[&>span:last-child]:motion-safe:duration-300',
              !collapsed && 'lg:[&>span:last-child]:max-w-48 lg:[&>span:last-child]:opacity-100',
            )}
          />
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
                    'text-sidebar-muted hover:text-sidebar-ink flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-white/8 motion-safe:transition-[padding,gap,background-color,color] motion-safe:duration-300',
                    isActive && 'text-sidebar-ink bg-white/12',
                    collapsed && 'lg:justify-center lg:gap-0 lg:px-2',
                  )
                }
              >
                <Icon className="size-5 shrink-0" />
                <span
                  className={cn(
                    'overflow-hidden whitespace-nowrap motion-safe:transition-[max-width,opacity] motion-safe:duration-300',
                    collapsed
                      ? 'lg:max-w-0 lg:opacity-0'
                      : 'max-w-40 opacity-100',
                  )}
                >
                  {item.label}
                </span>
              </NavLink>
            )
          })}
        </nav>
        <div className="p-3">
          <button
            type="button"
            className={cn(
              'text-sidebar-muted hover:text-sidebar-ink hidden w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium hover:bg-white/8 motion-safe:transition-[padding,justify-content] motion-safe:duration-300 lg:flex',
              collapsed && 'lg:justify-center lg:px-2',
            )}
            onClick={() => dispatch(setSidebarCollapsed(!collapsed))}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span
              aria-hidden="true"
              className={cn(
                'inline-block text-sm motion-safe:transition-transform motion-safe:duration-300',
                collapsed ? 'rotate-0' : 'rotate-180',
              )}
            >
              »
            </span>
            <span
              className={cn(
                'overflow-hidden whitespace-nowrap motion-safe:transition-[max-width,opacity] motion-safe:duration-300',
                collapsed ? 'max-w-0 opacity-0' : 'max-w-24 opacity-100',
              )}
            >
              Collapse
            </span>
          </button>
        </div>
      </aside>
    </>
  )
}
