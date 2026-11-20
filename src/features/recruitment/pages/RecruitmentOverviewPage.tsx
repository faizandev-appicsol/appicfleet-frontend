import { Link } from 'react-router'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { appConfig } from '@/config/app.config'
import { useGetRecruitmentSummaryQuery } from '@/features/recruitment/api/recruitmentApi'
import { KpiCard } from '@/features/reports/components/KpiCard'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function RecruitmentOverviewPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('recruitment.overview.title'))
  const query = useGetRecruitmentSummaryQuery()

  return (
    <>
      <PageHeader
        title={t('recruitment.overview.title')}
        description={t('recruitment.overview.description')}
      />
      <nav className="flex flex-wrap gap-3 text-sm" aria-label={t('recruitment.nav.label')}>
        <Link className="text-accent hover:underline" to={appConfig.routes.recruitmentRequisitions}>
          {t('recruitment.nav.requisitions')}
        </Link>
        <Link className="text-accent hover:underline" to={appConfig.routes.recruitmentPostings}>
          {t('recruitment.nav.postings')}
        </Link>
        <Link className="text-accent hover:underline" to={appConfig.routes.recruitmentCandidates}>
          {t('recruitment.nav.candidates')}
        </Link>
        <Link className="text-accent hover:underline" to={appConfig.routes.recruitmentApplications}>
          {t('recruitment.nav.applications')}
        </Link>
        <Link className="text-accent hover:underline" to={appConfig.routes.recruitmentInterviews}>
          {t('recruitment.nav.interviews')}
        </Link>
        <Link className="text-accent hover:underline" to={appConfig.routes.recruitmentOffers}>
          {t('recruitment.nav.offers')}
        </Link>
        <Link className="text-accent hover:underline" to={appConfig.routes.recruitmentOnboarding}>
          {t('recruitment.nav.onboarding')}
        </Link>
      </nav>
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={() => false}
        emptyTitle={t('recruitment.emptyTitle')}
        emptyDescription={t('recruitment.emptyDescription')}
      >
        {(data) => {
          const kpis = (data.kpis ?? {}) as Record<string, unknown>
          return (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                label={t('recruitment.kpis.openRequisitions')}
                value={String(kpis.openRequisitions ?? 0)}
              />
              <KpiCard
                label={t('recruitment.kpis.applications')}
                value={String(kpis.applications ?? 0)}
              />
              <KpiCard
                label={t('recruitment.kpis.inInterview')}
                value={String(kpis.candidatesInInterview ?? 0)}
              />
              <KpiCard
                label={t('recruitment.kpis.pendingOffers')}
                value={String(kpis.pendingOffers ?? 0)}
              />
              <KpiCard
                label={t('recruitment.kpis.acceptedOffers')}
                value={String(kpis.acceptedOffers ?? 0)}
              />
              <KpiCard
                label={t('recruitment.kpis.onboarding')}
                value={String(kpis.onboardingInProgress ?? 0)}
              />
              <KpiCard
                label={t('recruitment.kpis.upcomingInterviews')}
                value={String(kpis.upcomingInterviews ?? 0)}
              />
            </div>
          )
        }}
      </QueryState>
    </>
  )
}
