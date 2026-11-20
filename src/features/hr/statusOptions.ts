import type { StatusOption } from '@/components/ui/StatusBadge'

export const employmentStatusOptions: readonly StatusOption[] = [
  { value: 'active', label: 'Active', tone: 'success' },
  { value: 'on_leave', label: 'On leave', tone: 'warning' },
  { value: 'suspended', label: 'Suspended', tone: 'danger' },
  { value: 'terminated', label: 'Terminated', tone: 'danger' },
  { value: 'resigned', label: 'Resigned', tone: 'neutral' },
  { value: 'retired', label: 'Retired', tone: 'neutral' },
]

export const hrEntityStatusOptions: readonly StatusOption[] = [
  { value: 'active', label: 'Active', tone: 'success' },
  { value: 'inactive', label: 'Inactive', tone: 'neutral' },
]

export const hrDocumentStatusOptions: readonly StatusOption[] = [
  { value: 'valid', label: 'Valid', tone: 'success' },
  { value: 'expiring_soon', label: 'Expiring soon', tone: 'warning' },
  { value: 'expired', label: 'Expired', tone: 'danger' },
  { value: 'archived', label: 'Archived', tone: 'neutral' },
]
