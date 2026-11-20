import { useParams } from 'react-router'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import {
  useApprovePayrollRunMutation,
  useCalculatePayrollRunMutation,
  useGetPayrollRunReviewQuery,
  usePayPayrollRunMutation,
  useSubmitPayrollRunMutation,
} from '@/features/payroll/api/payrollApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function PayrollRunDetailsPage() {
  const { t } = useTranslation()
  const { runId = '' } = useParams()
  useDocumentTitle(t('payroll.runDetail.title'))
  const query = useGetPayrollRunReviewQuery(runId, { skip: !runId })
  const [calculate, calcState] = useCalculatePayrollRunMutation()
  const [submit, submitState] = useSubmitPayrollRunMutation()
  const [approve, approveState] = useApprovePayrollRunMutation()
  const [pay, payState] = usePayPayrollRunMutation()

  return (
    <>
      <PageHeader
        title={t('payroll.runDetail.title')}
        description={t('payroll.runDetail.description')}
      />
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
          const run = (data.run ?? {}) as Record<string, string | number>
          const calculations = (data.calculations ?? []) as Array<Record<string, unknown>>
          const exceptions = (data.exceptions ?? []) as Array<Record<string, unknown>>
          const status = String(run.status ?? '')
          return (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3 text-sm">
                <span>
                  <strong>{t('payroll.runs.columns.number')}:</strong> {String(run.runNumber)}
                </span>
                <span>
                  <strong>{t('payroll.runs.columns.status')}:</strong>{' '}
                  <span className="uppercase">{status}</span>
                </span>
                <span>
                  <strong>{t('payroll.runs.columns.employees')}:</strong>{' '}
                  {String(run.employeeCount ?? 0)}
                </span>
                <span>
                  <strong>{t('payroll.runs.columns.gross')}:</strong>{' '}
                  {run.grossTotal != null ? String(run.grossTotal) : '—'}
                </span>
                <span>
                  <strong>{t('payroll.runs.columns.net')}:</strong>{' '}
                  {run.netTotal != null ? String(run.netTotal) : '—'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {['open', 'processing', 'calculated'].includes(status) ? (
                  <Button
                    type="button"
                    disabled={calcState.isLoading}
                    onClick={() => calculate({ id: runId })}
                  >
                    {t('payroll.runDetail.calculate')}
                  </Button>
                ) : null}
                {status === 'calculated' ? (
                  <Button
                    type="button"
                    disabled={submitState.isLoading}
                    onClick={() => submit(runId)}
                  >
                    {t('payroll.runDetail.submit')}
                  </Button>
                ) : null}
                {status === 'pending_approval' ? (
                  <Button
                    type="button"
                    disabled={approveState.isLoading}
                    onClick={() => approve(runId)}
                  >
                    {t('payroll.runDetail.approve')}
                  </Button>
                ) : null}
                {status === 'approved' ? (
                  <Button type="button" disabled={payState.isLoading} onClick={() => pay({ id: runId })}>
                    {t('payroll.runDetail.pay')}
                  </Button>
                ) : null}
              </div>

              {exceptions.length > 0 ? (
                <section aria-labelledby="payroll-exceptions-heading">
                  <h2 id="payroll-exceptions-heading" className="mb-2 text-base font-semibold">
                    {t('payroll.runDetail.exceptions')}
                  </h2>
                  <div className="border-line bg-surface overflow-hidden rounded-lg border">
                    <Table className="table-fixed">
                      <THead>
                        <TR>
                          <TH className="w-[30%]">{t('payroll.runDetail.employeeNumber')}</TH>
                          <TH className="w-[70%]">{t('payroll.runDetail.exceptionDetail')}</TH>
                        </TR>
                      </THead>
                      <TBody>
                        {exceptions.map((row) => (
                          <TR key={String(row.id)}>
                            <TD>{String(row.employeeNumber)}</TD>
                            <TD>
                              {Array.isArray(row.exceptions)
                                ? (row.exceptions as Array<{ message: string }>)
                                    .map((e) => e.message)
                                    .join('; ')
                                : '—'}
                            </TD>
                          </TR>
                        ))}
                      </TBody>
                    </Table>
                  </div>
                </section>
              ) : null}

              <section aria-labelledby="payroll-review-heading">
                <h2 id="payroll-review-heading" className="mb-2 text-base font-semibold">
                  {t('payroll.runDetail.review')}
                </h2>
                <div className="border-line bg-surface overflow-hidden rounded-lg border">
                  <Table className="table-fixed">
                    <THead>
                      <TR>
                        <TH className="w-[20%]">{t('payroll.runDetail.employeeNumber')}</TH>
                        <TH className="w-[16%]">{t('payroll.runs.columns.gross')}</TH>
                        <TH className="w-[16%]">{t('payroll.kpis.deductions')}</TH>
                        <TH className="w-[16%]">{t('payroll.runs.columns.net')}</TH>
                        <TH className="w-[16%]">{t('payroll.kpis.employerCost')}</TH>
                        <TH className="w-[16%]">{t('payroll.runs.columns.status')}</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {calculations.map((row) => (
                        <TR key={String(row.id)}>
                          <TD>{String(row.employeeNumber)}</TD>
                          <TD>{row.grossPay != null ? String(row.grossPay) : '—'}</TD>
                          <TD>{row.totalDeductions != null ? String(row.totalDeductions) : '—'}</TD>
                          <TD>{row.netPay != null ? String(row.netPay) : '—'}</TD>
                          <TD>{row.employerCost != null ? String(row.employerCost) : '—'}</TD>
                          <TD>
                            {row.hasExceptions
                              ? t('payroll.runDetail.hasExceptions')
                              : t('payroll.runDetail.ok')}
                          </TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                </div>
              </section>
            </div>
          )
        }}
      </QueryState>
    </>
  )
}
