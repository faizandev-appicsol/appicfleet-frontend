import { Button } from '@/components/ui/Button'
import { normalizeApiError } from '@/lib/api/apiError'

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const normalized = normalizeApiError(error)

  return (
    <div
      role="alert"
      className="border-danger/30 bg-danger-soft grid justify-items-start gap-3 rounded-lg border px-5 py-6"
    >
      <div>
        <h2 className="text-danger text-base font-semibold">Something went wrong</h2>
        <p className="text-danger mt-1 max-w-lg text-sm">{normalized.message}</p>
      </div>
      {onRetry ? (
        <Button type="button" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  )
}
