import { Link } from 'react-router'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { appConfig } from '@/config/app.config'
import { useGetDocumentExpiryQuery } from '@/features/hr/api/hrApi'
import { hrDocumentStatusOptions } from '@/features/hr/statusOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

export function DocumentExpiryPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('hr.documentExpiry.title'))
  const { page, setPage } = useSearchPagination()
  const query = useGetDocumentExpiryQuery({ page, days: 60 })

  return (
    <>
      <PageHeader
        title={t('hr.documentExpiry.title')}
        description={t('hr.documentExpiry.description')}
      />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => data.items.length === 0}
        emptyTitle={t('hr.documentExpiry.emptyTitle')}
        emptyDescription={t('hr.documentExpiry.emptyDescription')}
      >
        {(data) => (
          <div className="grid gap-3">
            <div className="border-line bg-surface overflow-hidden rounded-lg border">
              <Table className="table-fixed">
                <THead>
                  <TR>
                    <TH className="w-[28%]">{t('hr.documents.type')}</TH>
                    <TH className="w-[24%]">{t('hr.documents.expiresOn')}</TH>
                    <TH className="w-[24%]">{t('common.status')}</TH>
                    <TH className="w-[24%]">{t('hr.employees.columns.number')}</TH>
                  </TR>
                </THead>
                <TBody>
                  {data.items.map((row) => (
                    <TR key={row.id}>
                      <TD>{row.documentType}</TD>
                      <TD dir="ltr">{row.expiresOn ?? '—'}</TD>
                      <TD>
                        <StatusBadge value={row.status} options={hrDocumentStatusOptions} />
                      </TD>
                      <TD>
                        <Link
                          className="text-ink font-medium underline-offset-2 hover:underline"
                          to={`${appConfig.routes.hrEmployees}/${row.employeeId}`}
                        >
                          {t('hr.employees.view')}
                        </Link>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
            <Pagination data={data} page={page} onPageChange={setPage} disabled={query.isFetching} />
          </div>
        )}
      </QueryState>
    </>
  )
}
