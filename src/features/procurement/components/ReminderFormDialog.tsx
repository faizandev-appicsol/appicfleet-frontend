import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { API_MAX_PAGE_SIZE } from '@/config/constants'
import { useProcurementOptions } from '@/features/procurement/hooks/useProcurementOptions'
import type { ReminderWriteBody } from '@/features/procurement/schemas/procurement.schema'
import { useGetVehiclesQuery } from '@/features/vehicles/api/vehiclesApi'
import { useTranslation } from '@/i18n'

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (body: ReminderWriteBody) => Promise<void>
}

export function ReminderFormDialog({ open, onClose, onSubmit }: Props) {
  const { t } = useTranslation()
  const options = useProcurementOptions()
  const vehiclesQuery = useGetVehiclesQuery({ page: 1, pageSize: API_MAX_PAGE_SIZE })
  const vehicleOptions = (vehiclesQuery.data?.items ?? []).map((item) => ({ value: item.id, label: item.plateNumber }))
  const [vehicleId, setVehicleId] = useState('')
  const [serviceType, setServiceType] = useState('oil_change')
  const [basis, setBasis] = useState('date')
  const [dueAt, setDueAt] = useState(new Date().toISOString().slice(0, 10))
  const [dueMileage, setDueMileage] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    setError('')
    if (!vehicleId) {
      setError(t('procurement.form.required'))
      return
    }
    setBusy(true)
    try {
      await onSubmit({
        vehicleId,
        serviceType,
        basis,
        dueAt: basis === 'date' ? new Date(`${dueAt}T00:00:00.000Z`).toISOString() : undefined,
        dueMileage: basis === 'mileage' && dueMileage ? Number(dueMileage) : undefined,
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
    <Modal open={open} onClose={onClose} title={t('procurement.reminders.createTitle')}>
      <div className="grid gap-3 md:grid-cols-2">
        <Select label={t('procurement.fields.vehicle')} value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} options={vehicleOptions} />
        <Select label={t('procurement.fields.serviceType')} value={serviceType} onChange={(e) => setServiceType(e.target.value)} options={options.serviceTypeOptions} />
        <Select label={t('procurement.fields.basis')} value={basis} onChange={(e) => setBasis(e.target.value)} options={options.reminderBasisOptions} />
        {basis === 'date' ? (
          <Input label={t('procurement.fields.dueAt')} type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} dir="ltr" />
        ) : (
          <Input label={t('procurement.fields.dueMileage')} value={dueMileage} onChange={(e) => setDueMileage(e.target.value)} dir="ltr" />
        )}
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
