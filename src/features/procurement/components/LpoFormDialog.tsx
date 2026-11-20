import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { API_MAX_PAGE_SIZE } from '@/config/constants'
import { useGetVendorsQuery } from '@/features/procurement/api/procurementApi'
import { useProcurementOptions } from '@/features/procurement/hooks/useProcurementOptions'
import type { LpoWriteBody } from '@/features/procurement/schemas/procurement.schema'
import { useTranslation } from '@/i18n'

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (body: LpoWriteBody) => Promise<void>
}

export function LpoFormDialog({ open, onClose, onSubmit }: Props) {
  const { t } = useTranslation()
  const options = useProcurementOptions()
  const vendorsQuery = useGetVendorsQuery({ page: 1, pageSize: API_MAX_PAGE_SIZE, status: 'active' })
  const vendorOptions = (vendorsQuery.data?.items ?? []).map((item) => ({ value: item.id, label: `${item.vendorCode} — ${item.name}` }))
  const [vendorId, setVendorId] = useState('')
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10))
  const [paymentTerms, setPaymentTerms] = useState('net_30')
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [unitPrice, setUnitPrice] = useState('100.00')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    setError('')
    if (!vendorId || !description) {
      setError(t('procurement.form.required'))
      return
    }
    setBusy(true)
    try {
      await onSubmit({
        vendorId,
        orderDate: new Date(`${orderDate}T00:00:00.000Z`).toISOString(),
        paymentTerms,
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
    <Modal open={open} onClose={onClose} title={t('procurement.lpos.createTitle')}>
      <div className="grid gap-3 md:grid-cols-2">
        <Select label={t('procurement.fields.vendor')} value={vendorId} onChange={(e) => setVendorId(e.target.value)} options={vendorOptions} />
        <Input label={t('procurement.fields.orderDate')} type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} dir="ltr" />
        <Select label={t('procurement.fields.paymentTerms')} value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} options={options.paymentTermsOptions} />
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
