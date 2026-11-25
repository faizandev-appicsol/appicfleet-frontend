import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { PERMISSIONS } from '@/app/router/access'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { CloseIcon } from '@/components/ui/icons'
import { useBranchOptions } from '@/features/branches/hooks/useBranchOptions'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import {
  useCreateCustomerMutation,
  useArchiveCustomerDocumentMutation,
  useGetCustomerDocumentsQuery,
  usePreviewCustomerDocumentMutation,
  useUploadCustomerDocumentMutation,
  useUpdateCustomerMutation,
} from '@/features/customers/api/customersApi'
import {
  customerFormSchema,
  customerToFormValues,
  toCustomerCreateBody,
  toCustomerUpdateBody,
  MAX_UPLOAD_BYTES,
  type CustomerDetail,
  type CustomerDocument,
  type CustomerFormValues,
  type UploadDocumentBody,
} from '@/features/customers/schemas/customer.schema'
import { useOrganizationOptions } from '@/features/organizations/hooks/useOrganizationOptions'
import { useTranslation } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'
import { applyApiFieldErrors } from '@/utils/forms'
import { isTodayOrFutureDate } from '@/utils/dates'

const PROFILE_DOCUMENT_FIELDS = [
  { purpose: 'identity', field: 'identity' },
  { purpose: 'identity_expiry', field: 'identityExpiry' },
  { purpose: 'license', field: 'license' },
  { purpose: 'license_expiry', field: 'licenseExpiry' },
  { purpose: 'signature', field: 'signature' },
] as const

type ProfileDocumentPurpose = (typeof PROFILE_DOCUMENT_FIELDS)[number]['purpose']
type ProfileImageMimeType = 'image/jpeg' | 'image/png' | 'image/webp'
type ChosenProfileFile = {
  file: File
  previewUrl: string
  mimeType: ProfileImageMimeType
}

function isProfileImageMimeType(value: string): value is ProfileImageMimeType {
  return value === 'image/jpeg' || value === 'image/png' || value === 'image/webp'
}

function readBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      const comma = result.indexOf(',')
      resolve(comma >= 0 ? result.slice(comma + 1) : result)
    }
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read the selected file'))
    reader.readAsDataURL(file)
  })
}

function findProfileImageDocument(
  purpose: ProfileDocumentPurpose,
  documents: readonly CustomerDocument[],
): CustomerDocument | undefined {
  const activeImages = documents.filter(
    (item) => item.status === 'active' && item.mimeType.startsWith('image/'),
  )
  const explicitlyTagged = activeImages.find((item) => item.purpose === purpose)
  if (explicitlyTagged) return explicitlyTagged

  const untaggedImages = activeImages
    .filter((item) => !item.purpose)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
  if (purpose === 'identity' || purpose === 'identity_expiry') {
    const identityDocuments = untaggedImages.filter(
      (item) => item.documentType === 'passport' || item.documentType === 'emirates_id',
    )
    return identityDocuments[purpose === 'identity' ? 0 : 1]
  }
  if (purpose === 'license' || purpose === 'license_expiry') {
    const licenseDocuments = untaggedImages.filter((item) => item.documentType === 'driving_license')
    return licenseDocuments[purpose === 'license' ? 0 : 1]
  }
  return untaggedImages.find((item) => item.documentType === 'other')
}

