import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { API_MAX_PAGE_SIZE } from '@/config/constants'
import { useBranchOptions } from '@/features/branches/hooks/useBranchOptions'
import { useChargesOptions } from '@/features/charges/hooks/useChargesOptions'
import type { TollWriteBody } from '@/features/charges/schemas/charges.schema'
import { useLegalEntityOptions } from '@/features/legal-entities/hooks/useLegalEntityOptions'
import { useGetVehiclesQuery } from '@/features/vehicles/api/vehiclesApi'
import { useTranslation } from '@/i18n'

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (body: TollWriteBody) => Promise<void>
}

export function TollFormDialog({ open, onClose, onSubmit }: Props) {
  const { t } = useTranslation()
  const options = useChargesOptions()
  const legalEntities = useLegalEntityOptions()
  const branches = useBranchOptions()
  const vehiclesQuery = useGetVehiclesQuery({ page: 1, pageSize: API_MAX_PAGE_SIZE })
  const vehicleOptions = (vehiclesQuery.data?.items ?? []).map((item) => ({
    value: item.id,
    label: item.plateNumber,
  }))
  const [legalEntityId, setLegalEntityId] = useState('')
  const [branchId, setBranchId] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [externalReference, setExternalReference] = useState('')
  const [provider, setProvider] = useState('salik')
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 10))
  const [eventTime, setEventTime] = useState('10:30')
  const [amount, setAmount] = useState('6.00')
  const [gate, setGate] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    setError('')
    if (!vehicleId || !externalReference || !amount) {
      setError(t('charges.form.required'))
      return
    }
    setBusy(true)
    try {
      await onSubmit({
        legalEntityId: legalEntityId || undefined,
        branchId: branchId || undefined,
        vehicleId,
        externalReference,
        provider,
        source: 'manual',
        eventAt: new Date(`${eventDate}T${eventTime}:00.000Z`).toISOString(),
        amount,
        gate: gate || undefined,
        location: location || undefined,
        description: description || undefined,
      })
      onClose()
    } catch {
      setError(t('charges.form.saveFailed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t('charges.tolls.createTitle')}>
      <div className="grid gap-3 md:grid-cols-2">
        <Select label={t('charges.fields.legalEntity')} value={legalEntityId} onChange={(e) => setLegalEntityId(e.target.value)} options={[{ value: '', label: t('common.optional') }, ...legalEntities.options]} />
        <Select label={t('charges.fields.branch')} value={branchId} onChange={(e) => setBranchId(e.target.value)} options={[{ value: '', label: t('common.optional') }, ...branches.items.map((b) => ({ value: b.id, label: b.name }))]} />
        <Select label={t('charges.fields.vehicle')} value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} options={[{ value: '', label: t('common.none') }, ...vehicleOptions]} />
        <Select label={t('charges.fields.provider')} value={provider} onChange={(e) => setProvider(e.target.value)} options={options.tollProviderOptions} />
        <Input label={t('charges.fields.externalReference')} value={externalReference} onChange={(e) => setExternalReference(e.target.value)} dir="ltr" />
        <Input label={t('charges.fields.amount')} value={amount} onChange={(e) => setAmount(e.target.value)} dir="ltr" />
        <Input label={t('charges.fields.eventDate')} type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} dir="ltr" />
        <Input label={t('charges.fields.eventTime')} type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} dir="ltr" />
        <Input label={t('charges.fields.gate')} value={gate} onChange={(e) => setGate(e.target.value)} />
        <Input label={t('charges.fields.location')} value={location} onChange={(e) => setLocation(e.target.value)} />
        <Textarea className="md:col-span-2" label={t('charges.fields.description')} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
      <ModalActions>
        <Button variant="ghost" onClick={onClose} disabled={busy}>{t('common.cancel')}</Button>
        <Button onClick={submit} disabled={busy}>{busy ? t('common.updating') : t('common.save')}</Button>
      </ModalActions>
    </Modal>
  )
}
