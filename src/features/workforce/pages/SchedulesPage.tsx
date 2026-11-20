import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { useGetSchedulesQuery } from '@/features/workforce/api/workforceApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function SchedulesPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('workforce.schedules.title'))
  const query = useGetSchedulesQuery({ page: 1, pageSize: 50 })

  return (
    <>
      <PageHeader
        title={t('workforce.schedules.title')}
        description={t('workforce.schedules.description')}
      />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => !Array.isArray(data.items) || data.items.length === 0}
        emptyTitle={t('workforce.schedules.emptyTitle')}
        emptyDescription={t('workforce.schedules.emptyDescription')}
      >
        {(data) => {
          const items = (data.items ?? []) as Array<Record<string, unknown>>
          return (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full table-fixed border-collapse text-sm">
                <thead className="bg-muted/40 text-left">
                  <tr>
                    <th className="p-3 font-medium">{t('workforce.schedules.code')}</th>
                    <th className="p-3 font-medium">{t('workforce.schedules.name')}</th>
                    <th className="p-3 font-medium">{t('workforce.schedules.hours')}</th>
                    <th className="p-3 font-medium">{t('workforce.schedules.timezone')}</th>
                    <th className="p-3 font-medium">{t('workforce.schedules.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => (
                    <tr key={String(row.id)} className="border-t border-border">
                      <td className="p-3">{String(row.code ?? '—')}</td>
                      <td className="p-3">{String(row.name ?? '—')}</td>
                      <td className="p-3">
                        {String(row.startTime ?? '')} → {String(row.endTime ?? '')}
                      </td>
                      <td className="p-3">{String(row.timezone ?? '—')}</td>
                      <td className="p-3">{String(row.status ?? '—')}</td>
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
