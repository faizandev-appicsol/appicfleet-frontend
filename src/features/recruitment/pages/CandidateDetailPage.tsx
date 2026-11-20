import { useParams } from 'react-router'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { useGetCandidateQuery } from '@/features/recruitment/api/recruitmentApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function CandidateDetailPage() {
  const { t } = useTranslation()
  const { candidateId = '' } = useParams()
  const query = useGetCandidateQuery(candidateId, { skip: !candidateId })
  useDocumentTitle(t('recruitment.candidateDetail.title'))

  return (
    <>
      <PageHeader
        title={t('recruitment.candidateDetail.title')}
        description={t('recruitment.candidateDetail.description')}
      />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={() => false}
        emptyTitle={t('recruitment.emptyTitle')}
        emptyDescription={t('recruitment.emptyDescription')}
      >
        {(data) => (
          <dl className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            <div>
              <dt className="text-muted">{t('common.name')}</dt>
              <dd className="font-medium">
                {String(data.firstName ?? '')} {String(data.lastName ?? '')}
              </dd>
            </div>
            <div>
              <dt className="text-muted">{t('recruitment.candidates.columns.email')}</dt>
              <dd dir="ltr">{String(data.email ?? '—')}</dd>
            </div>
            <div>
              <dt className="text-muted">{t('recruitment.candidateDetail.phone')}</dt>
              <dd dir="ltr">{String(data.phone ?? '—')}</dd>
            </div>
            <div>
              <dt className="text-muted">{t('recruitment.candidates.columns.employer')}</dt>
              <dd>{String(data.currentEmployer ?? '—')}</dd>
            </div>
            <div>
              <dt className="text-muted">{t('recruitment.candidateDetail.titleLabel')}</dt>
              <dd>{String(data.currentTitle ?? '—')}</dd>
            </div>
            <div>
              <dt className="text-muted">{t('recruitment.candidateDetail.source')}</dt>
              <dd>{String(data.source ?? '—')}</dd>
            </div>
            <div>
              <dt className="text-muted">{t('common.status')}</dt>
              <dd>{String(data.status ?? '—')}</dd>
            </div>
            <div>
              <dt className="text-muted">{t('recruitment.candidateDetail.employeeLink')}</dt>
              <dd dir="ltr">{String(data.employeeId ?? '—')}</dd>
            </div>
          </dl>
        )}
      </QueryState>
    </>
  )
}
