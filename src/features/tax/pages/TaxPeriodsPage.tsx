import { useState } from 'react'
import { PERMISSIONS, taxDirectoryRoles } from '@/app/router/access'
import { useAppSelector } from '@/app/hooks'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { Input, Select } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { hasAnyRole } from '@/features/auth/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useCreateTaxPeriodMutation, useGetTaxPeriodsQuery, useTaxPeriodActionMutation } from '@/features/tax/api/taxApi'
import type { TaxPeriod } from '@/features/tax/schemas/tax.schema'
import { useLegalEntityOptions } from '@/features/legal-entities/hooks/useLegalEntityOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function TaxPeriodsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('tax.periods.title'))
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const legalEntities = useLegalEntityOptions()
  const [legalEntityId, setLegalEntityId] = useState('')
  const [reason, setReason] = useState('')
  const [name, setName] = useState('Q1 2026')
  const [startDate, setStartDate] = useState('2026-01-01')
  const [endDate, setEndDate] = useState('2026-03-31')
  const query = useGetTaxPeriodsQuery({ legalEntityId }, { skip: !legalEntityId })
  const [createPeriod] = useCreateTaxPeriodMutation()
  const [periodAction] = useTaxPeriodActionMutation()
  const roleOk = hasAnyRole(roles, taxDirectoryRoles)

  const columns: DataTableColumn<TaxPeriod>[] = [
    { id: 'name', header: t('tax.fields.name'), cell: (row) => row.name },
    { id: 'year', header: t('tax.fields.taxYear'), cell: (row) => String(row.taxYear) },
    { id: 'start', header: t('tax.fields.startDate'), cell: (row) => <span dir="ltr">{row.startDate}</span> },
    { id: 'end', header: t('tax.fields.endDate'), cell: (row) => <span dir="ltr">{row.endDate}</span> },
    {
      id: 'status',
      header: t('common.status'),
      cell: (row) => (
        <StatusBadge
          value={row.status}
          options={[
            { value: 'open', label: t('tax.periodStatus.open') },
            { value: 'locked', label: t('tax.periodStatus.locked') },
            { value: 'filed', label: t('tax.periodStatus.filed') },
          ]}
        />
      ),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: (row) => (
        <div className="flex flex-wrap gap-2">
          {row.status === 'open' && (can(PERMISSIONS.taxManagePeriods) || roleOk) ? (
            <Button disabled={!reason} onClick={() => void periodAction({ id: row.id, action: 'lock', reason })}>{t('tax.actions.lock')}</Button>
          ) : null}
          {row.status === 'locked' && (can(PERMISSIONS.taxManagePeriods) || roleOk) ? (
            <Button variant="ghost" disabled={!reason} onClick={() => void periodAction({ id: row.id, action: 'reopen', reason })}>{t('tax.actions.reopen')}</Button>
          ) : null}
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader title={t('tax.periods.title')} description={t('tax.periods.description')} />
      <div className="grid gap-3 md:grid-cols-2">
        <Select label={t('tax.fields.legalEntity')} value={legalEntityId} onChange={(e) => setLegalEntityId(e.target.value)} options={[{ value: '', label: t('common.none') }, ...legalEntities.options]} />
        <Input label={t('tax.fields.reason')} value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>
      {(can(PERMISSIONS.taxManagePeriods) || roleOk) && legalEntityId ? (
        <div className="grid gap-3 md:grid-cols-4">
          <Input label={t('tax.fields.name')} value={name} onChange={(e) => setName(e.target.value)} />
          <Input label={t('tax.fields.startDate')} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} dir="ltr" />
          <Input label={t('tax.fields.endDate')} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} dir="ltr" />
          <Button
            onClick={() =>
              void createPeriod({
                legalEntityId,
                taxYear: Number(startDate.slice(0, 4)),
                name,
                periodNumber: 1,
                startDate: new Date(`${startDate}T00:00:00.000Z`).toISOString(),
                endDate: new Date(`${endDate}T23:59:59.000Z`).toISOString(),
              }).unwrap()
            }
          >
            {t('tax.periods.create')}
          </Button>
        </div>
      ) : null}
      <QueryState data={query.data} isLoading={query.isLoading} error={query.error} onRetry={query.refetch} isEmpty={(d) => d.length === 0} emptyTitle={t('tax.periods.empty')}>
        {(data) => (
          <div className="border-line bg-surface min-w-0 overflow-x-auto rounded-lg border">
            <DataTable columns={columns} rows={data} rowKey={(row) => row.id} />
          </div>
        )}
      </QueryState>
    </>
  )
}
