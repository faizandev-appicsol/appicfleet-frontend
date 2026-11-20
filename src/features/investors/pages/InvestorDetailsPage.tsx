import { useState } from 'react'
import { useParams } from 'react-router'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PERMISSIONS } from '@/app/router/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { InvestorAccessDialog } from '@/features/investors/components/InvestorAccessDialog'
import {
  useActivateInvestorMutation,
  useGetInvestorActivityQuery,
  useGetInvestorQuery,
  useInviteInvestorMutation,
  useRevokeInvestorMutation,
  useSuspendInvestorMutation,
} from '@/features/investors/api/investorsApi'
import { investorStatusOptions } from '@/features/investors/statusOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'

export function InvestorDetailsPage() {
  const { t } = useTranslation()
  const { investorId = '' } = useParams()
  const { can } = usePermissions()
  const query = useGetInvestorQuery(investorId, { skip: !investorId })
  const activity = useGetInvestorActivityQuery(investorId, { skip: !investorId })
  const [accessOpen, setAccessOpen] = useState(false)
  const [inviteToken, setInviteToken] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | undefined>()
  const [invite] = useInviteInvestorMutation()
  const [suspend] = useSuspendInvestorMutation()
  const [revoke] = useRevokeInvestorMutation()
  const [activate] = useActivateInvestorMutation()

  useDocumentTitle(query.data?.displayName ?? t('investors.title'))

  async function run(action: () => Promise<unknown>) {
    setActionError(undefined)
    try {
      await action()
    } catch (error) {
      setActionError(normalizeApiError(error).message)
    }
  }

  return (
    <>
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={() => false}
        emptyTitle={t('investors.emptyTitle')}
        emptyDescription={t('investors.emptyDescription')}
      >
        {(investor) => (
          <div className="grid gap-6">
            <PageHeader
              title={investor.displayName}
              description={investor.contactEmail}
              action={
                <div className="flex flex-wrap gap-2">
                  {can(PERMISSIONS.investorsManageAccess) ? (
                    <Button type="button" variant="secondary" onClick={() => setAccessOpen(true)}>
                      {t('investors.manageAccess')}
                    </Button>
                  ) : null}
                  {can(PERMISSIONS.investorsInvite) ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        void run(async () => {
                          const result = await invite(investor.id).unwrap()
                          setInviteToken(result.token)
                        })
                      }
                    >
                      {t('investors.invite')}
                    </Button>
                  ) : null}
                  {can(PERMISSIONS.investorsManage) ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => void run(() => activate(investor.id).unwrap())}
                    >
                      {t('investors.activate')}
                    </Button>
                  ) : null}
                  {can(PERMISSIONS.investorsSuspend) ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        void run(() => suspend({ id: investor.id, reason: 'Admin suspension' }).unwrap())
                      }
                    >
                      {t('investors.suspend')}
                    </Button>
                  ) : null}
                  {can(PERMISSIONS.investorsRevoke) ? (
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() =>
                        void run(() => revoke({ id: investor.id, reason: 'Admin revocation' }).unwrap())
                      }
                    >
                      {t('investors.revoke')}
                    </Button>
                  ) : null}
                </div>
              }
            />
            <div className="border-line bg-surface grid gap-3 rounded-lg border p-5 sm:grid-cols-2">
              <p>
                <span className="text-muted text-sm">{t('investors.columns.number')}</span>
                <br />
                <span dir="ltr">{investor.investorNumber}</span>
              </p>
              <p>
                <span className="text-muted text-sm">{t('common.status')}</span>
                <br />
                <StatusBadge value={investor.status} options={investorStatusOptions} />
              </p>
              <p className="sm:col-span-2">
                <span className="text-muted text-sm">{t('investors.columns.scope')}</span>
                <br />
                {t('investors.accessPreview', {
                  legalEntities: investor.accessPreview.legalEntityCount,
                  branches: investor.accessPreview.branchCount,
                  vehicles: investor.accessPreview.vehicleCount,
                  reports: investor.accessPreview.reportCount,
                })}
              </p>
            </div>
            {inviteToken ? (
              <div className="border-line bg-surface rounded-lg border p-4 text-sm" role="status">
                <p className="font-medium">{t('investors.inviteToken')}</p>
                <p className="mt-2 break-all" dir="ltr">
                  {inviteToken}
                </p>
              </div>
            ) : null}
            {actionError ? (
              <p role="alert" className="text-danger text-sm">
                {actionError}
              </p>
            ) : null}
            <section className="grid gap-3">
              <h2 className="text-ink text-lg font-semibold">{t('investors.activity')}</h2>
              <ul className="border-line bg-surface divide-line divide-y rounded-lg border">
                {(activity.data?.items ?? []).map((item, index) => (
                  <li key={String(item.id ?? index)} className="px-4 py-3 text-sm">
                    <span className="font-medium">{String(item.action ?? 'event')}</span>
                    <span className="text-muted ms-2" dir="ltr">
                      {String(item.createdAt ?? '')}
                    </span>
                  </li>
                ))}
                {(activity.data?.items?.length ?? 0) === 0 ? (
                  <li className="text-muted px-4 py-3 text-sm">{t('investors.activityEmpty')}</li>
                ) : null}
              </ul>
            </section>
            <InvestorAccessDialog
              open={accessOpen}
              onClose={() => setAccessOpen(false)}
              investor={investor}
            />
          </div>
        )}
      </QueryState>
    </>
  )
}
