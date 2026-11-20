import { useState } from 'react'
import { Link } from 'react-router'
import { SearchField } from '@/components/common/SearchField'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PERMISSIONS } from '@/app/router/access'
import { appConfig } from '@/config/app.config'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { CreateInvestorDialog } from '@/features/investors/components/CreateInvestorDialog'
import { useGetInvestorsQuery } from '@/features/investors/api/investorsApi'
import { investorStatusOptions } from '@/features/investors/statusOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

export function InvestorsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('investors.title'))
  const { can } = usePermissions()
  const { searchInput, setSearchInput, search, page, setPage } = useSearchPagination()
  const [createOpen, setCreateOpen] = useState(false)
  const canManage = can(PERMISSIONS.investorsManage)

  const query = useGetInvestorsQuery({
    page,
    pageSize: 20,
    search: search || undefined,
  })

  return (
    <>
      <PageHeader
        title={t('investors.title')}
        description={t('investors.description')}
        action={
          canManage ? (
            <Button type="button" onClick={() => setCreateOpen(true)}>
              {t('investors.create')}
            </Button>
          ) : undefined
        }
      />
      <SearchField
        value={searchInput}
        onChange={setSearchInput}
        label={t('investors.searchLabel')}
        placeholder={t('investors.searchPlaceholder')}
      />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => data.items.length === 0}
        emptyTitle={t('investors.emptyTitle')}
        emptyDescription={search ? t('investors.emptyFiltered') : t('investors.emptyDescription')}
      >
        {(data) => (
          <div className="grid gap-3">
            <div className="border-line bg-surface overflow-x-auto rounded-lg border">
              <table className="min-w-full text-sm">
                <thead className="bg-canvas text-muted text-start">
                  <tr>
                    <th className="px-4 py-3 font-medium">{t('investors.columns.number')}</th>
                    <th className="px-4 py-3 font-medium">{t('common.name')}</th>
                    <th className="px-4 py-3 font-medium">{t('common.email')}</th>
                    <th className="px-4 py-3 font-medium">{t('common.status')}</th>
                    <th className="px-4 py-3 font-medium">{t('investors.columns.scope')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((row) => (
                    <tr key={row.id} className="border-line border-t">
                      <td className="px-4 py-3" dir="ltr">
                        <Link
                          className="text-accent font-medium hover:underline"
                          to={`${appConfig.routes.investors}/${row.id}`}
                        >
                          {row.investorNumber}
                        </Link>
                      </td>
                      <td className="text-ink px-4 py-3 font-medium">{row.displayName}</td>
                      <td className="px-4 py-3" dir="ltr">
                        {row.contactEmail}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge value={row.status} options={investorStatusOptions} />
                      </td>
                      <td className="text-muted px-4 py-3">
                        {t('investors.accessPreview', {
                          legalEntities: row.accessPreview.legalEntityCount,
                          branches: row.accessPreview.branchCount,
                          vehicles: row.accessPreview.vehicleCount,
                          reports: row.accessPreview.reportCount,
                        })}
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
      {canManage ? <CreateInvestorDialog open={createOpen} onClose={() => setCreateOpen(false)} /> : null}
    </>
  )
}
