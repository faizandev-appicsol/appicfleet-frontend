import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { appConfig } from '@/config/app.config'
import { useCreateJournalMutation, useGetAccountTreeQuery } from '@/features/accounting/api/accountingApi'
import { useBranchOptions } from '@/features/branches/hooks/useBranchOptions'
import { useLegalEntityOptions } from '@/features/legal-entities/hooks/useLegalEntityOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

type Line = { accountId: string; debit: string; credit: string; description: string }

function toCents(value: string): bigint {
  const normalized = /^\d+(\.\d{0,2})?$/.test(value) ? value : '0'
  const [w = '0', f = ''] = normalized.split('.')
  return BigInt(w.replace(/^0+(?=\d)/, '') || '0') * 100n + BigInt(f.padEnd(2, '0').slice(0, 2) || '0')
}

function fromCents(cents: bigint): string {
  return `${cents / 100n}.${(cents % 100n).toString().padStart(2, '0')}`
}

export function JournalFormPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('accounting.journals.createTitle'))
  const navigate = useNavigate()
  const legalEntities = useLegalEntityOptions()
  const branches = useBranchOptions()
  const accountsQuery = useGetAccountTreeQuery()
  const [createJournal] = useCreateJournalMutation()
  const [legalEntityId, setLegalEntityId] = useState('')
  const [branchId, setBranchId] = useState('')
  const [journalType, setJournalType] = useState('general')
  const [accountingDate, setAccountingDate] = useState(new Date().toISOString().slice(0, 10))
  const [description, setDescription] = useState('')
  const [lines, setLines] = useState<Line[]>([
    { accountId: '', debit: '0.00', credit: '0.00', description: '' },
    { accountId: '', debit: '0.00', credit: '0.00', description: '' },
  ])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const accountOptions = (accountsQuery.data ?? [])
    .filter((row) => row.isActive)
    .map((row) => ({ value: row.id, label: `${row.code} — ${row.name}` }))

  const totals = useMemo(() => {
    const debit = lines.reduce((sum, line) => sum + toCents(line.debit || '0'), 0n)
    const credit = lines.reduce((sum, line) => sum + toCents(line.credit || '0'), 0n)
    const diff = debit >= credit ? debit - credit : credit - debit
    return { debit: fromCents(debit), credit: fromCents(credit), difference: fromCents(diff), balanced: debit === credit && debit > 0n }
  }, [lines])

  const updateLine = (index: number, patch: Partial<Line>) => {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)))
  }

  const submit = async () => {
    setError('')
    if (!legalEntityId || !branchId || !description || !totals.balanced) {
      setError(t('accounting.form.unbalanced'))
      return
    }
    setBusy(true)
    try {
      const created = await createJournal({
        legalEntityId,
        branchId,
        journalType,
        accountingDate: new Date(`${accountingDate}T00:00:00.000Z`).toISOString(),
        description,
        lines: lines.map((line) => ({
          accountId: line.accountId,
          debit: line.debit || '0.00',
          credit: line.credit || '0.00',
          description: line.description || undefined,
        })),
      }).unwrap()
      navigate(`${appConfig.routes.accountingJournals}/${created.id}`)
    } catch {
      setError(t('accounting.form.saveFailed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('accounting.journals.createTitle')} description={t('accounting.journals.description')} action={<Link to={appConfig.routes.accountingJournals} className="text-brand text-sm font-medium">{t('common.back')}</Link>} />
      <div className="grid gap-3 md:grid-cols-2">
        <Select
          label={t('accounting.fields.legalEntity')}
          value={legalEntityId}
          onChange={(e) => setLegalEntityId(e.target.value)}
          options={[{ value: '', label: t('common.none') }, ...legalEntities.options]}
        />
        <Select
          label={t('accounting.fields.branch')}
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          options={[
            { value: '', label: t('common.none') },
            ...branches.items.map((b) => ({ value: b.id, label: b.name })),
          ]}
        />
        <Select
          label={t('accounting.fields.journalType')}
          value={journalType}
          onChange={(e) => setJournalType(e.target.value)}
          options={[
            { value: 'general', label: t('accounting.journalTypes.general') },
            { value: 'adjustment', label: t('accounting.journalTypes.adjustment') },
            { value: 'opening_balance', label: t('accounting.journalTypes.openingBalance') },
          ]}
        />
        <Input
          label={t('accounting.fields.accountingDate')}
          type="date"
          value={accountingDate}
          onChange={(e) => setAccountingDate(e.target.value)}
          dir="ltr"
        />
        <div className="md:col-span-2">
          <Input
            label={t('accounting.fields.description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-3">
        {lines.map((line, index) => (
          <div key={index} className="grid gap-2 md:grid-cols-4">
            <Select label={t('accounting.fields.account')} value={line.accountId} onChange={(e) => updateLine(index, { accountId: e.target.value })} options={[{ value: '', label: t('common.none') }, ...accountOptions]} />
            <Input label={t('accounting.fields.debit')} value={line.debit} onChange={(e) => updateLine(index, { debit: e.target.value, credit: '0.00' })} dir="ltr" />
            <Input label={t('accounting.fields.credit')} value={line.credit} onChange={(e) => updateLine(index, { credit: e.target.value, debit: '0.00' })} dir="ltr" />
            <Input label={t('accounting.fields.lineDescription')} value={line.description} onChange={(e) => updateLine(index, { description: e.target.value })} />
          </div>
        ))}
        <Button variant="ghost" onClick={() => setLines((prev) => [...prev, { accountId: '', debit: '0.00', credit: '0.00', description: '' }])}>{t('accounting.journals.addLine')}</Button>
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        <p dir="ltr">{t('accounting.fields.totalDebit')}: {totals.debit}</p>
        <p dir="ltr">{t('accounting.fields.totalCredit')}: {totals.credit}</p>
        <p dir="ltr">{t('accounting.fields.difference')}: {totals.difference}</p>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button disabled={busy || !totals.balanced} onClick={submit}>{busy ? t('common.updating') : t('common.save')}</Button>
    </div>
  )
}
