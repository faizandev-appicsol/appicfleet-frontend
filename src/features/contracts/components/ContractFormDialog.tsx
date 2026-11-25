import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router'
import { PERMISSIONS } from '@/app/router/access'
import { appConfig } from '@/config/app.config'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { partsInZone, zonedLocalToUtc } from '@/features/bookings/utils/zonedTime'
import { useBranchOptions } from '@/features/branches/hooks/useBranchOptions'
import {
  useDeleteContractDocumentMutation,
  useGetContractQuoteQuery,
  useLazyGetContractDocumentContentQuery,
  useUploadContractDocumentMutation,
} from '@/features/contracts/api/contractsApi'
import {
  contractTypes,
  type ContractDocument,
  type ContractDetail,
  type ContractWriteBody,
} from '@/features/contracts/schemas/contract.schema'
import { useGetCustomerQuery, useGetCustomersQuery } from '@/features/customers/api/customersApi'
import {
  customerFormSchema,
  customerToFormValues,
  toCustomerCreateBody,
  type CustomerFormValues,
} from '@/features/customers/schemas/customer.schema'
import { useOrganizationOptions } from '@/features/organizations/hooks/useOrganizationOptions'
import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { useGetVehiclesQuery } from '@/features/vehicles/api/vehiclesApi'
import { API_MAX_PAGE_SIZE } from '@/config/constants'
import { useTranslation, type MessageKey } from '@/i18n'
import { normalizeApiError } from '@/lib/api/apiError'
import { fileToBase64 } from '@/utils/file'
import {
  emptyDetails,
  fileKeys,
  hydrateDetails,
  type ContractDetails,
  type FlagKey,
  type TextKey,
} from '@/features/contracts/utils/contractFormState'
import { getContractFormOptions } from '@/features/contracts/utils/contractFormOptions'
import { computePricing, money, periodUnits, toNumber, type RentalPeriod } from '@/features/contracts/utils/contractPricing'
import {
  Check,
  ChoiceGroup,
  FieldError,
  FieldGrid,
  FileField,
  FormErrorBoundary,
  MultiChoice,
  PercentSlider,
  Section,
  SubHeading,
  SummaryRow,
} from './ContractFormFields'

type Props = {
  open: boolean
  contract?: ContractDetail
  organizationId?: string
  /** Contract type chosen from the register before the dialog opens. */
  initialType?: (typeof contractTypes)[number]
  onClose: () => void
  onSubmit: (body: ContractWriteBody, contractId?: string) => Promise<ContractDetail>
}

type FieldEvent = ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>

const NO_FILES: File[] = []
const FILE_DOCUMENT_TYPES: Record<string, string> = {
  idImage: 'CUSTOMER_ID',
  idExpiryImage: 'CUSTOMER_ID_EXPIRY',
  licenseImage: 'DRIVING_LICENSE',
  licenseExpiryImage: 'DRIVING_LICENSE_EXPIRY',
  signature: 'CUSTOMER_SIGNATURE',
  mileageImage: 'HANDOVER_MILEAGE',
  fuelImage: 'HANDOVER_FUEL',
  documents: 'ADDITIONAL',
}
const ACTIVE_LOCKED_DETAIL_KEYS = new Set([
  'custName',
  'custMobile',
  'custEmail',
  'custNationality',
  'custDob',
  'custAddress',
  'custIdNumber',
  'custIdExpiry',
  'custIdIssueDate',
  'custIdIssuePlace',
  'custLicenseNumber',
  'custLicenseIssue',
  'custLicenseExpiry',
  'customerKind',
  'vatNumber',
  'residency',
])
const SUPPORTED_FILE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
/** Today as YYYY-MM-DD in the user's own timezone (toISOString would give the UTC date). */
const localToday = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}
/** past = birth / issue dates (no future). future = expiry dates (no past). */
const DATE_RULES: Partial<Record<TextKey, { rule: 'past' | 'future'; message: MessageKey }>> = {
  custDob: { rule: 'past', message: 'contracts.form.dobFuture' },
  custIdIssueDate: { rule: 'past', message: 'contracts.form.issueFuture' },
  custIdExpiry: { rule: 'future', message: 'contracts.form.idExpired' },
  custLicenseIssue: { rule: 'past', message: 'contracts.form.issueFuture' },
  custLicenseExpiry: { rule: 'future', message: 'contracts.form.licenseExpired' },
  addDriverLicenseExpiry: { rule: 'future', message: 'contracts.form.licenseExpired' },
}

const today = () => new Date().toISOString().slice(0, 10)
const MS_PER_DAY = 86_400_000
type CustomerTextKey = Exclude<keyof CustomerFormValues, 'type'>

function customerTypeForContract(
  contractType: (typeof contractTypes)[number],
  customerKind: string,
): CustomerFormValues['type'] {
  if (contractType === 'b2b' || contractType === 'draft_b2b') return 'corporate'
  if (contractType === 'b2c' || contractType === 'draft_b2c') return 'individual'
  return customerKind === 'organization' ? 'corporate' : 'individual'
}

function defaultsFromContract(contract: ContractDetail | undefined, timeZone: string) {
  if (!contract) {
    return {
      type: 'b2c' as (typeof contractTypes)[number],
      organizationId: '',
      customerId: '',
      branchId: '',
      vehicleId: '',
      pickupDate: today(),
      pickupTime: '10:00',
      returnDate: today(),
      returnTime: '18:00',
      terms: '',
      signerName: '',
      driverName: '',
      authorizedContactName: '',
      lenderName: '',
      borrowCost: '',
      notes: '',
      details: emptyDetails(),
    }
  }
  const pickup = partsInZone(contract.startsAt, timeZone)
  const returning = partsInZone(contract.endsAt, timeZone)
  const type = (contractTypes.includes(contract.type as (typeof contractTypes)[number])
    ? contract.type
    : 'b2c') as (typeof contractTypes)[number]
  return {
    type,
    organizationId: contract.organizationId,
    customerId: contract.customerId,
    branchId: contract.branchId,
    vehicleId: contract.currentVehicleId ?? '',
    pickupDate: pickup.date || today(),
    pickupTime: pickup.time || '10:00',
    returnDate: returning.date || today(),
    returnTime: returning.time || '18:00',
    terms: contract.terms[0]?.content ?? '',
    signerName: '',
    driverName: contract.driverName ?? '',
    authorizedContactName: contract.authorizedContactName ?? '',
    lenderName: contract.lenderName ?? '',
    borrowCost: contract.borrowCost ?? '',
    notes: contract.notes ?? '',
    details: hydrateDetails(contract.details),
  }
}

