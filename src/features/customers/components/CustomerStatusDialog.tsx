import { useEffect, useState } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { useChangeCustomerStatusMutation } from '@/features/customers/api/customersApi'
import type { CustomerDetail } from '@/features/customers/schemas/customer.schema'
import { useTranslation } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'

export function CustomerStatusDialog({
  open,
  customer,
  canDeactivate,
  onClose,
}: {
  open: boolean
  customer: CustomerDetail
  canDeactivate: boolean
  onClose: () => void
}) {
  const { t, tm } = useTranslation()
  const [status, setStatus] = useState(customer.status)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string>()
  const [changeStatus, state] = useChangeCustomerStatusMutation()

  useEffect(() => {
    if (open) {
      setStatus(customer.status)
      setReason('')
      setError(undefined)
    }
  }, [open, customer.status])

  const options = [
    { value: 'active', label: t('customers.status.active') },
    ...(canDeactivate
      ? [
          { value: 'inactive', label: t('customers.status.inactive') },
          { value: 'suspended', label: t('customers.status.suspended') },
        ]
      : []),
  ]

  const onSubmit = async () => {
    setError(undefined)
    try {
      await changeStatus({
        id: customer.id,
        status,
        reason: reason.trim() || undefined,
      }).unwrap()
      onClose()
    } catch (caught) {
      setError(normalizeApiError(caught).message)
    }
  }

  return (
    <Modal
      open={open}
      size="medium"
      title={t('customers.statusForm.title')}
      description={t('customers.statusForm.description', { name: customer.displayName })}
      onClose={onClose}
    >
      <div className="grid gap-4">
        {error ? <Alert tone="danger">{tm(error)}</Alert> : null}
        <Select
          label={t('common.status')}
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          options={options}
        />
        <Textarea
          label={t('customers.statusForm.reason')}
          hint={t('customers.statusForm.reasonHint')}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
        <ModalActions>
          <Button type="button" variant="secondary" onClick={onClose} disabled={state.isLoading}>
            {t('common.cancel')}
          </Button>
          <Button type="button" loading={state.isLoading} onClick={() => void onSubmit()}>
            {t('customers.statusForm.submit')}
          </Button>
        </ModalActions>
      </div>
    </Modal>
  )
}
