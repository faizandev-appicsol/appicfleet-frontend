import { NavLink, Outlet } from 'react-router'
import { BrandMark } from '@/components/common/BrandMark'
import { CloseIcon } from '@/components/ui/icons'
import { NavIcon } from '@/config/navIcons'
import { investorNavigationEntries } from '@/config/investorNavigation'
import { hasAnyPermission } from '@/features/auth/access'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setMobileNavOpen } from '@/features/ui/slices/uiSlice'
import { useTranslation } from '@/i18n'
import { cn } from '@/utils/cn'
import { TopBar } from '@/components/layout/TopBar'

export function InvestorShell() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const mobileOpen = useAppSelector((state) => state.ui.mobileNavOpen)
  const permissions = useAppSelector((state) => state.auth.user?.permissions)

  const visible = investorNavigationEntries.filter((item) =>
    item.permissions ? hasAnyPermission(permissions, item.permissions) : true,
  )

  return (
    <div className="flex min-h-svh bg-transparent">
      <a
        href="#main"
        className="focus:bg-surface sr-only focus:not-sr-only focus:absolute focus:top-3 focus:start-3 focus:z-[var(--z-max)] focus:rounded-md focus:px-3 focus:py-2"
      >
        {t('common.skipToContent')}
      </a>
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
          'sidebar bg-sidebar text-sidebar-ink border-line fixed inset-y-0 start-0 z-[var(--z-sidebar)] flex h-svh w-[var(--sidebar-width)] flex-col overflow-hidden border-e motion-safe:transition-transform motion-safe:duration-moderate motion-safe:ease-emphasized lg:sticky lg:top-0 lg:!translate-x-0',
          'dark:border-white/5 dark:bg-[linear-gradient(180deg,#0a162c_0%,#07101f_48%,#050b18_100%)]',
          mobileOpen
            ? 'max-lg:translate-x-0'
            : 'max-lg:-translate-x-full max-lg:rtl:translate-x-full',
        )}
      >
        <div className="flex h-[var(--header-height)] shrink-0 items-center justify-between px-4">
          <BrandMark />
          <button
            type="button"
            className="text-sidebar-ink inline-flex size-9 cursor-pointer items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/10 lg:hidden"
            aria-label={t('common.closeNavigation')}
            onClick={() => dispatch(setMobileNavOpen(false))}
          >
            <CloseIcon />
          </button>
        </div>
        <p className="text-sidebar-ink/70 px-4 pb-2 text-xs tracking-wide uppercase">
          {t('investorPortal.brand')}
        </p>
        <nav
          className="sidebar-scroll flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 py-2"
          aria-label={t('investorPortal.navLabel')}
        >
          {visible.map((item) => (
            <NavLink
              key={item.id}
              to={item.to!}
              end={item.end}
              onClick={() => dispatch(setMobileNavOpen(false))}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium motion-safe:transition-[background-color,box-shadow,color,border-color] motion-safe:duration-normal',
                  isActive
                    ? 'bg-brand-soft text-brand shadow-sm before:bg-brand before:absolute before:inset-y-1.5 before:start-0 before:w-1 before:rounded-full dark:border-brand dark:bg-white/6 dark:text-white dark:shadow-glow dark:before:hidden'
                    : 'text-sidebar-muted hover:bg-brand-soft/60 hover:text-sidebar-ink dark:hover:bg-white/10 dark:hover:text-white',
                )
              }
            >
              <NavIcon name={item.icon} className="size-5 shrink-0" />
              <span>{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main id="main" className="flex-1 px-3 py-5 sm:px-4 lg:px-5">
          <div className="mx-auto grid w-full max-w-[var(--content-max-width)] gap-5">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
