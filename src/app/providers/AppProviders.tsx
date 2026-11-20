import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { store } from '@/app/store'
import { LocaleSync } from '@/i18n'
import { useThemeSync } from '@/features/ui/hooks/useTheme'

function ThemeBridge({ children }: { children: ReactNode }) {
  useThemeSync()
  return children
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeBridge>
        <LocaleSync />
        {children}
      </ThemeBridge>
    </Provider>
  )
}
