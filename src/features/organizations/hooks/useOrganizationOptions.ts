import { PERMISSIONS } from '@/app/router/access'
import { API_MAX_PAGE_SIZE } from '@/config/constants'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useGetOrganizationsQuery } from '@/features/organizations/api/organizationsApi'

/**
 * Organizations a platform-wide account can pick from. Organization-bound accounts never
 * choose a tenant (the API uses their own), so the query is skipped for them.
 */
export function useOrganizationOptions() {
  const { can, accessAllOrganizations } = usePermissions()
  const enabled = accessAllOrganizations && can(PERMISSIONS.organizationsView)
  const query = useGetOrganizationsQuery(
    { page: 1, pageSize: API_MAX_PAGE_SIZE },
    { skip: !enabled },
  )

  const items = query.data?.items ?? []

  return {
    /** True when the account must choose an organization when creating tenant records. */
    required: accessAllOrganizations,
    enabled,
    isLoading: query.isLoading,
    options: items.map((organization) => ({
      value: organization.id,
      label: `${organization.name} (${organization.code})`,
    })),
    nameById: new Map(items.map((organization) => [organization.id, organization.name])),
  }
}
