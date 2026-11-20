import { useState } from 'react'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import {
  useCreateSalaryComponentMutation,
  useGetCompensationAssignmentsQuery,
  useGetSalaryComponentsQuery,
} from '@/features/payroll/api/payrollApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function CompensationPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('payroll.compensation.title'))
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    code: '',
    name: '',
    componentType: 'earning',
    category: 'basic',
    calculationMethod: 'fixed',
    fixedAmount: '',
    effectiveFrom: '',
  })
  const components = useGetSalaryComponentsQuery({ page: 1, pageSize: 50 })
  const assignments = useGetCompensationAssignmentsQuery({ page: 1, pageSize: 50 })
  const [createComponent, createState] = useCreateSalaryComponentMutation()

  return (
    <>
      <PageHeader
        title={t('payroll.compensation.title')}
        description={t('payroll.compensation.description')}
        action={
          <Button type="button" onClick={() => setOpen(true)}>
            {t('payroll.compensation.createComponent')}
          </Button>
        }
      />

      <section className="mb-8" aria-labelledby="components-heading">
        <h2 id="components-heading" className="mb-3 text-base font-semibold">
          {t('payroll.compensation.components')}
        </h2>
        <QueryState
          data={components.data}
          isLoading={components.isLoading}
          isFetching={components.isFetching && !components.isLoading}
          error={components.error}
          onRetry={components.refetch}
          isEmpty={(data) => !Array.isArray(data.items) || data.items.length === 0}
          emptyTitle={t('payroll.compensation.emptyComponents')}
          emptyDescription={t('payroll.compensation.emptyComponentsDescription')}
        >
          {(data) => (
            <div className="border-line bg-surface overflow-hidden rounded-lg border">
              <Table className="table-fixed">
                <THead>
                  <TR>
                    <TH className="w-[18%]">{t('payroll.compensation.columns.code')}</TH>
                    <TH className="w-[28%]">{t('payroll.compensation.columns.name')}</TH>
                    <TH className="w-[18%]">{t('payroll.compensation.columns.type')}</TH>
                    <TH className="w-[18%]">{t('payroll.compensation.columns.category')}</TH>
                    <TH className="w-[18%]">{t('payroll.compensation.columns.amount')}</TH>
                  </TR>
                </THead>
                <TBody>
                  {(data.items as Array<Record<string, string>>).map((row) => (
                    <TR key={row.id}>
                      <TD>{row.code}</TD>
                      <TD>{row.name}</TD>
                      <TD>{row.componentType}</TD>
                      <TD>{row.category}</TD>
                      <TD>{row.fixedAmount ?? row.percentage ?? '—'}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          )}
        </QueryState>
      </section>

      <section aria-labelledby="assignments-heading">
        <h2 id="assignments-heading" className="mb-3 text-base font-semibold">
          {t('payroll.compensation.assignments')}
        </h2>
        <QueryState
          data={assignments.data}
          isLoading={assignments.isLoading}
          isFetching={assignments.isFetching && !assignments.isLoading}
          error={assignments.error}
          onRetry={assignments.refetch}
          isEmpty={(data) => !Array.isArray(data.items) || data.items.length === 0}
          emptyTitle={t('payroll.compensation.emptyAssignments')}
          emptyDescription={t('payroll.compensation.emptyAssignmentsDescription')}
        >
          {(data) => (
            <div className="border-line bg-surface overflow-hidden rounded-lg border">
              <Table className="table-fixed">
                <THead>
                  <TR>
                    <TH className="w-[28%]">{t('payroll.compensation.columns.employee')}</TH>
                    <TH className="w-[18%]">{t('payroll.compensation.columns.currency')}</TH>
                    <TH className="w-[18%]">{t('payroll.compensation.columns.basic')}</TH>
                    <TH className="w-[18%]">{t('payroll.compensation.columns.status')}</TH>
                    <TH className="w-[18%]">{t('payroll.compensation.columns.effectiveFrom')}</TH>
                  </TR>
                </THead>
                <TBody>
                  {(data.items as Array<Record<string, string>>).map((row) => (
                    <TR key={row.id}>
                      <TD className="font-mono text-xs">{row.employeeId}</TD>
                      <TD>{row.currency}</TD>
                      <TD>{row.basicSalary ?? '—'}</TD>
                      <TD>{row.status}</TD>
                      <TD>{row.effectiveFrom?.slice(0, 10)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          )}
        </QueryState>
      </section>

      <Modal open={open} onClose={() => setOpen(false)} title={t('payroll.compensation.createComponentTitle')}>
        <form
          className="space-y-3"
          onSubmit={async (event) => {
            event.preventDefault()
            await createComponent({
              ...form,
              fixedAmount: form.fixedAmount || undefined,
              effectiveFrom: new Date(form.effectiveFrom).toISOString(),
            }).unwrap()
            setOpen(false)
          }}
        >
          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t('payroll.compensation.columns.code')}</span>
            <input
              className="w-full rounded border border-border bg-surface px-3 py-2"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              required
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t('payroll.compensation.columns.name')}</span>
            <input
              className="w-full rounded border border-border bg-surface px-3 py-2"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t('payroll.compensation.columns.amount')}</span>
            <input
              className="w-full rounded border border-border bg-surface px-3 py-2"
              value={form.fixedAmount}
              onChange={(e) => setForm((f) => ({ ...f, fixedAmount: e.target.value }))}
              placeholder="0.00"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t('payroll.compensation.columns.effectiveFrom')}</span>
            <input
              type="date"
              className="w-full rounded border border-border bg-surface px-3 py-2"
              value={form.effectiveFrom}
              onChange={(e) => setForm((f) => ({ ...f, effectiveFrom: e.target.value }))}
              required
            />
          </label>
          {createState.error ? (
            <p className="text-sm text-danger" role="alert">
              {t('payroll.saveError')}
            </p>
          ) : null}
          <Button type="submit" disabled={createState.isLoading}>
            {t('payroll.compensation.createComponent')}
          </Button>
        </form>
      </Modal>
    </>
  )
}
