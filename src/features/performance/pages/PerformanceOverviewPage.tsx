import { Link } from 'react-router'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { appConfig } from '@/config/app.config'
import { useGetPerformanceSummaryQuery } from '@/features/performance/api/performanceApi'
import { KpiCard } from '@/features/reports/components/KpiCard'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function PerformanceOverviewPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('performance.overview.title'))
  const query = useGetPerformanceSummaryQuery()

  return (
    <>
      <PageHeader
        title={t('performance.overview.title')}
        description={t('performance.overview.description')}
      />
      <nav className="flex flex-wrap gap-3 text-sm" aria-label={t('performance.nav.label')}>
        <Link className="text-accent hover:underline" to={appConfig.routes.performanceCycles}>
          {t('performance.nav.cycles')}
        </Link>
        <Link className="text-accent hover:underline" to={appConfig.routes.performanceReviews}>
          {t('performance.nav.reviews')}
        </Link>
        <Link className="text-accent hover:underline" to={appConfig.routes.performanceGoals}>
          {t('performance.nav.goals')}
        </Link>
        <Link className="text-accent hover:underline" to={appConfig.routes.performancePips}>
          {t('performance.nav.pips')}
        </Link>
        <Link className="text-accent hover:underline" to={appConfig.routes.performanceDevelopment}>
          {t('performance.nav.development')}
        </Link>
        <Link className="text-accent hover:underline" to={appConfig.routes.performanceAnalytics}>
          {t('performance.nav.analytics')}
        </Link>
      </nav>
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={() => false}
        emptyTitle={t('performance.emptyTitle')}
        emptyDescription={t('performance.emptyDescription')}
      >
        {(data) => {
          const kpis = (data.kpis ?? {}) as Record<string, unknown>
          return (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                label={t('performance.kpis.openCycles')}
                value={String(kpis.openCycles ?? 0)}
              />
              <KpiCard
                label={t('performance.kpis.reviewsPending')}
                value={String(kpis.reviewsPending ?? 0)}
              />
              <KpiCard
                label={t('performance.kpis.reviewsCompleted')}
                value={String(kpis.reviewsCompleted ?? 0)}
              />
              <KpiCard
                label={t('performance.kpis.completion')}
                value={
                  kpis.completionPercent == null ? '—' : `${String(kpis.completionPercent)}%`
                }
              />
              <KpiCard
                label={t('performance.kpis.goalsAtRisk')}
                value={String(kpis.goalsAtRisk ?? 0)}
              />
              <KpiCard
                label={t('performance.kpis.pipsActive')}
                value={String(kpis.pipsActive ?? 0)}
              />
              <KpiCard
                label={t('performance.kpis.development')}
                value={String(kpis.developmentPlans ?? 0)}
              />
            </div>
          )
        }}
      </QueryState>
    </>
  )
}
