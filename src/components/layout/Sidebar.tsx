import { NavLink, useLocation } from 'react-router'
import { BrandMark } from '@/components/common/BrandMark'
import { ChevronIcon, CloseIcon } from '@/components/ui/icons'
import { NavIcon } from '@/config/navIcons'
import { navigationEntries, type NavLeaf } from '@/config/navigation'
import { hasAnyPermission, hasAnyRole } from '@/features/auth/access'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  setMobileNavOpen,
  setSidebarCollapsed,
  toggleNavGroup,
} from '@/features/ui/slices/uiSlice'
import { useTranslation } from '@/i18n'
import { cn } from '@/utils/cn'

/**
 * UX-only visibility. Permissions win when an item declares them; role-only items keep the
 * legacy role check. The backend authorizes every request regardless.
 */
function canSeeItem(
  item: NavLeaf,
  roles: readonly string[] | undefined,
  permissions: readonly string[] | undefined,
): boolean {
  const allowedByPermission = item.permissions
    ? hasAnyPermission(permissions, item.permissions)
    : false
  const allowedByRole = item.roles ? hasAnyRole(roles, item.roles) : false
  // Either gate is enough. A session issued before a new permission was added
  // still carries the role, so the menu stays visible until the next sign-in.
  if (item.permissions || item.roles) return allowedByPermission || allowedByRole
  return true
}

