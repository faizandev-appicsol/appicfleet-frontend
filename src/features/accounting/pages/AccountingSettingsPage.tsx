import { PageHeader } from '@/components/layout/PageHeader'
import { appConfig } from '@/config/app.config'
import { Link } from 'react-router'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function AccountingSettingsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('accounting.settings.title'))

  return (
    <>
      <PageHeader title={t('accounting.settings.title')} description={t('accounting.settings.description')} />
      <ul className="space-y-3 text-sm">
        <li>
          <Link className="text-brand font-medium" to={appConfig.routes.accountingAccounts}>
            {t('accounting.settings.seedChart')}
          </Link>
          <p className="text-muted">{t('accounting.settings.seedChartHelp')}</p>
        </li>
        <li>
          <Link className="text-brand font-medium" to={appConfig.routes.accountingPeriods}>
            {t('accounting.settings.periods')}
          </Link>
          <p className="text-muted">{t('accounting.settings.periodsHelp')}</p>
        </li>
        <li>
          <p className="font-medium">{t('accounting.settings.mappings')}</p>
          <p className="text-muted">{t('accounting.settings.mappingsHelp')}</p>
        </li>
      </ul>
    </>
  )
}
