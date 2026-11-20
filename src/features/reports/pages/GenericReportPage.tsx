import { QueryState } from '@/components/feedback/QueryState'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { ReportPageShell } from '@/features/reports/components/ReportPageShell'
import { KpiCard } from '@/features/reports/components/KpiCard'
import type { ReportFilters } from '@/features/reports/schemas/reports.schema'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'
import type { Paginated } from '@/types/pagination'

type HookResult = {
  data?: Record<string, unknown>
  isLoading: boolean
  isFetching: boolean
  error: unknown
  refetch: () => void
}

type Props = {
  titleKey: string
  descriptionKey: string
  emptyKey: string
  exportKind?: string
  showStatus?: boolean
  statusOptions?: Array<{ value: string; label: string }>
  columns: DataTableColumn<Record<string, unknown>>[]
  useQuery: (filters: ReportFilters) => HookResult
  summaryCards?: (data: Record<string, unknown>) => Array<{
    label: string
    value: string
    empty?: boolean
  }>
}

function asPage(data: Record<string, unknown> | undefined): Paginated<Record<string, unknown>> | null {
  if (!data || !Array.isArray(data.items)) return null
  return {
    items: data.items as Array<Record<string, unknown>>,
    page: Number(data.page ?? 1),
    pageSize: Number(data.pageSize ?? 20),
    total: Number(data.total ?? 0),
  }
}

export function GenericReportPage({
  titleKey,
  descriptionKey,
  emptyKey,
  exportKind,
  showStatus,
  statusOptions,
  columns,
  useQuery,
  summaryCards,
}: Props) {
  const { t } = useTranslation()
  useDocumentTitle(t(titleKey as never))

  return (
    <ReportPageShell
      title={t(titleKey as never)}
      description={t(descriptionKey as never)}
      exportKind={exportKind}
      showStatus={showStatus}
      statusOptions={statusOptions}
    >
      {(filters) => {
        const query = useQuery(filters)
        const page = asPage(query.data)
        return (
          <QueryState
            data={query.data}
            isLoading={query.isLoading}
            isFetching={query.isFetching && !query.isLoading}
            error={query.error}
            onRetry={query.refetch}
            isEmpty={(data) => !Array.isArray(data.items) || data.items.length === 0}
            emptyTitle={t(emptyKey as never)}
          >
            {(data) => (
              <div className="grid gap-4">
                {summaryCards ? (
                  <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {summaryCards(data).map((card) => (
                      <KpiCard
                        key={card.label}
                        label={card.label}
                        value={card.value}
                        empty={card.empty}
                        emptyLabel={t(emptyKey as never)}
                      />
                    ))}
                  </section>
                ) : null}
                <div className="border-line bg-surface min-w-0 overflow-x-auto rounded-lg border">
                  <DataTable columns={columns} rows={page?.items ?? []} rowKey={(row, index) => String(row.id ?? index)} />
                </div>
                {page ? (
                  <Pagination
                    data={page}
                    page={filters.page ?? 1}
                    onPageChange={() => undefined}
                    disabled={query.isFetching}
                  />
                ) : null}
              </div>
            )}
          </QueryState>
        )
      }}
    </ReportPageShell>
  )
}
