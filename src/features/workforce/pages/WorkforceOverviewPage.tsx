import { Link } from 'react-router'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { appConfig } from '@/config/app.config'
import { useGetWorkforceSummaryQuery } from '@/features/workforce/api/workforceApi'
import { KpiCard } from '@/features/reports/components/KpiCard'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function WorkforceOverviewPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('workforce.overview.title'))
  const query = useGetWorkforceSummaryQuery()

  return (
    <>
      <PageHeader
        title={t('workforce.overview.title')}
        description={t('workforce.overview.description')}
      />
      <nav className="flex flex-wrap gap-3 text-sm" aria-label={t('workforce.nav.label')}>
        <Link className="text-accent hover:underline" to={appConfig.routes.workforceAttendance}>
          {t('workforce.nav.attendance')}
        </Link>
        <Link className="text-accent hover:underline" to={appConfig.routes.workforceSchedules}>
          {t('workforce.nav.schedules')}
        </Link>
        <Link className="text-accent hover:underline" to={appConfig.routes.workforceShifts}>
          {t('workforce.nav.shifts')}
        </Link>
        <Link className="text-accent hover:underline" to={appConfig.routes.workforceLeave}>
          {t('workforce.nav.leave')}
        </Link>
        <Link className="text-accent hover:underline" to={appConfig.routes.workforceHolidays}>
          {t('workforce.nav.holidays')}
        </Link>
        <Link className="text-accent hover:underline" to={appConfig.routes.workforceOvertime}>
          {t('workforce.nav.overtime')}
        </Link>
      </nav>
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={() => false}
        emptyTitle={t('workforce.emptyTitle')}
        emptyDescription={t('workforce.emptyDescription')}
      >
        {(data) => {
          const kpis = (data.kpis ?? {}) as Record<string, unknown>
          return (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                label={t('workforce.kpis.presentToday')}
                value={String(kpis.presentToday ?? 0)}
              />
              <KpiCard
                label={t('workforce.kpis.absentToday')}
                value={String(kpis.absentToday ?? 0)}
              />
              <KpiCard label={t('workforce.kpis.lateToday')} value={String(kpis.lateToday ?? 0)} />
              <KpiCard
                label={t('workforce.kpis.onLeaveToday')}
                value={String(kpis.onLeaveToday ?? 0)}
              />
              <KpiCard
                label={t('workforce.kpis.missingClockOut')}
                value={String(kpis.missingClockOut ?? 0)}
              />
              <KpiCard
                label={t('workforce.kpis.pendingCorrections')}
                value={String(kpis.pendingCorrections ?? 0)}
              />
              <KpiCard
                label={t('workforce.kpis.pendingLeave')}
                value={String(kpis.pendingLeaveRequests ?? 0)}
              />
              <KpiCard
                label={t('workforce.kpis.businessDate')}
                value={String(data.businessDate ?? '—')}
              />
            </div>
          )
        }}
      </QueryState>
    </>
  )
}
