import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, type UseFormSetError } from 'react-hook-form'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { useBranchOptions } from '@/features/branches/hooks/useBranchOptions'
import { useOrganizationOptions } from '@/features/organizations/hooks/useOrganizationOptions'
import {
  useCreateVehicleMutation,
  useCreateVehicleRateMutation,
  useGetVehicleMakesQuery,
  useGetVehicleRatesQuery,
  useGetVehicleTypesQuery,
  useUpdateVehicleMutation,
  useUploadVehiclePhotoMutation,
} from '@/features/vehicles/api/vehiclesApi'
import { CatalogCombobox } from '@/features/vehicles/components/CatalogCombobox'
import { FileBrowseField } from '@/features/vehicles/components/FileBrowseField'
import { VehicleThumbnail } from '@/features/vehicles/components/VehicleThumbnail'
import { useVehicleOptions } from '@/features/vehicles/hooks/useVehicleOptions'
import {
  createVehicleFormSchema,
  toVehicleCreateBody,
  toVehicleUpdateBody,
  vehicleFormFields,
  vehicleFormSchema,
  type OwnershipType,
  type VehicleDetail,
  type VehicleFormValues,
  type VehicleFuelType,
  type VehicleTransmission,
} from '@/features/vehicles/schemas/vehicle.schema'
import { useTranslation } from '@/i18n'
import { normalizeApiError, type NormalizedApiError } from '@/lib/api/apiError'
import { todayDateInput } from '@/utils/dates'
import { fileToBase64 } from '@/utils/file'

const PHOTO_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

const DEFAULT_VALUES: VehicleFormValues = {
  organizationId: '',
  branchId: '',
  legalEntityId: '',
  plateNumber: '',
  vin: '',
  make: '',
  model: '',
  year: String(new Date().getFullYear()),
  color: '',
  category: '',
  transmission: 'automatic',
  fuelType: 'petrol',
  seatingCapacity: '5',
  engineNumber: '',
  mileageKm: '',
  notes: '',
  ownershipType: 'company',
  investorName: '',
  investorReference: '',
  lenderName: '',
  expectedReturnOn: '',
  lessorName: '',
  leaseStartsOn: '',
  leaseEndsOn: '',
  leaseAmount: '',
  leaseCurrency: 'AED',
  financingCompany: '',
  purchasePrice: '',
  downPayment: '',
  financedAmount: '',
  interestRate: '',
  numberOfInstallments: '',
  monthlyInstallment: '',
  firstPaymentDate: '',
  lastPaymentDate: '',
  registrationExpiresOn: '',
  insuranceExpiresOn: '',
  inspectionExpiresOn: '',
  chassisNumber: '',
  salikTagNumber: '',
  mulkiyaNumber: '',
  latitude: '',
  longitude: '',
  dailyRent: '',
  weeklyRent: '',
  monthlyRent: '',
  dailyKmLimit: '250',
  vehicleCost: '0',
  purchasingDate: '',
  featureOnWebsite: false,
  photoName: '',
  logoName: '',
  registrationImageName: '',
  insuranceImageName: '',
  additionalImagesName: '',
}

function asEnum<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback
}

