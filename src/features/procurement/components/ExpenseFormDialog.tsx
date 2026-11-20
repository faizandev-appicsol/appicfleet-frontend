import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { useBranchOptions } from '@/features/branches/hooks/useBranchOptions'
import { useLegalEntityOptions } from '@/features/legal-entities/hooks/useLegalEntityOptions'
import { API_MAX_PAGE_SIZE } from '@/config/constants'
import { useGetExpenseCategoriesQuery } from '@/features/procurement/api/procurementApi'
import type { ExpenseWriteBody } from '@/features/procurement/schemas/procurement.schema'
import { useGetVehiclesQuery } from '@/features/vehicles/api/vehiclesApi'
import { useTranslation } from '@/i18n'

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (body: ExpenseWriteBody) => Promise<void>
}

export function ExpenseFormDialog({ open, onClose, onSubmit }: Props) {
  const { t } = useTranslation()
  const legalEntities = useLegalEntityOptions()
  const branches = useBranchOptions()
  const vehiclesQuery = useGetVehiclesQuery({ page: 1, pageSize: API_MAX_PAGE_SIZE })
  const categoriesQuery = useGetExpenseCategoriesQuery()
  const categoryOptions = (categoriesQuery.data ?? []).map((item) => ({ value: item.code.toLowerCase(), label: item.name }))
  const branchOptions = branches.items.map((branch) => ({ value: branch.id, label: branch.name }))
  const vehicleOptions = [
    { value: '', label: t('common.none') },
    ...(vehiclesQuery.data?.items ?? []).map((item) => ({ value: item.id, label: item.plateNumber })),
  ]
  const [legalEntityId, setLegalEntityId] = useState('')
  const [branchId, setBranchId] = useState('')
  const [categoryCode, setCategoryCode] = useState('office')
  const [vehicleId, setVehicleId] = useState('')
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10))
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('100.00')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    setError('')
    if (!legalEntityId || !branchId || !description || !amount) {
      setError(t('procurement.form.required'))
      return
    }
    setBusy(true)
    try {
      await onSubmit({
        legalEntityId,
        branchId,
        categoryCode,
        vehicleId: vehicleId || undefined,
        expenseDate: new Date(`${expenseDate}T00:00:00.000Z`).toISOString(),
        description,
        amount,
        taxRatePercent: '5.00',
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
    <Modal open={open} onClose={onClose} title={t('procurement.expenses.createTitle')}>
      <div className="grid gap-3 md:grid-cols-2">
        <Select label={t('procurement.fields.legalEntity')} value={legalEntityId} onChange={(e) => setLegalEntityId(e.target.value)} options={legalEntities.options} />
        <Select label={t('procurement.fields.branch')} value={branchId} onChange={(e) => setBranchId(e.target.value)} options={branchOptions} />
        <Select label={t('procurement.fields.category')} value={categoryCode} onChange={(e) => setCategoryCode(e.target.value)} options={categoryOptions} />
        <Select label={t('procurement.fields.vehicle')} value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} options={vehicleOptions} />
        <Input label={t('procurement.fields.expenseDate')} type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} dir="ltr" />
        <Input label={t('procurement.fields.amount')} value={amount} onChange={(e) => setAmount(e.target.value)} dir="ltr" />
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
