import { Link } from 'react-router'
import { buttonClassName } from '@/components/ui/buttonStyles'
import { PermissionDeniedState } from '@/components/feedback/PermissionDeniedState'
import { PageHeader } from '@/components/layout/PageHeader'
import { appConfig } from '@/config/app.config'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function UnauthorizedPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('feedback.permissionTitle'))

  return (
    <>
      <PageHeader title={t('feedback.permissionTitle')} />
      <PermissionDeniedState />
      <Link to={appConfig.routes.home} className={buttonClassName({ variant: 'secondary' })}>
        {t('navigation.dashboard')}
      </Link>
    </>
  )
}
