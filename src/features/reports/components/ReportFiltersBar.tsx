import { Select, Input } from '@/components/ui/Input'
import { useBranchOptions } from '@/features/branches/hooks/useBranchOptions'
import { useLegalEntityOptions } from '@/features/legal-entities/hooks/useLegalEntityOptions'
import { useTranslation } from '@/i18n'

type Props = {
  preset: string
  onPresetChange: (value: string) => void
  presets: readonly string[]
  from: string
  to: string
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  branchId: string
  onBranchChange: (value: string) => void
  legalEntityId: string
  onLegalEntityChange: (value: string) => void
  status?: string
  onStatusChange?: (value: string) => void
  statusOptions?: Array<{ value: string; label: string }>
  showStatus?: boolean
}

export function ReportFiltersBar({
  preset,
  onPresetChange,
  presets,
  from,
  to,
  onFromChange,
  onToChange,
  branchId,
  onBranchChange,
  legalEntityId,
  onLegalEntityChange,
  status = '',
  onStatusChange,
  statusOptions = [],
  showStatus = false,
}: Props) {
  const { t } = useTranslation()
  const branches = useBranchOptions()
  const legalEntities = useLegalEntityOptions()

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <Select
        label={t('reports.filters.datePreset')}
        value={preset}
        onChange={(event) => onPresetChange(event.target.value)}
        options={presets.map((value) => ({
          value,
          label: t(`reports.presets.${value}` as never),
        }))}
      />
      {preset === 'custom' ? (
        <>
          <Input
            label={t('reports.filters.from')}
            type="datetime-local"
            value={from}
            onChange={(event) => onFromChange(event.target.value)}
          />
          <Input
            label={t('reports.filters.to')}
            type="datetime-local"
            value={to}
            onChange={(event) => onToChange(event.target.value)}
          />
        </>
      ) : null}
      <Select
        label={t('reports.filters.legalEntity')}
        value={legalEntityId}
        onChange={(event) => onLegalEntityChange(event.target.value)}
        options={[{ value: '', label: t('common.all') }, ...(legalEntities.options ?? [])]}
      />
      <Select
        label={t('reports.filters.branch')}
        value={branchId}
        onChange={(event) => onBranchChange(event.target.value)}
        options={[
          { value: '', label: t('common.all') },
          ...(branches.items ?? []).map((item) => ({ value: item.id, label: item.name })),
        ]}
      />
      {showStatus && onStatusChange ? (
        <Select
          label={t('common.status')}
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          options={[{ value: '', label: t('common.all') }, ...statusOptions]}
        />
      ) : null}
    </div>
  )
}
