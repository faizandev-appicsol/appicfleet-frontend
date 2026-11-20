import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import {
  useGetPayslipsQuery,
  useLazyDownloadPayslipQuery,
} from '@/features/payroll/api/payrollApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function PayslipsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('payroll.payslips.title'))
  const query = useGetPayslipsQuery({ page: 1, pageSize: 50 })
  const [download] = useLazyDownloadPayslipQuery()

  return (
    <>
      <PageHeader title={t('payroll.payslips.title')} description={t('payroll.payslips.description')} />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => !Array.isArray(data.items) || data.items.length === 0}
        emptyTitle={t('payroll.payslips.emptyTitle')}
        emptyDescription={t('payroll.payslips.emptyDescription')}
      >
        {(data) => (
          <div className="border-line bg-surface overflow-hidden rounded-lg border">
            <Table className="table-fixed">
              <THead>
                <TR>
                  <TH className="w-[20%]">{t('payroll.payslips.columns.number')}</TH>
                  <TH className="w-[16%]">{t('payroll.payslips.columns.employee')}</TH>
                  <TH className="w-[14%]">{t('payroll.payslips.columns.payDate')}</TH>
                  <TH className="w-[14%]">{t('payroll.payslips.columns.gross')}</TH>
                  <TH className="w-[14%]">{t('payroll.payslips.columns.net')}</TH>
                  <TH className="w-[10%]">{t('payroll.payslips.columns.status')}</TH>
                  <TH className="w-[12%]">{t('payroll.payslips.columns.actions')}</TH>
                </TR>
              </THead>
              <TBody>
                {(data.items as Array<Record<string, string>>).map((row) => (
                  <TR key={row.id}>
                    <TD>{row.payslipNumber}</TD>
                    <TD>{row.employeeNumber}</TD>
                    <TD>{row.payDate?.slice(0, 10)}</TD>
                    <TD>{row.grossSalary ?? '—'}</TD>
                    <TD>{row.netSalary ?? '—'}</TD>
                    <TD>{row.status}</TD>
                    <TD>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={async () => {
                          const result = await download(row.id).unwrap()
                          const blob = new Blob([JSON.stringify(result, null, 2)], {
                            type: 'application/json',
                          })
                          const url = URL.createObjectURL(blob)
                          const anchor = document.createElement('a')
                          anchor.href = url
                          anchor.download = `${row.payslipNumber}.json`
                          anchor.click()
                          URL.revokeObjectURL(url)
                        }}
                      >
                        {t('payroll.payslips.download')}
                      </Button>
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
