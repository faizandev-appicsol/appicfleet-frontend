import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { useBranchOptions } from '@/features/branches/hooks/useBranchOptions'
import {
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
} from '@/features/customers/api/customersApi'
import {
  customerFormSchema,
  customerToFormValues,
  toCustomerCreateBody,
  toCustomerUpdateBody,
  type CustomerDetail,
  type CustomerFormValues,
} from '@/features/customers/schemas/customer.schema'
import { useOrganizationOptions } from '@/features/organizations/hooks/useOrganizationOptions'
import { useTranslation } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'
import { applyApiFieldErrors } from '@/utils/forms'

export function CustomerFormDialog({
  open,
  customer,
  onClose,
  onCreated,
}: {
  open: boolean
  customer?: CustomerDetail
  onClose: () => void
  onCreated?: (id: string) => void
}) {
  const { t, tm } = useTranslation()
  const organizations = useOrganizationOptions()
  const [createCustomer] = useCreateCustomerMutation()
  const [updateCustomer] = useUpdateCustomerMutation()
  const isEdit = Boolean(customer)
  const showOrganization = !isEdit && organizations.required
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: customerToFormValues(customer),
  })
  const type = form.watch('type')
  const organizationId = form.watch('organizationId')
  const branches = useBranchOptions({
    organizationId: organizationId || customer?.organizationId || undefined,
    enabled: open,
  })

  useEffect(() => {
    if (open) form.reset(customerToFormValues(customer))
  }, [open, customer, form])

  const onSubmit = form.handleSubmit(async (values) => {
    if (showOrganization && !values.organizationId) {
      form.setError('organizationId', { message: 'validation.selectRequired' })
      return
    }
    try {
      if (customer) {
        await updateCustomer({ id: customer.id, body: toCustomerUpdateBody(values) }).unwrap()
        onClose()
        return
      }
      const created = await createCustomer(toCustomerCreateBody(values)).unwrap()
      onClose()
      if (created.id) onCreated?.(created.id)
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
      size="wide"
      title={isEdit ? t('customers.edit.title') : t('customers.create.title')}
      description={
        customer
          ? t('customers.edit.description', { name: customer.displayName })
          : t('customers.create.description')
      }
      onClose={onClose}
    >
      <form className="grid gap-4" noValidate onSubmit={onSubmit}>
        {errors.root ? <Alert tone="danger">{tm(errors.root.message)}</Alert> : null}
        <div className="grid gap-4 lg:grid-cols-2">
          <fieldset className="border-line grid content-start gap-4 rounded-lg border p-4">
            <legend className="text-ink px-1 text-sm font-medium">{t('customers.form.identity')}</legend>
            {showOrganization ? (
              <Select
                label={t('customers.form.organization')}
                required
                options={[
                  { value: '', label: t('customers.form.selectOrganization') },
                  ...organizations.options,
                ]}
                error={tm(errors.organizationId?.message)}
                {...form.register('organizationId')}
              />
            ) : null}
            {isEdit ? (
              <Input
                label={t('customers.form.branch')}
                value={
                  customer
                    ? (branches.nameById.get(customer.branchId) ?? customer.branchId)
                    : ''
                }
                dir="ltr"
                readOnly
              />
            ) : branches.allowed ? (
              <Select
                label={t('customers.form.branch')}
                required
                options={[
                  { value: '', label: t('customers.form.selectBranch') },
                  ...branches.items.map((branch) => ({ value: branch.id, label: branch.name })),
                ]}
                error={tm(errors.branchId?.message)}
                {...form.register('branchId')}
              />
            ) : (
              <Input
                label={t('customers.form.branchId')}
                hint={t('customers.form.branchIdHint')}
                required
                dir="ltr"
                error={tm(errors.branchId?.message)}
                {...form.register('branchId')}
              />
            )}
            <Select
              label={t('customers.form.type')}
              required
              disabled={isEdit}
              options={[
                { value: 'individual', label: t('customers.types.individual') },
                { value: 'corporate', label: t('customers.types.corporate') },
              ]}
              {...form.register('type')}
            />
            <Input
              label={t('customers.form.displayName')}
              hint={t('customers.form.displayNameHint')}
              error={tm(errors.displayName?.message)}
              {...form.register('displayName')}
            />
          </fieldset>

          <fieldset className="border-line grid content-start gap-4 rounded-lg border p-4">
            <legend className="text-ink px-1 text-sm font-medium">
              {type === 'corporate' ? t('customers.form.company') : t('customers.form.person')}
            </legend>
            {type === 'individual' ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label={t('customers.form.firstName')}
                    required
                    error={tm(errors.firstName?.message)}
                    {...form.register('firstName')}
                  />
                  <Input
                    label={t('customers.form.middleName')}
                    error={tm(errors.middleName?.message)}
                    {...form.register('middleName')}
                  />
                </div>
                <Input
                  label={t('customers.form.lastName')}
                  required
                  error={tm(errors.lastName?.message)}
                  {...form.register('lastName')}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label={t('customers.form.dateOfBirth')}
                    type="date"
                    dir="ltr"
                    error={tm(errors.dateOfBirth?.message)}
                    {...form.register('dateOfBirth')}
                  />
                  <Input
                    label={t('customers.form.nationality')}
                    error={tm(errors.nationality?.message)}
                    {...form.register('nationality')}
                  />
                </div>
              </>
            ) : (
              <>
                <Input
                  label={t('customers.form.legalName')}
                  required
                  error={tm(errors.legalName?.message)}
                  {...form.register('legalName')}
                />
                <Input
                  label={t('customers.form.tradeName')}
                  error={tm(errors.tradeName?.message)}
                  {...form.register('tradeName')}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label={t('customers.form.registrationNumber')}
                    dir="ltr"
                    error={tm(errors.registrationNumber?.message)}
                    {...form.register('registrationNumber')}
                  />
                  <Input
                    label={t('customers.form.taxNumber')}
                    dir="ltr"
                    error={tm(errors.taxNumber?.message)}
                    {...form.register('taxNumber')}
                  />
                </div>
              </>
            )}
          </fieldset>
        </div>

        <fieldset className="border-line grid gap-4 rounded-lg border p-4">
          <legend className="text-ink px-1 text-sm font-medium">{t('customers.form.contact')}</legend>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label={t('common.email')}
              type="email"
              dir="ltr"
              autoComplete="email"
              error={tm(errors.email?.message)}
              {...form.register('email')}
            />
            <Input
              label={t('common.phone')}
              type="tel"
              dir="ltr"
              autoComplete="tel"
              error={tm(errors.phone?.message)}
              {...form.register('phone')}
            />
            <Input
              label={t('customers.form.alternatePhone')}
              type="tel"
              dir="ltr"
              error={tm(errors.alternatePhone?.message)}
              {...form.register('alternatePhone')}
            />
            <Input
              label={t('customers.form.line1')}
              error={tm(errors.line1?.message)}
              {...form.register('line1')}
            />
            <Input label={t('customers.form.city')} error={tm(errors.city?.message)} {...form.register('city')} />
            <Input
              label={t('customers.form.country')}
              dir="ltr"
              error={tm(errors.country?.message)}
              {...form.register('country')}
            />
          </div>
        </fieldset>

        <Textarea
          label={t('customers.form.notes')}
          error={tm(errors.notes?.message)}
          {...form.register('notes')}
        />

        <ModalActions>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? t('customers.edit.submit') : t('customers.create.submit')}
          </Button>
        </ModalActions>
      </form>
    </Modal>
  )
}