export function Sidebar() {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const location = useLocation()
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed)
  const mobileOpen = useAppSelector((state) => state.ui.mobileNavOpen)
  const openNavGroups = useAppSelector((state) => state.ui.openNavGroups)
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const permissions = useAppSelector((state) => state.auth.user?.permissions)

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="bg-ink/40 fixed inset-0 z-[var(--z-sidebar-backdrop)] lg:hidden"
          aria-label={t('common.closeNavigation')}
          onClick={() => dispatch(setMobileNavOpen(false))}
        />
      ) : null}
      <aside
        className={cn(
          'sidebar bg-sidebar text-sidebar-ink border-line fixed inset-y-0 start-0 z-[var(--z-sidebar)] flex h-svh w-[var(--sidebar-width)] flex-col overflow-hidden border-e motion-safe:transition-[width,transform] motion-safe:duration-moderate motion-safe:ease-emphasized lg:sticky lg:top-0 lg:!translate-x-0',
          'dark:border-white/5 dark:bg-[linear-gradient(180deg,#0a162c_0%,#07101f_48%,#050b18_100%)]',
          // Off-canvas only below lg. Never apply rtl/ltr slide transforms on desktop
          // or they override sticky layout and hide the sidebar in Arabic.
          mobileOpen
            ? 'max-lg:translate-x-0'
            : 'max-lg:-translate-x-full max-lg:rtl:translate-x-full',
          collapsed && 'lg:w-[var(--sidebar-width-collapsed)]',
        )}
      >
        <div
          className={cn(
            'flex h-[var(--header-height)] shrink-0 items-center justify-between px-4',
            collapsed && 'lg:justify-center lg:px-2',
          )}
        >
          <BrandMark
            className={cn(
              'min-w-0',
              collapsed && 'lg:gap-0 lg:[&>span:last-child]:max-w-0 lg:[&>span:last-child]:opacity-0',
              'lg:[&>span:last-child]:overflow-hidden lg:[&>span:last-child]:whitespace-nowrap lg:[&>span:last-child]:motion-safe:transition-[max-width,opacity] lg:[&>span:last-child]:motion-safe:duration-moderate',
              !collapsed && 'lg:[&>span:last-child]:max-w-48 lg:[&>span:last-child]:opacity-100',
            )}
          />
          <button
            type="button"
            className="text-sidebar-ink inline-flex size-9 cursor-pointer items-center justify-center rounded-xl hover:bg-brand-soft dark:hover:bg-white/10 lg:hidden"
            aria-label={t('common.closeNavigation')}
            onClick={() => dispatch(setMobileNavOpen(false))}
          >
            <CloseIcon />
          </button>
        </div>

        <nav
          className={cn(
            'sidebar-scroll flex min-h-0 flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto overscroll-contain px-3 py-2',
            collapsed && 'lg:px-2',
          )}
          aria-label={t('common.primaryNavigation')}
        >
          {navigationEntries.map((entry) => {
            if (entry.type === 'link') {
              if (!canSeeItem(entry.item, roles, permissions)) return null
              return (
                <NavItemLink
                  key={entry.item.id}
                  item={entry.item}
                  collapsed={collapsed}
                  onNavigate={() => dispatch(setMobileNavOpen(false))}
                />
              )
            }

            const visibleItems = entry.group.items.filter((item) =>
              canSeeItem(item, roles, permissions),
            )
            if (visibleItems.length === 0) return null
            const isOpen = openNavGroups.includes(entry.group.id)
            const groupActive = visibleItems.some(
              (item) => item.to && location.pathname.startsWith(item.to),
            )

            return (
              <div key={entry.group.id} className="grid gap-1">
                {/* Group headers stay expanded-only; collapsed mode shows leaf icons only. */}
                <button
                  type="button"
                  className={cn(
                    'text-sidebar-muted hover:text-sidebar-ink flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-start text-xs font-semibold tracking-wide uppercase hover:bg-brand-soft/60 dark:hover:bg-white/8',
                    groupActive && 'text-sidebar-ink',
                    collapsed && 'lg:hidden',
                  )}
                  aria-expanded={isOpen}
                  onClick={() => dispatch(toggleNavGroup(entry.group.id))}
                >
                  <NavIcon name={entry.group.icon} className="size-4 shrink-0 opacity-80" />
                  <span className="min-w-0 flex-1 truncate">{t(entry.group.labelKey)}</span>
                  <ChevronIcon
                    className={cn(
                      'size-4 shrink-0 motion-safe:transition-transform motion-safe:duration-moderate',
                      isOpen ? 'rotate-90' : 'rotate-0',
                    )}
                  />
                </button>

                {isOpen || collapsed ? (
                  <div className="grid gap-1">
                    {visibleItems.map((item) => (
                      <NavItemLink
                        key={item.id}
                        item={item}
                        collapsed={collapsed}
                        nested={!collapsed}
                        onNavigate={() => dispatch(setMobileNavOpen(false))}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}
        </nav>

        <div className={cn('shrink-0 p-3', collapsed && 'lg:px-2')}>
          <button
            type="button"
            className={cn(
              'text-sidebar-muted hover:text-sidebar-ink hidden w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-start text-xs font-medium hover:bg-brand-soft/60 dark:hover:bg-white/8 lg:flex',
              collapsed && 'lg:justify-center lg:px-0',
            )}
            onClick={() => dispatch(setSidebarCollapsed(!collapsed))}
            aria-expanded={!collapsed}
            aria-label={collapsed ? t('common.expandSidebar') : t('common.collapseSidebar')}
          >
            <ChevronIcon
              className={cn(
                'size-4 shrink-0 motion-safe:transition-transform motion-safe:duration-moderate',
                collapsed ? 'rotate-0 rtl:rotate-180' : 'rotate-180 rtl:rotate-0',
              )}
            />
            <span
              className={cn(
                'overflow-hidden whitespace-nowrap motion-safe:transition-[max-width,opacity] motion-safe:duration-moderate',
                collapsed ? 'max-w-0 opacity-0' : 'max-w-28 opacity-100',
              )}
            >
              {t('common.collapseSidebar')}
            </span>
          </button>
        </div>
      </aside>
    </>
  )
}

function NavItemLink({
  item,
  collapsed,
  nested = false,
  onNavigate,
}: {
  item: NavLeaf
  collapsed: boolean
  nested?: boolean
  onNavigate: () => void
}) {
  const { t } = useTranslation()
  const label = t(item.labelKey)
  const soonLabel = `${label} — ${t('common.comingSoon')}`

  if (item.status === 'soon' || !item.to) {
    return (
      <div
        title={soonLabel}
        aria-label={soonLabel}
        className={cn(
          'text-sidebar-muted/55 flex cursor-not-allowed items-center gap-2 rounded-xl px-3 py-2 text-sm',
          nested && 'ps-5',
          collapsed && 'lg:h-10 lg:justify-center lg:px-0 lg:ps-0',
        )}
      >
        <NavIcon name={item.icon} className="size-5 shrink-0 opacity-70" />
        <span className={cn('min-w-0 flex-1 truncate', collapsed && 'lg:hidden')}>{label}</span>
        {!collapsed ? (
          <span className="bg-control text-sidebar-muted/80 ms-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase dark:bg-white/10 dark:text-sidebar-muted">
            {t('common.comingSoon')}
          </span>
        ) : null}
      </div>
    )
  }

  return (
    <NavLink
      to={item.to}
      end={item.end}
      title={label}
      aria-label={label}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'text-sidebar-muted hover:text-sidebar-ink relative flex items-center gap-2 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium hover:bg-brand-soft/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand/40 motion-safe:transition-[background-color,box-shadow,color,border-color] motion-safe:duration-normal dark:hover:bg-white/8 dark:focus-visible:outline-white/40',
          nested && 'ps-5',
          // Light: soft blue fill + left brand bar. Dark: outlined glow pill.
          isActive &&
            'bg-brand-soft text-brand shadow-sm before:bg-brand hover:bg-brand-soft hover:text-brand before:absolute before:inset-y-1.5 before:start-0 before:w-1 before:rounded-full dark:border-brand dark:bg-white/6 dark:text-white dark:shadow-glow dark:before:hidden dark:hover:bg-white/8 dark:hover:text-white',
          collapsed && 'lg:h-10 lg:justify-center lg:px-0 lg:ps-0',
        )
      }
    >
      <NavIcon name={item.icon} className="size-5 shrink-0" />
      <span className={cn('min-w-0 flex-1 truncate', collapsed && 'lg:hidden')}>{label}</span>
    </NavLink>
  )
}
