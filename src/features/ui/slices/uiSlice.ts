import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { STORAGE_KEYS } from '@/config/constants'
import type { ThemePreference } from '@/features/ui/types/ui.types'
import { readStorage } from '@/lib/storage/browserStorage'

type UiState = {
  theme: ThemePreference
  sidebarCollapsed: boolean
  mobileNavOpen: boolean
}

function readTheme(): ThemePreference {
  const value = readStorage(STORAGE_KEYS.theme)
  if (value === 'light' || value === 'dark' || value === 'system') return value
  return 'system'
}

const initialState: UiState = {
  theme: readTheme(),
  sidebarCollapsed: readStorage(STORAGE_KEYS.sidebarCollapsed) === 'true',
  mobileNavOpen: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemePreference>) {
      state.theme = action.payload
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload
    },
    setMobileNavOpen(state, action: PayloadAction<boolean>) {
      state.mobileNavOpen = action.payload
    },
  },
})

export const { setTheme, setSidebarCollapsed, setMobileNavOpen } = uiSlice.actions
export const uiReducer = uiSlice.reducer
