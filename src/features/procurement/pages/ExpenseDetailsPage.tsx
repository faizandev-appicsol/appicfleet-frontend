import { Link, useParams } from 'react-router'
import { PERMISSIONS, procurementDirectoryRoles } from '@/app/router/access'
import { useAppSelector } from '@/app/hooks'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { appConfig } from '@/config/app.config'
import { hasAnyRole } from '@/features/auth/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useExpenseActionMutation, useGetExpenseQuery } from '@/features/procurement/api/procurementApi'
import { useProcurementOptions } from '@/features/procurement/hooks/useProcurementOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function ExpenseDetailsPage() {
  const { t } = useTranslation()
  const { expenseId = '' } = useParams()
  const options = useProcurementOptions()
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const query = useGetExpenseQuery(expenseId, { skip: !expenseId })
  const [action, actionState] = useExpenseActionMutation()
  useDocumentTitle(query.data?.documentNumber ?? t('procurement.expenses.title'))
  const roleOk = hasAnyRole(roles, procurementDirectoryRoles)

  return (
    <QueryState data={query.data} isLoading={query.isLoading} error={query.error} onRetry={query.refetch} isEmpty={(d) => !d.id} emptyTitle={t('procurement.expenses.notFound')}>
      {(expense) => (
        <div className="space-y-6">
          <PageHeader
            title={expense.documentNumber ?? t('procurement.draftLabel')}
            description={expense.description}
            action={
              <div className="flex flex-wrap gap-2">
                {expense.status === 'draft' && (can(PERMISSIONS.expenseSubmit) || roleOk) ? (
                  <Button disabled={actionState.isLoading} onClick={() => void action({ id: expense.id, action: 'submit' })}>{t('procurement.actions.submit')}</Button>
                ) : null}
                {expense.status === 'submitted' && (can(PERMISSIONS.expenseApprove) || roleOk) ? (
                  <Button disabled={actionState.isLoading} onClick={() => void action({ id: expense.id, action: 'approve' })}>{t('procurement.actions.approve')}</Button>
                ) : null}
                {expense.status === 'approved' && (can(PERMISSIONS.expensePost) || roleOk) ? (
                  <Button disabled={actionState.isLoading} onClick={() => void action({ id: expense.id, action: 'post' })}>{t('procurement.actions.post')}</Button>
                ) : null}
                <Link to={appConfig.routes.expenses} className="text-brand self-center text-sm font-medium">{t('common.back')}</Link>
              </div>
            }
          />
          <div className="grid gap-4 md:grid-cols-3">
            <div><p className="text-muted text-sm">{t('common.status')}</p><StatusBadge value={expense.status} options={options.expenseStatusOptions} /></div>
            <div><p className="text-muted text-sm">{t('procurement.fields.category')}</p><p>{expense.categoryCode}</p></div>
            <div><p className="text-muted text-sm">{t('procurement.columns.total')}</p><p dir="ltr">{expense.currency} {expense.totalAmount}</p></div>
          </div>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">{t('procurement.sections.timeline')}</h2>
            <ul className="space-y-2">
              {(expense.history ?? []).map((event) => (
                <li key={event.id} className="border-border border-b py-2 text-sm">
                  <StatusBadge value={event.toStatus} options={options.expenseStatusOptions} />
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
