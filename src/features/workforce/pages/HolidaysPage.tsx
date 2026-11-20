import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { useGetHolidaysQuery } from '@/features/workforce/api/workforceApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function HolidaysPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('workforce.holidays.title'))
  const query = useGetHolidaysQuery({ page: 1, pageSize: 100 })

  return (
    <>
      <PageHeader
        title={t('workforce.holidays.title')}
        description={t('workforce.holidays.description')}
      />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => !Array.isArray(data.items) || data.items.length === 0}
        emptyTitle={t('workforce.holidays.emptyTitle')}
        emptyDescription={t('workforce.holidays.emptyDescription')}
      >
        {(data) => {
          const items = (data.items ?? []) as Array<Record<string, unknown>>
          return (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full table-fixed border-collapse text-sm">
                <thead className="bg-muted/40 text-left">
                  <tr>
                    <th className="p-3 font-medium">{t('workforce.holidays.date')}</th>
                    <th className="p-3 font-medium">{t('workforce.holidays.name')}</th>
                    <th className="p-3 font-medium">{t('workforce.holidays.country')}</th>
                    <th className="p-3 font-medium">{t('workforce.holidays.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => (
                    <tr key={String(row.id)} className="border-t border-border">
                      <td className="p-3">{String(row.date ?? '—')}</td>
                      <td className="p-3">{String(row.name ?? '—')}</td>
                      <td className="p-3">{String(row.country ?? '—')}</td>
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
