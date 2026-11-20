import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import {
  useGetInvestorProfileQuery,
  useUpdateInvestorProfileMutation,
} from '@/features/investor-portal/api/investorPortalApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'

type FormValues = { displayName: string; phone: string }

export function InvestorProfilePage() {
  const { t } = useTranslation()
  useDocumentTitle(t('investorPortal.profile.title'))
  const query = useGetInvestorProfileQuery()
  const [updateProfile, updateState] = useUpdateInvestorProfileMutation()
  const form = useForm<FormValues>({ defaultValues: { displayName: '', phone: '' } })

  useEffect(() => {
    if (query.data) {
      form.reset({
        displayName: query.data.displayName,
        phone: query.data.phone ?? '',
      })
    }
  }, [query.data, form])

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await updateProfile({
        displayName: values.displayName,
        phone: values.phone.trim() ? values.phone.trim() : null,
      }).unwrap()
    } catch (error) {
      form.setError('root', { message: normalizeApiError(error).message })
    }
  })

  return (
    <>
      <PageHeader
        title={t('investorPortal.profile.title')}
        description={t('investorPortal.profile.description')}
      />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={() => false}
        emptyTitle={t('investorPortal.emptyTitle')}
        emptyDescription={t('investorPortal.emptyDescription')}
      >
        {(data) => (
          <form className="border-line bg-surface grid max-w-xl gap-4 rounded-lg border p-5" onSubmit={onSubmit}>
            <p className="text-muted text-sm" dir="ltr">
              {data.contactEmail} · {data.investorNumber}
            </p>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">{t('common.name')}</span>
              <input
                className="border-line rounded-md border px-3 py-2"
                {...form.register('displayName', { required: true, minLength: 2 })}
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">{t('common.phone')}</span>
              <input className="border-line rounded-md border px-3 py-2" {...form.register('phone')} />
            </label>
            {form.formState.errors.root ? (
              <p role="alert" className="text-danger text-sm">
                {form.formState.errors.root.message}
              </p>
            ) : null}
            <div>
              <Button type="submit" disabled={updateState.isLoading}>
                {t('common.saveChanges')}
              </Button>
            </div>
          </form>
        )}
      </QueryState>
    </>
  )
}
