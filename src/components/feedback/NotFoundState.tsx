import { useTranslation } from '@/i18n'

export function NotFoundState({
  title,
  description,
}: {
  title?: string
  description?: string
}) {
  const { t } = useTranslation()

  return (
    <div className="border-line bg-surface grid justify-items-start gap-2 rounded-lg border border-dashed px-5 py-8">
      <h2 className="text-ink text-base font-semibold">{title ?? t('feedback.notFoundTitle')}</h2>
      <p className="text-muted max-w-md text-sm">
        {description ?? t('feedback.notFoundDescription')}
      </p>
    </div>
  )
}
