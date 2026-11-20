import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { useBranchOptions } from '@/features/branches/hooks/useBranchOptions'
import { useChargesOptions } from '@/features/charges/hooks/useChargesOptions'
import type { ImportWriteBody } from '@/features/charges/schemas/charges.schema'
import { useLegalEntityOptions } from '@/features/legal-entities/hooks/useLegalEntityOptions'
import { useTranslation } from '@/i18n'

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (body: ImportWriteBody) => Promise<void>
}

function parseCsv(text: string): ImportWriteBody['rows'] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length < 2) return []
  const headers = lines[0]!.split(',').map((h) => h.trim().toLowerCase())
  return lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim())
    const get = (name: string) => {
      const index = headers.indexOf(name)
      return index >= 0 ? cols[index] : undefined
    }
    const date = get('event date') ?? get('eventdate') ?? ''
    const time = get('event time') ?? get('eventtime') ?? '00:00'
    const eventAt = date.includes('T')
      ? date
      : new Date(`${date}T${time.length === 5 ? `${time}:00` : time}.000Z`).toISOString()
    return {
      externalReference: get('external reference') ?? get('externalreference') ?? '',
      vehicleRegistration: get('vehicle registration') ?? get('vehicleregistration'),
      eventAt,
      amount: get('amount') ?? '0.00',
      currency: get('currency') ?? 'AED',
      type: get('type'),
      provider: get('provider'),
      location: get('location'),
      description: get('description'),
      gate: get('gate'),
    }
  })
}

export function ImportFormDialog({ open, onClose, onSubmit }: Props) {
  const { t } = useTranslation()
  const options = useChargesOptions()
  const legalEntities = useLegalEntityOptions()
  const branches = useBranchOptions()
  const [legalEntityId, setLegalEntityId] = useState('')
  const [branchId, setBranchId] = useState('')
  const [kind, setKind] = useState('toll')
  const [provider, setProvider] = useState('salik')
  const [fileName, setFileName] = useState('import.csv')
  const [csvText, setCsvText] = useState(
    'External Reference,Vehicle Registration,Event Date,Event Time,Amount,Currency,Type,Provider,Location,Description\nSALIK-1001,ABC-123,2026-01-07,10:30,6.00,AED,,salik,Gate A,Salik charge',
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    setError('')
    const rows = parseCsv(csvText)
    if (!legalEntityId || !branchId || rows.length === 0) {
      setError(t('charges.form.required'))
      return
    }
    setBusy(true)
    try {
      await onSubmit({
        legalEntityId,
        branchId,
        kind,
        provider: kind === 'toll' ? provider : provider || 'RTA',
        fileName,
        rows,
      })
      onClose()
    } catch {
      setError(t('charges.form.saveFailed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t('charges.import.createTitle')}>
      <div className="grid gap-3 md:grid-cols-2">
        <Select label={t('charges.fields.legalEntity')} value={legalEntityId} onChange={(e) => setLegalEntityId(e.target.value)} options={legalEntities.options} />
        <Select label={t('charges.fields.branch')} value={branchId} onChange={(e) => setBranchId(e.target.value)} options={branches.items.map((b) => ({ value: b.id, label: b.name }))} />
        <Select
          label={t('charges.fields.kind')}
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          options={[
            { value: 'fine', label: t('charges.kinds.fine') },
            { value: 'toll', label: t('charges.kinds.toll') },
          ]}
        />
        {kind === 'toll' ? (
          <Select label={t('charges.fields.provider')} value={provider} onChange={(e) => setProvider(e.target.value)} options={options.tollProviderOptions} />
        ) : (
          <Input label={t('charges.fields.provider')} value={provider} onChange={(e) => setProvider(e.target.value)} dir="ltr" />
        )}
        <Input className="md:col-span-2" label={t('charges.fields.fileName')} value={fileName} onChange={(e) => setFileName(e.target.value)} dir="ltr" />
        <Textarea className="md:col-span-2" label={t('charges.fields.csv')} value={csvText} onChange={(e) => setCsvText(e.target.value)} rows={8} dir="ltr" />
      </div>
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
      <ModalActions>
        <Button variant="ghost" onClick={onClose} disabled={busy}>{t('common.cancel')}</Button>
        <Button onClick={submit} disabled={busy}>{busy ? t('common.updating') : t('charges.import.process')}</Button>
      </ModalActions>
    </Modal>
  )
}
