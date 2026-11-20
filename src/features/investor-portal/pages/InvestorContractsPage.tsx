import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { useGetInvestorContractsQuery } from '@/features/investor-portal/api/investorPortalApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

export function InvestorContractsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('investorPortal.contracts.title'))
  const { page, setPage } = useSearchPagination()
  const query = useGetInvestorContractsQuery({ page, pageSize: 20 })

  return (
    <>
      <PageHeader
        title={t('investorPortal.contracts.title')}
        description={t('investorPortal.contracts.description')}
      />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => data.items.length === 0}
        emptyTitle={t('investorPortal.contracts.emptyTitle')}
        emptyDescription={t('investorPortal.contracts.emptyDescription')}
      >
        {(data) => (
          <div className="grid gap-3">
            <div className="border-line bg-surface overflow-x-auto rounded-lg border">
              <table className="min-w-full text-sm">
                <thead className="bg-canvas text-muted text-start">
                  <tr>
                    <th className="px-4 py-3 font-medium">{t('investorPortal.contracts.number')}</th>
                    <th className="px-4 py-3 font-medium">{t('investorPortal.fleet.plate')}</th>
                    <th className="px-4 py-3 font-medium">{t('common.status')}</th>
                    <th className="px-4 py-3 font-medium">{t('investorPortal.contracts.period')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((row) => (
                    <tr key={row.id} className="border-line border-t">
                      <td className="text-ink px-4 py-3 font-medium" dir="ltr">
                        {row.contractNumber}
                      </td>
                      <td className="px-4 py-3" dir="ltr">
                        {row.vehiclePlate ?? '—'}
                      </td>
                      <td className="px-4 py-3">{row.status}</td>
                      <td className="px-4 py-3" dir="ltr">
                        {row.startsAt.slice(0, 10)} → {row.endsAt.slice(0, 10)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination data={data} page={page} onPageChange={setPage} disabled={query.isFetching} />
          </div>
        )}
      </QueryState>
    </>
  )
}
