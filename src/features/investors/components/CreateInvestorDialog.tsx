import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useCreateInvestorMutation } from '@/features/investors/api/investorsApi'
import { useTranslation } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'
import { applyApiFieldErrors } from '@/utils/forms'

type FormValues = {
  displayName: string
  contactEmail: string
  phone: string
  legalName: string
}

export function CreateInvestorDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { t, tm } = useTranslation()
  const [createInvestor, state] = useCreateInvestorMutation()
  const form = useForm<FormValues>({
    defaultValues: { displayName: '', contactEmail: '', phone: '', legalName: '' },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createInvestor({
        displayName: values.displayName.trim(),
        contactEmail: values.contactEmail.trim(),
        phone: values.phone.trim() || undefined,
        legalName: values.legalName.trim() || undefined,
        scope: { reportKeys: [] },
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
    <Modal open={open} onClose={onClose} title={t('investors.createTitle')}>
      <form className="grid gap-4" onSubmit={onSubmit} noValidate>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">{t('common.name')}</span>
          <input
            className="border-line rounded-md border px-3 py-2"
            {...form.register('displayName', { required: true, minLength: 2 })}
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">{t('investors.legalName')}</span>
          <input className="border-line rounded-md border px-3 py-2" {...form.register('legalName')} />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">{t('common.email')}</span>
          <input
            type="email"
            className="border-line rounded-md border px-3 py-2"
            {...form.register('contactEmail', { required: true })}
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">{t('common.phone')}</span>
          <input className="border-line rounded-md border px-3 py-2" {...form.register('phone')} />
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
            {t('investors.create')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
