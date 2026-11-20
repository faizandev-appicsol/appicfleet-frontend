import { BuildingIcon } from '@/components/ui/icons'
import { useTranslation } from '@/i18n'
import { cn } from '@/utils/cn'

const TONE: Record<string, string> = {
  company: 'bg-[#e8f0fe] text-[#1a56db]',
  investor: 'bg-[#f3e8ff] text-[#7c3aed]',
  borrowed: 'bg-[#f3e8ff] text-[#7c3aed]',
  leased: 'bg-[#fff4e5] text-[#c2410c]',
}

/** Compact ownership chip matching the Vehicle Register reference. */
export function VehicleOwnershipBadge({ ownershipType }: { ownershipType: string }) {
  const { t } = useTranslation()
  const labelKey =
    ownershipType === 'company'
      ? 'vehicles.ownershipBadge.owned'
      : ownershipType === 'leased'
        ? 'vehicles.ownershipBadge.finance'
        : ownershipType === 'borrowed'
          ? 'vehicles.ownershipBadge.borrowed'
          : ownershipType === 'investor'
            ? 'vehicles.ownershipBadge.investor'
            : `vehicles.ownershipType.${ownershipType}`

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
        TONE[ownershipType] ?? 'bg-control text-ink',
      )}
    >
      <BuildingIcon className="size-3.5 shrink-0" />
      {t(labelKey)}
    </span>
  )
}
