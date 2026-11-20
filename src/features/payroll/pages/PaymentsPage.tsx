import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { useGetPayrollPaymentsQuery } from '@/features/payroll/api/payrollApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function PaymentsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('payroll.payments.title'))
  const query = useGetPayrollPaymentsQuery({ page: 1, pageSize: 50 })

  return (
    <>
      <PageHeader title={t('payroll.payments.title')} description={t('payroll.payments.description')} />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => !Array.isArray(data.items) || data.items.length === 0}
        emptyTitle={t('payroll.payments.emptyTitle')}
        emptyDescription={t('payroll.payments.emptyDescription')}
      >
        {(data) => (
          <div className="border-line bg-surface overflow-hidden rounded-lg border">
            <Table className="table-fixed">
              <THead>
                <TR>
                  <TH className="w-[24%]">{t('payroll.payments.columns.employee')}</TH>
                  <TH className="w-[16%]">{t('payroll.payments.columns.amount')}</TH>
                  <TH className="w-[16%]">{t('payroll.payments.columns.method')}</TH>
                  <TH className="w-[16%]">{t('payroll.payments.columns.status')}</TH>
                  <TH className="w-[28%]">{t('payroll.payments.columns.date')}</TH>
                </TR>
              </THead>
              <TBody>
                {(data.items as Array<Record<string, string>>).map((row) => (
                  <TR key={row.id}>
                    <TD className="font-mono text-xs">{row.employeeId}</TD>
                    <TD>
                      {row.amount} {row.currency}
                    </TD>
                    <TD>{row.paymentMethod}</TD>
                    <TD>{row.status}</TD>
                    <TD>{row.paymentDate?.slice(0, 10) ?? '—'}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        )}
      </QueryState>
    </>
  )
}
