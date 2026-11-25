import { useState } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { useDeleteCustomerMutation } from '@/features/customers/api/customersApi'
import { useTranslation } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'

export function DeleteCustomerDialog({
  open,
  customerId,
  customerName,
  onClose,
}: {
  open: boolean
  customerId: string
  customerName: string
  onClose: () => void
}) {
  const { t, tm } = useTranslation()
  const [deleteCustomer] = useDeleteCustomerMutation()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onConfirm = async () => {
    setError(null)
    setSubmitting(true)
    try {
      await deleteCustomer(customerId).unwrap()
      onClose()
    } catch (caught) {
      setError(normalizeApiError(caught).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      title={t('customers.delete.title')}
      description={t('customers.delete.description', { name: customerName })}
      onClose={onClose}
    >
      <div className="grid gap-4">
        {error ? <Alert tone="danger">{tm(error)}</Alert> : null}
        <ModalActions>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            {t('common.cancel')}
          </Button>
          <Button type="button" variant="danger" loading={submitting} onClick={() => void onConfirm()}>
            {t('customers.delete.submit')}
          </Button>
        </ModalActions>
      </div>
    </Modal>
  )
}
