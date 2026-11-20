import { useEffect, useState } from 'react'
import { PERMISSIONS, taxDirectoryRoles } from '@/app/router/access'
import { useAppSelector } from '@/app/hooks'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { hasAnyRole } from '@/features/auth/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useGetTaxConfigurationQuery, useUpdateTaxConfigurationMutation } from '@/features/tax/api/taxApi'
import { useLegalEntityOptions } from '@/features/legal-entities/hooks/useLegalEntityOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function TaxSettingsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('tax.settings.title'))
  const { can } = usePermissions()
  const roles = useAppSelector((state) => state.auth.user?.roles)
  const legalEntities = useLegalEntityOptions()
  const [legalEntityId, setLegalEntityId] = useState('')
  const configQuery = useGetTaxConfigurationQuery({ legalEntityId }, { skip: !legalEntityId })
  const [updateConfig] = useUpdateTaxConfigurationMutation()
  const [vatStatus, setVatStatus] = useState('not_registered')
  const [vatNumber, setVatNumber] = useState('')
  const [registeredName, setRegisteredName] = useState('')
  const [registeredAddress, setRegisteredAddress] = useState('')
  const [einvoicingEnabled, setEinvoicingEnabled] = useState(false)
  const canManage = can(PERMISSIONS.einvoiceManageSettings) || hasAnyRole(roles, taxDirectoryRoles)

  useEffect(() => {
    const data = configQuery.data
    if (!data) return
    setVatStatus(String(data.vatRegistrationStatus ?? 'not_registered'))
    setVatNumber(String(data.vatRegistrationNumber ?? ''))
    setRegisteredName(String(data.registeredName ?? ''))
    setRegisteredAddress(String(data.registeredAddress ?? ''))
    setEinvoicingEnabled(Boolean(data.einvoicingEnabled))
  }, [configQuery.data])

  return (
    <>
      <PageHeader title={t('tax.settings.title')} description={t('tax.settings.description')} />
      <Select label={t('tax.fields.legalEntity')} value={legalEntityId} onChange={(e) => setLegalEntityId(e.target.value)} options={[{ value: '', label: t('common.none') }, ...legalEntities.options]} />
      {legalEntityId ? (
        <div className="grid gap-3 md:grid-cols-2">
          <Select
            label={t('tax.fields.vatStatus')}
            value={vatStatus}
            onChange={(e) => setVatStatus(e.target.value)}
            options={[
              { value: 'not_registered', label: t('tax.vatStatus.notRegistered') },
              { value: 'registered', label: t('tax.vatStatus.registered') },
              { value: 'suspended', label: t('tax.vatStatus.suspended') },
            ]}
          />
          <Input label={t('tax.fields.vatNumber')} value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} dir="ltr" />
          <Input label={t('tax.fields.registeredName')} value={registeredName} onChange={(e) => setRegisteredName(e.target.value)} />
          <Input label={t('tax.fields.registeredAddress')} value={registeredAddress} onChange={(e) => setRegisteredAddress(e.target.value)} />
          <Select
            label={t('tax.fields.einvoicingEnabled')}
            value={einvoicingEnabled ? 'yes' : 'no'}
            onChange={(e) => setEinvoicingEnabled(e.target.value === 'yes')}
            options={[
              { value: 'yes', label: t('common.yes') },
              { value: 'no', label: t('common.no') },
            ]}
          />
          {canManage ? (
            <Button
              onClick={() =>
                void updateConfig({
                  legalEntityId,
                  vatRegistrationStatus: vatStatus,
                  vatRegistrationNumber: vatNumber || undefined,
                  registeredName: registeredName || undefined,
                  registeredAddress: registeredAddress || undefined,
                  einvoicingEnabled,
                  einvoiceProvider: 'sandbox',
                  einvoiceEnvironment: 'sandbox',
                }).unwrap()
              }
            >
              {t('common.save')}
            </Button>
          ) : null}
        </div>
      ) : null}
      <p className="text-muted text-sm">{t('tax.settings.secretNote')}</p>
    </>
  )
}
