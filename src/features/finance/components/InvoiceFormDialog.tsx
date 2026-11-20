import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { API_MAX_PAGE_SIZE } from '@/config/constants'
import { useGetCustomersQuery } from '@/features/customers/api/customersApi'
import type { InvoiceWriteBody } from '@/features/finance/schemas/finance.schema'
import { useTranslation } from '@/i18n'

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (body: InvoiceWriteBody) => Promise<void>
}

export function InvoiceFormDialog({ open, onClose, onSubmit }: Props) {
  const { t } = useTranslation()
  const customersQuery = useGetCustomersQuery({ page: 1, pageSize: API_MAX_PAGE_SIZE, status: 'active' })
  const customerOptions = (customersQuery.data?.items ?? []).map((item) => ({
    value: item.id,
    label: item.displayName,
  }))
  const [customerId, setCustomerId] = useState('')
  const [currency, setCurrency] = useState('AED')
  const [documentDate, setDocumentDate] = useState(new Date().toISOString().slice(0, 10))
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [unitPrice, setUnitPrice] = useState('100.00')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    setError('')
    if (!customerId || !description) {
      setError(t('finance.form.required'))
      return
    }
    setBusy(true)
    try {
      await onSubmit({
        customerId,
        currency,
        documentDate: new Date(`${documentDate}T00:00:00.000Z`).toISOString(),
        dueDate: new Date(`${dueDate}T00:00:00.000Z`).toISOString(),
        notes: notes || undefined,
        lines: [{ description, quantity: Number(quantity), unitPrice, taxRatePercent: '5.00' }],
      })
      onClose()
    } catch {
      setError(t('finance.form.saveFailed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t('finance.invoices.createTitle')}>
      <div className="grid gap-3 md:grid-cols-2">
        <Select
          label={t('finance.fields.customer')}
          value={customerId}
          onChange={(event) => setCustomerId(event.target.value)}
          options={customerOptions}
        />
        <Input label={t('finance.fields.currency')} value={currency} onChange={(event) => setCurrency(event.target.value)} dir="ltr" />
        <Input
          label={t('finance.fields.documentDate')}
          type="date"
          value={documentDate}
          onChange={(event) => setDocumentDate(event.target.value)}
          dir="ltr"
        />
        <Input label={t('finance.fields.dueDate')} type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} dir="ltr" />
        <Input
          className="md:col-span-2"
          label={t('finance.fields.lineDescription')}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <Input label={t('finance.fields.quantity')} value={quantity} onChange={(event) => setQuantity(event.target.value)} dir="ltr" />
        <Input label={t('finance.fields.unitPrice')} value={unitPrice} onChange={(event) => setUnitPrice(event.target.value)} dir="ltr" />
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
