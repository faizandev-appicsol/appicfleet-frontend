import { useAppSelector } from '@/app/hooks'
import { hasAnyPermission, hasPermission } from '@/features/auth/access'

/** UX-only permission checks against the session. The backend remains the authority. */
export function usePermissions() {
  const user = useAppSelector((state) => state.auth.user)
  const permissions = user?.permissions

  return {
    permissions,
    accessAllOrganizations: user?.accessAllOrganizations ?? false,
    accessAllBranches: user?.accessAllBranches ?? false,
    can: (permission: string) => hasPermission(permissions, permission),
    canAny: (required: readonly string[]) => hasAnyPermission(permissions, required),
  }
}
