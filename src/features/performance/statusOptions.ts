import type { StatusOption } from '@/components/ui/StatusBadge'

export const cycleStatusOptions: readonly StatusOption[] = [
  { value: 'DRAFT', label: 'Draft', tone: 'neutral' },
  { value: 'CONFIGURING', label: 'Configuring', tone: 'warning' },
  { value: 'OPEN', label: 'Open', tone: 'brand' },
  { value: 'SELF_REVIEW', label: 'Self review', tone: 'brand' },
  { value: 'MANAGER_REVIEW', label: 'Manager review', tone: 'warning' },
  { value: 'PEER_REVIEW', label: 'Peer review', tone: 'warning' },
  { value: 'CALIBRATION', label: 'Calibration', tone: 'warning' },
  { value: 'FINALIZATION', label: 'Finalization', tone: 'brand' },
  { value: 'COMPLETED', label: 'Completed', tone: 'success' },
  { value: 'CANCELLED', label: 'Cancelled', tone: 'danger' },
]

export const reviewStatusOptions: readonly StatusOption[] = [
  { value: 'DRAFT', label: 'Draft', tone: 'neutral' },
  { value: 'SELF_REVIEW', label: 'Self review', tone: 'brand' },
  { value: 'MANAGER_REVIEW', label: 'Manager review', tone: 'warning' },
  { value: 'PEER_REVIEW', label: 'Peer review', tone: 'warning' },
  { value: 'CALIBRATION', label: 'Calibration', tone: 'warning' },
  { value: 'FINAL_REVIEW', label: 'Final review', tone: 'brand' },
  { value: 'APPROVED', label: 'Approved', tone: 'success' },
  { value: 'COMPLETED', label: 'Completed', tone: 'success' },
  { value: 'CANCELLED', label: 'Cancelled', tone: 'danger' },
]

export const goalStatusOptions: readonly StatusOption[] = [
  { value: 'DRAFT', label: 'Draft', tone: 'neutral' },
  { value: 'ACTIVE', label: 'Active', tone: 'brand' },
  { value: 'AT_RISK', label: 'At risk', tone: 'warning' },
  { value: 'COMPLETED', label: 'Completed', tone: 'success' },
  { value: 'CANCELLED', label: 'Cancelled', tone: 'danger' },
  { value: 'OVERDUE', label: 'Overdue', tone: 'danger' },
]

export const pipStatusOptions: readonly StatusOption[] = [
  { value: 'DRAFT', label: 'Draft', tone: 'neutral' },
  { value: 'ACTIVE', label: 'Active', tone: 'brand' },
  { value: 'ON_TRACK', label: 'On track', tone: 'success' },
  { value: 'AT_RISK', label: 'At risk', tone: 'warning' },
  { value: 'COMPLETED', label: 'Completed', tone: 'neutral' },
  { value: 'SUCCESSFUL', label: 'Successful', tone: 'success' },
  { value: 'UNSUCCESSFUL', label: 'Unsuccessful', tone: 'danger' },
  { value: 'CANCELLED', label: 'Cancelled', tone: 'danger' },
]
