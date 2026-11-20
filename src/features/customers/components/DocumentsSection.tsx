import { useState } from 'react'
import { QueryState } from '@/components/feedback/QueryState'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { Input } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import {
  useArchiveCustomerDocumentMutation,
  useGetCustomerDocumentsQuery,
  useGetOcrRunsQuery,
  useOpenCustomerDocumentMutation,
  useReviewOcrMutation,
  useStartOcrMutation,
} from '@/features/customers/api/customersApi'
import { DocumentCaptureDialog } from '@/features/customers/components/DocumentCaptureDialog'
import { useCustomerOptions } from '@/features/customers/hooks/useCustomerOptions'
import {
  OCR_REVIEW_THRESHOLD,
  type CustomerDocument,
  type OcrRun,
} from '@/features/customers/schemas/customer.schema'
import { useTranslation, type MessageKey } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'
import { formatDateTime } from '@/utils/formatDate'

const PAGE_SIZE = 20

const FIELD_KEYS: Record<string, MessageKey> = {
  fullName: 'customers.ocr.fields.fullName',
  documentNumber: 'customers.ocr.fields.documentNumber',
  expiryDate: 'customers.ocr.fields.expiryDate',
  businessName: 'customers.ocr.fields.businessName',
  licenseNumber: 'customers.ocr.fields.licenseNumber',
  taxNumber: 'customers.ocr.fields.taxNumber',
}

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export function DocumentsSection({
  customerId,
  reveal,
  canUpload,
  canReadFile,
  canArchive,
  canReviewOcr,
}: {
  customerId: string
  reveal: boolean
  canUpload: boolean
  canReadFile: boolean
  canArchive: boolean
  canReviewOcr: boolean
}) {
  const { t } = useTranslation()
  const options = useCustomerOptions()
  const [page, setPage] = useState(1)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [openDocumentId, setOpenDocumentId] = useState<string | null>(null)
  const query = useGetCustomerDocumentsQuery({ customerId, page, pageSize: PAGE_SIZE })

  const columns: DataTableColumn<CustomerDocument>[] = [
    {
      id: 'file',
      header: t('customers.documents.file'),
      className: 'min-w-40',
      cell: (row) => (
        <>
          <p className="text-ink font-medium">{options.labelOf(options.fileTypeOptions, row.documentType)}</p>
          <p className="text-muted text-xs" dir="ltr">
            {row.originalFilename}
          </p>
        </>
      ),
    },
    {
      id: 'size',
      header: t('customers.documents.size'),
      cell: (row) => <span dir="ltr">{formatBytes(row.byteSize)}</span>,
    },
    {
      id: 'hash',
      header: t('customers.documents.hash'),
      cell: (row) => (
        <>
          <span dir="ltr">{row.sha256Prefix}</span>
          {row.duplicateFileFlag ? (
            <p className="text-warning text-xs">{t('customers.documents.duplicateFile')}</p>
          ) : null}
        </>
      ),
    },
    {
      id: 'ocr',
      header: t('customers.documents.ocr'),
      cell: (row) => <StatusBadge value={row.ocrStatus} options={options.ocrStatusOptions} />,
    },
    {
      id: 'status',
      header: t('common.status'),
      cell: (row) => <StatusBadge value={row.status} options={options.fileStatusOptions} />,
    },
    {
      id: 'actions',
      header: t('common.actions'),
      className: 'text-end',
      cell: (row) => (
        <button
          type="button"
          className="text-brand text-sm font-medium"
          onClick={() => setOpenDocumentId(openDocumentId === row.id ? null : row.id)}
        >
          {openDocumentId === row.id ? t('customers.documents.hide') : t('customers.documents.details')}
        </button>
      ),
    },
  ]

  return (
    <div className="grid min-w-0 gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted text-sm">{t('customers.documents.description')}</p>
        {canUpload ? (
          <Button type="button" onClick={() => setUploadOpen(true)}>
            {t('customers.documents.add')}
          </Button>
        ) : null}
      </div>
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => data.items.length === 0}
        emptyTitle={t('customers.documents.emptyTitle')}
        emptyDescription={t('customers.documents.emptyDescription')}
      >
        {(data) => (
          <div className="grid min-w-0 gap-3">
            <div className="border-line bg-surface min-w-0 overflow-x-auto rounded-lg border">
              <DataTable columns={columns} rows={data.items} rowKey={(row) => row.id} />
            </div>
            {data.items
              .filter((row) => row.id === openDocumentId)
              .map((row) => (
                <DocumentDetail
                  key={row.id}
                  customerId={customerId}
                  document={row}
                  reveal={reveal}
                  canReadFile={canReadFile}
                  canArchive={canArchive}
                  canReviewOcr={canReviewOcr}
                />
              ))}
            <Pagination data={data} page={page} onPageChange={setPage} disabled={query.isFetching} />
          </div>
        )}
      </QueryState>
      <DocumentCaptureDialog
        open={uploadOpen}
        customerId={customerId}
        onClose={() => setUploadOpen(false)}
      />
    </div>
  )
}

