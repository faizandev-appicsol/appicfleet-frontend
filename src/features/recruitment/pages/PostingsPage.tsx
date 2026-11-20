import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { PERMISSIONS } from '@/app/router/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import {
  useGetPostingsQuery,
  usePublishPostingMutation,
} from '@/features/recruitment/api/recruitmentApi'
import { postingStatusOptions } from '@/features/recruitment/statusOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

export function PostingsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('recruitment.postings.title'))
  const { can } = usePermissions()
  const { page, setPage } = useSearchPagination()
  const query = useGetPostingsQuery({ page, pageSize: 20 })
  const [publish] = usePublishPostingMutation()

  return (
    <>
      <PageHeader
        title={t('recruitment.postings.title')}
        description={t('recruitment.postings.description')}
      />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => !Array.isArray(data.items) || data.items.length === 0}
        emptyTitle={t('recruitment.postings.emptyTitle')}
        emptyDescription={t('recruitment.postings.emptyDescription')}
      >
        {(data) => {
          const items = (data.items ?? []) as Array<Record<string, unknown>>
          return (
            <div className="grid gap-3">
              <div className="border-line bg-surface overflow-hidden rounded-lg border">
                <Table className="table-fixed">
                  <THead>
                    <TR>
                      <TH className="w-[36%]">{t('recruitment.postings.columns.title')}</TH>
                      <TH className="w-[18%]">{t('recruitment.postings.columns.visibility')}</TH>
                      <TH className="w-[16%]">{t('common.status')}</TH>
                      <TH className="w-[30%]">{t('common.actions')}</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {items.map((row) => {
                      const id = String(row.id)
                      const status = String(row.status)
                      return (
                        <TR key={id}>
                          <TD className="font-medium">{String(row.title ?? '—')}</TD>
                          <TD>{String(row.visibility ?? '—')}</TD>
                          <TD>
                            <StatusBadge value={status} options={postingStatusOptions} />
                          </TD>
                          <TD>
                            {status === 'DRAFT' && can(PERMISSIONS.requisitionUpdate) ? (
                              <Button type="button" size="sm" onClick={() => void publish(id)}>
                                {t('recruitment.actions.publish')}
                              </Button>
                            ) : null}
                          </TD>
                        </TR>
                      )
                    })}
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
