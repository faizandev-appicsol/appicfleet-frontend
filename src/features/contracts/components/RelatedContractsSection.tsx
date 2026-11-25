import { Link } from 'react-router'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PERMISSIONS } from '@/app/router/access'
import { appConfig } from '@/config/app.config'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useGetContractsQuery } from '@/features/contracts/api/contractsApi'
import { useContractOptions } from '@/features/contracts/hooks/useContractOptions'
import { API_MAX_PAGE_SIZE } from '@/config/constants'
import { useTranslation } from '@/i18n'
import { formatDateTime } from '@/utils/formatDate'

type Props = { customerId: string } | { vehicleId: string }

export function RelatedContractsSection(props: Props) {
  const { t, locale } = useTranslation()
  const { can } = usePermissions()
  const options = useContractOptions()
  const isCustomerPage = 'customerId' in props
  const canOpenRelatedPage = can(
    isCustomerPage ? PERMISSIONS.vehicleView : PERMISSIONS.customerView,
  )
  const query = useGetContractsQuery({
    page: 1,
    pageSize: API_MAX_PAGE_SIZE,
    sort: 'createdAt',
    order: 'desc',
    ...props,
  })

  return (
    <Card className="grid gap-4 p-4">
      <h2 className="text-ink text-base font-semibold">{t('contracts.related.title')}</h2>
      {query.isLoading ? <LoadingState label={t('common.loading')} /> : null}
      {query.error ? <ErrorState error={query.error} onRetry={query.refetch} /> : null}
      {query.data?.items.length === 0 ? (
        <p className="text-muted text-sm">{t('contracts.related.empty')}</p>
      ) : null}
      {query.data?.items.length ? (
        <ul className="divide-line divide-y">
          {query.data.items.map((contract) => {
            const contractPath = `${appConfig.routes.contracts}/${encodeURIComponent(contract.id)}`
            const relatedId = isCustomerPage ? contract.currentVehicleId : contract.customerId
            const relatedPath = relatedId
              ? isCustomerPage
                ? `${appConfig.routes.vehicles}/${encodeURIComponent(relatedId)}`
                : `${appConfig.routes.customers}/${encodeURIComponent(relatedId)}`
              : undefined
            const relatedLabel = isCustomerPage
              ? contract.currentPlate
              : contract.customerName

            return (
              <li key={contract.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="grid min-w-0 gap-1">
                  <Link to={contractPath} className="text-brand w-fit font-medium hover:underline" dir="ltr">
                    {contract.contractNumber}
                  </Link>
                  <div className="text-muted flex flex-wrap items-center gap-x-2 text-sm">
                    <span>{options.labelOf(options.typeOptions, contract.type)}</span>
                    <span aria-hidden="true">·</span>
                    {relatedPath && canOpenRelatedPage ? (
                      <Link to={relatedPath} className="text-brand hover:underline">
                        {relatedLabel}
                      </Link>
                    ) : (
                      <span>{relatedLabel ?? t('common.notSet')}</span>
                    )}
                    <span aria-hidden="true">·</span>
                    <span>{formatDateTime(contract.startsAt, locale)} – {formatDateTime(contract.endsAt, locale)}</span>
                  </div>
                </div>
                <StatusBadge value={contract.status} options={options.statusOptions} />
              </li>
            )
          })}
        </ul>
      ) : null}
    </Card>
  )
}
