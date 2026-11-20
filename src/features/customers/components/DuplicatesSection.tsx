import { useState } from 'react'
import { Link } from 'react-router'
import { QueryState } from '@/components/feedback/QueryState'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Textarea } from '@/components/ui/Textarea'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { appConfig } from '@/config/app.config'
import {
  useGetCustomerDuplicatesQuery,
  useReviewDuplicateMutation,
} from '@/features/customers/api/customersApi'
import { useCustomerOptions } from '@/features/customers/hooks/useCustomerOptions'
import type { DuplicateReview } from '@/features/customers/schemas/customer.schema'
import { useTranslation, type MessageKey } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'

const PAGE_SIZE = 20

const SIGNAL_KEYS: Record<string, MessageKey> = {
  email: 'customers.duplicates.signals.email',
  phone: 'customers.duplicates.signals.phone',
  registration: 'customers.duplicates.signals.registration',
}

export function DuplicatesSection({
  customerId,
  canReview,
}: {
  customerId: string
  canReview: boolean
}) {
  const { t } = useTranslation()
  const options = useCustomerOptions()
  const [page, setPage] = useState(1)
  const [reviewing, setReviewing] = useState<DuplicateReview | null>(null)
  const query = useGetCustomerDuplicatesQuery(
    { customerId, page, pageSize: PAGE_SIZE },
    { skip: !canReview },
  )

  if (!canReview) {
    return <Alert tone="info">{t('customers.duplicates.denied')}</Alert>
  }

  const columns: DataTableColumn<DuplicateReview>[] = [
    {
      id: 'candidate',
      header: t('customers.duplicates.candidate'),
      cell: (row) => (
        <>
          <Link
            to={`${appConfig.routes.customers}/${encodeURIComponent(row.candidate.id)}`}
            className="text-brand font-medium"
          >
            {row.candidate.displayName}
          </Link>
          <p className="text-muted text-xs" dir="ltr">
            {row.candidate.customerNumber}
          </p>
        </>
      ),
    },
    {
      id: 'type',
      header: t('customers.columns.type'),
      cell: (row) => options.labelOf(options.typeOptions, row.candidate.type),
    },
    {
      id: 'signals',
      header: t('customers.duplicates.signalsTitle'),
      cell: (row) =>
        row.signals.map((signal) => (SIGNAL_KEYS[signal] ? t(SIGNAL_KEYS[signal]) : signal)).join(', '),
    },
    {
      id: 'status',
      header: t('common.status'),
      cell: (row) => <StatusBadge value={row.status} options={options.duplicateStatusOptions} />,
    },
    {
      id: 'actions',
      header: t('common.actions'),
      className: 'text-end',
      cell: (row) => (
        <button type="button" className="text-brand text-sm font-medium" onClick={() => setReviewing(row)}>
          {t('customers.duplicates.review')}
        </button>
      ),
    },
  ]

  return (
    <div className="grid min-w-0 gap-3">
      <p className="text-muted text-sm">{t('customers.duplicates.description')}</p>
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => data.items.length === 0}
        emptyTitle={t('customers.duplicates.emptyTitle')}
        emptyDescription={t('customers.duplicates.emptyDescription')}
      >
        {(data) => (
          <div className="grid min-w-0 gap-3">
            <div className="border-line bg-surface min-w-0 overflow-x-auto rounded-lg border">
              <DataTable columns={columns} rows={data.items} rowKey={(row) => row.id} />
            </div>
            <Pagination data={data} page={page} onPageChange={setPage} disabled={query.isFetching} />
          </div>
        )}
      </QueryState>
      {reviewing ? (
        <ReviewDialog
          customerId={customerId}
          review={reviewing}
          onClose={() => setReviewing(null)}
        />
      ) : null}
    </div>
  )
}

function ReviewDialog({
  customerId,
  review,
  onClose,
}: {
  customerId: string
  review: DuplicateReview
  onClose: () => void
}) {
  const { t, tm } = useTranslation()
  const [note, setNote] = useState(review.note ?? '')
  const [error, setError] = useState<string>()
  const [submit, state] = useReviewDuplicateMutation()

  const send = async (status: 'confirmed' | 'not_duplicate' | 'under_review') => {
    setError(undefined)
    try {
      await submit({
        customerId,
        reviewId: review.id,
        status,
        note: note.trim() || undefined,
      }).unwrap()
      onClose()
    } catch (caught) {
      setError(normalizeApiError(caught).message)
    }
  }

  return (
    <Modal
      open
      size="medium"
      title={t('customers.duplicates.reviewTitle')}
      description={t('customers.duplicates.reviewDescription', { name: review.candidate.displayName })}
      onClose={onClose}
    >
      <div className="grid gap-4">
        {error ? <Alert tone="danger">{tm(error)}</Alert> : null}
        <p className="text-muted text-sm">{t('customers.duplicates.noMerge')}</p>
        <Textarea
          label={t('customers.duplicates.note')}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
        <ModalActions>
          <Button type="button" variant="secondary" disabled={state.isLoading} onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            loading={state.isLoading}
            onClick={() => void send('under_review')}
          >
            {t('customers.duplicates.underReview')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            loading={state.isLoading}
            onClick={() => void send('not_duplicate')}
          >
            {t('customers.duplicates.notDuplicate')}
          </Button>
          <Button type="button" loading={state.isLoading} onClick={() => void send('confirmed')}>
            {t('customers.duplicates.confirmDuplicate')}
          </Button>
        </ModalActions>
      </div>
    </Modal>
  )
}
