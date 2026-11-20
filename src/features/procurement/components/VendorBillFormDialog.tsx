import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { API_MAX_PAGE_SIZE } from '@/config/constants'
import { useGetLposQuery, useGetVendorsQuery } from '@/features/procurement/api/procurementApi'
import type { VendorBillWriteBody } from '@/features/procurement/schemas/procurement.schema'
import { useTranslation } from '@/i18n'

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (body: VendorBillWriteBody) => Promise<void>
}

export function VendorBillFormDialog({ open, onClose, onSubmit }: Props) {
  const { t } = useTranslation()
  const vendorsQuery = useGetVendorsQuery({ page: 1, pageSize: API_MAX_PAGE_SIZE, status: 'active' })
  const lposQuery = useGetLposQuery({ page: 1, pageSize: API_MAX_PAGE_SIZE, status: 'approved' })
  const vendorOptions = (vendorsQuery.data?.items ?? []).map((item) => ({ value: item.id, label: `${item.vendorCode} — ${item.name}` }))
  const lpoOptions = [
    { value: '', label: t('common.none') },
    ...(lposQuery.data?.items ?? []).map((item) => ({
      value: item.id,
      label: item.documentNumber ?? item.id,
    })),
  ]
  const [vendorId, setVendorId] = useState('')
  const [lpoId, setLpoId] = useState('')
  const [vendorInvoiceNumber, setVendorInvoiceNumber] = useState('')
  const [billDate, setBillDate] = useState(new Date().toISOString().slice(0, 10))
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10))
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [unitPrice, setUnitPrice] = useState('100.00')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    setError('')
    if (!vendorId || !vendorInvoiceNumber || !description) {
      setError(t('procurement.form.required'))
      return
    }
    setBusy(true)
    try {
      await onSubmit({
        vendorId,
        vendorInvoiceNumber,
        lpoId: lpoId || undefined,
        billDate: new Date(`${billDate}T00:00:00.000Z`).toISOString(),
        dueDate: new Date(`${dueDate}T00:00:00.000Z`).toISOString(),
        notes: notes || undefined,
        lines: [{ description, quantity: Number(quantity), unitPrice, taxRatePercent: '5.00' }],
      })
      onClose()
    } catch {
      setError(t('procurement.form.saveFailed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t('procurement.vendorBills.createTitle')}>
      <div className="grid gap-3 md:grid-cols-2">
        <Select label={t('procurement.fields.vendor')} value={vendorId} onChange={(e) => setVendorId(e.target.value)} options={vendorOptions} />
        <Select label={t('procurement.fields.lpo')} value={lpoId} onChange={(e) => setLpoId(e.target.value)} options={lpoOptions} />
        <Input label={t('procurement.fields.vendorInvoiceNumber')} value={vendorInvoiceNumber} onChange={(e) => setVendorInvoiceNumber(e.target.value)} dir="ltr" />
        <Input label={t('procurement.fields.billDate')} type="date" value={billDate} onChange={(e) => setBillDate(e.target.value)} dir="ltr" />
        <Input label={t('procurement.fields.dueDate')} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} dir="ltr" />
        <Input className="md:col-span-2" label={t('procurement.fields.lineDescription')} value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input label={t('procurement.fields.quantity')} value={quantity} onChange={(e) => setQuantity(e.target.value)} dir="ltr" />
        <Input label={t('procurement.fields.unitPrice')} value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} dir="ltr" />
        <Textarea className="md:col-span-2" label={t('procurement.fields.notes')} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
      <ModalActions>
        <Button variant="ghost" onClick={onClose} disabled={busy}>{t('common.cancel')}</Button>
        <Button onClick={submit} disabled={busy}>{busy ? t('common.updating') : t('common.save')}</Button>
      </ModalActions>
    </Modal>
  )
}
