import { useParams } from 'react-router'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PERMISSIONS } from '@/app/router/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import {
  useChangeEmployeeStatusMutation,
  useGetEmployeeDocumentsQuery,
  useGetEmployeeQuery,
} from '@/features/hr/api/hrApi'
import { employmentStatusOptions, hrDocumentStatusOptions } from '@/features/hr/statusOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'
import { useState } from 'react'

export function EmployeeDetailsPage() {
  const { t } = useTranslation()
  const { employeeId = '' } = useParams()
  const { can } = usePermissions()
  const query = useGetEmployeeQuery(employeeId, { skip: !employeeId })
  const documents = useGetEmployeeDocumentsQuery(
    { employeeId },
    { skip: !employeeId || !can(PERMISSIONS.hrEmployeeDocumentView) },
  )
  const [changeStatus] = useChangeEmployeeStatusMutation()
  const [error, setError] = useState<string | undefined>()

  useDocumentTitle(
    query.data ? `${query.data.firstName} ${query.data.lastName}` : t('hr.employees.title'),
  )

  return (
    <QueryState
      data={query.data}
      isLoading={query.isLoading}
      isFetching={query.isFetching && !query.isLoading}
      error={query.error}
      onRetry={query.refetch}
      isEmpty={() => false}
      emptyTitle={t('hr.employees.emptyTitle')}
      emptyDescription={t('hr.employees.emptyDescription')}
    >
      {(employee) => (
        <div className="grid gap-6">
          <PageHeader
            title={`${employee.firstName} ${employee.lastName}`}
            description={employee.employeeNumber}
            action={
              can(PERMISSIONS.hrEmployeeStatusManage) ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      void changeStatus({ id: employee.id, status: 'on_leave' })
                        .unwrap()
                        .catch((err) => setError(normalizeApiError(err).message))
                    }
                  >
                    {t('hr.employees.markOnLeave')}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      void changeStatus({ id: employee.id, status: 'active' })
                        .unwrap()
                        .catch((err) => setError(normalizeApiError(err).message))
                    }
                  >
                    {t('hr.employees.markActive')}
                  </Button>
                </div>
              ) : undefined
            }
          />
          <div className="border-line bg-surface grid gap-3 rounded-lg border p-5 sm:grid-cols-2">
            <p>
              <span className="text-muted text-sm">{t('common.status')}</span>
              <br />
              <StatusBadge value={employee.status} options={employmentStatusOptions} />
            </p>
            <p>
              <span className="text-muted text-sm">{t('hr.fields.employmentType')}</span>
              <br />
              {employee.employmentType}
            </p>
            <p>
              <span className="text-muted text-sm">{t('hr.fields.workEmail')}</span>
              <br />
              <span dir="ltr">{employee.workEmail ?? '—'}</span>
            </p>
            <p>
              <span className="text-muted text-sm">{t('hr.fields.workPhone')}</span>
              <br />
              <span dir="ltr">{employee.workPhone ?? '—'}</span>
            </p>
            <p>
              <span className="text-muted text-sm">{t('hr.fields.personalEmail')}</span>
              <br />
              <span dir="ltr">{String(employee.personalEmail ?? '—')}</span>
            </p>
            <p>
              <span className="text-muted text-sm">{t('hr.fields.hireDate')}</span>
              <br />
              <span dir="ltr">{employee.hireDate ?? '—'}</span>
            </p>
          </div>
          {error ? (
            <p role="alert" className="text-danger text-sm">
              {error}
            </p>
          ) : null}
          {can(PERMISSIONS.hrEmployeeDocumentView) ? (
            <section className="grid gap-3">
              <h2 className="text-ink text-lg font-semibold">{t('hr.documents.title')}</h2>
              <ul className="border-line bg-surface divide-line divide-y rounded-lg border">
                {(documents.data?.items ?? []).map((doc) => (
                  <li key={doc.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium">{doc.documentType}</p>
                      <p className="text-muted" dir="ltr">
                        {doc.originalFilename}
                      </p>
                    </div>
                    <StatusBadge value={doc.status} options={hrDocumentStatusOptions} />
                  </li>
                ))}
                {(documents.data?.items.length ?? 0) === 0 ? (
                  <li className="text-muted px-4 py-3 text-sm">{t('hr.documents.empty')}</li>
                ) : null}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </QueryState>
  )
}
