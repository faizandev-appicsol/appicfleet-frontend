import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { API_MAX_PAGE_SIZE } from '@/config/constants'
import { useBranchOptions } from '@/features/branches/hooks/useBranchOptions'
import { useChargesOptions } from '@/features/charges/hooks/useChargesOptions'
import type { RefundWriteBody } from '@/features/charges/schemas/charges.schema'
import { useGetCustomersQuery } from '@/features/customers/api/customersApi'
import {
  useGetDepositsQuery,
  useGetPaymentsQuery,
} from '@/features/finance/api/financeApi'
import { useLegalEntityOptions } from '@/features/legal-entities/hooks/useLegalEntityOptions'
import { useTranslation } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (body: RefundWriteBody) => Promise<void>
}

export function RefundFormDialog({ open, onClose, onSubmit }: Props) {
  const { t, tm } = useTranslation()
  const options = useChargesOptions()
  const legalEntities = useLegalEntityOptions()
  const branches = useBranchOptions()
  const customersQuery = useGetCustomersQuery({ page: 1, pageSize: API_MAX_PAGE_SIZE })
  const customerOptions = (customersQuery.data?.items ?? []).map((item) => ({
    value: item.id,
    label: item.displayName,
  }))

  const [legalEntityId, setLegalEntityId] = useState('')
  const [branchId, setBranchId] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [sourceKind, setSourceKind] = useState('deposit')
  const [depositId, setDepositId] = useState('')
  const [paymentId, setPaymentId] = useState('')
  const [amount, setAmount] = useState('100.00')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const depositsQuery = useGetDepositsQuery(
    { page: 1, pageSize: API_MAX_PAGE_SIZE, customerId: customerId || undefined },
    { skip: !open || !customerId || sourceKind !== 'deposit' },
  )
  const paymentsQuery = useGetPaymentsQuery(
    { page: 1, pageSize: API_MAX_PAGE_SIZE, customerId: customerId || undefined },
    { skip: !open || !customerId || sourceKind !== 'payment' },
  )

  const depositOptions = useMemo(() => {
    const items = depositsQuery.data?.items ?? []
    return items
      .filter((d) => d.remainingAmount !== '0.00' && d.status !== 'released' && d.status !== 'cancelled')
      .map((d) => ({
        value: d.id,
        label: `${d.depositNumber} · ${d.currency} ${d.remainingAmount}`,
        remainingAmount: d.remainingAmount,
        legalEntityId: d.legalEntityId,
        branchId: d.branchId,
      }))
  }, [depositsQuery.data?.items])

  const paymentOptions = useMemo(() => {
    const items = paymentsQuery.data?.items ?? []
    return items.map((p) => ({
      value: p.id,
      label: `${p.paymentNumber ?? p.id.slice(-6)} · ${p.currency} ${p.amount}`,
      amount: p.amount,
      legalEntityId: p.legalEntityId,
      branchId: p.branchId,
    }))
  }, [paymentsQuery.data?.items])

  const onCustomerChange = (value: string) => {
    setCustomerId(value)
    setDepositId('')
    setPaymentId('')
  }

  const onSourceChange = (value: string) => {
    setSourceKind(value)
    setDepositId('')
    setPaymentId('')
  }

  const onDepositChange = (value: string) => {
    setDepositId(value)
    const selected = depositOptions.find((d) => d.value === value)
    if (selected) {
      setAmount(selected.remainingAmount)
      if (!legalEntityId) setLegalEntityId(selected.legalEntityId)
      if (!branchId) setBranchId(selected.branchId)
    }
  }

  const onPaymentChange = (value: string) => {
    setPaymentId(value)
    const selected = paymentOptions.find((p) => p.value === value)
    if (selected) {
      setAmount(selected.amount)
      if (!legalEntityId) setLegalEntityId(selected.legalEntityId)
      if (!branchId) setBranchId(selected.branchId)
    }
  }

  const submit = async () => {
    setError('')
    if (!legalEntityId || !branchId || !customerId || !amount || !reason) {
      setError(t('charges.form.required'))
      return
    }
    if (sourceKind === 'deposit' && !depositId) {
      setError(t('charges.form.depositRequired'))
      return
    }
    if (sourceKind === 'payment' && !paymentId) {
      setError(t('charges.form.paymentRequired'))
      return
    }
    setBusy(true)
    try {
      await onSubmit({
        legalEntityId,
        branchId,
        customerId,
        sourceKind,
        depositId: sourceKind === 'deposit' ? depositId : undefined,
        paymentId: sourceKind === 'payment' ? paymentId : undefined,
        amount,
        reason,
        notes: notes || undefined,
        idempotencyKey: `refund-${customerId}-${Date.now()}`,
      })
      onClose()
    } catch (err) {
      const normalized = normalizeApiError(err)
      const fieldMessage = normalized.fieldErrors
        ? Object.values(normalized.fieldErrors)[0]
        : undefined
      setError(fieldMessage ?? tm(normalized.message) ?? t('charges.form.saveFailed'))
    } finally {
      setBusy(false)
    }
  }

  const noneOption = { value: '', label: t('common.none') }

  return (
    <Modal open={open} onClose={onClose} title={t('charges.refunds.createTitle')}>
      <div className="grid gap-3 md:grid-cols-2">
        <Select
          label={t('charges.fields.legalEntity')}
          value={legalEntityId}
          onChange={(e) => setLegalEntityId(e.target.value)}
          options={[noneOption, ...legalEntities.options]}
          required
        />
        <Select
          label={t('charges.fields.branch')}
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          options={[
            noneOption,
            ...branches.items.map((b) => ({ value: b.id, label: b.name })),
          ]}
          required
        />
        <Select
          label={t('charges.fields.customer')}
          value={customerId}
          onChange={(e) => onCustomerChange(e.target.value)}
          options={[noneOption, ...customerOptions]}
          required
        />
        <Select
          label={t('charges.fields.sourceKind')}
          value={sourceKind}
          onChange={(e) => onSourceChange(e.target.value)}
          options={options.refundSourceOptions}
          required
        />
        {sourceKind === 'deposit' ? (
          <div className="md:col-span-2">
            <Select
              label={t('charges.fields.depositId')}
              value={depositId}
              onChange={(e) => onDepositChange(e.target.value)}
              options={[
                noneOption,
                ...depositOptions.map((d) => ({ value: d.value, label: d.label })),
              ]}
              required
              error={
                customerId && !depositsQuery.isLoading && depositOptions.length === 0
                  ? t('charges.form.noDeposits')
                  : undefined
              }
            />
          </div>
        ) : null}
        {sourceKind === 'payment' ? (
          <div className="md:col-span-2">
            <Select
              label={t('charges.fields.paymentId')}
              value={paymentId}
              onChange={(e) => onPaymentChange(e.target.value)}
              options={[
                noneOption,
                ...paymentOptions.map((p) => ({ value: p.value, label: p.label })),
              ]}
              required
              error={
                customerId && !paymentsQuery.isLoading && paymentOptions.length === 0
                  ? t('charges.form.noPayments')
                  : undefined
              }
            />
          </div>
        ) : null}
        <Input
          label={t('charges.fields.amount')}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          dir="ltr"
          required
        />
        <Input
          label={t('charges.fields.reason')}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
        <Textarea
          className="md:col-span-2"
          label={t('charges.fields.notes')}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      {error ? (
        <p className="text-danger mt-2 text-sm" role="alert">
          {error}
        </p>
      ) : null}
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
