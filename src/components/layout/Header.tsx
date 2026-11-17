import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Menu, MenuItem } from '@/components/ui/Menu'
import { Badge } from '@/components/ui/Badge'
import { MenuIcon } from '@/components/ui/icons'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { setMobileNavOpen } from '@/features/ui/slices/uiSlice'
import { useAppDispatch } from '@/app/hooks'

export function Header() {
  const dispatch = useAppDispatch()
  const { user, logout, isLoggingOut } = useAuth()
  const primaryRole = user?.roles[0]

  return (
    <header className="border-line bg-surface/90 sticky top-0 z-10 flex h-16 items-center justify-between gap-3 border-b px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        className="text-ink hover:bg-canvas inline-flex size-10 items-center justify-center rounded-md lg:hidden"
        aria-label="Open navigation"
        onClick={() => dispatch(setMobileNavOpen(true))}
      >
        <MenuIcon />
      </button>
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <ThemeToggle />
        <Menu label={<span className="max-w-40 truncate">{user?.name ?? 'Account'}</span>}>
          <div className="px-3 py-2">
            <p className="text-ink truncate text-sm font-medium">{user?.name}</p>
            <p className="text-muted truncate text-xs">{user?.email}</p>
            {primaryRole ? (
              <div className="mt-2">
                <Badge tone="brand">{primaryRole}</Badge>
              </div>
            ) : null}
          </div>
          <MenuItem onSelect={() => void logout()} disabled={isLoggingOut}>
            {isLoggingOut ? 'Signing out…' : 'Sign out'}
          </MenuItem>
        </Menu>
      </div>
    </header>
  )
}
