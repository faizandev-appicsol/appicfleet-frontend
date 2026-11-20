import { useRoleLabel } from '@/features/auth/hooks/useRoleLabel'
import { userRoles, userStatuses } from '@/features/users/schemas/user.schema'
import { useTranslation } from '@/i18n'

/** Localized role and status choices for user forms. */
export function useUserOptions() {
  const { t } = useTranslation()
  const roleLabel = useRoleLabel()

  return {
    roleOptions: userRoles.map((role) => ({ value: role, label: roleLabel(role) })),
    statusOptions: userStatuses.map((status) => ({ value: status, label: t(`status.${status}`) })),
  }
}