function SavedProfileImage({
  customerId,
  document: savedDocument,
  label,
  onRemove,
  removing,
  disabled,
}: {
  customerId: string
  document: CustomerDocument
  label: string
  onRemove?: () => void
  removing?: boolean
  disabled?: boolean
}) {
  const { t, tm } = useTranslation()
  const [previewCustomerDocument] = usePreviewCustomerDocumentMutation()
  const [previewUrl, setPreviewUrl] = useState<string>()
  const [error, setError] = useState<string>()
  const previewUrlRef = useRef<string | null>(null)

  useEffect(() => {
    let active = true
    setError(undefined)
    setPreviewUrl(undefined)
    void previewCustomerDocument({
      customerId,
      documentId: savedDocument.id,
    })
      .unwrap()
      .then((url) => {
        if (active) {
          previewUrlRef.current = url
          setPreviewUrl(url)
        } else {
          URL.revokeObjectURL(url)
        }
      })
      .catch((caught: unknown) => {
        if (active) setError(normalizeApiError(caught).message)
      })
    return () => {
      active = false
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
        previewUrlRef.current = null
      }
    }
  }, [customerId, previewCustomerDocument, savedDocument.id])

  return (
    <span className="text-muted flex items-center gap-2 text-xs">
      <span className="relative size-12 shrink-0">
        {previewUrl ? (
          <img src={previewUrl} alt={label} className="size-12 rounded-md object-cover" />
        ) : (
          <span className="bg-control block size-12 animate-pulse rounded-md" aria-hidden="true" />
        )}
        {onRemove ? (
          <button
            type="button"
            className="bg-danger text-white absolute -end-1 -top-1 inline-flex size-5 cursor-pointer items-center justify-center rounded-full shadow"
            aria-label={t('customers.form.removeImage')}
            title={t('customers.form.removeImage')}
            disabled={removing || disabled}
            onClick={onRemove}
          >
            <CloseIcon className="size-3" />
          </button>
        ) : null}
      </span>
      {error ? (
        <span className="text-danger min-w-0">{tm(error)}</span>
      ) : (
        <span className="min-w-0 truncate">{savedDocument.originalFilename}</span>
      )}
      {removing ? (
        <span className="text-muted ms-auto shrink-0">{t('customers.documents.archiving')}</span>
      ) : (
        <span className="text-success ms-auto shrink-0">{t('customers.form.uploaded')}</span>
      )}
    </span>
  )
}

