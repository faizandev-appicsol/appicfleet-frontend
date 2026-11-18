import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import { LoadingState } from '@/components/feedback/LoadingState'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/app/router/ProtectedRoute'
import { PublicOnlyRoute } from '@/app/router/PublicOnlyRoute'
import { RoleRoute } from '@/app/router/RoleRoute'
import { userDirectoryRoles } from '@/app/router/access'

const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((module) => ({ default: module.LoginPage })),
)
const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  })),
)
const UsersPage = lazy(() =>
  import('@/features/users/pages/UsersPage').then((module) => ({ default: module.UsersPage })),
)
const UserDetailsPage = lazy(() =>
  import('@/features/users/pages/UserDetailsPage').then((module) => ({
    default: module.UserDetailsPage,
  })),
)
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
)
const UnauthorizedPage = lazy(() =>
  import('@/pages/UnauthorizedPage').then((module) => ({ default: module.UnauthorizedPage })),
)

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingState fullscreen label="Loading page" />}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route element={<RoleRoute allow={userDirectoryRoles} />}>
              <Route path="users" element={<UsersPage />} />
              <Route path="users/:userId" element={<UserDetailsPage />} />
            </Route>
            <Route path="unauthorized" element={<UnauthorizedPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
