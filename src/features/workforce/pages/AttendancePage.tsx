import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import {
  useClockInMutation,
  useClockOutMutation,
  useGetAttendanceListQuery,
  useGetTodayAttendanceQuery,
} from '@/features/workforce/api/workforceApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

function formatMinutes(value: unknown) {
  const n = Number(value ?? 0)
  if (!Number.isFinite(n)) return '—'
  const h = Math.floor(n / 60)
  const m = n % 60
  return `${h}h ${m}m`
}

export function AttendancePage() {
  const { t } = useTranslation()
  useDocumentTitle(t('workforce.attendance.title'))
  const today = useGetTodayAttendanceQuery()
  const list = useGetAttendanceListQuery({ page: 1, pageSize: 20 })
  const [clockIn, clockInState] = useClockInMutation()
  const [clockOut, clockOutState] = useClockOutMutation()

  const todayRecord = today.data

  return (
    <>
      <PageHeader
        title={t('workforce.attendance.title')}
        description={t('workforce.attendance.description')}
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={clockInState.isLoading || Boolean(todayRecord?.clockInAt)}
              onClick={() => void clockIn({})}
            >
              {t('workforce.attendance.clockIn')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={
                clockOutState.isLoading || !todayRecord?.clockInAt || Boolean(todayRecord?.clockOutAt)
              }
              onClick={() => void clockOut({})}
            >
              {t('workforce.attendance.clockOut')}
            </Button>
          </div>
        }
      />

      <section className="mb-6 rounded-lg border border-border bg-surface p-4" aria-labelledby="today-att">
        <h2 id="today-att" className="text-base font-semibold text-fg">
          {t('workforce.attendance.today')}
        </h2>
        <QueryState
          data={today.data}
          isLoading={today.isLoading}
          isFetching={today.isFetching && !today.isLoading}
          error={today.error}
          onRetry={today.refetch}
          isEmpty={() => false}
          emptyTitle={t('workforce.emptyTitle')}
          emptyDescription={t('workforce.emptyDescription')}
        >
          {(data) => (
            <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              <div>
                <dt className="text-muted">{t('workforce.attendance.status')}</dt>
                <dd className="font-medium">{String(data.status ?? '—')}</dd>
              </div>
              <div>
                <dt className="text-muted">{t('workforce.attendance.businessDate')}</dt>
                <dd className="font-medium">{String(data.businessDate ?? '—')}</dd>
              </div>
              <div>
                <dt className="text-muted">{t('workforce.attendance.clockInAt')}</dt>
                <dd className="font-medium">
                  {data.clockInAt ? new Date(String(data.clockInAt)).toLocaleString() : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-muted">{t('workforce.attendance.clockOutAt')}</dt>
                <dd className="font-medium">
                  {data.clockOutAt ? new Date(String(data.clockOutAt)).toLocaleString() : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-muted">{t('workforce.attendance.worked')}</dt>
                <dd className="font-medium">{formatMinutes(data.workedDurationMinutes)}</dd>
              </div>
              <div>
                <dt className="text-muted">{t('workforce.attendance.late')}</dt>
                <dd className="font-medium">{formatMinutes(data.lateDurationMinutes)}</dd>
              </div>
              <div>
                <dt className="text-muted">{t('workforce.attendance.overtime')}</dt>
                <dd className="font-medium">{formatMinutes(data.overtimeDurationMinutes)}</dd>
              </div>
              <div>
                <dt className="text-muted">{t('workforce.attendance.timezone')}</dt>
                <dd className="font-medium">{String(data.timezone ?? '—')}</dd>
              </div>
            </dl>
          )}
        </QueryState>
      </section>

      <QueryState
        data={list.data}
        isLoading={list.isLoading}
        isFetching={list.isFetching && !list.isLoading}
        error={list.error}
        onRetry={list.refetch}
        isEmpty={(data) => !Array.isArray(data.items) || data.items.length === 0}
        emptyTitle={t('workforce.attendance.emptyTitle')}
        emptyDescription={t('workforce.attendance.emptyDescription')}
      >
        {(data) => {
          const items = (data.items ?? []) as Array<Record<string, unknown>>
          return (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full table-fixed border-collapse text-sm">
                <thead className="bg-muted/40 text-left">
                  <tr>
                    <th className="p-3 font-medium">{t('workforce.attendance.businessDate')}</th>
                    <th className="p-3 font-medium">{t('workforce.attendance.status')}</th>
                    <th className="p-3 font-medium">{t('workforce.attendance.worked')}</th>
                    <th className="p-3 font-medium">{t('workforce.attendance.source')}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => (
                    <tr key={String(row.id)} className="border-t border-border">
                      <td className="p-3">{String(row.businessDate ?? '—')}</td>
                      <td className="p-3">
                        <span aria-label={String(row.status)}>{String(row.status ?? '—')}</span>
                      </td>
                      <td className="p-3">{formatMinutes(row.workedDurationMinutes)}</td>
                      <td className="p-3">{String(row.source ?? '—')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }}
      </QueryState>
    </>
  )
}