function toDefaults(vehicle?: VehicleDetail): VehicleFormValues {
  if (!vehicle) return DEFAULT_VALUES
  const ownership = vehicle.ownership
  const engine = vehicle.engineNumber ?? ''
  return {
    ...DEFAULT_VALUES,
    organizationId: vehicle.organizationId,
    branchId: vehicle.branchId,
    legalEntityId: vehicle.legalEntityId,
    plateNumber: vehicle.plateNumber,
    vin: vehicle.vin ?? '',
    make: vehicle.make,
    model: vehicle.model,
    year: String(vehicle.year),
    color: vehicle.color ?? '',
    category: vehicle.category ?? '',
    transmission: asEnum<VehicleTransmission>(
      vehicle.transmission,
      ['automatic', 'manual'],
      'automatic',
    ),
    fuelType: asEnum<VehicleFuelType>(
      vehicle.fuelType,
      ['petrol', 'diesel', 'hybrid', 'electric'],
      'petrol',
    ),
    seatingCapacity: String(vehicle.seatingCapacity ?? 5),
    engineNumber: engine,
    chassisNumber: engine,
    mileageKm: vehicle.mileageKm != null ? String(vehicle.mileageKm) : '',
    notes: vehicle.notes ?? '',
    ownershipType: asEnum<OwnershipType>(
      vehicle.ownershipType,
      ['company', 'investor', 'borrowed', 'leased'],
      'company',
    ),
    investorName: ownership?.investorName ?? '',
    investorReference: ownership?.investorReference ?? '',
    lenderName: ownership?.lenderName ?? '',
    expectedReturnOn: ownership?.expectedReturnOn ?? '',
    lessorName: ownership?.lessorName ?? '',
    leaseStartsOn: ownership?.leaseStartsOn ?? '',
    leaseEndsOn: ownership?.leaseEndsOn ?? '',
    leaseAmount: ownership?.leaseAmount ?? '',
    leaseCurrency: ownership?.leaseCurrency ?? 'AED',
    financingCompany: ownership?.lessorName ?? '',
    purchasePrice: ownership?.purchasePrice ?? '',
    downPayment: ownership?.downPayment ?? '',
    financedAmount: ownership?.financedAmount ?? '',
    interestRate: ownership?.interestRate ?? '',
    numberOfInstallments:
      ownership?.numberOfInstallments != null ? String(ownership.numberOfInstallments) : '',
    monthlyInstallment: ownership?.leaseAmount ?? '',
    firstPaymentDate: ownership?.leaseStartsOn ?? '',
    lastPaymentDate: ownership?.leaseEndsOn ?? '',
    registrationExpiresOn: vehicle.compliance?.registration?.expiresOn ?? '',
    insuranceExpiresOn: vehicle.compliance?.insurance?.expiresOn ?? '',
    inspectionExpiresOn: vehicle.compliance?.inspection?.expiresOn ?? '',
    purchasingDate: vehicle.purchasedOn ?? '',
    salikTagNumber: vehicle.salikTagNumber ?? '',
    mulkiyaNumber: vehicle.mulkiyaNumber ?? '',
    latitude: vehicle.latitude ?? '',
    longitude: vehicle.longitude ?? '',
    featureOnWebsite: Boolean(vehicle.featureOnWebsite),
  }
}

/** Date input `min`: keep an existing past value visible, otherwise today. */
function expiryInputMin(existing: string | undefined, today: string): string | undefined {
  if (existing && /^\d{4}-\d{2}-\d{2}$/.test(existing) && existing < today) return existing
  return today
}

/**
 * The API reports nested paths such as `ownership.lessorName`; the form is flat, so errors are
 * mapped by their last path segment. Anything the form does not own is shown at the top.
 */
function applyVehicleFieldErrors(
  setError: UseFormSetError<VehicleFormValues>,
  error: NormalizedApiError,
): boolean {
  if (!error.fieldErrors) return false

  const unmapped: string[] = []
  for (const [path, message] of Object.entries(error.fieldErrors)) {
    const field = path.split('.').pop() ?? path
    if (vehicleFormFields.has(field)) {
      setError(field as keyof VehicleFormValues, { message })
    } else {
      unmapped.push(message)
    }
  }
  if (unmapped.length > 0) setError('root', { message: unmapped.join(' ') })
  return true
}

