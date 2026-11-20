import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { useGetPerformanceAnalyticsQuery } from '@/features/performance/api/performanceApi'
import { KpiCard } from '@/features/reports/components/KpiCard'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function AnalyticsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('performance.analytics.title'))
  const query = useGetPerformanceAnalyticsQuery()

  return (
    <>
      <PageHeader
        title={t('performance.analytics.title')}
        description={t('performance.analytics.description')}
      />
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
          const review = (data.reviewCompletion ?? {}) as Record<string, unknown>
          const goals = (data.goalPerformance ?? {}) as Record<string, unknown>
          const pips = (data.pipAnalytics ?? {}) as Record<string, unknown>
          const feedback = (data.feedbackAnalytics ?? {}) as Record<string, unknown>
          const rating = data.ratingDistribution as
            | { suppressed?: boolean; sampleSize?: number }
            | Array<{ rating: number; count: number }>

          return (
            <div className="mt-4 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard
                  label={t('performance.analytics.reviewsTotal')}
                  value={String(review.total ?? 0)}
                />
                <KpiCard
                  label={t('performance.analytics.reviewsCompleted')}
                  value={String(review.completed ?? 0)}
                />
                <KpiCard
                  label={t('performance.analytics.goalsAtRisk')}
                  value={String(goals.atRisk ?? 0)}
                />
                <KpiCard
                  label={t('performance.analytics.pipsActive')}
                  value={String(pips.active ?? 0)}
                />
                <KpiCard
                  label={t('performance.analytics.feedback')}
                  value={String(feedback.feedbackCount ?? 0)}
                />
                <KpiCard
                  label={t('performance.analytics.recognition')}
                  value={String(feedback.recognitionCount ?? 0)}
                />
              </div>
              <section className="rounded-lg border border-border bg-surface p-4" aria-labelledby="rating-dist">
                <h2 id="rating-dist" className="text-base font-semibold">
                  {t('performance.analytics.ratingDistribution')}
                </h2>
                {Array.isArray(rating) ? (
                  <ul className="mt-3 grid gap-2 text-sm">
                    {rating.map((row) => (
                      <li key={row.rating}>
                        {t('performance.analytics.ratingRow', {
                          rating: row.rating,
                          count: row.count,
                        })}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted mt-2 text-sm">
                    {t('performance.analytics.ratingSuppressed', {
                      threshold: String(rating?.sampleSize ?? 0),
                    })}
                  </p>
                )}
              </section>
            </div>
          )
        }}
      </QueryState>
    </>
  )
}