export function CustomerFormDialog({
  open,
  customer,
  onClose,
  onCreated,
}: {
  open: boolean
  customer?: CustomerDetail
  onClose: () => void
  onCreated?: (id: string) => void
}) {
  const { t, tm } = useTranslation()
  const { can } = usePermissions()
  const canUploadDocuments = can(PERMISSIONS.customerUploadDocuments)
  const canViewSensitive = can(PERMISSIONS.customerViewSensitive)
  const canManageDocuments = can(PERMISSIONS.customerManageDocuments)
  const organizations = useOrganizationOptions()
  const [createCustomer] = useCreateCustomerMutation()
  const [updateCustomer] = useUpdateCustomerMutation()
  const [uploadCustomerDocument] = useUploadCustomerDocumentMutation()
  const [archiveCustomerDocument] = useArchiveCustomerDocumentMutation()
  const customerDocumentsQuery = useGetCustomerDocumentsQuery(
    {
      customerId: customer?.id ?? '',
      page: 1,
      pageSize: 50,
      status: 'active',
    },
    { skip: !open || !customer?.id },
  )
  const [profileFiles, setProfileFiles] = useState<
    Partial<Record<ProfileDocumentPurpose, ChosenProfileFile>>
  >({})
  const profileFilesRef = useRef(profileFiles)
  profileFilesRef.current = profileFiles
  const [savedCustomerId, setSavedCustomerId] = useState<string | null>(null)
  const [uploadedPurposes, setUploadedPurposes] = useState<ReadonlySet<ProfileDocumentPurpose>>(
    () => new Set(),
  )
  const [replacementDocumentIds, setReplacementDocumentIds] = useState<
    Partial<Record<ProfileDocumentPurpose, string>>
  >({})
  const [archivingDocumentId, setArchivingDocumentId] = useState<string | null>(null)
  const isEdit = Boolean(customer)
  const showOrganization = !isEdit && organizations.required
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: customerToFormValues(customer),
  })
  const type = form.watch('customerType')
  const organizationId = form.watch('organizationId')
  const branches = useBranchOptions({
    organizationId: organizationId || customer?.organizationId || undefined,
    enabled: open,
  })

  useEffect(() => {
    if (open) {
      form.reset(customerToFormValues(customer))
      Object.values(profileFilesRef.current).forEach((chosen) => {
        if (chosen) URL.revokeObjectURL(chosen.previewUrl)
      })
      setProfileFiles({})
      setSavedCustomerId(null)
      setUploadedPurposes(new Set())
      setReplacementDocumentIds({})
      setArchivingDocumentId(null)
    }
  }, [open, customer?.id, form])

  useEffect(
    () => () => {
      Object.values(profileFilesRef.current).forEach((chosen) => {
        if (chosen) URL.revokeObjectURL(chosen.previewUrl)
      })
    },
    [],
  )

  const chooseProfileFile = (purpose: ProfileDocumentPurpose, file?: File) => {
    const mimeType = file ? file.type.toLowerCase() : undefined
    if (
      file &&
      (file.size > MAX_UPLOAD_BYTES ||
        !mimeType ||
        !isProfileImageMimeType(mimeType))
    ) {
      form.setError('root', {
        message:
          file.size > MAX_UPLOAD_BYTES
            ? 'customers.documents.tooLarge'
            : 'customers.documents.invalidType',
      })
      return
    }
    const previous = profileFiles[purpose]
    if (previous) URL.revokeObjectURL(previous.previewUrl)
    const selected =
      file && mimeType && isProfileImageMimeType(mimeType)
        ? { file, mimeType, previewUrl: URL.createObjectURL(file) }
        : undefined
    form.clearErrors('root')
    setProfileFiles((current) => {
      if (!selected) {
        const next = { ...current }
        delete next[purpose]
        return next
      }
      return { ...current, [purpose]: selected }
    })
    setUploadedPurposes((current) => {
      if (!file) return current
      const next = new Set(current)
      next.delete(purpose)
      return next
    })
    setReplacementDocumentIds((current) => {
      const next = { ...current }
      if (file) {
        const existing = findProfileImageDocument(
          purpose,
          customerDocumentsQuery.data?.items ?? [],
        )
        if (existing) next[purpose] = existing.id
        else delete next[purpose]
      } else if (!uploadedPurposes.has(purpose)) {
        delete next[purpose]
      }
      return next
    })
  }

  const removeSavedProfileImage = async (
    purpose: ProfileDocumentPurpose,
    savedDocument: CustomerDocument,
  ) => {
    if (!customer || !canManageDocuments) return
    setArchivingDocumentId(savedDocument.id)
    form.clearErrors('root')
    try {
      await archiveCustomerDocument({
        customerId: customer.id,
        documentId: savedDocument.id,
      }).unwrap()
      setReplacementDocumentIds((current) => {
        if (current[purpose] !== savedDocument.id) return current
        const next = { ...current }
        delete next[purpose]
        return next
      })
    } catch (caught) {
      form.setError('root', { message: normalizeApiError(caught).message })
    } finally {
      setArchivingDocumentId(null)
    }
  }

  const onSubmit = form.handleSubmit(async (values) => {
    if (
      customer &&
      Object.values(profileFiles).some(Boolean) &&
      customerDocumentsQuery.isLoading
    ) {
      form.setError('root', { message: 'customers.documents.loadingProfileImages' })
      return
    }
    if (
      Object.values(replacementDocumentIds).some(Boolean) &&
      !canManageDocuments
    ) {
      form.setError('root', { message: 'customers.documents.replaceRequiresPermission' })
      return
    }
    if (
      (profileFiles.identity || profileFiles.identity_expiry) &&
      !values.identityDocumentType
    ) {
      form.setError('identityDocumentType', { message: 'validation.selectRequired' })
      return
    }
    if (!customer) {
      for (const key of ['identityExpiresOn', 'licenseExpiresOn'] as const) {
        const value = values[key]
        if (value && !isTodayOrFutureDate(value)) {
          form.setError(key, { message: 'customers.validation.expiryMustBeFuture' })
          return
        }
      }
    }
    if (showOrganization && !values.organizationId) {
      form.setError('organizationId', { message: 'validation.selectRequired' })
      return
    }
    try {
      let customerId = customer?.id ?? savedCustomerId
      let wasCreated = !customer && Boolean(savedCustomerId)
      if (customerId) {
        await updateCustomer({ id: customerId, body: toCustomerUpdateBody(values) }).unwrap()
      } else {
        const created = await createCustomer(toCustomerCreateBody(values)).unwrap()
        if (!created.id) throw new Error(t('customers.create.missingId'))
        customerId = created.id
        wasCreated = true
        setSavedCustomerId(customerId)
      }
      for (const { purpose } of PROFILE_DOCUMENT_FIELDS) {
        const chosen = profileFiles[purpose]
        let uploaded = uploadedPurposes.has(purpose)
        if (chosen && !uploaded) {
          const documentType: UploadDocumentBody['documentType'] =
            purpose.startsWith('identity')
              ? values.identityDocumentType === 'emirates_id'
                ? 'emirates_id'
                : 'passport'
              : purpose.startsWith('license')
                ? 'driving_license'
                : 'other'
          await uploadCustomerDocument({
            customerId,
            body: {
              documentType,
              purpose,
              filename: chosen.file.name,
              mimeType: chosen.mimeType,
              contentBase64: await readBase64(chosen.file),
            },
          }).unwrap()
          uploaded = true
          setUploadedPurposes((current) => new Set(current).add(purpose))
        }

        const replacementDocumentId = replacementDocumentIds[purpose]
        if (uploaded && replacementDocumentId) {
          await archiveCustomerDocument({
            customerId,
            documentId: replacementDocumentId,
          }).unwrap()
          setReplacementDocumentIds((current) => {
            if (current[purpose] !== replacementDocumentId) return current
            const next = { ...current }
            delete next[purpose]
            return next
          })
        }
      }
      onClose()
      if (wasCreated && customerId) onCreated?.(customerId)
    } catch (error) {
      const normalized = normalizeApiError(error)
      if (!applyApiFieldErrors(form.setError, normalized)) {
        form.setError('root', { message: normalized.message })
      }
    }
  })

  const errors = form.formState.errors
  const submitting = form.formState.isSubmitting

  return (
    <Modal
      open={open}
      size="wide"
      title={isEdit ? t('customers.edit.title') : t('customers.create.title')}
      description={
        customer
          ? t('customers.edit.description', { name: customer.displayName })
          : t('customers.create.description')
      }
      onClose={onClose}
    >
      <form className="grid gap-4" noValidate onSubmit={onSubmit}>
        {errors.root ? <Alert tone="danger">{tm(errors.root.message)}</Alert> : null}
        <div className="grid gap-4 lg:grid-cols-2">
          <fieldset className="border-line grid content-start gap-4 rounded-lg border p-4">
            <legend className="text-ink px-1 text-sm font-medium">{t('customers.form.identity')}</legend>
            {showOrganization ? (
              <Select
                label={t('customers.form.organization')}
                required
                options={[
                  { value: '', label: t('customers.form.selectOrganization') },
                  ...organizations.options,
                ]}
                error={tm(errors.organizationId?.message)}
                {...form.register('organizationId')}
              />
            ) : null}
            {isEdit ? (
              <Input
                label={t('customers.form.branch')}
                value={
                  customer
                    ? (branches.nameById.get(customer.branchId) ?? customer.branchId)
                    : ''
                }
                dir="ltr"
                readOnly
              />
            ) : branches.allowed ? (
              <Select
                label={t('customers.form.branch')}
                required
                options={[
                  { value: '', label: t('customers.form.selectBranch') },
                  ...branches.items.map((branch) => ({ value: branch.id, label: branch.name })),
                ]}
                error={tm(errors.branchId?.message)}
                {...form.register('branchId')}
              />
            ) : (
              <Input
                label={t('customers.form.branchId')}
                hint={t('customers.form.branchIdHint')}
                required
                dir="ltr"
                error={tm(errors.branchId?.message)}
                {...form.register('branchId')}
              />
            )}
            <Select
              label={t('customers.form.type')}
              required
              options={[
                { value: 'individual', label: t('customers.types.individual') },
                { value: 'organization', label: t('customers.types.organization') },
                { value: 'tourist', label: t('customers.types.tourist') },
              ]}
              {...form.register('customerType')}
            />
            <Select
              label={t('customers.form.residency')}
              options={[
                { value: '', label: t('common.notSet') },
                { value: 'residential', label: t('customers.residencies.residential') },
                { value: 'gcc', label: t('customers.residencies.gcc') },
                { value: 'tourist', label: t('customers.residencies.tourist') },
              ]}
              {...form.register('residency')}
            />
            <Input
              label={t('customers.form.displayName')}
              hint={t('customers.form.displayNameHint')}
              error={tm(errors.displayName?.message)}
              {...form.register('displayName')}
            />
          </fieldset>

          <fieldset className="border-line grid content-start gap-4 rounded-lg border p-4">
            <legend className="text-ink px-1 text-sm font-medium">
              {type === 'organization' ? t('customers.form.company') : t('customers.form.person')}
            </legend>
            {type !== 'organization' ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label={t('customers.form.firstName')}
                    required
                    error={tm(errors.firstName?.message)}
                    {...form.register('firstName')}
                  />
                  <Input
                    label={t('customers.form.middleName')}
                    error={tm(errors.middleName?.message)}
                    {...form.register('middleName')}
                  />
                </div>
                <Input
                  label={t('customers.form.lastName')}
                  required
                  error={tm(errors.lastName?.message)}
                  {...form.register('lastName')}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label={t('customers.form.dateOfBirth')}
                    type="date"
                    dir="ltr"
                    error={tm(errors.dateOfBirth?.message)}
                    {...form.register('dateOfBirth')}
                  />
                  <Input
                    label={t('customers.form.nationality')}
                    error={tm(errors.nationality?.message)}
                    {...form.register('nationality')}
                  />
                </div>
              </>
            ) : (
              <>
                <Input
                  label={t('customers.form.legalName')}
                  required
                  error={tm(errors.legalName?.message)}
                  {...form.register('legalName')}
                />
                <Input
                  label={t('customers.form.tradeName')}
                  error={tm(errors.tradeName?.message)}
                  {...form.register('tradeName')}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label={t('customers.form.registrationNumber')}
                    dir="ltr"
                    error={tm(errors.registrationNumber?.message)}
                    {...form.register('registrationNumber')}
                  />
                  <Input
                    label={t('customers.form.taxNumber')}
                    dir="ltr"
                    error={tm(errors.taxNumber?.message)}
                    {...form.register('taxNumber')}
                  />
                </div>
              </>
            )}
          </fieldset>
        </div>

        <fieldset className="border-line grid gap-4 rounded-lg border p-4">
          <legend className="text-ink px-1 text-sm font-medium">{t('customers.form.identityDocuments')}</legend>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Select
              label={t('customers.form.identityDocumentType')}
              options={[
                { value: '', label: t('common.notSet') },
                { value: 'passport', label: t('customers.fileTypes.passport') },
                { value: 'emirates_id', label: t('customers.fileTypes.emirates_id') },
              ]}
              error={tm(errors.identityDocumentType?.message)}
              {...form.register('identityDocumentType')}
            />
            <Input
              label={t('customers.form.identityNumber')}
              dir="ltr"
              error={tm(errors.identityNumber?.message)}
              {...form.register('identityNumber')}
            />
            <Input
              label={t('customers.form.identityIssuedOn')}
              type="date"
              dir="ltr"
              error={tm(errors.identityIssuedOn?.message)}
              {...form.register('identityIssuedOn')}
            />
            <Input
              label={t('customers.form.identityExpiresOn')}
              type="date"
              dir="ltr"
              error={tm(errors.identityExpiresOn?.message)}
              {...form.register('identityExpiresOn')}
            />
            <Input
              label={t('customers.form.identityIssuePlace')}
              error={tm(errors.identityIssuePlace?.message)}
              {...form.register('identityIssuePlace')}
            />
            <Input
              label={t('customers.form.licenseNumber')}
              dir="ltr"
              error={tm(errors.licenseNumber?.message)}
              {...form.register('licenseNumber')}
            />
            <Input
              label={t('customers.form.licenseIssuedOn')}
              type="date"
              dir="ltr"
              error={tm(errors.licenseIssuedOn?.message)}
              {...form.register('licenseIssuedOn')}
            />
            <Input
              label={t('customers.form.licenseExpiresOn')}
              type="date"
              dir="ltr"
              error={tm(errors.licenseExpiresOn?.message)}
              {...form.register('licenseExpiresOn')}
            />
            <Input
              label={t('customers.form.vatNumber')}
              dir="ltr"
              error={tm(errors.vatNumber?.message)}
              {...form.register('vatNumber')}
            />
          </div>
          {customerDocumentsQuery.error ? (
            <Alert tone="danger">{tm(normalizeApiError(customerDocumentsQuery.error).message)}</Alert>
          ) : null}
          {!canUploadDocuments && isEdit && customerDocumentsQuery.isLoading ? (
            <p className="text-muted text-sm">{t('common.loading')}</p>
          ) : null}
          {!canUploadDocuments &&
          isEdit &&
          !customerDocumentsQuery.isLoading &&
          !customerDocumentsQuery.error &&
          !(customerDocumentsQuery.data?.items.some(
            (item) => item.mimeType.startsWith('image/'),
          ) ?? false) ? (
            <p className="text-muted text-sm">{t('customers.form.noUploadedImages')}</p>
          ) : null}
          {canUploadDocuments || isEdit ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PROFILE_DOCUMENT_FIELDS.map(({ purpose, field }) => {
                const chosen = profileFiles[purpose]
                const label = t(`customers.form.${field}`)
                const savedDocument = findProfileImageDocument(
                  purpose,
                  customerDocumentsQuery.data?.items ?? [],
                )
                if (!canUploadDocuments && !savedDocument) return null
                const inputId = `customer-document-${purpose}`
                return (
                  <div key={purpose} className="text-ink grid gap-2 text-sm font-medium">
                    <label htmlFor={inputId}>{label}</label>
                    {canUploadDocuments ? (
                      <input
                        id={inputId}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        aria-label={label}
                        disabled={submitting || customerDocumentsQuery.isLoading}
                        className="border-line bg-surface text-ink file:bg-control w-full rounded-lg border text-sm file:me-3 file:border-0 file:px-3 file:py-2"
                        onChange={(event) => {
                          chooseProfileFile(purpose, event.target.files?.[0])
                          event.currentTarget.value = ''
                        }}
                      />
                    ) : null}
                    {savedDocument && canViewSensitive && customer ? (
                      <SavedProfileImage
                        customerId={customer.id}
                        document={savedDocument}
                        label={label}
                        onRemove={
                          canManageDocuments
                            ? () => void removeSavedProfileImage(purpose, savedDocument)
                            : undefined
                        }
                        removing={archivingDocumentId === savedDocument.id}
                        disabled={submitting}
                      />
                    ) : null}
                    {savedDocument && !canViewSensitive ? (
                      <span className="text-muted flex items-center gap-2 text-xs">
                        <span className="min-w-0 truncate">
                          {savedDocument.originalFilename} — {t('customers.documents.sensitiveDenied')}
                        </span>
                        {canManageDocuments ? (
                          <button
                            type="button"
                            className="bg-danger text-white inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full"
                            aria-label={t('customers.form.removeImage')}
                            title={t('customers.form.removeImage')}
                            disabled={submitting || archivingDocumentId === savedDocument.id}
                            onClick={() => void removeSavedProfileImage(purpose, savedDocument)}
                          >
                            <CloseIcon className="size-3" />
                          </button>
                        ) : null}
                      </span>
                    ) : null}
                    {chosen ? (
                      <span className="text-muted flex items-center gap-2 text-xs">
                        <span className="relative size-12 shrink-0">
                          <img
                            src={chosen.previewUrl}
                            alt={label}
                            className="size-12 rounded-md object-cover"
                          />
                          <button
                            type="button"
                            className="bg-danger text-white absolute -end-1 -top-1 inline-flex size-5 cursor-pointer items-center justify-center rounded-full shadow"
                            aria-label={t('customers.form.removeImage')}
                            title={t('customers.form.removeImage')}
                            disabled={submitting}
                            onClick={() => chooseProfileFile(purpose)}
                          >
                            <CloseIcon className="size-3" />
                          </button>
                        </span>
                        <span className="min-w-0 truncate">{chosen.file.name}</span>
                      </span>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ) : null}
        </fieldset>

        <fieldset className="border-line grid gap-4 rounded-lg border p-4">
          <legend className="text-ink px-1 text-sm font-medium">{t('customers.form.contact')}</legend>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label={t('common.email')}
              type="email"
              dir="ltr"
              autoComplete="email"
              error={tm(errors.email?.message)}
              {...form.register('email')}
            />
            <Input
              label={t('common.phone')}
              type="tel"
              dir="ltr"
              autoComplete="tel"
              error={tm(errors.phone?.message)}
              {...form.register('phone')}
            />
            <Input
              label={t('customers.form.alternatePhone')}
              type="tel"
              dir="ltr"
              error={tm(errors.alternatePhone?.message)}
              {...form.register('alternatePhone')}
            />
            <Input
              label={t('customers.form.line1')}
              error={tm(errors.line1?.message)}
              {...form.register('line1')}
            />
            <Input label={t('customers.form.city')} error={tm(errors.city?.message)} {...form.register('city')} />
            <Input
              label={t('customers.form.country')}
              dir="ltr"
              error={tm(errors.country?.message)}
              {...form.register('country')}
            />
          </div>
        </fieldset>

        <Textarea
          label={t('customers.form.notes')}
          error={tm(errors.notes?.message)}
          {...form.register('notes')}
        />

        <ModalActions>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? t('customers.edit.submit') : t('customers.create.submit')}
          </Button>
        </ModalActions>
      </form>
    </Modal>
  )
}
