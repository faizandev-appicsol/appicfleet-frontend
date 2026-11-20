import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { useBranchOptions } from '@/features/branches/hooks/useBranchOptions'
import { useLegalEntityOptions } from '@/features/legal-entities/hooks/useLegalEntityOptions'
import { useProcurementOptions } from '@/features/procurement/hooks/useProcurementOptions'
import type { VendorWriteBody } from '@/features/procurement/schemas/procurement.schema'
import { useTranslation } from '@/i18n'

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (body: VendorWriteBody) => Promise<void>
}

export function VendorFormDialog({ open, onClose, onSubmit }: Props) {
  const { t } = useTranslation()
  const options = useProcurementOptions()
  const legalEntities = useLegalEntityOptions()
  const branches = useBranchOptions()
  const branchOptions = branches.items.map((branch) => ({ value: branch.id, label: branch.name }))
  const [legalEntityId, setLegalEntityId] = useState('')
  const [branchId, setBranchId] = useState('')
  const [name, setName] = useState('')
  const [vendorType, setVendorType] = useState('general')
  const [paymentTerms, setPaymentTerms] = useState('net_30')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    setError('')
    if (!legalEntityId || !branchId || !name) {
      setError(t('procurement.form.required'))
      return
    }
    setBusy(true)
    try {
      await onSubmit({
        legalEntityId,
        branchId,
        name,
        vendorType,
        paymentTerms,
        phone: phone || undefined,
        email: email || undefined,
        notes: notes || undefined,
      })
      onClose()
    } catch {
      setError(t('procurement.form.saveFailed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t('procurement.vendors.createTitle')}>
      <div className="grid gap-3 md:grid-cols-2">
        <Select label={t('procurement.fields.legalEntity')} value={legalEntityId} onChange={(e) => setLegalEntityId(e.target.value)} options={legalEntities.options} />
        <Select label={t('procurement.fields.branch')} value={branchId} onChange={(e) => setBranchId(e.target.value)} options={branchOptions} />
        <Input className="md:col-span-2" label={t('common.name')} value={name} onChange={(e) => setName(e.target.value)} />
        <Select label={t('procurement.fields.vendorType')} value={vendorType} onChange={(e) => setVendorType(e.target.value)} options={options.vendorTypeOptions} />
        <Select label={t('procurement.fields.paymentTerms')} value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} options={options.paymentTermsOptions} />
        <Input label={t('common.phone')} value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
        <Input label={t('common.email')} value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
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
