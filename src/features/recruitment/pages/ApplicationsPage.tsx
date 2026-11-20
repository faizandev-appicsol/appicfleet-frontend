import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { PERMISSIONS } from '@/app/router/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import {
  useChangeApplicationStageMutation,
  useGetApplicationsQuery,
  useGetRecruitmentStagesQuery,
} from '@/features/recruitment/api/recruitmentApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function ApplicationsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('recruitment.applications.title'))
  const { can } = usePermissions()
  const stagesQuery = useGetRecruitmentStagesQuery()
  const appsQuery = useGetApplicationsQuery({ page: 1, pageSize: 100 })
  const [changeStage] = useChangeApplicationStageMutation()

  const stages = (
    Array.isArray(stagesQuery.data)
      ? stagesQuery.data
      : Array.isArray((stagesQuery.data as { items?: unknown[] } | undefined)?.items)
        ? ((stagesQuery.data as { items: unknown[] }).items)
        : []
  ) as Array<Record<string, unknown>>

  const pipelineStages = stages
    .filter((s) => !['REJECTED', 'WITHDRAWN'].includes(String(s.code)))
    .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0))

  return (
    <>
      <PageHeader
        title={t('recruitment.applications.title')}
        description={t('recruitment.applications.description')}
      />
      <QueryState
        data={appsQuery.data}
        isLoading={appsQuery.isLoading || stagesQuery.isLoading}
        isFetching={appsQuery.isFetching && !appsQuery.isLoading}
        error={appsQuery.error ?? stagesQuery.error}
        onRetry={() => {
          void appsQuery.refetch()
          void stagesQuery.refetch()
        }}
        isEmpty={(data) => !Array.isArray(data.items) || data.items.length === 0}
        emptyTitle={t('recruitment.applications.emptyTitle')}
        emptyDescription={t('recruitment.applications.emptyDescription')}
      >
        {(data) => {
          const items = (data.items ?? []) as Array<Record<string, unknown>>
          return (
            <div
              className="mt-2 flex gap-3 overflow-x-auto pb-2"
              role="list"
              aria-label={t('recruitment.applications.pipelineLabel')}
            >
              {pipelineStages.map((stage) => {
                const code = String(stage.code)
                const columnItems = items.filter((app) => String(app.stageCode) === code)
                return (
                  <section
                    key={code}
                    role="listitem"
                    className="border-line bg-surface min-w-[220px] flex-1 rounded-lg border p-3"
                    aria-labelledby={`stage-${code}`}
                  >
                    <h2 id={`stage-${code}`} className="text-sm font-semibold">
                      {String(stage.name ?? code)}{' '}
                      <span className="text-muted font-normal">({columnItems.length})</span>
                    </h2>
                    <ul className="mt-3 grid gap-2">
                      {columnItems.map((app) => {
                        const id = String(app.id)
                        const next = pipelineStages.find(
                          (s) => Number(s.sortOrder) > Number(stage.sortOrder),
                        )
                        return (
                          <li key={id} className="rounded border border-border p-2 text-sm">
                            <p className="font-medium" dir="ltr">
                              {String(app.candidateId).slice(-6)}
                            </p>
                            <p className="text-muted text-xs">{String(app.status)}</p>
                            {next && can(PERMISSIONS.applicationStageManage) ? (
                              <Button
                                type="button"
                                className="mt-2"
                                onClick={() =>
                                  void changeStage({
                                    id,
                                    stageCode: String(next.code),
                                  })
                                }
                              >
                                {t('recruitment.actions.moveNext')}
                              </Button>
                            ) : null}
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                )
              })}
            </div>
          )
        }}
      </QueryState>
    </>
  )
}
