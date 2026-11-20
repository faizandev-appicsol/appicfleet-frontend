import { PERMISSIONS } from '@/app/router/access'
import { API_MAX_PAGE_SIZE } from '@/config/constants'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useGetBranchesQuery } from '@/features/branches/api/branchesApi'

/**
 * Branches for selectors and name lookups. Skipped without `branches.view`
 * (or when `enabled` is false) so the UI never fires a request the API would reject.
 */
export function useBranchOptions({
  organizationId,
  enabled = true,
}: {
  organizationId?: string
  enabled?: boolean
} = {}) {
  const { can } = usePermissions()
  const allowed = enabled && can(PERMISSIONS.branchesView)
  const query = useGetBranchesQuery(
    {
      page: 1,
      pageSize: API_MAX_PAGE_SIZE,
      organizationId: organizationId || undefined,
    },
    { skip: !allowed },
  )

  const items = query.data?.items ?? []

  return {
    allowed,
    isLoading: query.isLoading,
    items,
    nameById: new Map(items.map((branch) => [branch.id, branch.name])),
  }
}
