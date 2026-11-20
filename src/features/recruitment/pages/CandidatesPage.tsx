import { Link } from 'react-router'
import { SearchField } from '@/components/common/SearchField'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { appConfig } from '@/config/app.config'
import { useGetCandidatesQuery } from '@/features/recruitment/api/recruitmentApi'
import { candidateStatusOptions } from '@/features/recruitment/statusOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

export function CandidatesPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('recruitment.candidates.title'))
  const { searchInput, setSearchInput, search, page, setPage } = useSearchPagination()
  const query = useGetCandidatesQuery({
    page,
    pageSize: 20,
    q: search || undefined,
  })

  return (
    <>
      <PageHeader
        title={t('recruitment.candidates.title')}
        description={t('recruitment.candidates.description')}
      />
      <SearchField
        value={searchInput}
        onChange={setSearchInput}
        label={t('recruitment.candidates.searchLabel')}
        placeholder={t('recruitment.candidates.searchPlaceholder')}
      />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => !Array.isArray(data.items) || data.items.length === 0}
        emptyTitle={t('recruitment.candidates.emptyTitle')}
        emptyDescription={
          search
            ? t('recruitment.candidates.emptyFiltered')
            : t('recruitment.candidates.emptyDescription')
        }
      >
        {(data) => {
          const items = (data.items ?? []) as Array<Record<string, unknown>>
          return (
            <div className="grid gap-3">
              <div className="border-line bg-surface overflow-hidden rounded-lg border">
                <Table className="table-fixed">
                  <THead>
                    <TR>
                      <TH className="w-[28%]">{t('common.name')}</TH>
                      <TH className="w-[28%]">{t('recruitment.candidates.columns.email')}</TH>
                      <TH className="w-[24%]">{t('recruitment.candidates.columns.employer')}</TH>
                      <TH className="w-[20%]">{t('common.status')}</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {items.map((row) => (
                      <TR key={String(row.id)}>
                        <TD className="font-medium">
                          <Link
                            to={`${appConfig.routes.recruitmentCandidates}/${String(row.id)}`}
                            className="text-ink underline-offset-2 hover:underline"
                          >
                            {String(row.firstName ?? '')} {String(row.lastName ?? '')}
                          </Link>
                        </TD>
                        <TD dir="ltr">{String(row.email ?? '—')}</TD>
                        <TD className="text-muted">{String(row.currentEmployer ?? '—')}</TD>
                        <TD>
                          <StatusBadge
                            value={String(row.status)}
                            options={candidateStatusOptions}
                          />
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>
              <Pagination
                data={data as never}
                page={page}
                onPageChange={setPage}
                disabled={query.isFetching}
              />
            </div>
          )
        }}
      </QueryState>
    </>
  )
}
