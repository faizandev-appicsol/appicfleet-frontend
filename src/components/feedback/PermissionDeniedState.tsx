import { useTranslation } from '@/i18n'

export function PermissionDeniedState({
  title,
  description,
}: {
  title?: string
  description?: string
}) {
  const { t } = useTranslation()

  return (
    <div
      role="status"
      className="border-warning/30 bg-warning-soft grid justify-items-start gap-2 rounded-lg border px-5 py-8"
    >
      <h2 className="text-warning text-base font-semibold">
        {title ?? t('feedback.permissionTitle')}
      </h2>
      <p className="text-warning max-w-md text-sm">
        {description ?? t('feedback.permissionDescription')}
      </p>
    </div>
  )
}
