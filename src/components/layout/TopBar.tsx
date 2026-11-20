import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Menu, MenuItem } from '@/components/ui/Menu'
import { BellIcon, MenuIcon, SearchIcon } from '@/components/ui/icons'
import { Tooltip } from '@/components/ui/Tooltip'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { appConfig } from '@/config/app.config'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useRoleLabel } from '@/features/auth/hooks/useRoleLabel'
import { setLocale, setMobileNavOpen } from '@/features/ui/slices/uiSlice'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { useTranslation, type Locale } from '@/i18n'

export function TopBar() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const locale = useAppSelector((state) => state.ui.locale)
  const { user, logout, isLoggingOut } = useAuth()
  const [searchHint, setSearchHint] = useState(false)
  const [notificationHint, setNotificationHint] = useState(false)
  const hintRef = useRef<HTMLDivElement>(null)
  const primaryRole = user?.roles[0]
  const roleLabel = useRoleLabel()

  useEffect(() => {
    if (!searchHint && !notificationHint) return
    const onPointerDown = (event: MouseEvent) => {
      if (!hintRef.current?.contains(event.target as Node)) {
        setSearchHint(false)
        setNotificationHint(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [searchHint, notificationHint])

  return (
    <header className="border-line bg-surface/90 sticky top-0 z-[var(--z-header)] border-b backdrop-blur-xl dark:border-white/8 dark:bg-[color-mix(in_srgb,#0c1428_72%,transparent)]">
      <div className="flex h-[var(--header-height)] items-center gap-3 px-4 sm:px-6">
        {/* Leading: mobile nav — sits at inline-start (left in EN, right in AR) */}
        <button
          type="button"
          className="text-ink hover:bg-control inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl lg:hidden dark:hover:bg-white/8"
          aria-label={t('common.openNavigation')}
          onClick={() => dispatch(setMobileNavOpen(true))}
        >
          <MenuIcon />
        </button>

        {/* Center grows — breadcrumbs near the sidebar edge via natural RTL flex */}
        <div className="min-w-0 flex-1">
          <Breadcrumbs className="hidden md:block" />
          <p className="text-ink truncate text-sm font-medium md:hidden">
            {user?.name ?? 'Appic Fleet'}
          </p>
        </div>

        {/* Trailing actions — sit at inline-end (right in EN, left in AR) */}
        <div ref={hintRef} className="flex shrink-0 items-center gap-1 sm:gap-2">
          <div className="relative hidden lg:block">
            <Tooltip label={t('search.unavailable')}>
              <button
                type="button"
                className="border-line bg-control text-muted hover:text-ink inline-flex h-10 min-w-52 cursor-pointer items-center gap-2 rounded-xl border px-3 text-start text-sm dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/8"
                onClick={() => {
                  setNotificationHint(false)
                  setSearchHint(true)
                }}
                aria-label={t('common.search')}
              >
                <SearchIcon className="size-4 shrink-0" />
                <span className="truncate">{t('search.placeholder')}</span>
              </button>
            </Tooltip>
            {searchHint ? (
              <p className="border-line bg-surface text-muted absolute end-0 top-full z-20 mt-2 w-64 rounded-md border px-3 py-2 text-start text-xs shadow-md">
                {t('search.unavailable')}
              </p>
            ) : null}
          </div>

          <Tooltip label={t('common.notifications')}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t('common.notifications')}
              onClick={() => {
                setSearchHint(false)
                setNotificationHint((value) => !value)
              }}
            >
              <BellIcon />
            </Button>
          </Tooltip>

          <Menu label={<span className="text-sm font-medium">{t('common.language')}</span>}>
            {(
              [
                ['en', 'common.english'],
                ['ar', 'common.arabic'],
              ] as const
            ).map(([code, key]) => (
              <MenuItem
                key={code}
                onSelect={() => dispatch(setLocale(code as Locale))}
                disabled={locale === code}
              >
                {t(key)}
              </MenuItem>
            ))}
          </Menu>

          <ThemeToggle />

          <Menu
            label={<span className="max-w-40 truncate">{user?.name ?? t('common.profile')}</span>}
          >
            <div className="px-3 py-2 text-start">
              <p className="text-ink truncate text-sm font-medium">{user?.name}</p>
              <p className="text-muted truncate text-xs">{user?.email}</p>
              {primaryRole ? (
                <div className="mt-2">
                  <Badge tone="brand">{roleLabel(primaryRole)}</Badge>
                </div>
              ) : null}
            </div>
            <MenuItem onSelect={() => navigate(appConfig.routes.profile)}>
              {t('common.profile')}
            </MenuItem>
            <MenuItem onSelect={() => undefined} disabled>
              {t('common.settings')}
            </MenuItem>
            <MenuItem onSelect={() => void logout()} disabled={isLoggingOut}>
              {isLoggingOut ? t('common.loggingOut') : t('common.logout')}
            </MenuItem>
          </Menu>
        </div>
      </div>

      {notificationHint ? (
        <div className="border-line text-muted border-t px-4 py-2 text-start text-xs sm:px-6">
          {t('notifications.empty')}
        </div>
      ) : null}
    </header>
  )
}
