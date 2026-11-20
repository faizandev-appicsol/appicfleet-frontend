import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { STORAGE_KEYS } from '@/config/constants'
import type { ThemePreference } from '@/features/ui/types/ui.types'
import { isLocale, type Locale } from '@/i18n/locales'
import { readStorage } from '@/lib/storage/browserStorage'

type UiState = {
  theme: ThemePreference
  locale: Locale
  sidebarCollapsed: boolean
  mobileNavOpen: boolean
  openNavGroups: string[]
}

function readTheme(): ThemePreference {
  const value = readStorage(STORAGE_KEYS.theme)
  if (value === 'light' || value === 'dark' || value === 'system') return value
  return 'system'
}

function readLocale(): Locale {
  const value = readStorage(STORAGE_KEYS.locale)
  if (value && isLocale(value)) return value
  return 'en'
}

const initialState: UiState = {
  theme: readTheme(),
  locale: readLocale(),
  sidebarCollapsed: readStorage(STORAGE_KEYS.sidebarCollapsed) === 'true',
  mobileNavOpen: false,
  openNavGroups: ['settings'],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemePreference>) {
      state.theme = action.payload
    },
    setLocale(state, action: PayloadAction<Locale>) {
      state.locale = action.payload
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload
    },
    setMobileNavOpen(state, action: PayloadAction<boolean>) {
      state.mobileNavOpen = action.payload
    },
    toggleNavGroup(state, action: PayloadAction<string>) {
      const id = action.payload
      if (state.openNavGroups.includes(id)) {
        state.openNavGroups = state.openNavGroups.filter((groupId) => groupId !== id)
      } else {
        state.openNavGroups.push(id)
      }
    },
  },
})

export const {
  setTheme,
  setLocale,
  setSidebarCollapsed,
  setMobileNavOpen,
  toggleNavGroup,
} = uiSlice.actions
export const uiReducer = uiSlice.reducer
