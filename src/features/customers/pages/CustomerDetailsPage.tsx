import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { PERMISSIONS } from '@/app/router/access'
import { useAppSelector } from '@/app/hooks'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { appConfig } from '@/config/app.config'
import { hasAnyRole } from '@/features/auth/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useBranchOptions } from '@/features/branches/hooks/useBranchOptions'
import { useGetCustomerQuery } from '@/features/customers/api/customersApi'
import { ContactsSection } from '@/features/customers/components/ContactsSection'
import { CustomerFormDialog } from '@/features/customers/components/CustomerFormDialog'
import { CustomerStatusDialog } from '@/features/customers/components/CustomerStatusDialog'
import { DetailField } from '@/features/vehicles/components/DetailField'
import { DocumentsSection } from '@/features/customers/components/DocumentsSection'
import { DuplicatesSection } from '@/features/customers/components/DuplicatesSection'
import { useCustomerOptions } from '@/features/customers/hooks/useCustomerOptions'
import type { CustomerDetail } from '@/features/customers/schemas/customer.schema'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'
import { cn } from '@/utils/cn'
import { formatDateTime } from '@/utils/formatDate'

const TABS = ['overview', 'contacts', 'documents', 'duplicates', 'activity'] as const
type TabId = (typeof TABS)[number]

const STAFF_ROLES = ['admin', 'org_admin', 'super_admin', 'manager', 'branch_manager'] as const
const ADMIN_ROLES = ['admin', 'org_admin', 'super_admin'] as const

export function CustomerDetailsPage() {
  const { t, tm } = useTranslation()
  const { customerId } = useParams()
  const [reveal, setReveal] = useState(false)
  const query = useGetCustomerQuery(
    { id: customerId ?? '', reveal },
    { skip: !customerId },
  )
  useDocumentTitle(query.data?.displayName ?? t('customers.detail.title'))

  if (!customerId) {
    return <ErrorState error={new Error(tm('customers.detail.missingId'))} />
  }

  if (query.data) {
    return (
      <CustomerDetails
        customer={query.data}
        reveal={reveal}
        onRevealChange={setReveal}
      />
    )
  }

  return (
    <>
      <PageHeader
        title={t('customers.detail.title')}
        description={t('customers.detail.description')}
        action={<BackLink />}
      />
      {query.isLoading ? <LoadingState label={t('customers.detail.loading')} /> : null}
      {query.error ? <ErrorState error={query.error} onRetry={query.refetch} /> : null}
    </>
  )
}

function BackLink() {
  const { t } = useTranslation()
  return (
    <Link
      to={appConfig.routes.customers}
      className="text-brand hover:text-brand-strong text-sm font-medium"
    >
      {t('customers.detail.back')}
    </Link>
  )
}

function CustomerDetails({
  customer,
  reveal,
  onRevealChange,
}: {
  customer: CustomerDetail
  reveal: boolean
  onRevealChange: (value: boolean) => void
}) {
  const { t } = useTranslation()
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const options = useCustomerOptions()
  const [tab, setTab] = useState<TabId>('overview')
  const [editOpen, setEditOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)

  const canUpdate = can(PERMISSIONS.customerUpdate) || hasAnyRole(roles, STAFF_ROLES)
  const canDeactivate = can(PERMISSIONS.customerDeactivate) || hasAnyRole(roles, ADMIN_ROLES)
  const canUpload = can(PERMISSIONS.customerUploadDocuments) || hasAnyRole(roles, STAFF_ROLES)
  const canReadFile = can(PERMISSIONS.customerViewSensitive) || hasAnyRole(roles, ADMIN_ROLES)
  const canArchive = can(PERMISSIONS.customerManageDocuments) || hasAnyRole(roles, ADMIN_ROLES)
  const canReviewOcr = can(PERMISSIONS.customerReviewOcr) || hasAnyRole(roles, STAFF_ROLES)
  const canReviewDuplicates =
    can(PERMISSIONS.customerReviewDuplicates) || hasAnyRole(roles, ADMIN_ROLES)
  const showStatus = canDeactivate || (canUpdate && customer.status !== 'active')

  return (
    <>
      <PageHeader
        title={customer.displayName}
        description={customer.customerNumber}
        status={<StatusBadge value={customer.status} options={options.statusOptions} />}
        secondaryActions={<BackLink />}
        action={
          canUpdate || showStatus ? (
            <div className="flex flex-wrap gap-2">
              {showStatus ? (
                <Button type="button" variant="secondary" onClick={() => setStatusOpen(true)}>
                  {t('customers.actions.changeStatus')}
                </Button>
              ) : null}
              {canUpdate ? (
                <Button type="button" onClick={() => setEditOpen(true)}>
                  {t('customers.actions.edit')}
                </Button>
              ) : null}
            </div>
          ) : undefined
        }
      />

      <div className="grid min-w-0 gap-4">
        <div
          role="tablist"
          aria-label={t('customers.detail.sections')}
          className="border-line flex min-w-0 gap-1 overflow-x-auto border-b"
        >
          {TABS.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`customer-tab-${id}`}
              aria-selected={tab === id}
              aria-controls={`customer-panel-${id}`}
              onClick={() => setTab(id)}
              className={cn(
                '-mb-px cursor-pointer border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                tab === id
                  ? 'border-brand text-brand'
                  : 'text-muted hover:text-ink border-transparent',
              )}
            >
              {t(`customers.detail.tabs.${id}`)}
            </button>
          ))}
        </div>

        <div
          role="tabpanel"
          id={`customer-panel-${tab}`}
          aria-labelledby={`customer-tab-${tab}`}
          className="min-w-0"
        >
          {tab === 'overview' ? (
            <Overview
              customer={customer}
              reveal={reveal}
              canReveal={canReadFile}
              onRevealChange={onRevealChange}
            />
          ) : null}
          {tab === 'contacts' ? (
            <ContactsSection customerId={customer.id} reveal={reveal} canUpdate={canUpdate} />
          ) : null}
          {tab === 'documents' ? (
            <DocumentsSection
              customerId={customer.id}
              reveal={reveal}
              canUpload={canUpload}
              canReadFile={canReadFile}
              canArchive={canArchive}
              canReviewOcr={canReviewOcr}
            />
          ) : null}
          {tab === 'duplicates' ? (
            <DuplicatesSection customerId={customer.id} canReview={canReviewDuplicates} />
          ) : null}
          {tab === 'activity' ? <Activity customer={customer} /> : null}
        </div>
      </div>

      <CustomerFormDialog open={editOpen} customer={customer} onClose={() => setEditOpen(false)} />
      <CustomerStatusDialog
        open={statusOpen}
        customer={customer}
        canDeactivate={canDeactivate}
        onClose={() => setStatusOpen(false)}
      />
    </>
  )
}

