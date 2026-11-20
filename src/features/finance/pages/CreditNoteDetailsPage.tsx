import { Link, useParams } from 'react-router'
import { PERMISSIONS, financeDirectoryRoles } from '@/app/router/access'
import { useAppSelector } from '@/app/hooks'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { appConfig } from '@/config/app.config'
import { hasAnyRole } from '@/features/auth/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useCreditNoteActionMutation, useGetCreditNoteQuery } from '@/features/finance/api/financeApi'
import { useFinanceOptions } from '@/features/finance/hooks/useFinanceOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function CreditNoteDetailsPage() {
  const { t } = useTranslation()
  const { creditNoteId = '' } = useParams()
  const options = useFinanceOptions()
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const query = useGetCreditNoteQuery(creditNoteId, { skip: !creditNoteId })
  const [action, actionState] = useCreditNoteActionMutation()
  useDocumentTitle(query.data?.documentNumber ?? t('finance.creditNotes.title'))
  const canPost = can(PERMISSIONS.creditNotePost) || hasAnyRole(roles, financeDirectoryRoles)

  return (
    <QueryState
      data={query.data}
      isLoading={query.isLoading}
      error={query.error}
      onRetry={query.refetch}
      isEmpty={(data) => !data.id}
      emptyTitle={t('finance.creditNotes.notFound')}
    >
      {(note) => (
        <div className="space-y-6">
          <PageHeader
            title={note.documentNumber ?? t('finance.draftLabel')}
            description={note.reason}
            action={
              <div className="flex flex-wrap gap-2">
                {note.status === 'draft' && canPost ? (
                  <Button disabled={actionState.isLoading} onClick={() => void action({ id: note.id, action: 'post' })}>
                    {t('finance.actions.post')}
                  </Button>
                ) : null}
                <Link to={appConfig.routes.creditNotes} className="text-brand text-sm font-medium self-center">
                  {t('common.back')}
                </Link>
              </div>
            }
          />
          <StatusBadge value={note.status} options={options.docStatusOptions} />
          <p dir="ltr">
            {note.currency} {note.totalAmount}
          </p>
          {note.invoiceId ? (
            <Link to={`${appConfig.routes.invoices}/${note.invoiceId}`} className="text-brand">
              {t('finance.fields.invoice')}
            </Link>
          ) : null}
        </div>
      )}
    </QueryState>
  )
}
