import type { StatusOption } from '@/components/ui/StatusBadge'

/** Investor statuses are returned as lowercase public enums from the API. */
export const investorStatusOptions: readonly StatusOption[] = [
  { value: 'invited', label: 'Invited', tone: 'warning' },
  { value: 'active', label: 'Active', tone: 'success' },
  { value: 'suspended', label: 'Suspended', tone: 'danger' },
  { value: 'expired', label: 'Expired', tone: 'neutral' },
  { value: 'revoked', label: 'Revoked', tone: 'danger' },
]