function DocumentDetail({
  customerId,
  document,
  reveal,
  canReadFile,
  canArchive,
  canReviewOcr,
}: {
  customerId: string
  document: CustomerDocument
  reveal: boolean
  canReadFile: boolean
  canArchive: boolean
  canReviewOcr: boolean
}) {
  const { t, tm } = useTranslation()
  const [openFile, fileState] = useOpenCustomerDocumentMutation()
  const [archive, archiveState] = useArchiveCustomerDocumentMutation()
  const [startOcr, ocrState] = useStartOcrMutation()
  const [fileError, setFileError] = useState<string>()
  const runs = useGetOcrRunsQuery({
    customerId,
    documentId: document.id,
    page: 1,
    pageSize: 20,
    reveal,
  })

  const readFile = async (intent: 'view' | 'download') => {
    setFileError(undefined)
    try {
      await openFile({
        customerId,
        documentId: document.id,
        filename: document.originalFilename,
        intent,
      }).unwrap()
    } catch (caught) {
      setFileError(normalizeApiError(caught).message)
    }
  }

  return (
    <section className="border-line grid gap-4 rounded-lg border p-4">
      <div className="flex flex-wrap gap-2">
        {canReadFile ? (
          <>
            <Button type="button" variant="secondary" loading={fileState.isLoading} onClick={() => void readFile('view')}>
              {t('customers.documents.view')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              loading={fileState.isLoading}
              onClick={() => void readFile('download')}
            >
              {t('customers.documents.download')}
            </Button>
          </>
        ) : (
          <p className="text-muted text-sm">{t('customers.documents.sensitiveDenied')}</p>
        )}
        {canReviewOcr && document.status === 'active' ? (
          <Button
            type="button"
            loading={ocrState.isLoading}
            onClick={() => void startOcr({ customerId, documentId: document.id })}
          >
            {t('customers.ocr.start')}
          </Button>
        ) : null}
        {canArchive && document.status === 'active' ? (
          <Button
            type="button"
            variant="secondary"
            loading={archiveState.isLoading}
            onClick={() => void archive({ customerId, documentId: document.id })}
          >
            {t('customers.documents.archive')}
          </Button>
        ) : null}
      </div>
      {fileError ? <Alert tone="danger">{tm(fileError)}</Alert> : null}
      <p className="text-muted text-sm">{t('customers.ocr.historyHint')}</p>
      {runs.isLoading ? <p className="text-muted text-sm">{t('common.loading')}</p> : null}
      {runs.error ? (
        <Alert tone="danger">
          {tm(normalizeApiError(runs.error).message)}
        </Alert>
      ) : null}
      {runs.data?.items.length === 0 ? (
        <p className="text-muted text-sm">{t('customers.ocr.empty')}</p>
      ) : null}
      <div className="grid gap-3">
        {runs.data?.items.map((run, index) => (
          <OcrRunCard
            key={run.id}
            customerId={customerId}
            documentId={document.id}
            run={run}
            canReview={canReviewOcr && index === 0 && run.status !== 'failed'}
          />
        ))}
      </div>
    </section>
  )
}

function OcrRunCard({
  customerId,
  documentId,
  run,
  canReview,
}: {
  customerId: string
  documentId: string
  run: OcrRun
  canReview: boolean
}) {
  const { t } = useTranslation()
  const options = useCustomerOptions()
  const [reviewOpen, setReviewOpen] = useState(false)
  const lowType = run.typeConfidence < OCR_REVIEW_THRESHOLD

  return (
    <article className="border-line grid gap-3 rounded-md border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge value={run.status} options={options.ocrStatusOptions} />
        <StatusBadge value={run.reviewStatus} options={options.reviewStatusOptions} />
        <span className="text-muted text-xs" dir="ltr">
          {run.provider} · {run.modelVersion}
        </span>
        <span className="text-muted text-xs" dir="ltr">
          {formatDateTime(run.createdAt)}
        </span>
      </div>
      <p className="text-ink text-sm">
        {t('customers.ocr.detected', {
          type: options.labelOf(options.fileTypeOptions, run.detectedType),
          confidence: Math.round(run.typeConfidence * 100),
        })}
        {lowType ? ` · ${t('customers.ocr.lowConfidence')}` : ''}
      </p>
      {run.errorCode ? (
        <p className="text-danger text-sm" dir="ltr">
          {run.errorCode}
        </p>
      ) : null}
      <dl className="grid gap-2 sm:grid-cols-2">
        {run.fields.map((field) => {
          const low = field.confidence < OCR_REVIEW_THRESHOLD
          const reviewed = run.reviewedFields?.find((item) => item.key === field.key)
          return (
            <div key={field.key} className="grid gap-1">
              <dt className="text-muted text-xs font-medium">
                {FIELD_KEYS[field.key] ? t(FIELD_KEYS[field.key]) : field.key}
              </dt>
              <dd className="text-ink text-sm" dir="ltr">
                {reviewed?.value ?? field.value}
                <span className="text-muted ms-2 text-xs">
                  {Math.round(field.confidence * 100)}%
                  {low ? ` · ${t('customers.ocr.lowConfidence')}` : ''}
                </span>
              </dd>
            </div>
          )
        })}
      </dl>
      {canReview && run.reviewStatus === 'none' ? (
        <div>
          <Button type="button" variant="secondary" onClick={() => setReviewOpen(true)}>
            {t('customers.ocr.review')}
          </Button>
        </div>
      ) : null}
      {reviewOpen ? (
        <OcrReviewDialog
          customerId={customerId}
          documentId={documentId}
          run={run}
          onClose={() => setReviewOpen(false)}
        />
      ) : null}
    </article>
  )
}

function OcrReviewDialog({
  customerId,
  documentId,
  run,
  onClose,
}: {
  customerId: string
  documentId: string
  run: OcrRun
  onClose: () => void
}) {
  const { t, tm } = useTranslation()
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      run.fields.map((field) => [
        field.key,
        run.reviewedFields?.find((item) => item.key === field.key)?.value ?? field.value,
      ]),
    ),
  )
  const [error, setError] = useState<string>()
  const [review, state] = useReviewOcrMutation()

  const send = async (decision: 'approve' | 'reject') => {
    setError(undefined)
    const fields = run.fields
      .map((field) => ({ key: field.key, value: (values[field.key] ?? '').trim() }))
      .filter((field) => field.value.length > 0 && !field.value.includes('*'))
    try {
      await review({
        customerId,
        documentId,
        runId: run.id,
        decision,
        fields: decision === 'approve' ? fields : undefined,
      }).unwrap()
      onClose()
    } catch (caught) {
      setError(normalizeApiError(caught).message)
    }
  }

  return (
    <Modal
      open
      size="wide"
      title={t('customers.ocr.reviewTitle')}
      description={t('customers.ocr.reviewDescription')}
      onClose={onClose}
    >
      <div className="grid gap-4">
        {error ? <Alert tone="danger">{tm(error)}</Alert> : null}
        <p className="text-muted text-sm">{t('customers.ocr.reviewHint')}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {run.fields.map((field) => (
            <Input
              key={field.key}
              label={FIELD_KEYS[field.key] ? t(FIELD_KEYS[field.key]) : field.key}
              hint={
                field.confidence < OCR_REVIEW_THRESHOLD
                  ? t('customers.ocr.lowConfidence')
                  : `${Math.round(field.confidence * 100)}%`
              }
              dir="ltr"
              value={values[field.key] ?? ''}
              onChange={(event) =>
                setValues((current) => ({ ...current, [field.key]: event.target.value }))
              }
            />
          ))}
        </div>
        <ModalActions>
          <Button type="button" variant="secondary" disabled={state.isLoading} onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="button" variant="secondary" loading={state.isLoading} onClick={() => void send('reject')}>
            {t('customers.ocr.reject')}
          </Button>
          <Button type="button" loading={state.isLoading} onClick={() => void send('approve')}>
            {t('customers.ocr.approve')}
          </Button>
        </ModalActions>
      </div>
    </Modal>
  )
}
