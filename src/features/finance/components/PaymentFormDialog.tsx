import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { API_MAX_PAGE_SIZE } from '@/config/constants'
import { useGetCustomersQuery } from '@/features/customers/api/customersApi'
import { useFinanceOptions } from '@/features/finance/hooks/useFinanceOptions'
import type { PaymentWriteBody } from '@/features/finance/schemas/finance.schema'
import { useTranslation } from '@/i18n'

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (body: PaymentWriteBody) => Promise<void>
  invoiceId?: string
}

export function PaymentFormDialog({ open, onClose, onSubmit, invoiceId }: Props) {
  const { t } = useTranslation()
  const options = useFinanceOptions()
  const customersQuery = useGetCustomersQuery({ page: 1, pageSize: API_MAX_PAGE_SIZE, status: 'active' })
  const customerOptions = (customersQuery.data?.items ?? []).map((item) => ({
    value: item.id,
    label: item.displayName,
  }))
  const [customerId, setCustomerId] = useState('')
  const [amount, setAmount] = useState('100.00')
  const [method, setMethod] = useState('card')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    setError('')
    if (!customerId) {
      setError(t('finance.form.required'))
      return
    }
    setBusy(true)
    try {
      await onSubmit({
        customerId,
        amount,
        method,
        currency: 'AED',
        paymentDate: new Date(`${paymentDate}T00:00:00.000Z`).toISOString(),
        notes: notes || undefined,
        idempotencyKey: `ui-${customerId}-${amount}-${paymentDate}-${Date.now()}`,
        allocations: invoiceId ? [{ invoiceId, amount }] : undefined,
      })
      onClose()
    } catch {
      setError(t('finance.form.saveFailed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t('finance.payments.createTitle')}>
      <div className="grid gap-3 md:grid-cols-2">
        <Select
          label={t('finance.fields.customer')}
          value={customerId}
          onChange={(event) => setCustomerId(event.target.value)}
          options={customerOptions}
        />
        <Select
          label={t('finance.fields.method')}
          value={method}
          onChange={(event) => setMethod(event.target.value)}
          options={options.methodOptions}
        />
        <Input label={t('finance.fields.amount')} value={amount} onChange={(event) => setAmount(event.target.value)} dir="ltr" />
        <Input
          label={t('finance.fields.paymentDate')}
          type="date"
          value={paymentDate}
          onChange={(event) => setPaymentDate(event.target.value)}
          dir="ltr"
        />
        <Textarea
          className="md:col-span-2"
          label={t('finance.fields.notes')}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
      <ModalActions>
        <Button variant="ghost" onClick={onClose} disabled={busy}>
          {t('common.cancel')}
        </Button>
        <Button onClick={submit} disabled={busy}>
          {busy ? t('common.updating') : t('common.save')}
        </Button>
      </ModalActions>
    </Modal>
  )
}
