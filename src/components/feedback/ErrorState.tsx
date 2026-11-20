import { Button } from '@/components/ui/Button'
import { useTranslation } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { t, tm } = useTranslation()
  const normalized = normalizeApiError(error)

  return (
    <div
      role="alert"
      className="border-danger/30 bg-danger-soft grid justify-items-start gap-3 rounded-lg border px-5 py-6"
    >
      <div>
        <h2 className="text-danger text-base font-semibold">{t('feedback.errorTitle')}</h2>
        <p className="text-danger mt-1 max-w-lg text-sm">
          {tm(normalized.message) || t('feedback.errorDescription')}
        </p>
      </div>
      {onRetry ? (
        <Button type="button" variant="secondary" onClick={onRetry}>
          {t('feedback.retry')}
        </Button>
      ) : null}
    </div>
  )
}
