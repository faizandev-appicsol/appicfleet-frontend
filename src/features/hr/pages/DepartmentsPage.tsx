import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { SearchField } from '@/components/common/SearchField'
import { QueryState } from '@/components/feedback/QueryState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { PERMISSIONS } from '@/app/router/access'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useCreateDepartmentMutation, useGetDepartmentsQuery } from '@/features/hr/api/hrApi'
import { hrEntityStatusOptions } from '@/features/hr/statusOptions'
import { useLegalEntityOptions } from '@/features/legal-entities/hooks/useLegalEntityOptions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPagination } from '@/hooks/useSearchPagination'
import { useTranslation } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'

type FormValues = { legalEntityId: string; name: string; code: string }

export function DepartmentsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('hr.departments.title'))
  const { can } = usePermissions()
  const { searchInput, setSearchInput, search, page, setPage } = useSearchPagination()
  const [open, setOpen] = useState(false)
  const legalEntities = useLegalEntityOptions()
  const [createDepartment, state] = useCreateDepartmentMutation()
  const form = useForm<FormValues>({
    defaultValues: { legalEntityId: '', name: '', code: '' },
  })
  const query = useGetDepartmentsQuery({ page, pageSize: 20, search: search || undefined })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createDepartment({
        legalEntityId: values.legalEntityId,
        name: values.name.trim(),
        code: values.code.trim(),
      }).unwrap()
      form.reset()
      setOpen(false)
    } catch (error) {
      form.setError('root', { message: normalizeApiError(error).message })
    }
  })

  return (
    <>
      <PageHeader
        title={t('hr.departments.title')}
        description={t('hr.departments.description')}
        action={
          can(PERMISSIONS.hrDepartmentManage) ? (
            <Button type="button" onClick={() => setOpen(true)}>
              {t('hr.departments.create')}
            </Button>
          ) : undefined
        }
      />
      <SearchField
        value={searchInput}
        onChange={setSearchInput}
        label={t('hr.departments.searchLabel')}
        placeholder={t('hr.departments.searchPlaceholder')}
      />
      <QueryState
        data={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching && !query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(data) => data.items.length === 0}
        emptyTitle={t('hr.departments.emptyTitle')}
        emptyDescription={t('hr.departments.emptyDescription')}
      >
        {(data) => (
          <div className="grid gap-3">
            <div className="border-line bg-surface overflow-hidden rounded-lg border">
              <Table className="table-fixed">
                <THead>
                  <TR>
                    <TH className="w-[20%]">{t('common.code')}</TH>
                    <TH className="w-[55%]">{t('common.name')}</TH>
                    <TH className="w-[25%]">{t('common.status')}</TH>
                  </TR>
                </THead>
                <TBody>
                  {data.items.map((row) => (
                    <TR key={row.id}>
                      <TD dir="ltr">{row.code}</TD>
                      <TD className="font-medium">{row.name}</TD>
                      <TD>
                        <StatusBadge value={row.status} options={hrEntityStatusOptions} />
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
            <Pagination data={data} page={page} onPageChange={setPage} disabled={query.isFetching} />
          </div>
        )}
      </QueryState>
      <Modal open={open} onClose={() => setOpen(false)} title={t('hr.departments.createTitle')}>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">{t('hr.fields.legalEntity')}</span>
            <select
              className="border-line rounded-md border px-3 py-2"
              {...form.register('legalEntityId', { required: true })}
            >
              <option value="">{t('common.none')}</option>
              {legalEntities.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">{t('common.name')}</span>
            <input
              className="border-line rounded-md border px-3 py-2"
              {...form.register('name', { required: true })}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">{t('common.code')}</span>
            <input
              className="border-line rounded-md border px-3 py-2"
              {...form.register('code', { required: true })}
            />
          </label>
          {form.formState.errors.root ? (
            <p role="alert" className="text-danger text-sm">
              {form.formState.errors.root.message}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={state.isLoading}>
              {t('hr.departments.create')}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
