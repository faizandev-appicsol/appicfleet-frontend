import { useMemo, useState } from 'react'
import type { ReportFilters } from '@/features/reports/schemas/reports.schema'

const PRESETS = [
  'today',
  'yesterday',
  'this_week',
  'last_week',
  'this_month',
  'last_month',
  'this_quarter',
  'this_year',
  'custom',
] as const

export function useReportFilters(initial?: Partial<ReportFilters>) {
  const [preset, setPreset] = useState(initial?.preset ?? 'this_month')
  const [from, setFrom] = useState(initial?.from ?? '')
  const [to, setTo] = useState(initial?.to ?? '')
  const [branchId, setBranchId] = useState(initial?.branchId ?? '')
  const [legalEntityId, setLegalEntityId] = useState(initial?.legalEntityId ?? '')
  const [status, setStatus] = useState(initial?.status ?? '')
  const [page, setPage] = useState(1)

  const filters = useMemo<ReportFilters>(() => {
    const toIso = (value: string) => {
      if (!value) return undefined
      const date = new Date(value)
      return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
    }
    return {
      preset: preset || undefined,
      from: preset === 'custom' ? toIso(from) : undefined,
      to: preset === 'custom' ? toIso(to) : undefined,
      branchId: branchId || undefined,
      legalEntityId: legalEntityId || undefined,
      status: status || undefined,
      page,
      pageSize: 20,
    }
  }, [preset, from, to, branchId, legalEntityId, status, page])

  return {
    presets: PRESETS,
    preset,
    setPreset: (value: string) => {
      setPreset(value)
      setPage(1)
    },
    from,
    setFrom,
    to,
    setTo,
    branchId,
    setBranchId: (value: string) => {
      setBranchId(value)
      setPage(1)
    },
    legalEntityId,
    setLegalEntityId: (value: string) => {
      setLegalEntityId(value)
      setPage(1)
    },
    status,
    setStatus: (value: string) => {
      setStatus(value)
      setPage(1)
    },
    page,
    setPage,
    filters,
  }
}
