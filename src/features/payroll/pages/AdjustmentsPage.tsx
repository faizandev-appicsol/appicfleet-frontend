import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import {
  useApprovePayrollAdjustmentMutation,
  useGetPayrollAdjustmentsQuery,
} from '@/features/payroll/api/payrollApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function AdjustmentsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('payroll.adjustments.title'))
  const query = useGetPayrollAdjustmentsQuery({ page: 1, pageSize: 50 })
  const [approve, approveState] = useApprovePayrollAdjustmentMutation()

  return (
    <>
      <PageHeader
        title={t('payroll.adjustments.title')}
        description={t('payroll.adjustments.description')}
      />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => !Array.isArray(data.items) || data.items.length === 0}
        emptyTitle={t('payroll.adjustments.emptyTitle')}
        emptyDescription={t('payroll.adjustments.emptyDescription')}
      >
        {(data) => (
          <div className="border-line bg-surface overflow-hidden rounded-lg border">
            <Table className="table-fixed">
              <THead>
                <TR>
                  <TH className="w-[22%]">{t('payroll.adjustments.columns.employee')}</TH>
                  <TH className="w-[14%]">{t('payroll.adjustments.columns.direction')}</TH>
                  <TH className="w-[14%]">{t('payroll.adjustments.columns.amount')}</TH>
                  <TH className="w-[14%]">{t('payroll.adjustments.columns.status')}</TH>
                  <TH className="w-[22%]">{t('payroll.adjustments.columns.reason')}</TH>
                  <TH className="w-[14%]">{t('payroll.adjustments.columns.actions')}</TH>
                </TR>
              </THead>
              <TBody>
                {(data.items as Array<Record<string, string>>).map((row) => (
                  <TR key={row.id}>
                    <TD className="font-mono text-xs">{row.employeeId}</TD>
                    <TD>{row.direction}</TD>
                    <TD>
                      {row.amount} {row.currency}
                    </TD>
                    <TD>{row.status}</TD>
                    <TD>{row.reason}</TD>
                    <TD>
                      {row.status === 'draft' || row.status === 'pending_approval' ? (
                        <Button
                          type="button"
                          size="sm"
                          disabled={approveState.isLoading}
                          onClick={() => approve(row.id)}
                        >
                          {t('payroll.adjustments.approve')}
                        </Button>
                      ) : (
                        '—'
                      )}
                    </TD>
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
