import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { useGetOvertimeQuery } from '@/features/workforce/api/workforceApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function OvertimePage() {
  const { t } = useTranslation()
  useDocumentTitle(t('workforce.overtime.title'))
  const query = useGetOvertimeQuery({ page: 1, pageSize: 50 })

  return (
    <>
      <PageHeader
        title={t('workforce.overtime.title')}
        description={t('workforce.overtime.description')}
      />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => !Array.isArray(data.items) || data.items.length === 0}
        emptyTitle={t('workforce.overtime.emptyTitle')}
        emptyDescription={t('workforce.overtime.emptyDescription')}
      >
        {(data) => {
          const items = (data.items ?? []) as Array<Record<string, unknown>>
          return (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full table-fixed border-collapse text-sm">
                <thead className="bg-muted/40 text-left">
                  <tr>
                    <th className="p-3 font-medium">{t('workforce.overtime.date')}</th>
                    <th className="p-3 font-medium">{t('workforce.overtime.hours')}</th>
                    <th className="p-3 font-medium">{t('workforce.overtime.status')}</th>
                    <th className="p-3 font-medium">{t('workforce.overtime.reason')}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => (
                    <tr key={String(row.id)} className="border-t border-border">
                      <td className="p-3">{String(row.workDate ?? '—')}</td>
                      <td className="p-3">{String(row.hours ?? '—')}</td>
                      <td className="p-3">
                        <span aria-label={String(row.status)}>{String(row.status ?? '—')}</span>
                      </td>
                      <td className="p-3">{String(row.reason ?? '—')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }}
      </QueryState>
    </>
  )
}
