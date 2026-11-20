import { useState } from 'react'
import { Link } from 'react-router'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { appConfig } from '@/config/app.config'
import {
  useCreatePayrollRunMutation,
  useGetPayrollPeriodsQuery,
  useGetPayrollRunsQuery,
} from '@/features/payroll/api/payrollApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function PayrollRunsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('payroll.runs.title'))
  const [open, setOpen] = useState(false)
  const [payrollPeriodId, setPayrollPeriodId] = useState('')
  const query = useGetPayrollRunsQuery({ page: 1, pageSize: 50 })
  const periods = useGetPayrollPeriodsQuery({ page: 1, pageSize: 100 })
  const [createRun, createState] = useCreatePayrollRunMutation()

  return (
    <>
      <PageHeader
        title={t('payroll.runs.title')}
        description={t('payroll.runs.description')}
        action={
          <Button type="button" onClick={() => setOpen(true)}>
            {t('payroll.runs.create')}
          </Button>
        }
      />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => !Array.isArray(data.items) || data.items.length === 0}
        emptyTitle={t('payroll.runs.emptyTitle')}
        emptyDescription={t('payroll.runs.emptyDescription')}
      >
        {(data) => (
          <div className="border-line bg-surface overflow-hidden rounded-lg border">
            <Table className="table-fixed">
              <THead>
                <TR>
                  <TH className="w-[18%]">{t('payroll.runs.columns.number')}</TH>
                  <TH className="w-[14%]">{t('payroll.runs.columns.status')}</TH>
                  <TH className="w-[12%]">{t('payroll.runs.columns.employees')}</TH>
                  <TH className="w-[14%]">{t('payroll.runs.columns.gross')}</TH>
                  <TH className="w-[14%]">{t('payroll.runs.columns.net')}</TH>
                  <TH className="w-[14%]">{t('payroll.runs.columns.exceptions')}</TH>
                  <TH className="w-[14%]">{t('payroll.runs.columns.actions')}</TH>
                </TR>
              </THead>
              <TBody>
                {(data.items as Array<Record<string, string | number>>).map((row) => (
                  <TR key={String(row.id)}>
                    <TD>{String(row.runNumber)}</TD>
                    <TD>
                      <span className="uppercase tracking-wide text-xs">{String(row.status)}</span>
                    </TD>
                    <TD>{String(row.employeeCount ?? 0)}</TD>
                    <TD>{row.grossTotal != null ? String(row.grossTotal) : '—'}</TD>
                    <TD>{row.netTotal != null ? String(row.netTotal) : '—'}</TD>
                    <TD>{String(row.exceptionCount ?? 0)}</TD>
                    <TD>
                      <Link
                        className="text-accent hover:underline"
                        to={`${appConfig.routes.payrollRuns}/${row.id}`}
                      >
                        {t('payroll.runs.view')}
                      </Link>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        )}
      </QueryState>

      <Modal open={open} onClose={() => setOpen(false)} title={t('payroll.runs.createTitle')}>
        <form
          className="space-y-3"
          onSubmit={async (event) => {
            event.preventDefault()
            await createRun({ payrollPeriodId }).unwrap()
            setOpen(false)
          }}
        >
          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t('payroll.fields.period')}</span>
            <select
              className="w-full rounded border border-border bg-surface px-3 py-2"
              value={payrollPeriodId}
              onChange={(e) => setPayrollPeriodId(e.target.value)}
              required
            >
              <option value="">{t('payroll.fields.select')}</option>
              {(((periods.data?.items as Array<Record<string, string>>) ?? [])).map((period) => (
                <option key={period.id} value={period.id}>
                  {period.name} ({period.periodNumber})
                </option>
              ))}
            </select>
          </label>
          {createState.error ? (
            <p className="text-sm text-danger" role="alert">
              {t('payroll.saveError')}
            </p>
          ) : null}
          <Button type="submit" disabled={createState.isLoading}>
            {t('payroll.runs.create')}
          </Button>
        </form>
      </Modal>
    </>
  )
}
