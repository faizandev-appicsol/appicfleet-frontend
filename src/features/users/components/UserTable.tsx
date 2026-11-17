import { Link } from 'react-router'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { appConfig } from '@/config/app.config'
import type { User } from '@/features/users/types/user.types'
import { formatDateTime } from '@/utils/formatDate'

function statusTone(status: string): BadgeTone {
  if (status === 'active') return 'success'
  if (status === 'invited') return 'warning'
  if (status === 'disabled') return 'danger'
  return 'neutral'
}

export function UserTable({ users }: { users: User[] }) {
  return (
    <div className="border-line bg-surface overflow-hidden rounded-lg border">
      <Table>
        <THead>
          <TR>
            <TH>Name</TH>
            <TH>Role</TH>
            <TH>Status</TH>
            <TH>Created</TH>
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
                <p className="text-muted text-xs">{user.email}</p>
              </TD>
              <TD className="capitalize">{user.role}</TD>
              <TD>
                <Badge tone={statusTone(user.status)}>{user.status}</Badge>
              </TD>
              <TD className="text-muted whitespace-nowrap">{formatDateTime(user.createdAt)}</TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  )
}
