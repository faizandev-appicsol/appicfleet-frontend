import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { useGetShiftsQuery } from '@/features/workforce/api/workforceApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function ShiftsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('workforce.shifts.title'))
  const query = useGetShiftsQuery({ page: 1, pageSize: 50 })

  return (
    <>
      <PageHeader title={t('workforce.shifts.title')} description={t('workforce.shifts.description')} />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => !Array.isArray(data.items) || data.items.length === 0}
        emptyTitle={t('workforce.shifts.emptyTitle')}
        emptyDescription={t('workforce.shifts.emptyDescription')}
      >
        {(data) => {
          const items = (data.items ?? []) as Array<Record<string, unknown>>
          return (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full table-fixed border-collapse text-sm">
                <thead className="bg-muted/40 text-left">
                  <tr>
                    <th className="p-3 font-medium">{t('workforce.shifts.code')}</th>
                    <th className="p-3 font-medium">{t('workforce.shifts.name')}</th>
                    <th className="p-3 font-medium">{t('workforce.shifts.hours')}</th>
                    <th className="p-3 font-medium">{t('workforce.shifts.overnight')}</th>
                    <th className="p-3 font-medium">{t('workforce.shifts.status')}</th>
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
                      <td className="p-3">
                        {row.crossesMidnight
                          ? t('workforce.shifts.overnightYes')
                          : t('workforce.shifts.overnightNo')}
                      </td>
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