/** Single modal with sections for creating and editing contracts. */
export function ContractFormDialog({
  open,
  contract,
  organizationId: initialOrg,
  initialType,
  onClose,
  onSubmit,
}: Props) {
  const { t, tm } = useTranslation()
  const { can } = usePermissions()
  const formOptions = getContractFormOptions(t)
  const isEdit = Boolean(contract)
  const organizations = useOrganizationOptions()
  const [organizationId, setOrganizationId] = useState(initialOrg ?? '')
  const branches = useBranchOptions({ organizationId: organizationId || undefined })
  const [type, setType] = useState<(typeof contractTypes)[number]>(initialType ?? 'b2c')
  const [customerId, setCustomerId] = useState('')
  const [branchId, setBranchId] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [pickupDate, setPickupDate] = useState(today())
  const [pickupTime, setPickupTime] = useState('10:00')
  const [returnDate, setReturnDate] = useState(today())
  const [returnTime, setReturnTime] = useState('18:00')
  const [terms, setTerms] = useState('')
  const [signerName, setSignerName] = useState('')
  const [driverName, setDriverName] = useState('')
  const [authorizedContactName, setAuthorizedContactName] = useState('')
  const [lenderName, setLenderName] = useState('')
  const [borrowCost, setBorrowCost] = useState('')
  const [notes, setNotes] = useState('')
  const [details, setDetails] = useState<ContractDetails>(emptyDetails)
  const [newCustomer, setNewCustomer] = useState<CustomerFormValues>(customerToFormValues)
  const [files, setFiles] = useState<Record<string, File[]>>({})
  const [savedDocuments, setSavedDocuments] = useState<ContractDocument[]>([])
  const [removedDocumentIds, setRemovedDocumentIds] = useState<string[]>([])
  const [rateEdited, setRateEdited] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [notice, setNotice] = useState<string>()
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState(false)
  const [savedContract, setSavedContract] = useState(contract)
  const [savedBody, setSavedBody] = useState<string>()
  const [uploadContractDocument] = useUploadContractDocumentMutation()
  const [deleteContractDocument] = useDeleteContractDocumentMutation()
  const canViewSensitive = can(PERMISSIONS.contractViewSensitive)
  const activeEdit = (savedContract?.status ?? contract?.status) === 'active'
  const canRemoveSavedDocuments =
    can(PERMISSIONS.contractUpdate) &&
    ['draft', 'active'].includes(savedContract?.status ?? contract?.status ?? '')

  const timeZone = branches.items.find((item) => item.id === branchId)?.timezone || 'UTC'
  const needsOrganization = !isEdit && organizations.required && !organizationId

  /* ---- small binding helpers so each control is one line ---- */
  const set = <K extends keyof ContractDetails>(key: K, value: ContractDetails[K]) =>
    setDetails((previous) => ({ ...previous, [key]: value }))
  const text = (key: TextKey) => ({
    value: details[key],
    onChange: (event: FieldEvent) => set(key, event.target.value),
  })
  const customerText = (key: CustomerTextKey) => ({
    value: newCustomer[key],
    onChange: (event: FieldEvent) =>
      setNewCustomer((previous) => ({ ...previous, [key]: event.target.value })),
  })
  const flag = (key: FlagKey) => ({ checked: details[key], onChange: (value: boolean) => set(key, value) })
  const file = (key: string) => ({
    files: files[key] ?? NO_FILES,
    onChange: (next: File[]) => setFiles((previous) => ({ ...previous, [key]: next })),
  })

  const todayLocal = localToday()
  const dateErrors: Partial<Record<TextKey, string>> = {}
  for (const [key, { rule, message }] of Object.entries(DATE_RULES) as [TextKey, (typeof DATE_RULES)[TextKey] & object][]) {
    const value = details[key]
    if (!value) continue
    if ((rule === 'past' && value > todayLocal) || (rule === 'future' && value < todayLocal)) dateErrors[key] = message
  }
  const hasDateErrors = Object.keys(dateErrors).some(
    (key) => !activeEdit || !ACTIVE_LOCKED_DETAIL_KEYS.has(key),
  )
  /** Date input that blocks invalid days in the picker and shows a message if one is typed in. */
  const dateField = (key: TextKey, label: string) => (
    <div className="grid min-w-0 content-start gap-1">
      <Input
        label={label}
        type="date"
        {...(DATE_RULES[key]?.rule === 'past' ? { max: todayLocal } : { min: todayLocal })}
        {...text(key)}
      />
      {dateErrors[key] ? <FieldError>{t(dateErrors[key])}</FieldError> : null}
    </div>
  )
  const readOnlyField = (label: string, value: string | undefined, type = 'text') => (
    <Input label={label} type={type} readOnly value={value ?? ''} />
  )

  const contractId = contract?.id
  useEffect(() => {
    if (!open) return
    const zone =
      branches.items.find((item) => item.id === (contract?.branchId ?? branchId))?.timezone || 'UTC'
    const next = defaultsFromContract(contract, zone)
    setType(contract ? next.type : (initialType ?? next.type))
    setOrganizationId(initialOrg || next.organizationId)
    setCustomerId(next.customerId)
    setBranchId(next.branchId)
    setVehicleId(next.vehicleId)
    setPickupDate(next.pickupDate)
    setPickupTime(next.pickupTime)
    setReturnDate(next.returnDate)
    setReturnTime(next.returnTime)
    setTerms(next.terms)
    setSignerName(next.signerName)
    setDriverName(next.driverName)
    setAuthorizedContactName(next.authorizedContactName)
    setLenderName(next.lenderName)
    setBorrowCost(next.borrowCost)
    setNotes(next.notes)
    setDetails(next.details)
    setNewCustomer({
      ...customerToFormValues(),
      organizationId: initialOrg || next.organizationId,
      branchId: next.branchId,
      type: customerTypeForContract(next.type, next.details.customerKind),
    })
    setFiles({})
    setSavedDocuments(contract?.documents ?? [])
    setRemovedDocumentIds([])
    setSavedContract(contract)
    setSavedBody(undefined)
    setRateEdited(Boolean(next.details.dailyRate))
    setNotice(undefined)
    setError(undefined)
    // Reset only when the dialog opens or the contract being edited changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [open, contractId, initialOrg, initialType])

  const customers = useGetCustomersQuery(
    {
      page: 1,
      pageSize: API_MAX_PAGE_SIZE,
      organizationId: organizationId || undefined,
      status: 'active',
      sort: 'displayName',
      order: 'asc',
    },
    { skip: !open || needsOrganization },
  )
  const selectedCustomerQuery = useGetCustomerQuery(
    { id: customerId, reveal: false },
    { skip: !open || !customerId },
  )
  const vehicles = useGetVehiclesQuery(
    {
      page: 1,
      pageSize: API_MAX_PAGE_SIZE,
      organizationId: organizationId || undefined,
      sort: 'plateNumber',
      order: 'asc',
    },
    { skip: !open || needsOrganization },
  )

  const window = useMemo(() => {
    if (!pickupDate || !returnDate || !pickupTime || !returnTime) return undefined
    const starts = zonedLocalToUtc(pickupDate, pickupTime, timeZone)
    const ends = zonedLocalToUtc(returnDate, returnTime, timeZone)
    if (Number.isNaN(starts.getTime()) || Number.isNaN(ends.getTime())) return undefined
    if (!(ends > starts)) return undefined
    return { startsAt: starts.toISOString(), endsAt: ends.toISOString() }
  }, [pickupDate, pickupTime, returnDate, returnTime, timeZone])

  const isDateWindowInvalid = useMemo(() => {
    if (!pickupDate || !returnDate || !pickupTime || !returnTime) return false
    const starts = zonedLocalToUtc(pickupDate, pickupTime, timeZone)
    const ends = zonedLocalToUtc(returnDate, returnTime, timeZone)
    if (Number.isNaN(starts.getTime()) || Number.isNaN(ends.getTime())) return false
    return !(ends > starts)
  }, [pickupDate, pickupTime, returnDate, returnTime, timeZone])

  const quote = useGetContractQuoteQuery(
    {
      vehicleId,
      startsAt: window?.startsAt ?? '',
      endsAt: window?.endsAt ?? '',
      organizationId: organizationId || undefined,
    },
    { skip: !open || !vehicleId || !window },
  )

  // Pre-fill the rate from the quote (also when the vehicle changes), but never overwrite what staff typed.
  const quotedRate = quote.data?.unitAmount
  useEffect(() => {
    if (quotedRate === undefined || rateEdited) return
    // Returning the same object when nothing changed lets React skip the re-render (no loops).
    setDetails((previous) => (previous.dailyRate === quotedRate ? previous : { ...previous, dailyRate: quotedRate }))
  }, [quotedRate, rateEdited])

  const customerOptions = [
    { value: '', label: t('contracts.form.customerPlaceholder') },
    ...(customerId && !(customers.data?.items ?? []).some((customer) => customer.id === customerId)
      ? [{
          value: customerId,
          label: savedContract?.customerName ?? contract?.customerName ?? t('common.notSet'),
        }]
      : []),
    ...(customers.data?.items ?? [])
      .filter((customer) => {
        const requiredType =
          type === 'b2c' || type === 'draft_b2c'
            ? 'individual'
            : type === 'b2b' || type === 'draft_b2b'
              ? 'corporate'
              : undefined
        return !requiredType || customer.type === requiredType
      })
      .map((customer) => ({
      value: customer.id,
      label: `${customer.displayName} (${customer.customerNumber})`,
      })),
  ]
  const vehicleOptions = [
    { value: '', label: t('contracts.form.vehiclePlaceholder') },
    ...(vehicles.data?.items ?? [])
      .filter((vehicle) => type !== 'borrow' || vehicle.ownershipType === 'borrowed')
      .map((vehicle) => ({
      value: vehicle.id,
      label: `${vehicle.plateNumber} — ${vehicle.make} ${vehicle.model}`,
      })),
  ]

  /* ---- vehicle info (read-only, from the selected vehicle) ---- */
  const selectedVehicle = vehicles.data?.items.find(
    (vehicle) =>
      vehicle.id === vehicleId && (type !== 'borrow' || vehicle.ownershipType === 'borrowed'),
  )
  const selectedCustomer = customers.data?.items.find((customer) => customer.id === customerId)
  const selectedCustomerDetail = selectedCustomerQuery.data
  const newCustomerType = customerTypeForContract(type, details.customerKind)
  const fixedCustomerType = type === 'b2c' || type === 'draft_b2c' || type === 'b2b' || type === 'draft_b2b'
  const vehicleYear = selectedVehicle?.year

  const documentsForField = (field: string) => {
    const type = FILE_DOCUMENT_TYPES[field]?.toLowerCase()
    return savedDocuments.filter((document) => document.documentType.toLowerCase() === type)
  }
  const existingDocumentCards = (field: string) => {
    const id = savedContract?.id ?? contract?.id
    if (!id) return null
    return documentsForField(field).map((document) => (
      <ExistingContractDocument
        key={document.id}
        contractId={id}
        document={document}
        canView={canViewSensitive}
        canRemove={canRemoveSavedDocuments}
        markedForRemoval={removedDocumentIds.includes(document.id)}
        onRemove={() =>
          setRemovedDocumentIds((previous) =>
            previous.includes(document.id) ? previous : [...previous, document.id],
          )
        }
        onRestore={() =>
          setRemovedDocumentIds((previous) => previous.filter((id) => id !== document.id))
        }
      />
    ))
  }

  /* ---- pricing ---- */
  const currency = quote.data?.currency ?? 'AED'
  const days = window ? Math.max(1, Math.ceil((Date.parse(window.endsAt) - Date.parse(window.startsAt)) / MS_PER_DAY)) : 0
  const period = details.rentalPeriod as RentalPeriod
  const units = periodUnits(days, period)
  const unitLabel = period === 'weekly'
    ? t('contracts.form.weeks')
    : period === 'monthly'
      ? t('contracts.form.months')
      : t('contracts.form.daysUnit')
  const pricing = computePricing({
    rate: toNumber(details.dailyRate),
    units,
    amountOverride: details.amountOverride,
    addVat: details.addVat,
    amountContainsVat: details.amountContainsVat,
  })
  const extrasTotal =
    (details.deliver ? toNumber(details.deliveryFee) : 0) +
    (details.babySeats ? toNumber(details.babySeatFee) * Math.max(1, toNumber(details.babySeatCount)) : 0) +
    (details.insurance ? toNumber(details.insuranceFee) : 0)
  const grandTotal = pricing.total + extrasTotal
  const advancePaid = details.advanceType === 'full' ? grandTotal : toNumber(details.advanceAmount)
  const depositPaid = toNumber(details.depositAmount)
  const paidTotal = advancePaid + depositPaid
  const balanceDue = Math.max(0, grandTotal - advancePaid)

  async function save(event: FormEvent) {
    event.preventDefault()
    const selectedFiles = Object.values(files).flat()
    if (selectedFiles.some((file) => !SUPPORTED_FILE_TYPES.has(file.type) || file.size > 5_000_000)) {
      setError(t('contracts.form.fileTypeOrSize'))
      return
    }
    if (
      needsOrganization ||
      !vehicleId ||
      !window ||
      terms.trim().length < 3
    ) {
      setError(!vehicleId ? t('contracts.form.vehicleRequired') : t('contracts.form.required'))
      return
    }
    if (hasDateErrors) {
      setNotice(t('contracts.form.fixDates'))
      return
    }
    setNotice(undefined)
    setPending(true)
    setError(undefined)
    try {
      let newCustomerBody: ContractWriteBody['newCustomer']
      if (!customerId) {
        const customerBranchId = selectedVehicle?.branchId || branchId
        if (!customerBranchId) {
          setError(t('contracts.form.vehicleRequired'))
          return
        }
        const parsedCustomer = customerFormSchema.safeParse({
          ...newCustomer,
          organizationId,
          branchId: customerBranchId,
          type: newCustomerType,
        })
        if (!parsedCustomer.success) {
          setError(tm(parsedCustomer.error.issues[0]?.message ?? 'contracts.form.required'))
          return
        }
        newCustomerBody = toCustomerCreateBody(parsedCustomer.data)
      }
      const customerName = newCustomerType === 'corporate'
        ? newCustomer.legalName.trim()
        : [newCustomer.firstName, newCustomer.middleName, newCustomer.lastName]
            .map((value) => value.trim())
            .filter(Boolean)
            .join(' ')
      const formDetails = {
        ...details,
        ...(customerId
          ? {}
          : {
              custName: customerName,
              custMobile: newCustomer.phone.trim(),
              custEmail: newCustomer.email.trim(),
              custNationality: newCustomer.nationality.trim(),
              custDob: newCustomer.dateOfBirth,
              custAddress: newCustomer.line1.trim(),
              customerKind: newCustomerType === 'corporate' ? 'organization' : 'individual',
              vatNumber: newCustomer.taxNumber.trim(),
            }),
        rentalDays: days,
        rentalUnits: units,
        currency,
        netAmount: money(pricing.net),
        vatAmount: money(pricing.vat),
        grandTotal: money(grandTotal),
        advancePaid: money(advancePaid),
        paidTotal: money(paidTotal),
        balanceDue: money(balanceDue),
      }
      const writableDetails = activeEdit
        ? Object.fromEntries(
            Object.entries(formDetails).filter(([key]) => !ACTIVE_LOCKED_DETAIL_KEYS.has(key)),
          )
        : formDetails
      const body: ContractWriteBody = {
        organizationId: organizationId || undefined,
        ...(activeEdit
          ? {}
          : {
              type,
              customerId: customerId || undefined,
              newCustomer: newCustomerBody,
              vehicleId: vehicleId || undefined,
              startsAt: window.startsAt,
              endsAt: window.endsAt,
              terms: terms.trim(),
              signerName: signerName.trim() || undefined,
            }),
        driverName: driverName.trim() || signerName.trim() || undefined,
        authorizedContactName: authorizedContactName.trim() || undefined,
        lenderName: lenderName.trim() || undefined,
        borrowCost: borrowCost.trim() || undefined,
        notes: notes.trim() || undefined,
        details: writableDetails,
      }
      const bodySnapshot = JSON.stringify(body)
      const saved = savedContract && savedBody === bodySnapshot
        ? savedContract
        : await onSubmit(body, savedContract?.id ?? contract?.id)
      setSavedContract(saved)
      setSavedBody(bodySnapshot)
      if (newCustomerBody) {
        setCustomerId(saved.customerId)
        setDetails((previous) => ({
          ...previous,
          custName: customerName,
          custMobile: newCustomer.phone.trim(),
          custEmail: newCustomer.email.trim(),
          custNationality: newCustomer.nationality.trim(),
          custDob: newCustomer.dateOfBirth,
          custAddress: newCustomer.line1.trim(),
          customerKind: newCustomerType === 'corporate' ? 'organization' : 'individual',
          vatNumber: newCustomer.taxNumber.trim(),
        }))
      }
      for (const documentId of removedDocumentIds) {
        await deleteContractDocument({ id: saved.id, documentId }).unwrap()
        setSavedDocuments((previous) => previous.filter((document) => document.id !== documentId))
        setRemovedDocumentIds((previous) => previous.filter((id) => id !== documentId))
      }
      for (const [field, selected] of Object.entries(files)) {
        const documentType = FILE_DOCUMENT_TYPES[field]
        if (!documentType) continue
        for (const file of selected) {
          const uploaded = await uploadContractDocument({
            id: saved.id,
            body: {
              documentType,
              filename: file.name,
              mimeType: file.type,
              contentBase64: await fileToBase64(file),
            },
          }).unwrap()
          setSavedDocuments((previous) => [uploaded, ...previous])
          setFiles((previous) => ({
            ...previous,
            [field]: (previous[field] ?? []).filter((item) => item !== file),
          }))
        }
      }
      onClose()
    } catch (caught) {
      setError(normalizeApiError(caught).message)
    } finally {
      setPending(false)
    }
  }

  return (
    <Modal
      open={open}
      size="wide"
      title={isEdit ? t('contracts.edit') : t('contracts.add')}
      description={t('contracts.form.description', { timezone: timeZone })}
      onClose={onClose}
    >
      <FormErrorBoundary key={formKey} onReset={() => setFormKey((value) => value + 1)}>
        <form className="grid gap-4" onSubmit={(event) => void save(event)} noValidate>
          <div className="grid gap-4 md:grid-cols-2 md:items-start">
            {/* ---------------------------------------------------- type + tax */}
            <Section title={t('contracts.steps.type')} wide>
              <FieldGrid cols={2}>
                <Input
                  label={t('contracts.form.type')}
                  required
                  readOnly
                  value={t(`contracts.type.${type}` as MessageKey)}
                />
                <Select
                  label={t('contracts.form.emirate')}
                  {...text('emirate')}
                  options={formOptions.emirateOptions}
                />
              </FieldGrid>
              {organizations.required ? (
                isEdit ? (
                  readOnlyField(
                    t('contracts.form.organization'),
                    organizations.options.find((item) => item.value === organizationId)?.label ??
                      organizationId,
                  )
                ) : (
                  <Select
                    label={t('contracts.form.organization')}
                    value={organizationId}
                    required
                    onChange={(event) => setOrganizationId(event.target.value)}
                    options={[
                      { value: '', label: t('contracts.form.organizationPlaceholder') },
                      ...organizations.options,
                    ]}
                  />
                )
              ) : null}
            </Section>

            {/* ------------------------------------------------ customer/driver */}
            <Section title={t('contracts.steps.customer')} wide>
              <FieldGrid>
                <Select
                  label={t('contracts.form.customer')}
                  value={customerId}
                  disabled={activeEdit}
                  onChange={(event) => {
                    const id = event.target.value
                    setCustomerId(id)
                    const selected = customers.data?.items.find((customer) => customer.id === id)
                    if (selected) {
                      if (selected.branchId) setBranchId(selected.branchId)
                      setDetails((previous) => ({
                        ...previous,
                        custName: selected.displayName || previous.custName,
                        custEmail: selected.email || previous.custEmail,
                        custMobile: selected.phone || previous.custMobile,
                        customerKind: selected.type === 'corporate' ? 'organization' : 'individual',
                      }))
                      if (type === 'b2c' && !driverName) {
                        setDriverName(selected.displayName)
                      }
                    }
                  }}
                  options={customerOptions}
                />
                {type === 'b2c' ? (
                  <Input
                    label={t('contracts.form.driver')}
                    value={driverName}
                    onChange={(event) => setDriverName(event.target.value)}
                  />
                ) : null}
                {type === 'b2b' ? (
                  <Input
                    label={t('contracts.form.contact')}
                    value={authorizedContactName}
                    onChange={(event) => setAuthorizedContactName(event.target.value)}
                  />
                ) : null}
              </FieldGrid>
              {customerId ? (
                <Link
                  className="text-brand w-fit text-sm font-medium hover:underline"
                  to={`${appConfig.routes.customers}/${encodeURIComponent(customerId)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('contracts.form.openCustomer')}
                </Link>
              ) : null}
              {customers.isLoading ? <p className="text-muted text-sm">{t('common.loading')}</p> : null}

              {customerId ? (
                <div className="border-line bg-control/40 grid gap-2 rounded-xl border p-4">
                  <p className="text-muted text-sm">{t('contracts.form.selectedCustomerLocked')}</p>
                  {selectedCustomerQuery.isLoading ? (
                    <p className="text-muted text-sm">{t('common.loading')}</p>
                  ) : null}
                  {selectedCustomerQuery.error ? (
                    <p className="text-danger text-sm">
                      {normalizeApiError(selectedCustomerQuery.error).message}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="text-muted text-sm">{t('contracts.form.newCustomerHint')}</p>
              )}

              <FieldGrid cols={2}>
                {customerId ? (
                  readOnlyField(
                    t('contracts.form.customerType'),
                    selectedCustomer?.type === 'corporate' || selectedCustomerDetail?.type === 'corporate'
                      ? t('customers.types.corporate')
                      : t('customers.types.individual'),
                  )
                ) : fixedCustomerType ? (
                  readOnlyField(
                    t('contracts.form.customerType'),
                    newCustomerType === 'corporate'
                      ? t('customers.types.corporate')
                      : t('customers.types.individual'),
                  )
                ) : (
                  <ChoiceGroup
                    label={t('contracts.form.customerType')}
                    options={formOptions.customerKindOptions}
                    value={details.customerKind}
                    onChange={(value) => set('customerKind', value)}
                  />
                )}
                {customerId ? (
                  readOnlyField(
                    t('contracts.form.customerNationality'),
                    formOptions.residencyOptions.find((option) => option.value === details.residency)?.label ??
                      details.residency,
                  )
                ) : (
                  <ChoiceGroup
                    label={t('contracts.form.customerNationality')}
                    options={formOptions.residencyOptions}
                    value={details.residency}
                    onChange={(value) => set('residency', value)}
                  />
                )}
              </FieldGrid>

              <SubHeading>{t('contracts.form.personal')}</SubHeading>
              <FieldGrid>
                {customerId ? (
                  selectedCustomer?.type === 'corporate' ||
                  selectedCustomerDetail?.type === 'corporate' ? (
                    <>
                      {readOnlyField(
                        t('customers.form.legalName'),
                        selectedCustomerDetail?.corporate?.legalName ??
                          selectedCustomer?.displayName ??
                          details.custName,
                      )}
                      {readOnlyField(
                        t('customers.form.tradeName'),
                        selectedCustomerDetail?.corporate?.tradeName,
                      )}
                      {readOnlyField(
                        t('customers.form.registrationNumber'),
                        selectedCustomerDetail?.corporate?.registrationNumber,
                      )}
                      {readOnlyField(
                        t('customers.form.taxNumber'),
                        selectedCustomerDetail?.corporate?.taxNumber ?? details.vatNumber,
                      )}
                    </>
                  ) : (
                    <>
                      {readOnlyField(
                        t('customers.form.firstName'),
                        selectedCustomerDetail?.individual?.firstName ??
                          (selectedCustomer?.displayName ?? details.custName).split(' ')[0],
                      )}
                      {readOnlyField(
                        t('customers.form.middleName'),
                        selectedCustomerDetail?.individual?.middleName,
                      )}
                      {readOnlyField(
                        t('customers.form.lastName'),
                        selectedCustomerDetail?.individual?.lastName,
                      )}
                      {readOnlyField(
                        t('customers.form.dateOfBirth'),
                        selectedCustomerDetail?.individual?.dateOfBirth ?? details.custDob,
                        'date',
                      )}
                      {readOnlyField(
                        t('customers.form.nationality'),
                        selectedCustomerDetail?.individual?.nationality ?? details.custNationality,
                      )}
                    </>
                  )
                ) : newCustomerType === 'corporate' ? (
                  <>
                    <Input label={t('customers.form.legalName')} required {...customerText('legalName')} />
                    <Input label={t('customers.form.tradeName')} {...customerText('tradeName')} />
                    <Input label={t('customers.form.registrationNumber')} dir="ltr" {...customerText('registrationNumber')} />
                    <Input label={t('customers.form.taxNumber')} dir="ltr" {...customerText('taxNumber')} />
                  </>
                ) : (
                  <>
                    <Input label={t('customers.form.firstName')} required autoComplete="given-name" {...customerText('firstName')} />
                    <Input label={t('customers.form.middleName')} autoComplete="additional-name" {...customerText('middleName')} />
                    <Input label={t('customers.form.lastName')} required autoComplete="family-name" {...customerText('lastName')} />
                    <Input label={t('customers.form.dateOfBirth')} type="date" {...customerText('dateOfBirth')} />
                    <Input label={t('customers.form.nationality')} {...customerText('nationality')} />
                  </>
                )}
                {customerId ? (
                  <>
                    {readOnlyField(
                      t('common.phone'),
                      selectedCustomerDetail?.phone ?? selectedCustomer?.phone ?? details.custMobile,
                      'tel',
                    )}
                    {readOnlyField(
                      t('common.email'),
                      selectedCustomerDetail?.email ?? selectedCustomer?.email ?? details.custEmail,
                      'email',
                    )}
                  </>
                ) : (
                  <>
                    <Input label={t('common.phone')} type="tel" inputMode="tel" autoComplete="tel" dir="ltr" {...customerText('phone')} />
                    <Input label={t('common.email')} type="email" autoComplete="email" dir="ltr" {...customerText('email')} />
                  </>
                )}
              </FieldGrid>
              <FieldGrid>
                {customerId ? (
                  <>
                    {readOnlyField(
                      t('customers.form.line1'),
                      selectedCustomerDetail?.address?.line1,
                    )}
                    {readOnlyField(t('customers.form.city'), selectedCustomerDetail?.address?.city)}
                    {readOnlyField(
                      t('customers.form.country'),
                      selectedCustomerDetail?.address?.country,
                    )}
                  </>
                ) : (
                  <>
                    <Input label={t('customers.form.line1')} {...customerText('line1')} />
                    <Input label={t('customers.form.city')} {...customerText('city')} />
                    <Input label={t('customers.form.country')} {...customerText('country')} />
                  </>
                )}
              </FieldGrid>

              <SubHeading>{t('contracts.form.idSection')}</SubHeading>
              <FieldGrid>
                {customerId ? (
                  <>
                    {readOnlyField(t('contracts.form.idNumber'), details.custIdNumber)}
                    {readOnlyField(t('contracts.form.idIssue'), details.custIdIssueDate, 'date')}
                    {readOnlyField(t('contracts.form.idPlace'), details.custIdIssuePlace)}
                    {readOnlyField(t('contracts.form.idExpiry'), details.custIdExpiry, 'date')}
                  </>
                ) : (
                  <>
                    <Input label={t('contracts.form.idNumber')} dir="ltr" {...text('custIdNumber')} />
                    {dateField('custIdIssueDate', t('contracts.form.idIssue'))}
                    <Input label={t('contracts.form.idPlace')} {...text('custIdIssuePlace')} />
                    {dateField('custIdExpiry', t('contracts.form.idExpiry'))}
                  </>
                )}
                <div className="grid min-w-0 gap-2">
                  <FileField label={t('contracts.form.idImage')} {...file(fileKeys.idImage)} />
                  {existingDocumentCards(fileKeys.idImage)}
                </div>
                <div className="grid min-w-0 gap-2">
                  <FileField label={t('contracts.form.idExpiryImage')} {...file(fileKeys.idExpiryImage)} />
                  {existingDocumentCards(fileKeys.idExpiryImage)}
                </div>
              </FieldGrid>

              <SubHeading>{t('contracts.form.licenseSection')}</SubHeading>
              <FieldGrid>
                {customerId ? (
                  <>
                    {readOnlyField(t('contracts.form.licenseNumber'), details.custLicenseNumber)}
                    {readOnlyField(t('contracts.form.licenseIssue'), details.custLicenseIssue, 'date')}
                    {readOnlyField(t('contracts.form.licenseExpiry'), details.custLicenseExpiry, 'date')}
                  </>
                ) : (
                  <>
                    <Input label={t('contracts.form.licenseNumber')} dir="ltr" {...text('custLicenseNumber')} />
                    {dateField('custLicenseIssue', t('contracts.form.licenseIssue'))}
                    {dateField('custLicenseExpiry', t('contracts.form.licenseExpiry'))}
                  </>
                )}
                <div className="grid min-w-0 gap-2">
                  <FileField label={t('contracts.form.licenseImage')} {...file(fileKeys.licenseImage)} />
                  {existingDocumentCards(fileKeys.licenseImage)}
                </div>
                <div className="grid min-w-0 gap-2">
                  <FileField label={t('contracts.form.licenseExpiryImage')} {...file(fileKeys.licenseExpiryImage)} />
                  {existingDocumentCards(fileKeys.licenseExpiryImage)}
                </div>
                <div className="grid min-w-0 gap-2">
                  <FileField label={t('contracts.form.signatureImage')} accept="image/jpeg,image/png,image/webp" {...file(fileKeys.signature)} />
                  {existingDocumentCards(fileKeys.signature)}
                </div>
              </FieldGrid>

              <SubHeading>{t('contracts.form.additionalDriver')}</SubHeading>
              <Check label={t('contracts.form.additionalDriverQuestion')} {...flag('addDriver')} />
              {details.addDriver ? (
                <FieldGrid cols={4}>
                  <Input label={t('contracts.form.driverName')} {...text('addDriverName')} />
                  <Input label={t('contracts.form.mobile')} type="tel" inputMode="tel" dir="ltr" {...text('addDriverMobile')} />
                  <Input label={t('contracts.form.licenseNumber')} dir="ltr" {...text('addDriverLicense')} />
                  {dateField('addDriverLicenseExpiry', t('contracts.form.licenseExpiry'))}
                </FieldGrid>
              ) : null}
            </Section>

            <Section
              wide
              title={t('contracts.form.staffSource')}
              hint={t('contracts.form.staffHint')}
            >
              <Check label={t('contracts.form.chauffeur')} {...flag('chauffeur')} />
              <Select
                label={details.chauffeur ? t('contracts.form.chauffeurSelect') : t('contracts.form.staffDriver')}
                {...text('staffDriver')}
                options={formOptions.staffDriverOptions}
              />
              <FieldGrid cols={2}>
                <Select label={t('contracts.form.source')} {...text('source')} options={formOptions.sourceOptions} />
                <Select label={t('contracts.form.salesAgent')} {...text('salesAgent')} options={formOptions.salesAgentOptions} />
              </FieldGrid>
              <Select label={t('contracts.form.rentalType')} {...text('rentalType')} options={formOptions.rentalTypeOptions} />
            </Section>

            {/* ---------------------------------------------------- vehicle */}
            <Section title={t('contracts.steps.vehicle')} wide>
              <FieldGrid>
                <Select
                  label={t('contracts.columns.vehicle')}
                  value={vehicleId}
                  disabled={activeEdit}
                  onChange={(event) => {
                    const id = event.target.value
                    setVehicleId(id)
                    const selected = vehicles.data?.items.find((vehicle) => vehicle.id === id)
                    if (selected) {
                      setBranchId(selected.branchId)
                      if (selected.mileageKm !== undefined && selected.mileageKm !== null) {
                        set('mileage', String(selected.mileageKm))
                      }
                      setRateEdited(false)
                    }
                  }}
                  options={vehicleOptions}
                />
                {branches.allowed && selectedVehicle ? (
                  <Input
                    label={t('contracts.form.branch')}
                    readOnly
                    value={branches.items.find((branch) => branch.id === selectedVehicle.branchId)?.name ?? ''}
                  />
                ) : null}
              </FieldGrid>
              {vehicleId ? (
                <Link
                  className="text-brand w-fit text-sm font-medium hover:underline"
                  to={`${appConfig.routes.vehicles}/${encodeURIComponent(vehicleId)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('contracts.form.openVehicle')}
                </Link>
              ) : null}
              {vehicles.isLoading ? <p className="text-muted text-sm">{t('common.loading')}</p> : null}

              {selectedVehicle ? (
                <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <Input label={t('contracts.form.vehicleName')} readOnly value={`${selectedVehicle.make} ${selectedVehicle.model}`} />
                  <Input label={t('contracts.form.make')} readOnly value={selectedVehicle.make} />
                  <Input label={t('contracts.form.model')} readOnly value={selectedVehicle.model} />
                  <Input label={t('contracts.form.year')} readOnly dir="ltr" value={vehicleYear ? String(vehicleYear) : ''} />
                  <Input label={t('contracts.form.plate')} readOnly dir="ltr" value={selectedVehicle.plateNumber} />
                </div>
              ) : null}

              <SubHeading>{t('contracts.form.handover')}</SubHeading>
              <FieldGrid>
                <Input label={t('contracts.form.mileage')} type="number" inputMode="numeric" min={0} dir="ltr" {...text('mileage')} />
                <div className="grid min-w-0 gap-2">
                  <FileField label={t('contracts.form.mileageImage')} {...file(fileKeys.mileageImage)} />
                  {existingDocumentCards(fileKeys.mileageImage)}
                </div>
                <PercentSlider label={t('contracts.form.fuel')} value={details.fuel} onChange={(value) => set('fuel', value)} />
                <div className="grid min-w-0 gap-2">
                  <FileField label={t('contracts.form.fuelImage')} {...file(fileKeys.fuelImage)} />
                  {existingDocumentCards(fileKeys.fuelImage)}
                </div>
              </FieldGrid>

              <SubHeading>{t('contracts.form.kmLimits')}</SubHeading>
              <FieldGrid cols={4}>
                <Input label={t('contracts.form.extraKm', { currency })} type="number" inputMode="decimal" min={0} step="0.01" dir="ltr" {...text('extraKmCharge')} />
                <Input label={t('contracts.form.dailyKm')} type="number" inputMode="numeric" min={0} dir="ltr" {...text('dailyKmLimit')} />
                <Input label={t('contracts.form.weeklyKm')} type="number" inputMode="numeric" min={0} dir="ltr" {...text('weeklyKmLimit')} />
                <Input label={t('contracts.form.monthlyKm')} type="number" inputMode="numeric" min={0} dir="ltr" {...text('monthlyKmLimit')} />
              </FieldGrid>

              {type === 'borrow' ? (
                <FieldGrid cols={2}>
                  <Input
                    label={t('contracts.form.lender')}
                    value={lenderName}
                    onChange={(event) => setLenderName(event.target.value)}
                  />
                  <Input
                    label={t('contracts.form.borrowCost')}
                    value={borrowCost}
                    onChange={(event) => setBorrowCost(event.target.value)}
                    dir="ltr"
                  />
                </FieldGrid>
              ) : null}
            </Section>

            {/* ------------------------------------------------- booking/pricing */}
            <Section title={t('contracts.form.booking')} wide>
              <FieldGrid cols={4}>
                <Input label={t('contracts.form.pickupDate')} type="date" value={pickupDate} required disabled={activeEdit} onChange={(event) => setPickupDate(event.target.value)} />
                <Input label={t('contracts.form.pickupTime')} type="time" value={pickupTime} required disabled={activeEdit} onChange={(event) => setPickupTime(event.target.value)} />
                <Input label={t('contracts.form.returnDate')} type="date" value={returnDate} required disabled={activeEdit} onChange={(event) => setReturnDate(event.target.value)} />
                <Input label={t('contracts.form.returnTime')} type="time" value={returnTime} required disabled={activeEdit} onChange={(event) => setReturnTime(event.target.value)} />
              </FieldGrid>
              {isDateWindowInvalid ? (
                <p role="alert" className="text-danger text-sm font-medium">
                  {t('contracts.form.returnAfterPickup')}
                </p>
              ) : null}

              <div className="grid gap-2 sm:grid-cols-3">
                <Check label={t('contracts.form.cardoo')} {...flag('cardooRent')} />
                <Check label={t('contracts.form.recurring')} {...flag('recurring')} />
                <Check label={t('contracts.form.autoUpdate')} {...flag('autoRentalUpdate')} />
              </div>

              <ChoiceGroup label={t('contracts.form.rentalPeriod')} options={formOptions.rentalPeriodOptions} value={details.rentalPeriod} onChange={(value) => set('rentalPeriod', value)} />

              <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
                <div className="grid content-start gap-3">
                  <FieldGrid cols={2}>
                    <Input
                      label={t('contracts.form.baseRate', {
                        period: period === 'daily'
                          ? t('contracts.form.periodDaily')
                          : period === 'weekly'
                            ? t('contracts.form.periodWeekly')
                            : t('contracts.form.periodMonthly'),
                        currency,
                      })}
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.01"
                      dir="ltr"
                      value={details.dailyRate}
                      onChange={(event) => {
                        setRateEdited(true)
                        set('dailyRate', event.target.value)
                      }}
                    />
                    <Input label={unitLabel} readOnly dir="ltr" value={String(units)} />
                    <Input label={t('contracts.form.baseRental', { currency })} readOnly dir="ltr" value={money(pricing.baseRental)} />
                    <Input
                      label={t('contracts.form.amount', { currency })}
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.01"
                      dir="ltr"
                      placeholder={money(pricing.baseRental)}
                      {...text('amountOverride')}
                    />
                  </FieldGrid>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Check label={t('contracts.form.addVat')} {...flag('addVat')} />
                    {details.addVat ? <Check label={t('contracts.form.amountContainsVat')} {...flag('amountContainsVat')} /> : null}
                  </div>
                  <p className="text-muted text-sm">
                    {quote.isFetching
                      ? t('common.loading')
                      : quote.data
                        ? t('contracts.form.systemQuote', {
                          total: quote.data.totalAmount,
                          currency: quote.data.currency,
                          days: quote.data.quantityDays,
                        })
                        : t('contracts.form.noQuote')}
                  </p>
                </div>

                <div className="border-line bg-surface grid content-start gap-2 rounded-lg border p-4" aria-live="polite">
                  <SummaryRow label={t('contracts.form.rentalSummary', { units, unit: unitLabel.toLowerCase() })} value={`${money(pricing.net)} ${currency}`} />
                  <SummaryRow label={t('contracts.form.vatLine')} value={`${money(pricing.vat)} ${currency}`} />
                  {extrasTotal > 0 ? <SummaryRow label={t('contracts.form.addons')} value={`${money(extrasTotal)} ${currency}`} /> : null}
                  <div className="border-line border-t pt-2">
                    <SummaryRow strong label={t('contracts.form.total')} value={`${money(grandTotal)} ${currency}`} />
                  </div>
                </div>
              </div>
            </Section>

            {/* --------------------------------------------------- payments */}
            <Section title={t('contracts.form.payments')}>
              <Select label={t('contracts.form.advanceMethod')} {...text('advanceMethod')} options={formOptions.advancePaymentOptions} />
              <ChoiceGroup label={t('contracts.form.advanceType')} options={formOptions.advanceTypeOptions} value={details.advanceType} onChange={(value) => set('advanceType', value)} />
              {details.advanceType === 'custom' ? (
                <Input label={t('contracts.form.advanceAmount', { currency })} type="number" inputMode="decimal" min={0} step="0.01" dir="ltr" {...text('advanceAmount')} />
              ) : null}
              <Select label={t('contracts.form.depositMethod')} {...text('depositMethod')} options={formOptions.depositPaymentOptions} />
              <Input label={t('contracts.form.deposit', { currency })} type="number" inputMode="decimal" min={0} step="0.01" dir="ltr" {...text('depositAmount')} />
              <div className="border-line bg-surface grid gap-1.5 rounded-lg border p-3">
                <SummaryRow label={t('contracts.form.paidTotal')} value={`${money(paidTotal)} ${currency}`} strong />
                <SummaryRow label={t('contracts.form.balanceDue')} value={`${money(balanceDue)} ${currency}`} />
              </div>
            </Section>

            {/* ---------------------------------------------------- add-ons */}
            <Section title={t('contracts.form.addonsSection')}>
              <Check label={t('contracts.form.deliver')} {...flag('deliver')} />
              {details.deliver ? (
                <FieldGrid cols={2}>
                  <Input label={t('contracts.form.deliveryAddress')} {...text('deliveryAddress')} />
                  <Input label={t('contracts.form.deliveryFee', { currency })} type="number" inputMode="decimal" min={0} step="0.01" dir="ltr" {...text('deliveryFee')} />
                </FieldGrid>
              ) : null}

              <Check label={t('contracts.form.babySeats')} {...flag('babySeats')} />
              {details.babySeats ? (
                <FieldGrid cols={2}>
                  <Input label={t('contracts.form.seatCount')} type="number" inputMode="numeric" min={1} dir="ltr" {...text('babySeatCount')} />
                  <Input label={t('contracts.form.seatFee', { currency })} type="number" inputMode="decimal" min={0} step="0.01" dir="ltr" {...text('babySeatFee')} />
                </FieldGrid>
              ) : null}

              <Check label={t('contracts.form.insurance')} {...flag('insurance')} />
              {details.insurance ? (
                <>
                  <Input label={t('contracts.form.insuranceFee', { currency })} type="number" inputMode="decimal" min={0} step="0.01" dir="ltr" {...text('insuranceFee')} />
                  <MultiChoice label={t('contracts.form.protection')} options={formOptions.protectionPlans} values={details.protection} onChange={(value) => set('protection', value)} />
                </>
              ) : null}
            </Section>

            {/* ------------------------------------------- terms + documents */}
            <Section title={t('contracts.steps.terms')} wide>
              <label className="grid gap-1.5 text-sm font-medium">
                {t('contracts.form.terms')}
                <textarea
                  className="border-line bg-surface focus-visible:border-brand focus-visible:ring-brand/30 min-h-28 rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"
                  value={terms}
                  required
                  minLength={3}
                  disabled={activeEdit}
                  onChange={(event) => setTerms(event.target.value)}
                />
              </label>
              <div className="grid min-w-0 gap-2">
                <FileField label={t('contracts.form.documents')} multiple accept="image/jpeg,image/png,image/webp,application/pdf" {...file(fileKeys.documents)} />
                {existingDocumentCards(fileKeys.documents)}
              </div>
              <label className="grid gap-1.5 text-sm font-medium">
                {t('contracts.form.remarks')}
                <textarea
                  className="border-line bg-surface focus-visible:border-brand focus-visible:ring-brand/30 min-h-16 rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"
                  value={notes}
                  maxLength={2000}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </label>
            </Section>

            <Section title={t('contracts.steps.signature')} wide>
              <p className="text-muted text-sm">{t('contracts.form.signatureLater')}</p>
              <div className="sm:max-w-sm">
                <Input
                  label={t('contracts.form.signer')}
                  value={signerName}
                  disabled={activeEdit}
                  onChange={(event) => setSignerName(event.target.value)}
                />
              </div>
            </Section>
          </div>

          {notice ? <Alert tone="danger">{notice}</Alert> : null}
          {error ? <Alert tone="danger">{tm(error)}</Alert> : null}
          <div className="border-line bg-surface/95 sticky bottom-0 -mx-5 -mb-4 mt-2 flex flex-wrap items-center justify-between gap-3 border-t p-4 backdrop-blur sm:-mx-6">
            <p className="text-muted text-xs sm:text-sm">
              {activeEdit ? t('contracts.form.activeEditHint') : t('contracts.form.draftHint')}
            </p>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" loading={pending}>
                {isEdit ? t('common.saveChanges') : t('contracts.form.saveDraft')}
              </Button>
            </div>
          </div>
        </form>
      </FormErrorBoundary>
    </Modal>
  )
}

function ExistingContractDocument({
  contractId,
  document,
  canView,
  canRemove,
  markedForRemoval,
  onRemove,
  onRestore,
}: {
  contractId: string
  document: ContractDocument
  canView: boolean
  canRemove: boolean
  markedForRemoval: boolean
  onRemove: () => void
  onRestore: () => void
}) {
  const { t, tm } = useTranslation()
  const [loadContent, state] = useLazyGetContractDocumentContentQuery()
  const [previewUrl, setPreviewUrl] = useState<string>()
  const [previewError, setPreviewError] = useState<string>()
  const isImage = document.mimeType.startsWith('image/')

  useEffect(() => {
    setPreviewUrl(undefined)
    if (!canView || !isImage) return
    let active = true
    let objectUrl: string | undefined
    setPreviewError(undefined)
    void loadContent({ id: contractId, documentId: document.id })
      .unwrap()
      .then((blob) => {
        if (!active) return
        objectUrl = URL.createObjectURL(blob)
        setPreviewUrl(objectUrl)
      })
      .catch((caught) => {
        if (active) setPreviewError(normalizeApiError(caught).message)
      })
    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [canView, contractId, document.id, isImage, loadContent])

  return (
    <figure
      className={`border-line flex min-w-0 max-w-full items-center gap-2 rounded-md border p-1.5 text-xs ${
        markedForRemoval ? 'opacity-50' : ''
      }`}
    >
      {previewUrl ? (
        <img
          src={previewUrl}
          alt={document.originalFilename}
          className="size-10 shrink-0 rounded object-cover"
        />
      ) : (
        <span className="bg-control text-muted grid size-10 shrink-0 place-items-center rounded font-semibold">
          {isImage && state.isFetching
            ? t('common.loading')
            : document.mimeType.split('/').pop()?.slice(0, 4).toUpperCase()}
        </span>
      )}
      <figcaption className="grid min-w-0 flex-1 gap-0.5">
        <span className="truncate text-xs font-medium" title={document.originalFilename}>
          {document.originalFilename}
        </span>
        {markedForRemoval ? (
          <span className="text-danger text-xs">{t('contracts.form.documentPendingRemoval')}</span>
        ) : null}
        {!canView ? (
          <span className="text-muted text-xs">{t('contracts.documents.previewUnavailable')}</span>
        ) : null}
        {previewError ? <span className="text-danger text-xs">{tm(previewError)}</span> : null}
      </figcaption>
      {canRemove ? (
        <button
          type="button"
          className="text-brand min-h-8 shrink-0 px-2 text-xs font-medium hover:underline"
          aria-label={t(
            markedForRemoval ? 'contracts.form.restoreDocument' : 'contracts.form.removeDocument',
            { name: document.originalFilename },
          )}
          onClick={markedForRemoval ? onRestore : onRemove}
        >
          {t(markedForRemoval ? 'contracts.form.restoreDocumentAction' : 'contracts.form.removeDocumentAction')}
        </button>
      ) : null}
    </figure>
  )
}