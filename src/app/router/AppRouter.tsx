import { BrowserRouter } from 'react-router'
import { SessionRestorer } from '@/app/router/SessionRestorer'
import { AppRoutes } from '@/app/router/routes'

export function AppRouter() {
  return (
    <BrowserRouter>
      <SessionRestorer>
        <AppRoutes />
      </SessionRestorer>
    </BrowserRouter>
  )
}
