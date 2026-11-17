import { configureStore, type Action } from '@reduxjs/toolkit'
import { setSession } from '@/features/auth/slices/authSlice'
import { listenerMiddleware } from '@/app/listenerMiddleware'
import { rootReducer } from '@/app/rootReducer'
import { baseApi } from '@/lib/api/baseApi'
import { isRecord } from '@/lib/utils/typeGuards'
import '@/app/registerFeatures'

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware).concat(baseApi.middleware),
  devTools: import.meta.env.PROD
    ? false
    : {
        actionSanitizer: <A extends Action>(action: A): A => {
          if (!setSession.match(action)) return action
          return {
            ...action,
            payload: {
              ...action.payload,
              accessToken: '[redacted]',
            },
          } as A
        },
        stateSanitizer: <S>(state: S): S => {
          if (!isRecord(state) || !isRecord(state.auth)) return state
          return {
            ...state,
            auth: {
              ...state.auth,
              accessToken:
                typeof state.auth.accessToken === 'string' ? '[redacted]' : state.auth.accessToken,
            },
          } as S
        },
      },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
