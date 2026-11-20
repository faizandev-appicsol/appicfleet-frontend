import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useBranchOptions } from '@/features/branches/hooks/useBranchOptions'
import { useLegalEntityOptions } from '@/features/legal-entities/hooks/useLegalEntityOptions'
import { useReplaceInvestorAccessMutation } from '@/features/investors/api/investorsApi'
import {
  INVESTOR_REPORT_OPTIONS,
  type Investor,
} from '@/features/investors/schemas/investor.schema'
import { useTranslation } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'

function toggle(list: string[], id: string) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id]
}

export function InvestorAccessDialog({
  open,
  onClose,
  investor,
}: {
  open: boolean
  onClose: () => void
  investor?: Investor
}) {
  const { t } = useTranslation()
  const legalEntities = useLegalEntityOptions()
  const branches = useBranchOptions()
  const [replaceAccess, state] = useReplaceInvestorAccessMutation()
  const [legalEntityIds, setLegalEntityIds] = useState<string[]>([])
  const [branchIds, setBranchIds] = useState<string[]>([])
  const [reportKeys, setReportKeys] = useState<string[]>([])
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    if (!investor) return
    setLegalEntityIds(investor.scope.legalEntityIds)
    setBranchIds(investor.scope.branchIds)
    setReportKeys(investor.scope.reportKeys)
    setReason('')
    setError(undefined)
  }, [investor, open])

  if (!investor) return null

  async function onSave() {
    try {
      await replaceAccess({
        id: investor!.id,
        body: { legalEntityIds, branchIds, reportKeys, reason: reason || undefined },
      }).unwrap()
      onClose()
    } catch (err) {
      setError(normalizeApiError(err).message)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t('investors.accessTitle')} size="wide">
      <div className="grid gap-4">
        <p className="text-muted text-sm">
          {t('investors.accessPreview', {
            legalEntities: legalEntityIds.length,
            branches: branchIds.length,
            vehicles: investor.scope.vehicleIds.length,
            reports: reportKeys.length,
          })}
        </p>
        <fieldset className="grid gap-2">
          <legend className="text-ink text-sm font-medium">{t('investors.legalEntities')}</legend>
          {legalEntities.options.map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={legalEntityIds.includes(option.value)}
                onChange={() => setLegalEntityIds((prev) => toggle(prev, option.value))}
              />
              {option.label}
            </label>
          ))}
        </fieldset>
        <fieldset className="grid gap-2">
          <legend className="text-ink text-sm font-medium">{t('investors.branches')}</legend>
          {branches.items.map((branch) => (
            <label key={branch.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={branchIds.includes(branch.id)}
                onChange={() => setBranchIds((prev) => toggle(prev, branch.id))}
              />
              {branch.name}
            </label>
          ))}
        </fieldset>
        <fieldset className="grid gap-2">
          <legend className="text-ink text-sm font-medium">{t('investors.reports')}</legend>
          {INVESTOR_REPORT_OPTIONS.map((key) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={reportKeys.includes(key)}
                onChange={() => setReportKeys((prev) => toggle(prev, key))}
              />
              {key}
            </label>
          ))}
        </fieldset>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">{t('investors.reason')}</span>
          <input
            className="border-line rounded-md border px-3 py-2"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </label>
        {error ? (
          <p role="alert" className="text-danger text-sm">
            {error}
          </p>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="button" loading={state.isLoading} onClick={() => void onSave()}>
            {t('common.saveChanges')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
