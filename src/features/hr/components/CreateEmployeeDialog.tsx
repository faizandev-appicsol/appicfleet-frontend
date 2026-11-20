import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useBranchOptions } from '@/features/branches/hooks/useBranchOptions'
import { useCreateEmployeeMutation } from '@/features/hr/api/hrApi'
import { useLegalEntityOptions } from '@/features/legal-entities/hooks/useLegalEntityOptions'
import { useTranslation } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'
import { applyApiFieldErrors } from '@/utils/forms'

type FormValues = {
  legalEntityId: string
  branchId: string
  firstName: string
  lastName: string
  workEmail: string
  jobTitle: string
}

export function CreateEmployeeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, tm } = useTranslation()
  const legalEntities = useLegalEntityOptions()
  const branches = useBranchOptions()
  const [createEmployee, state] = useCreateEmployeeMutation()
  const form = useForm<FormValues>({
    defaultValues: {
      legalEntityId: '',
      branchId: '',
      firstName: '',
      lastName: '',
      workEmail: '',
      jobTitle: '',
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createEmployee({
        legalEntityId: values.legalEntityId,
        branchId: values.branchId,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        workEmail: values.workEmail.trim() || undefined,
        employmentType: 'full_time',
      }).unwrap()
      form.reset()
      onClose()
    } catch (error) {
      const normalized = normalizeApiError(error)
      if (!applyApiFieldErrors(form.setError, normalized)) {
        form.setError('root', { message: normalized.message })
      }
    }
  })

  return (
    <Modal open={open} onClose={onClose} title={t('hr.employees.createTitle')} size="medium">
      <form className="grid gap-4" onSubmit={onSubmit} noValidate>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">{t('hr.fields.legalEntity')}</span>
          <select
            className="border-line rounded-md border px-3 py-2"
            {...form.register('legalEntityId', { required: true })}
          >
            <option value="">{t('common.none')}</option>
            {legalEntities.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">{t('hr.fields.branch')}</span>
          <select
            className="border-line rounded-md border px-3 py-2"
            {...form.register('branchId', { required: true })}
          >
            <option value="">{t('common.none')}</option>
            {branches.items.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="font-medium">{t('hr.fields.firstName')}</span>
            <input
              className="border-line rounded-md border px-3 py-2"
              {...form.register('firstName', { required: true })}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">{t('hr.fields.lastName')}</span>
            <input
              className="border-line rounded-md border px-3 py-2"
              {...form.register('lastName', { required: true })}
            />
          </label>
        </div>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">{t('hr.fields.workEmail')}</span>
          <input
            type="email"
            className="border-line rounded-md border px-3 py-2"
            {...form.register('workEmail')}
          />
        </label>
        {form.formState.errors.root ? (
          <p role="alert" className="text-danger text-sm">
            {tm(form.formState.errors.root.message)}
          </p>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={state.isLoading}>
            {t('hr.employees.create')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
