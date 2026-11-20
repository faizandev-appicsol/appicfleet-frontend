import { Link } from 'react-router'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { appConfig } from '@/config/app.config'
import { useGetPayrollSummaryQuery } from '@/features/payroll/api/payrollApi'
import { KpiCard } from '@/features/reports/components/KpiCard'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function PayrollOverviewPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('payroll.overview.title'))
  const query = useGetPayrollSummaryQuery()

  return (
    <>
      <PageHeader title={t('payroll.overview.title')} description={t('payroll.overview.description')} />
      <nav className="flex flex-wrap gap-3 text-sm" aria-label={t('payroll.nav.label')}>
        <Link className="text-accent hover:underline" to={appConfig.routes.payrollPeriods}>
          {t('payroll.nav.periods')}
        </Link>
        <Link className="text-accent hover:underline" to={appConfig.routes.payrollRuns}>
          {t('payroll.nav.runs')}
        </Link>
        <Link className="text-accent hover:underline" to={appConfig.routes.payrollCompensation}>
          {t('payroll.nav.compensation')}
        </Link>
        <Link className="text-accent hover:underline" to={appConfig.routes.payrollAdjustments}>
          {t('payroll.nav.adjustments')}
        </Link>
        <Link className="text-accent hover:underline" to={appConfig.routes.payrollPayslips}>
          {t('payroll.nav.payslips')}
        </Link>
        <Link className="text-accent hover:underline" to={appConfig.routes.payrollPayments}>
          {t('payroll.nav.payments')}
        </Link>
      </nav>
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={() => false}
        emptyTitle={t('payroll.emptyTitle')}
        emptyDescription={t('payroll.emptyDescription')}
      >
        {(data) => {
          const kpis = (data.kpis ?? {}) as Record<string, unknown>
          const period = data.currentPeriod as { name?: string } | null
          return (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                label={t('payroll.kpis.currentPeriod')}
                value={period?.name ?? t('payroll.kpis.none')}
              />
              <KpiCard
                label={t('payroll.kpis.pendingApprovals')}
                value={String(data.pendingApprovals ?? 0)}
              />
              <KpiCard
                label={t('payroll.kpis.employeesIncluded')}
                value={String(kpis.employeesIncluded ?? 0)}
              />
              <KpiCard
                label={t('payroll.kpis.netPayroll')}
                value={
                  kpis.netPayroll
                    ? `${String(kpis.netPayroll)} ${String(kpis.currency ?? '')}`.trim()
                    : '—'
                }
              />
              <KpiCard
                label={t('payroll.kpis.grossPayroll')}
                value={kpis.grossPayroll ? String(kpis.grossPayroll) : '—'}
              />
              <KpiCard
                label={t('payroll.kpis.deductions')}
                value={kpis.totalDeductions ? String(kpis.totalDeductions) : '—'}
              />
              <KpiCard
                label={t('payroll.kpis.employerCost')}
                value={kpis.employerCost ? String(kpis.employerCost) : '—'}
              />
              <KpiCard label={t('payroll.kpis.paidRuns')} value={String(data.paidRuns ?? 0)} />
            </div>
          )
        }}
      </QueryState>
    </>
  )
}
