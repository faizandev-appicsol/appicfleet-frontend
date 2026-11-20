import { PERMISSIONS } from '@/app/router/access'
import { API_MAX_PAGE_SIZE } from '@/config/constants'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useGetLegalEntitiesQuery } from '@/features/legal-entities/api/legalEntitiesApi'

/**
 * Legal entities for selectors and name lookups. Skipped without `legal_entities.view`
 * (or when `enabled` is false) so the UI never fires a request the API would reject.
 */
export function useLegalEntityOptions({
  organizationId,
  enabled = true,
}: {
  organizationId?: string
  enabled?: boolean
} = {}) {
  const { can } = usePermissions()
  const allowed = enabled && can(PERMISSIONS.legalEntitiesView)
  const query = useGetLegalEntitiesQuery(
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
    options: items.map((entity) => ({ value: entity.id, label: entity.displayName })),
    nameById: new Map(items.map((entity) => [entity.id, entity.displayName])),
  }
}
