import { combineReducers } from '@reduxjs/toolkit'
import { authReducer } from '@/features/auth/slices/authSlice'
import { uiReducer } from '@/features/ui/slices/uiSlice'
import { baseApi } from '@/lib/api/baseApi'

export const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: authReducer,
  ui: uiReducer,
})
