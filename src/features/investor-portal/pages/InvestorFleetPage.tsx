import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { useGetInvestorFleetQuery } from '@/features/investor-portal/api/investorPortalApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

export function InvestorFleetPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('investorPortal.fleet.title'))
  const { page, setPage } = useSearchPagination()
  const query = useGetInvestorFleetQuery({ page, pageSize: 20 })

  return (
    <>
      <PageHeader
        title={t('investorPortal.fleet.title')}
        description={t('investorPortal.fleet.description')}
      />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => data.items.length === 0}
        emptyTitle={t('investorPortal.fleet.emptyTitle')}
        emptyDescription={t('investorPortal.fleet.emptyDescription')}
      >
        {(data) => (
          <div className="grid gap-3">
            <div className="border-line bg-surface overflow-x-auto rounded-lg border">
              <table className="min-w-full text-sm">
                <thead className="bg-canvas text-muted text-start">
                  <tr>
                    <th className="px-4 py-3 font-medium">{t('investorPortal.fleet.plate')}</th>
                    <th className="px-4 py-3 font-medium">{t('investorPortal.fleet.vehicle')}</th>
                    <th className="px-4 py-3 font-medium">{t('investorPortal.fleet.category')}</th>
                    <th className="px-4 py-3 font-medium">{t('common.status')}</th>
                    <th className="px-4 py-3 font-medium">{t('investorPortal.fleet.contract')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((row) => (
                    <tr key={row.id} className="border-line border-t">
                      <td className="text-ink px-4 py-3 font-medium" dir="ltr">
                        {row.plateNumber}
                      </td>
                      <td className="px-4 py-3">
                        {[row.make, row.model, row.year].filter(Boolean).join(' ') || '—'}
                      </td>
                      <td className="px-4 py-3">{row.category}</td>
                      <td className="px-4 py-3">{row.status}</td>
                      <td className="px-4 py-3" dir="ltr">
                        {row.currentContractNumber ?? '—'}
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
