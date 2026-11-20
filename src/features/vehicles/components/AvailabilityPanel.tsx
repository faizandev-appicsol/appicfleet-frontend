import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { QueryState } from '@/components/feedback/QueryState'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { Input } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Textarea } from '@/components/ui/Textarea'
import {
  useCheckVehicleAvailabilityMutation,
  useCreateVehicleAssignmentMutation,
  useGetVehicleAssignmentsQuery,
  useReleaseVehicleAssignmentMutation,
} from '@/features/vehicles/api/vehiclesApi'
import { useVehicleOptions } from '@/features/vehicles/hooks/useVehicleOptions'
import {
  assignmentFormSchema,
  availabilityFormSchema,
  toTimeWindowBody,
  type AssignmentFormValues,
  type AvailabilityFormValues,
  type VehicleAssignment,
  type VehicleDetail,
} from '@/features/vehicles/schemas/vehicle.schema'
import { useTranslation } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'
import { applyApiFieldErrors } from '@/utils/forms'
import { formatDateTime } from '@/utils/formatDate'

const PAGE_SIZE = 10

const WINDOW_DEFAULTS: AvailabilityFormValues = { startsAt: '', endsAt: '' }
const ASSIGNMENT_DEFAULTS: AssignmentFormValues = { startsAt: '', endsAt: '', reason: '' }