/** Creates a vehicle, or edits one when `vehicle` is provided. Status is never edited here. */
export function VehicleFormDialog({
  open,
  vehicle,
  onClose,
  onSaved,
}: {
  open: boolean
  vehicle?: VehicleDetail
  onClose: () => void
  /** Called after a successful create with the new vehicle id (when the API returned one). */
  onSaved?: (id?: string) => void
}) {
  const { t, tm } = useTranslation()
  const options = useVehicleOptions()
  const organizations = useOrganizationOptions()
  const [createVehicle] = useCreateVehicleMutation()
  const [updateVehicle] = useUpdateVehicleMutation()
  const [uploadVehiclePhoto] = useUploadVehiclePhotoMutation()
  const [createRate] = useCreateVehicleRateMutation()
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [baselineRents, setBaselineRents] = useState({
    daily: '',
    weekly: '',
    monthly: '',
    currency: 'AED',
  })
  const isEdit = Boolean(vehicle)
  const showOrganization = !isEdit && organizations.required
  const today = todayDateInput()
  const allowedPastExpiries = useMemo(
    () =>
      vehicle
        ? [
            vehicle.compliance?.registration?.expiresOn ?? '',
            vehicle.compliance?.insurance?.expiresOn ?? '',
            vehicle.compliance?.inspection?.expiresOn ?? '',
          ]
        : [],
    [vehicle],
  )
  const validationRef = useRef({ vehicle, allowedPastExpiries })
  validationRef.current = { vehicle, allowedPastExpiries }
  const form = useForm<VehicleFormValues>({
    resolver: async (values, context, options) => {
      const current = validationRef.current
      const schema = current.vehicle
        ? createVehicleFormSchema(current.allowedPastExpiries)
        : vehicleFormSchema
      return zodResolver(schema)(values, context, options)
    },
    defaultValues: toDefaults(vehicle),
  })

  const selectedOrganizationId = form.watch('organizationId')
  const ownershipType = form.watch('ownershipType')
  const organizationScope =
    (showOrganization ? selectedOrganizationId : undefined) || vehicle?.organizationId || undefined
  const scopeReady = open && (!showOrganization || Boolean(organizationScope))
  const branches = useBranchOptions({ enabled: scopeReady, organizationId: organizationScope })
  const catalogQueryArg = organizationScope ? { organizationId: organizationScope } : undefined
  const makesQuery = useGetVehicleMakesQuery(catalogQueryArg, { skip: !open })
  const typesQuery = useGetVehicleTypesQuery(catalogQueryArg, { skip: !open })
  const ratesQuery = useGetVehicleRatesQuery(
    { id: vehicle?.id ?? '', page: 1, pageSize: 50 },
    { skip: !open || !vehicle?.id },
  )

  useEffect(() => {
    if (!open) return
    const defaults = toDefaults(vehicle)
    form.reset(defaults)
    setPhotoFile(null)
    // Explicitly re-apply optional text fields so edit never stays blank after remount/HMR.
    if (vehicle) {
      form.setValue('salikTagNumber', defaults.salikTagNumber, { shouldDirty: false })
      form.setValue('mulkiyaNumber', defaults.mulkiyaNumber, { shouldDirty: false })
      form.setValue('latitude', defaults.latitude, { shouldDirty: false })
      form.setValue('longitude', defaults.longitude, { shouldDirty: false })
      form.setValue('purchasingDate', defaults.purchasingDate, { shouldDirty: false })
      form.setValue('featureOnWebsite', defaults.featureOnWebsite, { shouldDirty: false })
      form.setValue('ownershipType', defaults.ownershipType, { shouldDirty: false })
      form.setValue('financingCompany', defaults.financingCompany, { shouldDirty: false })
      form.setValue('lessorName', defaults.lessorName, { shouldDirty: false })
      form.setValue('purchasePrice', defaults.purchasePrice, { shouldDirty: false })
      form.setValue('downPayment', defaults.downPayment, { shouldDirty: false })
      form.setValue('financedAmount', defaults.financedAmount, { shouldDirty: false })
      form.setValue('interestRate', defaults.interestRate, { shouldDirty: false })
      form.setValue('numberOfInstallments', defaults.numberOfInstallments, { shouldDirty: false })
      form.setValue('monthlyInstallment', defaults.monthlyInstallment, { shouldDirty: false })
      form.setValue('leaseAmount', defaults.leaseAmount, { shouldDirty: false })
      form.setValue('leaseCurrency', defaults.leaseCurrency, { shouldDirty: false })
      form.setValue('firstPaymentDate', defaults.firstPaymentDate, { shouldDirty: false })
      form.setValue('lastPaymentDate', defaults.lastPaymentDate, { shouldDirty: false })
      form.setValue('leaseStartsOn', defaults.leaseStartsOn, { shouldDirty: false })
      form.setValue('leaseEndsOn', defaults.leaseEndsOn, { shouldDirty: false })
    }
  }, [open, vehicle, form])

  useEffect(() => {
    if (!open || !vehicle?.id || ratesQuery.isFetching || !ratesQuery.data) return
    const active = ratesQuery.data.items.filter(
      (rate) => rate.status === 'active' && rate.vehicleId === vehicle.id,
    )
    const daily = active.find((rate) => rate.rateType === 'daily')
    const weekly = active.find((rate) => rate.rateType === 'weekly')
    const monthly = active.find((rate) => rate.rateType === 'monthly')
    const currency = daily?.currency || weekly?.currency || monthly?.currency || 'AED'
    const next = {
      daily: daily?.amount ?? '',
      weekly: weekly?.amount ?? '',
      monthly: monthly?.amount ?? '',
      currency,
    }
    setBaselineRents(next)
    form.setValue('dailyRent', next.daily, { shouldDirty: false })
    form.setValue('weeklyRent', next.weekly, { shouldDirty: false })
    form.setValue('monthlyRent', next.monthly, { shouldDirty: false })
    form.setValue('leaseCurrency', next.currency, { shouldDirty: false })
  }, [open, vehicle?.id, ratesQuery.data, ratesQuery.isFetching, form])

  const persistPhoto = async (vehicleId: string) => {
    if (!photoFile) return
    const mimeType = photoFile.type
    if (!PHOTO_MIME_TYPES.has(mimeType)) {
      throw Object.assign(new Error(t('vehicles.validation.photoType')), { status: 422 })
    }
    const contentBase64 = await fileToBase64(photoFile)
    await uploadVehiclePhoto({
      id: vehicleId,
      body: {
        filename: photoFile.name,
        mimeType,
        contentBase64,
      },
    }).unwrap()
  }

  const branchOptions = [
    { value: '', label: t('vehicles.form.selectBranch') },
    ...branches.items.map((branch) => ({
      value: branch.id,
      label: `${branch.name} (${branch.code})`,
    })),
  ]
  if (vehicle && !branchOptions.some((option) => option.value === vehicle.branchId)) {
    branchOptions.push({ value: vehicle.branchId, label: vehicle.branchId })
  }

  const makeOptions = Array.from(
    new Set([
      ...(makesQuery.data?.map((item) => item.name) ?? []),
      ...(vehicle?.make ? [vehicle.make] : []),
    ]),
  )
  const typeOptions = Array.from(
    new Set([
      ...(typesQuery.data?.map((item) => item.name) ?? []),
      ...(vehicle?.category ? [vehicle.category] : []),
    ]),
  )

  const persistRentRates = async (
    vehicleId: string,
    values: VehicleFormValues,
    options?: { onlyChanged?: boolean },
  ) => {
    const currency = (values.leaseCurrency || 'AED').trim().toUpperCase() || 'AED'
    const effectiveFrom = new Date().toISOString()
    const rents = [
      {
        rateType: 'daily' as const,
        amount: values.dailyRent,
        previous: baselineRents.daily,
      },
      {
        rateType: 'weekly' as const,
        amount: values.weeklyRent,
        previous: baselineRents.weekly,
      },
      {
        rateType: 'monthly' as const,
        amount: values.monthlyRent,
        previous: baselineRents.monthly,
      },
    ]
    for (const rent of rents) {
      const amount = rent.amount.trim()
      if (!amount) continue
      if (options?.onlyChanged) {
        const currencyChanged =
          currency !== (baselineRents.currency || 'AED').trim().toUpperCase()
        if (amount === rent.previous.trim() && !currencyChanged) continue
      }
      await createRate({
        id: vehicleId,
        body: {
          rateType: rent.rateType,
          amount,
          currency,
          effectiveFrom,
        },
      }).unwrap()
    }
  }

  const onSubmit = form.handleSubmit(async (values) => {
    if (showOrganization && !values.organizationId) {
      form.setError('organizationId', { message: 'validation.selectRequired' })
      return
    }

    try {
      if (vehicle) {
        await updateVehicle({ id: vehicle.id, body: toVehicleUpdateBody(values) }).unwrap()
        try {
          await persistRentRates(vehicle.id, values, { onlyChanged: true })
        } catch (rateError) {
          const normalized = normalizeApiError(rateError)
          form.setError('root', { message: normalized.message })
          return
        }
        try {
          await persistPhoto(vehicle.id)
        } catch (photoError) {
          const normalized = normalizeApiError(photoError)
          form.setError('root', {
            message: normalized.message || t('vehicles.validation.photoUploadFailed'),
          })
          return
        }
        onSaved?.(vehicle.id)
      } else {
        const created = await createVehicle(toVehicleCreateBody(values)).unwrap()
        if (created.id) {
          try {
            await persistRentRates(created.id, values)
          } catch {
            // Vehicle was created; rate failures should not block closing the form.
          }
          try {
            await persistPhoto(created.id)
          } catch {
            // Vehicle was created; photo can be re-uploaded from edit.
          }
          onSaved?.(created.id)
        } else {
          onSaved?.()
        }
      }
      onClose()
    } catch (error) {
      const normalized = normalizeApiError(error)
      if (!applyVehicleFieldErrors(form.setError, normalized)) {
        form.setError('root', { message: normalized.message })
      }
    }
  })

  const errors = form.formState.errors
  const submitting = form.formState.isSubmitting
  const registrationMin = expiryInputMin(vehicle?.compliance?.registration?.expiresOn ?? undefined, today)
  const insuranceMin = expiryInputMin(vehicle?.compliance?.insurance?.expiresOn ?? undefined, today)
  const inspectionMin = expiryInputMin(vehicle?.compliance?.inspection?.expiresOn ?? undefined, today)

  return (
    <Modal
      open={open}
      size="wide"
      title={isEdit ? t('vehicles.edit.title') : t('vehicles.create.title')}
      description={
        vehicle
          ? t('vehicles.edit.description', { name: vehicle.plateNumber })
          : t('vehicles.create.description')
      }
      onClose={onClose}
    >
      <form className="grid gap-5" noValidate onSubmit={onSubmit}>
        {errors.root ? <Alert tone="danger">{tm(errors.root.message)}</Alert> : null}

        {showOrganization ? (
          <Select
            label={t('vehicles.form.organization')}
            required
            options={[
              { value: '', label: t('vehicles.form.selectOrganization') },
              ...organizations.options,
            ]}
            error={tm(errors.organizationId?.message)}
            {...form.register('organizationId', {
              onChange: () => {
                form.setValue('branchId', '')
                form.setValue('legalEntityId', '')
              },
            })}
          />
        ) : null}

        <div className="grid items-start gap-x-6 gap-y-4 lg:grid-cols-2">
          {/* Left column — matches New Vehicle reference */}
          <div className="grid gap-4">
            <Input
              label={t('vehicles.form.vin')}
              dir="ltr"
              autoCapitalize="characters"
              hint={t('vehicles.form.vinHint')}
              error={tm(errors.vin?.message)}
              {...form.register('vin')}
            />
            <Select
              label={t('vehicles.form.fuelType')}
              options={options.fuelTypeOptions}
              error={tm(errors.fuelType?.message)}
              {...form.register('fuelType')}
            />
            <CatalogCombobox
              label={t('vehicles.form.make')}
              required
              value={form.watch('make')}
              options={makeOptions}
              placeholder={t('vehicles.form.makePlaceholder')}
              hint={t('vehicles.form.makeHint')}
              error={tm(errors.make?.message)}
              onChange={(value) =>
                form.setValue('make', value, { shouldDirty: true, shouldValidate: true })
              }
            />
            <div className="grid gap-3">
              {vehicle?.hasPhoto ? (
                <div className="flex items-center gap-3">
                  <VehicleThumbnail
                    size="md"
                    vehicleId={vehicle.id}
                    hasPhoto
                    alt={`${vehicle.make} ${vehicle.model}`.trim()}
                  />
                  <p className="text-muted text-sm">{t('vehicles.form.currentPhoto')}</p>
                </div>
              ) : null}
              <FileBrowseField
                label={t('vehicles.form.photo')}
                accept="image/jpeg,image/png,image/webp"
                hint={t('vehicles.form.photoHint')}
                currentFileLabel={vehicle?.hasPhoto ? t('vehicles.form.currentPhoto') : undefined}
                onFilesChange={(files) => {
                  const file = files?.[0] ?? null
                  setPhotoFile(file)
                  form.setValue('photoName', file?.name ?? '', { shouldDirty: true })
                }}
              />
            </div>
            <FileBrowseField
              label={t('vehicles.form.logo')}
              accept="image/*"
              onFilesChange={(files) =>
                form.setValue('logoName', files?.[0]?.name ?? '', { shouldDirty: true })
              }
            />
            <Input
              label={t('vehicles.form.dailyRent')}
              dir="ltr"
              inputMode="decimal"
              error={tm(errors.dailyRent?.message)}
              {...form.register('dailyRent')}
            />
            <Input
              label={t('vehicles.form.weeklyRent')}
              dir="ltr"
              inputMode="decimal"
              error={tm(errors.weeklyRent?.message)}
              {...form.register('weeklyRent')}
            />
            <Input
              label={t('vehicles.form.monthlyRent')}
              dir="ltr"
              inputMode="decimal"
              error={tm(errors.monthlyRent?.message)}
              {...form.register('monthlyRent')}
            />
            <Input
              label={t('vehicles.form.plateNumber')}
              required
              dir="ltr"
              autoCapitalize="characters"
              hint={t('vehicles.form.plateHint')}
              error={tm(errors.plateNumber?.message)}
              {...form.register('plateNumber')}
            />
            <Input
              label={t('vehicles.form.salikTagNumber')}
              dir="ltr"
              error={tm(errors.salikTagNumber?.message)}
              {...form.register('salikTagNumber')}
            />
            <CatalogCombobox
              label={t('vehicles.form.vehicleType')}
              required
              value={form.watch('category')}
              options={typeOptions}
              placeholder={t('vehicles.form.typePlaceholder')}
              hint={t('vehicles.form.typeHint')}
              error={tm(errors.category?.message)}
              onChange={(value) =>
                form.setValue('category', value, { shouldDirty: true, shouldValidate: true })
              }
            />
            {branches.allowed ? (
              <Select
                label={t('vehicles.form.branch')}
                required
                options={branchOptions}
                error={tm(errors.branchId?.message)}
                {...form.register('branchId')}
              />
            ) : (
              <Input
                label={t('vehicles.form.branchId')}
                required
                dir="ltr"
                hint={t('vehicles.form.branchIdHint')}
                error={tm(errors.branchId?.message)}
                {...form.register('branchId')}
              />
            )}
            {branches.allowed && !branches.isLoading && branches.items.length === 0 ? (
              <p className="text-muted -mt-2 text-sm">{t('vehicles.form.noBranches')}</p>
            ) : null}
          </div>

          {/* Right column — matches New Vehicle reference */}
          <div className="grid gap-4">
            <Input
              label={t('vehicles.form.year')}
              required
              dir="ltr"
              inputMode="numeric"
              hint={t('vehicles.form.yearHint')}
              error={tm(errors.year?.message)}
              {...form.register('year')}
            />
            <Input
              label={t('vehicles.form.model')}
              required
              hint={t('vehicles.form.modelHint')}
              error={tm(errors.model?.message)}
              {...form.register('model')}
            />
            <Input
              label={t('vehicles.form.color')}
              error={tm(errors.color?.message)}
              {...form.register('color')}
            />
            <Input
              label={t('vehicles.form.chassisNumber')}
              dir="ltr"
              error={tm(errors.chassisNumber?.message)}
              {...form.register('chassisNumber')}
            />
            <Input
              label={t('vehicles.form.latitude')}
              dir="ltr"
              error={tm(errors.latitude?.message)}
              {...form.register('latitude')}
            />
            <Input
              label={t('vehicles.form.longitude')}
              dir="ltr"
              error={tm(errors.longitude?.message)}
              {...form.register('longitude')}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t('vehicles.form.registrationExpiresOn')}
                type="date"
                dir="ltr"
                min={registrationMin}
                error={tm(errors.registrationExpiresOn?.message)}
                {...form.register('registrationExpiresOn')}
              />
              <FileBrowseField
                label={t('vehicles.form.registrationImage')}
                accept="image/*,.pdf"
                onFilesChange={(files) =>
                  form.setValue('registrationImageName', files?.[0]?.name ?? '', {
                    shouldDirty: true,
                  })
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t('vehicles.form.insuranceExpiresOn')}
                type="date"
                dir="ltr"
                min={insuranceMin}
                error={tm(errors.insuranceExpiresOn?.message)}
                {...form.register('insuranceExpiresOn')}
              />
              <FileBrowseField
                label={t('vehicles.form.insuranceImage')}
                accept="image/*,.pdf"
                onFilesChange={(files) =>
                  form.setValue('insuranceImageName', files?.[0]?.name ?? '', { shouldDirty: true })
                }
              />
            </div>
            <Input
              label={t('vehicles.form.mulkiyaNumber')}
              dir="ltr"
              error={tm(errors.mulkiyaNumber?.message)}
              {...form.register('mulkiyaNumber')}
            />
            <Input
              label={t('vehicles.form.mulkiyaExpiresOn')}
              type="date"
              dir="ltr"
              min={inspectionMin}
              error={tm(errors.inspectionExpiresOn?.message)}
              {...form.register('inspectionExpiresOn')}
            />
            <Input
              label={t('vehicles.form.mileageKm')}
              dir="ltr"
              inputMode="numeric"
              error={tm(errors.mileageKm?.message)}
              {...form.register('mileageKm')}
            />
            <Input
              label={t('vehicles.form.dailyKmLimit')}
              dir="ltr"
              inputMode="numeric"
              error={tm(errors.dailyKmLimit?.message)}
              {...form.register('dailyKmLimit')}
            />
            <Input
              label={t('vehicles.form.vehicleCost')}
              dir="ltr"
              inputMode="decimal"
              error={tm(errors.vehicleCost?.message)}
              {...form.register('vehicleCost')}
            />
            <Input
              label={t('vehicles.form.purchasingDate')}
              type="date"
              dir="ltr"
              error={tm(errors.purchasingDate?.message)}
              {...form.register('purchasingDate')}
            />
            <Select
              label={t('vehicles.form.ownershipType')}
              options={
                // Keep a legacy investor/borrowed value visible when editing an older vehicle.
                vehicle &&
                (vehicle.ownershipType === 'investor' || vehicle.ownershipType === 'borrowed') &&
                !options.formOwnershipOptions.some((option) => option.value === vehicle.ownershipType)
                  ? [
                      ...options.formOwnershipOptions,
                      {
                        value: vehicle.ownershipType,
                        label: options.labelOf(options.ownershipOptions, vehicle.ownershipType),
                      },
                    ]
                  : options.formOwnershipOptions
              }
              error={tm(errors.ownershipType?.message)}
              {...form.register('ownershipType')}
            />
            <FileBrowseField
              label={t('vehicles.form.additionalImages')}
              accept="image/*"
              multiple
              onFilesChange={(files) =>
                form.setValue(
                  'additionalImagesName',
                  files?.length
                    ? Array.from(files)
                        .map((file) => file.name)
                        .join(', ')
                    : '',
                  { shouldDirty: true },
                )
              }
            />
            <label className="text-ink flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="border-line text-brand size-4 rounded accent-[var(--ui-brand)]"
                checked={Boolean(form.watch('featureOnWebsite'))}
                onChange={(event) =>
                  form.setValue('featureOnWebsite', event.target.checked, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
              {t('vehicles.form.featureOnWebsite')}
            </label>
          </div>
        </div>

        {ownershipType === 'investor' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t('vehicles.form.investorName')}
              required
              error={tm(errors.investorName?.message)}
              {...form.register('investorName')}
            />
            <Input
              label={t('vehicles.form.investorReference')}
              dir="ltr"
              error={tm(errors.investorReference?.message)}
              {...form.register('investorReference')}
            />
          </div>
        ) : null}
        {ownershipType === 'borrowed' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t('vehicles.form.lenderName')}
              required
              error={tm(errors.lenderName?.message)}
              {...form.register('lenderName')}
            />
            <Input
              label={t('vehicles.form.expectedReturnOn')}
              type="date"
              dir="ltr"
              error={tm(errors.expectedReturnOn?.message)}
              {...form.register('expectedReturnOn')}
            />
          </div>
        ) : null}
        {ownershipType === 'leased' ? (
          <div className="border-line grid gap-4 rounded-xl border p-4">
            <Input
              label={t('vehicles.form.financingCompany')}
              required
              error={tm(errors.financingCompany?.message)}
              {...form.register('financingCompany')}
            />
            <Input
              label={t('vehicles.form.purchasePrice')}
              dir="ltr"
              inputMode="decimal"
              error={tm(errors.purchasePrice?.message)}
              {...form.register('purchasePrice')}
            />
            <Input
              label={t('vehicles.form.downPayment')}
              dir="ltr"
              inputMode="decimal"
              error={tm(errors.downPayment?.message)}
              {...form.register('downPayment')}
            />
            <Input
              label={t('vehicles.form.financedAmount')}
              dir="ltr"
              inputMode="decimal"
              error={tm(errors.financedAmount?.message)}
              {...form.register('financedAmount')}
            />
            <Input
              label={t('vehicles.form.interestRate')}
              dir="ltr"
              inputMode="decimal"
              error={tm(errors.interestRate?.message)}
              {...form.register('interestRate')}
            />
            <Input
              label={t('vehicles.form.numberOfInstallments')}
              dir="ltr"
              inputMode="numeric"
              error={tm(errors.numberOfInstallments?.message)}
              {...form.register('numberOfInstallments')}
            />
            <Input
              label={t('vehicles.form.monthlyInstallment')}
              dir="ltr"
              inputMode="decimal"
              error={tm(errors.monthlyInstallment?.message)}
              {...form.register('monthlyInstallment')}
            />
            <Input
              label={t('vehicles.form.firstPaymentDate')}
              type="date"
              dir="ltr"
              error={tm(errors.firstPaymentDate?.message)}
              {...form.register('firstPaymentDate')}
            />
            <Input
              label={t('vehicles.form.lastPaymentDate')}
              type="date"
              dir="ltr"
              hint={t('vehicles.form.lastPaymentDateHint')}
              error={tm(errors.lastPaymentDate?.message)}
              {...form.register('lastPaymentDate')}
            />
          </div>
        ) : null}

        <ModalActions>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? t('vehicles.edit.submit') : t('vehicles.create.submit')}
          </Button>
        </ModalActions>
      </form>
    </Modal>
  )
}
