import type { ReactNode } from 'react'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useMeQuery } from '@/features/auth/api/authApi'
import { useRoleLabel } from '@/features/auth/hooks/useRoleLabel'
import type { ProfileResource } from '@/features/auth/types/auth.types'
import { ChangePasswordForm } from '@/features/profile/components/ChangePasswordForm'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useStatusOptions } from '@/hooks/useStatusOptions'
import { useTranslation } from '@/i18n'
import { formatDateTime } from '@/utils/formatDate'

export function ProfilePage() {
  const { t } = useTranslation()
  useDocumentTitle(t('profile.documentTitle'))
  const query = useMeQuery()

  return (
    <>
      <PageHeader title={t('profile.title')} description={t('profile.description')} />
      {query.isLoading ? <LoadingState label={t('profile.loading')} /> : null}
      {query.error && !query.data ? (
        <ErrorState error={query.error} onRetry={query.refetch} />
      ) : null}
      {query.data ? <ProfileDetails profile={query.data} /> : null}
    </>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1">
      <dt className="text-muted text-xs font-medium tracking-wide uppercase">{label}</dt>
      <dd className="text-ink min-w-0 text-sm break-words">{children}</dd>
    </div>
  )
}

function ProfileDetails({ profile }: { profile: ProfileResource }) {
  const { t, locale } = useTranslation()
  const roleLabel = useRoleLabel()
  const statusOptions = useStatusOptions()

  const organization = profile.organization
    ? `${profile.organization.name} (${profile.organization.code})`
    : profile.accessAllOrganizations
      ? t('profile.allOrganizations')
      : t('profile.noOrganization')

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title={t('profile.account')} description={t('profile.accountDescription')}>
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field label={t('profile.name')}>{profile.name}</Field>
          <Field label={t('profile.email')}>
            <span dir="ltr" className="inline-block">
              {profile.email}
            </span>
          </Field>
          <Field label={t('profile.phone')}>
            {profile.phone ? (
              <span dir="ltr" className="inline-block">
                {profile.phone}
              </span>
            ) : (
              <span className="text-muted">{t('common.notSet')}</span>
            )}
          </Field>
          <Field label={t('profile.status')}>
            <StatusBadge value={profile.status.toLowerCase()} options={statusOptions} />
          </Field>
          <Field label={t('profile.lastLogin')}>
            {profile.lastLoginAt ? (
              formatDateTime(profile.lastLoginAt, locale)
            ) : (
              <span className="text-muted">{t('common.never')}</span>
            )}
          </Field>
        </dl>
      </Card>

      <Card title={t('profile.access')} description={t('profile.accessDescription')}>
        <dl className="grid gap-4">
          <Field label={t('profile.organization')}>{organization}</Field>
          <Field label={t('profile.roles')}>
            {profile.roles.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.roles.map((role) => (
                  <Badge key={role} tone="brand">
                    {roleLabel(role)}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-muted">{t('profile.noRoles')}</span>
            )}
          </Field>
          <Field label={t('profile.branches')}>
            {profile.accessAllBranches ? (
              t('profile.allBranches')
            ) : profile.branches.length > 0 ? (
              <ul className="grid gap-1">
                {profile.branches.map((branch) => (
                  <li key={branch.id}>
                    {branch.name}{' '}
                    <span className="text-muted text-xs" dir="ltr">
                      {branch.code}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-muted">{t('profile.noBranches')}</span>
            )}
          </Field>
        </dl>
      </Card>

      <Card title={t('profile.permissions')} className="lg:col-span-2">
        {profile.permissions.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {profile.permissions.map((permission) => (
              <li key={permission}>
                <span
                  dir="ltr"
                  className="bg-canvas text-ink inline-block rounded-md px-2 py-0.5 font-mono text-xs"
                >
                  {permission}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted text-sm">{t('profile.noPermissions')}</p>
        )}
      </Card>

      <div className="lg:col-span-2">
        <ChangePasswordForm />
      </div>
    </div>
  )
}
