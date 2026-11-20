import { useState } from 'react'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import {
  useCreatePayrollPeriodMutation,
  useGetPayrollPeriodsQuery,
} from '@/features/payroll/api/payrollApi'
import { useLegalEntityOptions } from '@/features/legal-entities/hooks/useLegalEntityOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function PayrollPeriodsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('payroll.periods.title'))
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    legalEntityId: '',
    name: '',
    periodNumber: '',
    startDate: '',
    endDate: '',
    payDate: '',
  })
  const query = useGetPayrollPeriodsQuery({ page: 1, pageSize: 50 })
  const [createPeriod, createState] = useCreatePayrollPeriodMutation()
  const legalEntities = useLegalEntityOptions()

  return (
    <>
      <PageHeader
        title={t('payroll.periods.title')}
        description={t('payroll.periods.description')}
        action={
          <Button type="button" onClick={() => setOpen(true)}>
            {t('payroll.periods.create')}
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
        emptyTitle={t('payroll.periods.emptyTitle')}
        emptyDescription={t('payroll.periods.emptyDescription')}
      >
        {(data) => (
          <div className="border-line bg-surface overflow-hidden rounded-lg border">
            <Table className="table-fixed">
              <THead>
                <TR>
                  <TH className="w-[22%]">{t('payroll.periods.columns.name')}</TH>
                  <TH className="w-[14%]">{t('payroll.periods.columns.number')}</TH>
                  <TH className="w-[14%]">{t('payroll.periods.columns.status')}</TH>
                  <TH className="w-[16%]">{t('payroll.periods.columns.start')}</TH>
                  <TH className="w-[16%]">{t('payroll.periods.columns.end')}</TH>
                  <TH className="w-[18%]">{t('payroll.periods.columns.payDate')}</TH>
                </TR>
              </THead>
              <TBody>
                {(data.items as Array<Record<string, string>>).map((row) => (
                  <TR key={row.id}>
                    <TD>{row.name}</TD>
                    <TD>{row.periodNumber}</TD>
                    <TD>
                      <span className="uppercase tracking-wide text-xs">{row.status}</span>
                    </TD>
                    <TD>{row.startDate?.slice(0, 10)}</TD>
                    <TD>{row.endDate?.slice(0, 10)}</TD>
                    <TD>{row.payDate?.slice(0, 10)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        )}
      </QueryState>

      <Modal open={open} onClose={() => setOpen(false)} title={t('payroll.periods.createTitle')}>
        <form
          className="space-y-3"
          onSubmit={async (event) => {
            event.preventDefault()
            await createPeriod({
              ...form,
              startDate: new Date(form.startDate).toISOString(),
              endDate: new Date(form.endDate).toISOString(),
              payDate: new Date(form.payDate).toISOString(),
            }).unwrap()
            setOpen(false)
          }}
        >
          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t('payroll.fields.legalEntity')}</span>
            <select
              className="w-full rounded border border-border bg-surface px-3 py-2"
              value={form.legalEntityId}
              onChange={(e) => setForm((f) => ({ ...f, legalEntityId: e.target.value }))}
              required
            >
              <option value="">{t('payroll.fields.select')}</option>
              {legalEntities.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t('payroll.fields.name')}</span>
            <input
              className="w-full rounded border border-border bg-surface px-3 py-2"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t('payroll.fields.periodNumber')}</span>
            <input
              className="w-full rounded border border-border bg-surface px-3 py-2"
              value={form.periodNumber}
              onChange={(e) => setForm((f) => ({ ...f, periodNumber: e.target.value }))}
              required
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            {(['startDate', 'endDate', 'payDate'] as const).map((key) => (
              <label key={key} className="block space-y-1 text-sm">
                <span className="font-medium">{t(`payroll.fields.${key}`)}</span>
                <input
                  type="date"
                  className="w-full rounded border border-border bg-surface px-3 py-2"
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  required
                />
              </label>
            ))}
          </div>
          {createState.error ? (
            <p className="text-sm text-danger" role="alert">
              {t('payroll.saveError')}
            </p>
          ) : null}
          <Button type="submit" disabled={createState.isLoading}>
            {t('payroll.periods.create')}
          </Button>
        </form>
      </Modal>
    </>
  )
}
