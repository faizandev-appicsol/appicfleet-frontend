import { createListenerMiddleware, type TypedStartListening } from '@reduxjs/toolkit'
import type { AppDispatch, RootState } from '@/app/store'
import { STORAGE_KEYS } from '@/config/constants'
import { clearSession } from '@/features/auth/slices/authSlice'
import { setLocale, setSidebarCollapsed, setTheme } from '@/features/ui/slices/uiSlice'
import { baseApi } from '@/lib/api/baseApi'
import { writeStorage } from '@/lib/storage/browserStorage'
import { tokenStorage } from '@/lib/storage/tokenStorage'

export const listenerMiddleware = createListenerMiddleware()

export type AppStartListening = TypedStartListening<RootState, AppDispatch>

const startListening = listenerMiddleware.startListening as AppStartListening

startListening({
  actionCreator: clearSession,
  effect: (_action, api) => {
    tokenStorage.clear()
    api.dispatch(baseApi.util.resetApiState())
  },
})

startListening({
  actionCreator: setTheme,
  effect: (action) => {
    writeStorage(STORAGE_KEYS.theme, action.payload)
  },
})

startListening({
  actionCreator: setLocale,
  effect: (action) => {
    writeStorage(STORAGE_KEYS.locale, action.payload)
  },
})

startListening({
  actionCreator: setSidebarCollapsed,
  effect: (action) => {
    writeStorage(STORAGE_KEYS.sidebarCollapsed, String(action.payload))
  },
})
