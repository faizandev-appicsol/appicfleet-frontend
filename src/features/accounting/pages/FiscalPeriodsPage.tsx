import { useState } from 'react'
import { PERMISSIONS, accountingDirectoryRoles } from '@/app/router/access'
import { useAppSelector } from '@/app/hooks'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { Input, Select } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { hasAnyRole } from '@/features/auth/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import {
  useCreateFiscalPeriodMutation,
  useCreateFiscalYearMutation,
  useGetFiscalPeriodsQuery,
  useGetFiscalYearsQuery,
  usePeriodActionMutation,
} from '@/features/accounting/api/accountingApi'
import type { FiscalPeriod } from '@/features/accounting/schemas/accounting.schema'
import { useLegalEntityOptions } from '@/features/legal-entities/hooks/useLegalEntityOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function FiscalPeriodsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('accounting.periods.title'))
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const legalEntities = useLegalEntityOptions()
  const [legalEntityId, setLegalEntityId] = useState('')
  const [yearName, setYearName] = useState('FY 2026')
  const [startDate, setStartDate] = useState('2026-01-01')
  const [endDate, setEndDate] = useState('2026-12-31')
  const [reason, setReason] = useState('')
  const yearsQuery = useGetFiscalYearsQuery({ legalEntityId }, { skip: !legalEntityId })
  const periodsQuery = useGetFiscalPeriodsQuery({ legalEntityId }, { skip: !legalEntityId })
  const [createYear] = useCreateFiscalYearMutation()
  const [createPeriod] = useCreateFiscalPeriodMutation()
  const [periodAction] = usePeriodActionMutation()
  const roleOk = hasAnyRole(roles, accountingDirectoryRoles)

  const columns: DataTableColumn<FiscalPeriod>[] = [
    { id: 'name', header: t('accounting.fields.name'), cell: (row) => row.name },
    { id: 'number', header: t('accounting.fields.periodNumber'), cell: (row) => String(row.periodNumber) },
    { id: 'start', header: t('accounting.fields.startDate'), cell: (row) => <span dir="ltr">{row.startDate}</span> },
    { id: 'end', header: t('accounting.fields.endDate'), cell: (row) => <span dir="ltr">{row.endDate}</span> },
    {
      id: 'status',
      header: t('common.status'),
      cell: (row) => <StatusBadge value={row.status} options={[{ value: 'open', label: t('accounting.periodStatus.open') }, { value: 'closed', label: t('accounting.periodStatus.closed') }, { value: 'locked', label: t('accounting.periodStatus.locked') }]} />,
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: (row) => (
        <div className="flex flex-wrap gap-2">
          {row.status === 'open' && (can(PERMISSIONS.accountingClosePeriod) || roleOk) ? (
            <Button disabled={!reason} onClick={() => void periodAction({ id: row.id, action: 'close', reason })}>{t('accounting.actions.close')}</Button>
          ) : null}
          {row.status === 'closed' && (can(PERMISSIONS.accountingReopenPeriod) || roleOk) ? (
            <Button disabled={!reason} variant="ghost" onClick={() => void periodAction({ id: row.id, action: 'reopen', reason })}>{t('accounting.actions.reopen')}</Button>
          ) : null}
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader title={t('accounting.periods.title')} description={t('accounting.periods.description')} />
      <div className="grid gap-3 md:grid-cols-2">
        <Select label={t('accounting.fields.legalEntity')} value={legalEntityId} onChange={(e) => setLegalEntityId(e.target.value)} options={[{ value: '', label: t('common.none') }, ...legalEntities.options]} />
        <Input label={t('accounting.fields.reason')} value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>
      {(can(PERMISSIONS.accountingCreate) || roleOk) && legalEntityId ? (
        <div className="grid gap-3 md:grid-cols-4">
          <Input label={t('accounting.fields.yearName')} value={yearName} onChange={(e) => setYearName(e.target.value)} />
          <Input label={t('accounting.fields.startDate')} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} dir="ltr" />
          <Input label={t('accounting.fields.endDate')} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} dir="ltr" />
          <Button
            onClick={async () => {
              const year = await createYear({
                legalEntityId,
                name: yearName,
                startDate: new Date(`${startDate}T00:00:00.000Z`).toISOString(),
                endDate: new Date(`${endDate}T23:59:59.000Z`).toISOString(),
              }).unwrap()
              await createPeriod({
                legalEntityId,
                fiscalYearId: year.id,
                name: `${yearName} P1`,
                periodNumber: 1,
                startDate: new Date(`${startDate}T00:00:00.000Z`).toISOString(),
                endDate: new Date(`${endDate}T23:59:59.000Z`).toISOString(),
              }).unwrap()
            }}
          >
            {t('accounting.periods.createYearPeriod')}
          </Button>
        </div>
      ) : null}
      <QueryState data={periodsQuery.data} isLoading={periodsQuery.isLoading} error={periodsQuery.error} onRetry={periodsQuery.refetch} isEmpty={(d) => d.length === 0} emptyTitle={t('accounting.periods.empty')}>
        {(data) => (
          <div className="border-line bg-surface min-w-0 overflow-x-auto rounded-lg border">
            <DataTable columns={columns} rows={data} rowKey={(row) => row.id} />
          </div>
        )}
      </QueryState>
      {yearsQuery.data?.length ? (
        <p className="text-muted text-sm">{t('accounting.periods.yearsCount', { count: String(yearsQuery.data.length) })}</p>
      ) : null}
    </>
  )
}
