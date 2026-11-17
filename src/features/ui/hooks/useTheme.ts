import { useEffect } from 'react'
import { themePreferences, type ThemePreference } from '@/features/ui/types/ui.types'
import { setTheme } from '@/features/ui/slices/uiSlice'
import { useAppDispatch, useAppSelector } from '@/app/hooks'

function resolveDark(theme: ThemePreference, systemDark: boolean): boolean {
  if (theme === 'dark') return true
  if (theme === 'light') return false
  return systemDark
}

export function useTheme() {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.ui.theme)

  const changeTheme = (next: ThemePreference) => {
    dispatch(setTheme(next))
  }

  const cycleTheme = () => {
    const index = themePreferences.indexOf(theme)
    const next = themePreferences[(index + 1) % themePreferences.length] ?? 'system'
    dispatch(setTheme(next))
  }

  return { theme, changeTheme, cycleTheme }
}

export function useThemeSync() {
  const theme = useAppSelector((state) => state.ui.theme)

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const apply = () => {
      const dark = resolveDark(theme, media.matches)
      root.classList.toggle('dark', dark)
      root.style.colorScheme = dark ? 'dark' : 'light'
    }

    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])
}
