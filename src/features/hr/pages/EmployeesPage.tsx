import { useState } from 'react'
import { Link } from 'react-router'
import { SearchField } from '@/components/common/SearchField'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { PERMISSIONS } from '@/app/router/access'
import { appConfig } from '@/config/app.config'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useGetEmployeesQuery } from '@/features/hr/api/hrApi'
import { CreateEmployeeDialog } from '@/features/hr/components/CreateEmployeeDialog'
import { employmentStatusOptions } from '@/features/hr/statusOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'

export function EmployeesPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('hr.employees.title'))
  const { can } = usePermissions()
  const { searchInput, setSearchInput, search, page, setPage } = useSearchPagination()
  const [createOpen, setCreateOpen] = useState(false)
  const query = useGetEmployeesQuery({
    page,
    pageSize: 20,
    search: search || undefined,
  })

  return (
    <>
      <PageHeader
        title={t('hr.employees.title')}
        description={t('hr.employees.description')}
        action={
          can(PERMISSIONS.hrEmployeeCreate) ? (
            <Button type="button" onClick={() => setCreateOpen(true)}>
              {t('hr.employees.create')}
            </Button>
          ) : undefined
        }
      />
      <SearchField
        value={searchInput}
        onChange={setSearchInput}
        label={t('hr.employees.searchLabel')}
        placeholder={t('hr.employees.searchPlaceholder')}
      />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => data.items.length === 0}
        emptyTitle={t('hr.employees.emptyTitle')}
        emptyDescription={
          search ? t('hr.employees.emptyFiltered') : t('hr.employees.emptyDescription')
        }
      >
        {(data) => (
          <div className="grid gap-3">
            <div className="border-line bg-surface overflow-hidden rounded-lg border">
              <Table className="table-fixed">
                <THead>
                  <TR>
                    <TH className="w-[18%]">{t('hr.employees.columns.number')}</TH>
                    <TH className="w-[34%]">{t('common.name')}</TH>
                    <TH className="w-[28%]">{t('hr.employees.columns.title')}</TH>
                    <TH className="w-[20%]">{t('common.status')}</TH>
                  </TR>
                </THead>
                <TBody>
                  {data.items.map((row) => (
                    <TR key={row.id}>
                      <TD dir="ltr">
                        <Link
                          to={`${appConfig.routes.hrEmployees}/${row.id}`}
                          className="text-ink font-medium underline-offset-2 hover:underline"
                        >
                          {row.employeeNumber}
                        </Link>
                      </TD>
                      <TD className="font-medium">
                        {row.firstName} {row.lastName}
                      </TD>
                      <TD className="text-muted">{row.jobTitle ?? '—'}</TD>
                      <TD>
                        <StatusBadge value={row.status} options={employmentStatusOptions} />
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
      {can(PERMISSIONS.hrEmployeeCreate) ? (
        <CreateEmployeeDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      ) : null}
    </>
  )
}
