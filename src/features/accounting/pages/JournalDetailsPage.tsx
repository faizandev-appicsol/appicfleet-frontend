import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { PERMISSIONS, accountingDirectoryRoles } from '@/app/router/access'
import { useAppSelector } from '@/app/hooks'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { appConfig } from '@/config/app.config'
import { hasAnyRole } from '@/features/auth/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useGetJournalQuery, useJournalActionMutation } from '@/features/accounting/api/accountingApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'posted', label: 'Posted' },
  { value: 'reversed', label: 'Reversed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function JournalDetailsPage() {
  const { t } = useTranslation()
  const { journalId = '' } = useParams()
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const query = useGetJournalQuery(journalId, { skip: !journalId })
  const [action, actionState] = useJournalActionMutation()
  const [reason, setReason] = useState('')
  useDocumentTitle(query.data?.journalNumber ?? t('accounting.journals.title'))
  const roleOk = hasAnyRole(roles, accountingDirectoryRoles)

  type Line = NonNullable<NonNullable<typeof query.data>['lines']>[number]
  const columns: DataTableColumn<Line>[] = [
    { id: 'account', header: t('accounting.fields.account'), cell: (row) => <span dir="ltr">{row.accountCode} {row.accountName}</span> },
    { id: 'debit', header: t('accounting.fields.debit'), cell: (row) => <span dir="ltr">{row.debit}</span> },
    { id: 'credit', header: t('accounting.fields.credit'), cell: (row) => <span dir="ltr">{row.credit}</span> },
    { id: 'description', header: t('accounting.fields.description'), cell: (row) => row.description ?? '—' },
  ]

  return (
    <QueryState data={query.data} isLoading={query.isLoading} error={query.error} onRetry={query.refetch} isEmpty={(d) => !d.id} emptyTitle={t('accounting.journals.notFound')}>
      {(journal) => (
        <div className="space-y-6">
          <PageHeader
            title={journal.journalNumber ?? t('accounting.draftLabel')}
            description={journal.description}
            action={
              <div className="flex flex-wrap gap-2">
                {journal.status === 'draft' && (can(PERMISSIONS.accountingPost) || roleOk) ? (
                  <Button disabled={actionState.isLoading} onClick={() => void action({ id: journal.id, action: 'post' })}>{t('accounting.actions.post')}</Button>
                ) : null}
                {journal.status === 'posted' && (can(PERMISSIONS.accountingReverse) || roleOk) ? (
                  <Button disabled={actionState.isLoading || !reason} onClick={() => void action({ id: journal.id, action: 'reverse', body: { reason } })}>{t('accounting.actions.reverse')}</Button>
                ) : null}
                {journal.status === 'draft' && (can(PERMISSIONS.accountingEdit) || roleOk) ? (
                  <Button variant="ghost" disabled={actionState.isLoading || !reason} onClick={() => void action({ id: journal.id, action: 'cancel', body: { reason } })}>{t('accounting.actions.cancel')}</Button>
                ) : null}
                <Link to={appConfig.routes.accountingJournals} className="text-brand self-center text-sm font-medium">{t('common.back')}</Link>
              </div>
            }
          />
          {journal.status === 'posted' ? <p className="text-muted text-sm">{t('accounting.journals.immutable')}</p> : null}
          <div className="grid gap-4 md:grid-cols-3">
            <div><p className="text-muted text-sm">{t('common.status')}</p><StatusBadge value={journal.status} options={statusOptions} /></div>
            <div><p className="text-muted text-sm">{t('accounting.fields.totalDebit')}</p><p dir="ltr">{journal.totalDebit}</p></div>
            <div><p className="text-muted text-sm">{t('accounting.fields.totalCredit')}</p><p dir="ltr">{journal.totalCredit}</p></div>
            <div><p className="text-muted text-sm">{t('accounting.fields.accountingDate')}</p><p dir="ltr">{journal.accountingDate}</p></div>
            <div><p className="text-muted text-sm">{t('accounting.fields.sourceModule')}</p><p>{journal.sourceModule}</p></div>
            <div><p className="text-muted text-sm">{t('accounting.fields.sourceId')}</p><p dir="ltr">{journal.sourceId ?? '—'}</p></div>
          </div>
          {(journal.status === 'posted' || journal.status === 'draft') ? (
            <Input label={t('accounting.fields.reason')} value={reason} onChange={(e) => setReason(e.target.value)} />
          ) : null}
          <div className="border-line bg-surface min-w-0 overflow-x-auto rounded-lg border">
            <DataTable columns={columns} rows={journal.lines ?? []} rowKey={(row, index) => row.id ?? String(index)} />
          </div>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">{t('accounting.sections.timeline')}</h2>
            <ul className="space-y-2">
              {(journal.history ?? []).map((event) => (
                <li key={event.id} className="border-border border-b py-2 text-sm">
                  <StatusBadge value={event.toStatus} options={statusOptions} />
                  <span className="text-muted ms-2" dir="ltr">{event.createdAt}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </QueryState>
  )
}
