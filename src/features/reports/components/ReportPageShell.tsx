import type { ReactNode } from 'react'
import { PERMISSIONS } from '@/app/router/access'
import { useAppSelector } from '@/app/hooks'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { env } from '@/config/env'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { ReportFiltersBar } from '@/features/reports/components/ReportFiltersBar'
import { useReportFilters } from '@/features/reports/hooks/useReportFilters'
import type { ReportFilters } from '@/features/reports/schemas/reports.schema'
import { useTranslation } from '@/i18n'

type FilterControls = ReturnType<typeof useReportFilters>

type Props = {
  title: string
  description: string
  exportKind?: string
  showStatus?: boolean
  statusOptions?: Array<{ value: string; label: string }>
  children: (filters: ReportFilters, controls: FilterControls) => ReactNode
}

export function ReportPageShell({
  title,
  description,
  exportKind,
  showStatus,
  statusOptions,
  children,
}: Props) {
  const { t } = useTranslation()
  const { can } = usePermissions()
  const accessToken = useAppSelector((state) => state.auth.accessToken)
  const filterState = useReportFilters()
  const canExport = Boolean(exportKind && can(PERMISSIONS.reportsExport))

  async function handleExport() {
    if (!exportKind) return
    const params = new URLSearchParams()
    params.set('kind', exportKind)
    for (const [key, value] of Object.entries(filterState.filters)) {
      if (value != null && value !== '') params.set(key, String(value))
    }
    const response = await fetch(`${env.apiUrl}/reports/export?${params.toString()}`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      credentials: 'include',
    })
    if (!response.ok) return
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${exportKind}-report.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        action={
          canExport ? (
            <Button type="button" variant="secondary" onClick={() => void handleExport()}>
              {t('reports.exportCsv')}
            </Button>
          ) : undefined
        }
      />
      <div className="grid gap-4">
        <ReportFiltersBar
          preset={filterState.preset}
          onPresetChange={filterState.setPreset}
          presets={filterState.presets}
          from={filterState.from}
          to={filterState.to}
          onFromChange={filterState.setFrom}
          onToChange={filterState.setTo}
          branchId={filterState.branchId}
          onBranchChange={filterState.setBranchId}
          legalEntityId={filterState.legalEntityId}
          onLegalEntityChange={filterState.setLegalEntityId}
          status={filterState.status}
          onStatusChange={filterState.setStatus}
          statusOptions={statusOptions}
          showStatus={showStatus}
        />
        {children(filterState.filters, filterState)}
      </div>
    </>
  )
}