function Overview({
  customer,
  reveal,
  canReveal,
  onRevealChange,
}: {
  customer: CustomerDetail
  reveal: boolean
  canReveal: boolean
  onRevealChange: (value: boolean) => void
}) {
  const { t } = useTranslation()
  const options = useCustomerOptions()
  const branches = useBranchOptions()
  const placeholder = t('common.notSet')

  return (
    <Card className="grid gap-4 p-4">
      {canReveal ? (
        <label className="text-ink flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={reveal}
            onChange={(event) => onRevealChange(event.target.checked)}
          />
          {t('customers.detail.reveal')}
        </label>
      ) : null}
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailField label={t('customers.columns.type')} placeholder={placeholder}>
          {options.labelOf(options.typeOptions, customer.type)}
        </DetailField>
        <DetailField label={t('customers.columns.branch')} placeholder={placeholder}>
          {branches.nameById.get(customer.branchId) ?? customer.branchId}
        </DetailField>
        <DetailField label={t('customers.columns.documents')} placeholder={placeholder}>
          <StatusBadge value={customer.documentStatus} options={options.documentStatusOptions} />
        </DetailField>
        <DetailField label={t('common.email')} placeholder={placeholder} ltr>
          {customer.email}
        </DetailField>
        <DetailField label={t('common.phone')} placeholder={placeholder} ltr>
          {customer.phone}
        </DetailField>
        <DetailField label={t('customers.form.alternatePhone')} placeholder={placeholder} ltr>
          {customer.alternatePhone}
        </DetailField>
        {customer.individual ? (
          <>
            <DetailField label={t('customers.form.firstName')} placeholder={placeholder}>
              {customer.individual.firstName}
            </DetailField>
            <DetailField label={t('customers.form.middleName')} placeholder={placeholder}>
              {customer.individual.middleName}
            </DetailField>
            <DetailField label={t('customers.form.lastName')} placeholder={placeholder}>
              {customer.individual.lastName}
            </DetailField>
            <DetailField label={t('customers.form.dateOfBirth')} placeholder={placeholder} ltr>
              {customer.individual.dateOfBirth}
            </DetailField>
            <DetailField label={t('customers.form.nationality')} placeholder={placeholder}>
              {customer.individual.nationality}
            </DetailField>
          </>
        ) : null}
        {customer.corporate ? (
          <>
            <DetailField label={t('customers.form.legalName')} placeholder={placeholder}>
              {customer.corporate.legalName}
            </DetailField>
            <DetailField label={t('customers.form.tradeName')} placeholder={placeholder}>
              {customer.corporate.tradeName}
            </DetailField>
            <DetailField label={t('customers.form.registrationNumber')} placeholder={placeholder} ltr>
              {customer.corporate.registrationNumber}
            </DetailField>
            <DetailField label={t('customers.form.taxNumber')} placeholder={placeholder} ltr>
              {customer.corporate.taxNumber}
            </DetailField>
          </>
        ) : null}
        <DetailField label={t('customers.form.line1')} placeholder={placeholder}>
          {customer.address
            ? `${customer.address.line1}, ${customer.address.city}, ${customer.address.country}`
            : undefined}
        </DetailField>
        <DetailField label={t('customers.form.notes')} placeholder={placeholder}>
          {customer.notes}
        </DetailField>
      </dl>
    </Card>
  )
}

function Activity({ customer }: { customer: CustomerDetail }) {
  const { t } = useTranslation()
  const placeholder = t('common.notSet')
  return (
    <Card className="grid gap-4 p-4">
      <p className="text-muted text-sm">{t('customers.activity.description')}</p>
      <dl className="grid gap-4 sm:grid-cols-2">
        <DetailField label={t('common.created')} placeholder={placeholder} ltr>
          {formatDateTime(customer.createdAt)}
        </DetailField>
        <DetailField label={t('common.updated')} placeholder={placeholder} ltr>
          {formatDateTime(customer.updatedAt)}
        </DetailField>
      </dl>
    </Card>
  )
}
