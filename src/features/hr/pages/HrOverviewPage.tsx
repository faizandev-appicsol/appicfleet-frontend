import { Link } from 'react-router'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { appConfig } from '@/config/app.config'
import { KpiCard } from '@/features/reports/components/KpiCard'
import { useGetHrSummaryQuery } from '@/features/hr/api/hrApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function HrOverviewPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('hr.overview.title'))
  const query = useGetHrSummaryQuery()

  return (
    <>
      <PageHeader title={t('hr.overview.title')} description={t('hr.overview.description')} />
      <div className="flex flex-wrap gap-3 text-sm">
        <Link className="text-accent hover:underline" to={appConfig.routes.hrEmployees}>
          {t('hr.nav.employees')}
        </Link>
        <Link className="text-accent hover:underline" to={appConfig.routes.hrDepartments}>
          {t('hr.nav.departments')}
        </Link>
        <Link className="text-accent hover:underline" to={appConfig.routes.hrPositions}>
          {t('hr.nav.positions')}
        </Link>
        <Link className="text-accent hover:underline" to={appConfig.routes.hrDocumentExpiry}>
          {t('hr.nav.documentExpiry')}
        </Link>
      </div>
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={() => false}
        emptyTitle={t('hr.emptyTitle')}
        emptyDescription={t('hr.emptyDescription')}
      >
        {(data) => {
          const totals = (data.totals ?? {}) as Record<string, number>
          const documents = (data.documents ?? {}) as Record<string, number>
          return (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard label={t('hr.kpis.total')} value={String(totals.employees ?? 0)} />
              <KpiCard label={t('hr.kpis.active')} value={String(totals.active ?? 0)} />
              <KpiCard label={t('hr.kpis.onLeave')} value={String(totals.onLeave ?? 0)} />
              <KpiCard
                label={t('hr.kpis.expiringDocs')}
                value={String(documents.expiringSoon ?? 0)}
              />
            </div>
          )
        }}
      </QueryState>
    </>
  )
}