/** Availability check, plus the allocation list with create and release. */
export function AvailabilityPanel({
  vehicle,
  canCheck,
  canAllocate,
}: {
  vehicle: VehicleDetail
  canCheck: boolean
  canAllocate: boolean
}) {
  const { t, tm, locale } = useTranslation()
  const { reasonLabel, assignmentStatusOptions } = useVehicleOptions()
  const [checkAvailability, checkState] = useCheckVehicleAvailabilityMutation()
  const [releaseAssignment, releaseState] = useReleaseVehicleAssignmentMutation()
  const [page, setPage] = useState(1)
  const [allocateOpen, setAllocateOpen] = useState(false)
  const [releasing, setReleasing] = useState<VehicleAssignment | undefined>()

  const form = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilityFormSchema),
    defaultValues: WINDOW_DEFAULTS,
  })

  const assignments = useGetVehicleAssignmentsQuery(
    { id: vehicle.id, page, pageSize: PAGE_SIZE },
    { skip: !canCheck },
  )

  const onCheck = form.handleSubmit(async (values) => {
    try {
      await checkAvailability({ id: vehicle.id, body: toTimeWindowBody(values) }).unwrap()
    } catch (error) {
      const normalized = normalizeApiError(error)
      if (!applyApiFieldErrors(form.setError, normalized)) {
        form.setError('root', { message: normalized.message })
      }
    }
  })

  const onRelease = async () => {
    if (!releasing) return
    try {
      await releaseAssignment({ id: vehicle.id, assignmentId: releasing.id }).unwrap()
      setReleasing(undefined)
      // The earlier check no longer reflects the current allocations.
      checkState.reset()
    } catch {
      // The mutation error is rendered inside the dialog.
    }
  }

  const columns: DataTableColumn<VehicleAssignment>[] = [
    {
      id: 'startsAt',
      header: t('vehicles.availability.columns.startsAt'),
      className: 'whitespace-nowrap',
      cell: (row) => formatDateTime(row.startsAt, locale),
    },
    {
      id: 'endsAt',
      header: t('vehicles.availability.columns.endsAt'),
      className: 'whitespace-nowrap',
      cell: (row) => formatDateTime(row.endsAt, locale),
    },
    {
      id: 'reason',
      header: t('vehicles.availability.columns.reason'),
      className: 'min-w-40',
      cell: (row) => row.reason,
    },
    {
      id: 'status',
      header: t('vehicles.availability.columns.status'),
      cell: (row) => <StatusBadge value={row.status} options={assignmentStatusOptions} />,
    },
    ...(canAllocate
      ? [
          {
            id: 'actions',
            header: t('common.actions'),
            className: 'text-end',
            cell: (row: VehicleAssignment) =>
              row.status === 'active' ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    releaseState.reset()
                    setReleasing(row)
                  }}
                >
                  {t('vehicles.availability.release')}
                </Button>
              ) : null,
          },
        ]
      : []),
  ]

  const result = checkState.data
  const errors = form.formState.errors

  return (
    <div className="grid gap-4">
      <Card
        title={t('vehicles.availability.checkTitle')}
        description={t('vehicles.availability.checkDescription')}
      >
        {canCheck ? (
          <form className="grid gap-4" noValidate onSubmit={onCheck}>
            {errors.root ? <Alert tone="danger">{tm(errors.root.message)}</Alert> : null}
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t('vehicles.availability.startsAt')}
                type="datetime-local"
                required
                dir="ltr"
                error={tm(errors.startsAt?.message)}
                {...form.register('startsAt')}
              />
              <Input
                label={t('vehicles.availability.endsAt')}
                type="datetime-local"
                required
                dir="ltr"
                error={tm(errors.endsAt?.message)}
                {...form.register('endsAt')}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={form.formState.isSubmitting}>
                {t('vehicles.availability.check')}
              </Button>
            </div>
            {result ? (
              <Alert
                tone={result.available ? 'success' : 'warning'}
                title={
                  result.available
                    ? t('vehicles.availability.available')
                    : t('vehicles.availability.unavailable')
                }
              >
                {result.reasons.length > 0 ? (
                  <div className="grid gap-1">
                    <p className="font-medium">{t('vehicles.availability.reasonsTitle')}</p>
                    <ul className="list-disc ps-5">
                      {result.reasons.map((reason) => (
                        <li key={reason}>{reasonLabel(reason)}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {result.conflicts.length > 0 ? (
                  <div className="mt-2 grid gap-1">
                    <p className="font-medium">{t('vehicles.availability.conflictsTitle')}</p>
                    <ul className="list-disc ps-5">
                      {result.conflicts.map((conflict) => (
                        <li key={conflict.id}>
                          {t('vehicles.availability.range', {
                            start: formatDateTime(conflict.startsAt, locale),
                            end: formatDateTime(conflict.endsAt, locale),
                          })}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </Alert>
            ) : null}
          </form>
        ) : (
          <Alert tone="info">{t('vehicles.availability.checkDenied')}</Alert>
        )}
      </Card>

      <Card
        title={t('vehicles.availability.assignmentsTitle')}
        description={t('vehicles.availability.assignmentsDescription')}
        action={
          canAllocate ? (
            <Button type="button" size="sm" onClick={() => setAllocateOpen(true)}>
              {t('vehicles.availability.allocate')}
            </Button>
          ) : undefined
        }
      >
        {canCheck ? (
          <QueryState
            data={assignments.data}
            isLoading={assignments.isLoading}
            isFetching={assignments.isFetching && !assignments.isLoading}
            error={assignments.error}
            onRetry={assignments.refetch}
            isEmpty={(data) => data.items.length === 0}
            emptyTitle={t('vehicles.availability.emptyTitle')}
            emptyDescription={t('vehicles.availability.emptyDescription')}
          >
            {(data) => (
              <div className="grid min-w-0 gap-3">
                <div className="border-line min-w-0 overflow-x-auto rounded-lg border">
                  <DataTable columns={columns} rows={data.items} rowKey={(row) => row.id} />
                </div>
                <Pagination
                  data={data}
                  page={page}
                  onPageChange={setPage}
                  disabled={assignments.isFetching}
                />
              </div>
            )}
          </QueryState>
        ) : (
          <Alert tone="info">{t('vehicles.availability.assignmentsDenied')}</Alert>
        )}
      </Card>

      <AssignmentFormDialog
        open={allocateOpen}
        vehicle={vehicle}
        onClose={() => setAllocateOpen(false)}
        onCreated={() => checkState.reset()}
      />

      <Modal
        open={Boolean(releasing)}
        title={t('vehicles.availability.releaseTitle')}
        description={t('vehicles.availability.releaseDescription')}
        onClose={() => setReleasing(undefined)}
      >
        <div className="grid gap-4">
          {releaseState.error ? (
            <Alert tone="danger">{tm(normalizeApiError(releaseState.error).message)}</Alert>
          ) : null}
          {releasing ? (
            <p className="text-muted text-sm">
              {t('vehicles.availability.range', {
                start: formatDateTime(releasing.startsAt, locale),
                end: formatDateTime(releasing.endsAt, locale),
              })}
            </p>
          ) : null}
          <ModalActions>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setReleasing(undefined)}
              disabled={releaseState.isLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={releaseState.isLoading}
              onClick={() => void onRelease()}
            >
              {t('vehicles.availability.releaseConfirm')}
            </Button>
          </ModalActions>
        </div>
      </Modal>
    </div>
  )
}

function AssignmentFormDialog({
  open,
  vehicle,
  onClose,
  onCreated,
}: {
  open: boolean
  vehicle: VehicleDetail
  onClose: () => void
  onCreated: () => void
}) {
  const { t, tm } = useTranslation()
  const [createAssignment] = useCreateVehicleAssignmentMutation()
  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: ASSIGNMENT_DEFAULTS,
  })

  useEffect(() => {
    if (open) form.reset(ASSIGNMENT_DEFAULTS)
  }, [open, form])

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createAssignment({
        id: vehicle.id,
        body: { ...toTimeWindowBody(values), reason: values.reason.trim() },
      }).unwrap()
      onCreated()
      onClose()
    } catch (error) {
      const normalized = normalizeApiError(error)
      if (!applyApiFieldErrors(form.setError, normalized)) {
        form.setError('root', { message: normalized.message })
      }
    }
  })

  const errors = form.formState.errors
  const submitting = form.formState.isSubmitting

  return (
    <Modal
      open={open}
      size="medium"
      title={t('vehicles.availability.create.title')}
      description={t('vehicles.availability.create.description', { name: vehicle.plateNumber })}
      onClose={onClose}
    >
      <form className="grid gap-4" noValidate onSubmit={onSubmit}>
        {errors.root ? <Alert tone="danger">{tm(errors.root.message)}</Alert> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('vehicles.availability.startsAt')}
            type="datetime-local"
            required
            dir="ltr"
            error={tm(errors.startsAt?.message)}
            {...form.register('startsAt')}
          />
          <Input
            label={t('vehicles.availability.endsAt')}
            type="datetime-local"
            required
            dir="ltr"
            error={tm(errors.endsAt?.message)}
            {...form.register('endsAt')}
          />
        </div>
        <Textarea
          label={t('vehicles.availability.form.reason')}
          required
          hint={t('vehicles.availability.form.reasonHint')}
          error={tm(errors.reason?.message)}
          {...form.register('reason')}
        />
        <ModalActions>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={submitting}>
            {t('vehicles.availability.create.submit')}
          </Button>
        </ModalActions>
      </form>
    </Modal>
  )
}
