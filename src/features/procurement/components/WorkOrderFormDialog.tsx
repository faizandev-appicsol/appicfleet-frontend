import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { API_MAX_PAGE_SIZE } from '@/config/constants'
import { useGetVendorsQuery } from '@/features/procurement/api/procurementApi'
import { useProcurementOptions } from '@/features/procurement/hooks/useProcurementOptions'
import type { WorkOrderWriteBody } from '@/features/procurement/schemas/procurement.schema'
import { useGetVehiclesQuery } from '@/features/vehicles/api/vehiclesApi'
import { useTranslation } from '@/i18n'

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (body: WorkOrderWriteBody) => Promise<void>
}

export function WorkOrderFormDialog({ open, onClose, onSubmit }: Props) {
  const { t } = useTranslation()
  const options = useProcurementOptions()
  const vehiclesQuery = useGetVehiclesQuery({ page: 1, pageSize: API_MAX_PAGE_SIZE })
  const vehicleOptions = (vehiclesQuery.data?.items ?? []).map((item) => ({ value: item.id, label: item.plateNumber }))
  const vendorsQuery = useGetVendorsQuery({ page: 1, pageSize: API_MAX_PAGE_SIZE, status: 'active' })
  const vendorOptions = [
    { value: '', label: t('common.none') },
    ...(vendorsQuery.data?.items ?? []).map((item) => ({ value: item.id, label: item.name })),
  ]
  const [vehicleId, setVehicleId] = useState('')
  const [vendorId, setVendorId] = useState('')
  const [serviceType, setServiceType] = useState('scheduled_maintenance')
  const [priority, setPriority] = useState('normal')
  const [description, setDescription] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('0.00')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    setError('')
    if (!vehicleId || !description) {
      setError(t('procurement.form.required'))
      return
    }
    setBusy(true)
    try {
      await onSubmit({
        vehicleId,
        vendorId: vendorId || undefined,
        serviceType,
        priority,
        description,
        estimatedCost,
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
    <Modal open={open} onClose={onClose} title={t('procurement.service.createTitle')}>
      <div className="grid gap-3 md:grid-cols-2">
        <Select label={t('procurement.fields.vehicle')} value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} options={vehicleOptions} />
        <Select label={t('procurement.fields.vendor')} value={vendorId} onChange={(e) => setVendorId(e.target.value)} options={vendorOptions} />
        <Select label={t('procurement.fields.serviceType')} value={serviceType} onChange={(e) => setServiceType(e.target.value)} options={options.serviceTypeOptions} />
        <Select label={t('procurement.fields.priority')} value={priority} onChange={(e) => setPriority(e.target.value)} options={options.priorityOptions} />
        <Input label={t('procurement.fields.estimatedCost')} value={estimatedCost} onChange={(e) => setEstimatedCost(e.target.value)} dir="ltr" />
        <Input className="md:col-span-2" label={t('procurement.fields.description')} value={description} onChange={(e) => setDescription(e.target.value)} />
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
