import { Link } from 'react-router'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { appConfig } from '@/config/app.config'
import { useRoleLabel } from '@/features/auth/hooks/useRoleLabel'
import { normalizeUserStatus } from '@/features/users/schemas/user.schema'
import type { User } from '@/features/users/types/user.types'
import { useStatusOptions } from '@/hooks/useStatusOptions'
import { useTranslation } from '@/i18n'
import { formatDateTime } from '@/utils/formatDate'

export function UserTable({ users }: { users: User[] }) {
  const { t, locale } = useTranslation()
  const roleLabel = useRoleLabel()
  const statusOptions = useStatusOptions()

  return (
    <div className="border-line bg-surface overflow-hidden rounded-lg border">
      <Table>
        <THead>
          <TR>
            <TH>{t('users.columns.name')}</TH>
            <TH>{t('users.columns.role')}</TH>
            <TH>{t('users.columns.status')}</TH>
            <TH>{t('users.columns.branches')}</TH>
            <TH>{t('users.columns.created')}</TH>
          </TR>
        </THead>
        <TBody>
          {users.map((user) => (
            <TR key={user.id}>
              <TD>
                <Link
                  to={`${appConfig.routes.users}/${user.id}`}
                  className="text-ink font-medium underline-offset-2 hover:underline"
                >
                  {user.name}
                </Link>
                <p className="text-muted text-xs" dir="ltr">
                  {user.email}
                </p>
              </TD>
              <TD>{roleLabel(user.role)}</TD>
              <TD>
                <StatusBadge value={normalizeUserStatus(user.status)} options={statusOptions} />
              </TD>
              <TD className="text-muted">
                {user.accessAllBranches
                  ? t('common.all')
                  : user.branchIds.length > 0
                    ? user.branchIds.length
                    : '—'}
              </TD>
              <TD className="text-muted whitespace-nowrap">
                {formatDateTime(user.createdAt, locale)}
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  )
}
