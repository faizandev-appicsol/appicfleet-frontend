import type { StatusOption } from '@/components/ui/StatusBadge'

export const requisitionStatusOptions: readonly StatusOption[] = [
  { value: 'DRAFT', label: 'Draft', tone: 'neutral' },
  { value: 'PENDING_APPROVAL', label: 'Pending approval', tone: 'warning' },
  { value: 'APPROVED', label: 'Approved', tone: 'success' },
  { value: 'OPEN', label: 'Open', tone: 'brand' },
  { value: 'ON_HOLD', label: 'On hold', tone: 'warning' },
  { value: 'FILLED', label: 'Filled', tone: 'success' },
  { value: 'CANCELLED', label: 'Cancelled', tone: 'danger' },
  { value: 'CLOSED', label: 'Closed', tone: 'neutral' },
]

export const postingStatusOptions: readonly StatusOption[] = [
  { value: 'DRAFT', label: 'Draft', tone: 'neutral' },
  { value: 'PUBLISHED', label: 'Published', tone: 'success' },
  { value: 'PAUSED', label: 'Paused', tone: 'warning' },
  { value: 'CLOSED', label: 'Closed', tone: 'neutral' },
]

export const candidateStatusOptions: readonly StatusOption[] = [
  { value: 'ACTIVE', label: 'Active', tone: 'success' },
  { value: 'HIRED', label: 'Hired', tone: 'brand' },
  { value: 'ARCHIVED', label: 'Archived', tone: 'neutral' },
  { value: 'BLACKLISTED', label: 'Blacklisted', tone: 'danger' },
]

export const interviewStatusOptions: readonly StatusOption[] = [
  { value: 'SCHEDULED', label: 'Scheduled', tone: 'brand' },
  { value: 'CONFIRMED', label: 'Confirmed', tone: 'success' },
  { value: 'COMPLETED', label: 'Completed', tone: 'success' },
  { value: 'CANCELLED', label: 'Cancelled', tone: 'danger' },
  { value: 'RESCHEDULED', label: 'Rescheduled', tone: 'warning' },
  { value: 'NO_SHOW', label: 'No-show', tone: 'danger' },
]

export const offerStatusOptions: readonly StatusOption[] = [
  { value: 'DRAFT', label: 'Draft', tone: 'neutral' },
  { value: 'PENDING_APPROVAL', label: 'Pending approval', tone: 'warning' },
  { value: 'APPROVED', label: 'Approved', tone: 'success' },
  { value: 'SENT', label: 'Sent', tone: 'brand' },
  { value: 'VIEWED', label: 'Viewed', tone: 'brand' },
  { value: 'ACCEPTED', label: 'Accepted', tone: 'success' },
  { value: 'REJECTED', label: 'Rejected', tone: 'danger' },
  { value: 'EXPIRED', label: 'Expired', tone: 'warning' },
  { value: 'WITHDRAWN', label: 'Withdrawn', tone: 'neutral' },
]

export const onboardingStatusOptions: readonly StatusOption[] = [
  { value: 'NOT_STARTED', label: 'Not started', tone: 'neutral' },
  { value: 'IN_PROGRESS', label: 'In progress', tone: 'brand' },
  { value: 'COMPLETED', label: 'Completed', tone: 'success' },
  { value: 'CANCELLED', label: 'Cancelled', tone: 'danger' },
]
