import { Outlet } from 'react-router'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { useTranslation } from '@/i18n'

export function AppShell() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-svh bg-transparent">
      <a
        href="#main"
        className="focus:bg-surface sr-only focus:not-sr-only focus:absolute focus:top-3 focus:start-3 focus:z-[var(--z-max)] focus:rounded-md focus:px-3 focus:py-2"
      >
        {t('common.skipToContent')}
      </a>
      {/* Sidebar is first in DOM so flex + html[dir=rtl] places it on the right in Arabic. */}
      <Sidebar />
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
