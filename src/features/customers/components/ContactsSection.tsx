import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { QueryState } from '@/components/feedback/QueryState'
import {
  useCreateCustomerContactMutation,
  useDeactivateCustomerContactMutation,
  useGetCustomerContactsQuery,
  useUpdateCustomerContactMutation,
} from '@/features/customers/api/customersApi'
import { useCustomerOptions } from '@/features/customers/hooks/useCustomerOptions'
import {
  contactFormSchema,
  contactToFormValues,
  toContactCreateBody,
  toContactUpdateBody,
  type ContactFormValues,
  type CustomerContact,
} from '@/features/customers/schemas/customer.schema'
import { useTranslation } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'
import { todayDateInput } from '@/utils/dates'
import { applyApiFieldErrors } from '@/utils/forms'
import { useForm } from 'react-hook-form'

const PAGE_SIZE = 20

export function ContactsSection({
  customerId,
  reveal,
  canUpdate,
}: {
  customerId: string
  reveal: boolean
  canUpdate: boolean
}) {
  const { t } = useTranslation()
  const options = useCustomerOptions()
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<CustomerContact | null | undefined>(undefined)
  const query = useGetCustomerContactsQuery({ customerId, page, pageSize: PAGE_SIZE, reveal })

  const columns: DataTableColumn<CustomerContact>[] = [
    {
      id: 'name',
      header: t('common.name'),
      cell: (row) => (
        <>
          <p className="text-ink font-medium">{row.name}</p>
          {row.isPrimary ? <p className="text-muted text-xs">{t('customers.contacts.primary')}</p> : null}
        </>
      ),
    },
    {
      id: 'role',
      header: t('customers.contacts.role'),
      cell: (row) => options.labelOf(options.contactRoleOptions, row.role),
    },
    {
      id: 'phone',
      header: t('common.phone'),
      cell: (row) => (row.phone ? <span dir="ltr">{row.phone}</span> : t('common.notSet')),
    },
    {
      id: 'email',
      header: t('common.email'),
      cell: (row) => (row.email ? <span dir="ltr">{row.email}</span> : t('common.notSet')),
    },
    {
      id: 'license',
      header: t('customers.contacts.license'),
      cell: (row) => (
        <span dir="ltr">{row.licenseNumber ?? t('common.notSet')}</span>
      ),
    },
    {
      id: 'status',
      header: t('common.status'),
      cell: (row) => <StatusBadge value={row.status} options={options.contactStatusOptions} />,
    },
    {
      id: 'actions',
      header: t('common.actions'),
      className: 'text-end',
      cell: (row) =>
        canUpdate ? (
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="text-brand text-sm font-medium"
              onClick={() => setEditing(row)}
            >
              {t('common.edit')}
            </button>
            {row.status === 'active' ? (
              <DeactivateButton customerId={customerId} contactId={row.id} />
            ) : null}
          </div>
        ) : null,
    },
  ]

  return (
    <div className="grid min-w-0 gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted text-sm">{t('customers.contacts.description')}</p>
        {canUpdate ? (
          <Button type="button" onClick={() => setEditing(null)}>
            {t('customers.contacts.add')}
          </Button>
        ) : null}
      </div>
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => data.items.length === 0}
        emptyTitle={t('customers.contacts.emptyTitle')}
        emptyDescription={t('customers.contacts.emptyDescription')}
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
      <ContactFormDialog
        open={editing !== undefined}
        customerId={customerId}
        contact={editing ?? undefined}
        onClose={() => setEditing(undefined)}
      />
    </div>
  )
}

function DeactivateButton({ customerId, contactId }: { customerId: string; contactId: string }) {
  const { t, tm } = useTranslation()
  const [deactivate, state] = useDeactivateCustomerContactMutation()
  const [error, setError] = useState<string>()

  return (
    <>
      <button
        type="button"
        className="text-danger text-sm font-medium"
        disabled={state.isLoading}
        onClick={() => {
          setError(undefined)
          void deactivate({ customerId, contactId })
            .unwrap()
            .catch((caught: unknown) => setError(normalizeApiError(caught).message))
        }}
      >
        {t('customers.contacts.deactivate')}
      </button>
      {error ? <span className="text-danger text-xs">{tm(error)}</span> : null}
    </>
  )
}

function ContactFormDialog({
  open,
  customerId,
  contact,
  onClose,
}: {
  open: boolean
  customerId: string
  contact?: CustomerContact
  onClose: () => void
}) {
  const { t, tm } = useTranslation()
  const options = useCustomerOptions()
  const [createContact] = useCreateCustomerContactMutation()
  const [updateContact] = useUpdateCustomerContactMutation()
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: contactToFormValues(contact),
  })

  useEffect(() => {
    if (open) form.reset(contactToFormValues(contact))
  }, [open, contact, form])

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (contact) {
        await updateContact({
          customerId,
          contactId: contact.id,
          body: toContactUpdateBody(values),
        }).unwrap()
      } else {
        await createContact({ customerId, body: toContactCreateBody(values) }).unwrap()
      }
      onClose()
    } catch (error) {
      const normalized = normalizeApiError(error)
      if (!applyApiFieldErrors(form.setError, normalized)) {
        form.setError('root', { message: normalized.message })
      }
    }
  })

  const errors = form.formState.errors

  return (
    <Modal
      open={open}
      size="medium"
      title={contact ? t('customers.contacts.editTitle') : t('customers.contacts.addTitle')}
      description={t('customers.contacts.formDescription')}
      onClose={onClose}
    >
      <form className="grid gap-4" noValidate onSubmit={onSubmit}>
        {errors.root ? <Alert tone="danger">{tm(errors.root.message)}</Alert> : null}
        <Input label={t('common.name')} required error={tm(errors.name?.message)} {...form.register('name')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('common.phone')}
            type="tel"
            dir="ltr"
            error={tm(errors.phone?.message)}
            {...form.register('phone')}
          />
          <Input
            label={t('common.email')}
            type="email"
            dir="ltr"
            error={tm(errors.email?.message)}
            {...form.register('email')}
          />
        </div>
        <Select
          label={t('customers.contacts.role')}
          options={options.contactRoleOptions}
          {...form.register('role')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('customers.contacts.license')}
            dir="ltr"
            hint={contact?.licenseNumber?.includes('*') ? t('customers.contacts.licenseMasked') : undefined}
            error={tm(errors.licenseNumber?.message)}
            {...form.register('licenseNumber')}
          />
          <Input
            label={t('customers.contacts.licenseExpires')}
            type="date"
            dir="ltr"
            min={todayDateInput()}
            error={tm(errors.licenseExpiresOn?.message)}
            {...form.register('licenseExpiresOn')}
          />
        </div>
        <label className="text-ink flex items-center gap-2 text-sm">
          <input type="checkbox" {...form.register('isPrimary')} />
          {t('customers.contacts.primary')}
        </label>
        <ModalActions>
          <Button type="button" variant="secondary" onClick={onClose} disabled={form.formState.isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={form.formState.isSubmitting}>
            {t('common.save')}
          </Button>
        </ModalActions>
      </form>
    </Modal>
  )
}
