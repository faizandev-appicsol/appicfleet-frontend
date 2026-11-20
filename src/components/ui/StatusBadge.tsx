import { Badge, type BadgeTone } from '@/components/ui/Badge'

export type StatusOption = {
  value: string
  label: string
  tone?: BadgeTone
}

export function StatusBadge({
  value,
  options,
}: {
  value: string
  options: readonly StatusOption[]
}) {
  const option = options.find((entry) => entry.value === value)
  return <Badge tone={option?.tone ?? 'neutral'}>{option?.label ?? value}</Badge>
}

/** Example status presets for future modules — not business-hardcoded into Badge itself. */
export const defaultOperationalStatuses: readonly StatusOption[] = [
  { value: 'active', label: 'Active', tone: 'success' },
  { value: 'inactive', label: 'Inactive', tone: 'neutral' },
  { value: 'pending', label: 'Pending', tone: 'warning' },
  { value: 'draft', label: 'Draft', tone: 'neutral' },
  { value: 'approved', label: 'Approved', tone: 'success' },
  { value: 'rejected', label: 'Rejected', tone: 'danger' },
  { value: 'completed', label: 'Completed', tone: 'brand' },
  { value: 'cancelled', label: 'Cancelled', tone: 'danger' },
]
