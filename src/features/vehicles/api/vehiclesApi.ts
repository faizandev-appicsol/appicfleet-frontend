import { API_ENDPOINTS } from '@/config/constants'
import {
  availabilityResultSchema,
  statusEventSchema,
  vehicleAssignmentSchema,
  vehicleDetailSchema,
  vehicleDocumentSchema,
  vehicleListItemSchema,
  vehicleRateSchema,
  type AssignmentCreateBody,
  type AvailabilityResult,
  type ChangeStatusBody,
  type DocumentCreateBody,
  type RateCreateBody,
  type TimeWindowBody,
  type VehicleAssignment,
  type VehicleCreateBody,
  type VehicleDetail,
  type VehicleDocument,
  type VehicleListItem,
  type VehicleListQuery,
  type VehicleRate,
  type VehicleStats,
  type VehicleStatsQuery,
  type VehicleStatusEvent,
  type VehicleSubListQuery,
  type VehicleUpdateBody,
  vehicleStatsSchema,
} from '@/features/vehicles/schemas/vehicle.schema'
import { baseApi } from '@/lib/api/baseApi'
import { parsePage, parseResource, unwrapEnvelope } from '@/lib/api/envelope'
import { buildListParams } from '@/lib/api/params'
import { isRecord } from '@/lib/utils/typeGuards'
import type { Paginated } from '@/types/pagination'

const LOAD_ERROR = 'vehicles.loadError'

function vehicleUrl(id: string, path = ''): string {
  return `${API_ENDPOINTS.vehicles}/${encodeURIComponent(id)}${path}`
}

/**
 * Sub-resource cache entries hang off the `Vehicle` tag with a suffixed id, so one vehicle's
 * history, rates, documents and assignments can be invalidated independently of the detail.
 */
const history = (id: string) => ({ type: 'Vehicle' as const, id: `${id}:history` })
const rates = (id: string) => ({ type: 'Vehicle' as const, id: `${id}:rates` })
const documents = (id: string) => ({ type: 'Vehicle' as const, id: `${id}:documents` })
const assignments = (id: string) => ({ type: 'Vehicle' as const, id: `${id}:assignments` })

function subListParams(query: VehicleSubListQuery) {
  return buildListParams({ page: query.page, pageSize: query.pageSize })
}

/** The create response is only used to find the new id; a surprising shape never fails the save. */
function readCreatedId(response: unknown): { id?: string } {
  const body = unwrapEnvelope(response)
  return isRecord(body) && typeof body.id === 'string' ? { id: body.id } : {}
}

function parseVehicleCatalog(response: unknown): { id: string; name: string }[] {
  const body = unwrapEnvelope(response)
  if (!isRecord(body) || !Array.isArray(body.items)) return []
  return body.items
    .filter((item): item is { id: string; name: string } => {
      return isRecord(item) && typeof item.id === 'string' && typeof item.name === 'string'
    })
    .map((item) => ({ id: item.id, name: item.name }))
}

export const vehiclesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVehicles: builder.query<Paginated<VehicleListItem>, VehicleListQuery>({
      query: (query) => ({
        url: API_ENDPOINTS.vehicles,
        params: buildListParams(query),
      }),
      transformResponse: (response: unknown) =>
        parsePage(vehicleListItemSchema, response, LOAD_ERROR),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({ type: 'Vehicle' as const, id: item.id })),
              { type: 'Vehicles' as const, id: 'LIST' },
            ]
          : [{ type: 'Vehicles' as const, id: 'LIST' }],
    }),
    getVehicleStats: builder.query<VehicleStats, VehicleStatsQuery | void>({
      query: (query) => ({
        url: `${API_ENDPOINTS.vehicles}/stats`,
        params: query
          ? Object.fromEntries(
              Object.entries(query).filter(([, value]) => value !== undefined && value !== ''),
            )
          : undefined,
      }),
      transformResponse: (response: unknown) =>
        parseResource(vehicleStatsSchema, response, LOAD_ERROR),
      providesTags: [{ type: 'Vehicles', id: 'STATS' }],
    }),
    getVehicleMakes: builder.query<{ id: string; name: string }[], { organizationId?: string } | void>({
      query: (query) => ({
        url: `${API_ENDPOINTS.vehicles}/makes`,
        params: query?.organizationId ? { organizationId: query.organizationId } : undefined,
      }),
      transformResponse: parseVehicleCatalog,
      providesTags: [{ type: 'VehicleMakes', id: 'LIST' }],
    }),
    getVehicleTypes: builder.query<{ id: string; name: string }[], { organizationId?: string } | void>({
      query: (query) => ({
        url: `${API_ENDPOINTS.vehicles}/types`,
        params: query?.organizationId ? { organizationId: query.organizationId } : undefined,
      }),
      transformResponse: parseVehicleCatalog,
      providesTags: [{ type: 'VehicleTypes', id: 'LIST' }],
    }),
    getVehicle: builder.query<VehicleDetail, string>({
      query: (id) => vehicleUrl(id),
      transformResponse: (response: unknown) => {
        const parsed = parseResource(vehicleDetailSchema, response, LOAD_ERROR)
        const raw = unwrapEnvelope(response)
        // Keep optional text fields even if an older cached schema strip dropped them.
        if (!isRecord(raw)) return parsed
        const keep = (key: keyof VehicleDetail) => {
          const value = raw[key as string]
          return typeof value === 'string' ? value : undefined
        }
        const rawOwnership = isRecord(raw.ownership) ? raw.ownership : undefined
        const parsedOwnership = parsed.ownership
        const ownership =
          rawOwnership || parsedOwnership
            ? {
                ...parsedOwnership,
                lessorName:
                  (typeof rawOwnership?.lessorName === 'string'
                    ? rawOwnership.lessorName
                    : undefined) ?? parsedOwnership?.lessorName,
                leaseStartsOn:
                  (typeof rawOwnership?.leaseStartsOn === 'string'
                    ? rawOwnership.leaseStartsOn
                    : undefined) ?? parsedOwnership?.leaseStartsOn,
                leaseEndsOn:
                  (typeof rawOwnership?.leaseEndsOn === 'string'
                    ? rawOwnership.leaseEndsOn
                    : undefined) ?? parsedOwnership?.leaseEndsOn,
                leaseAmount:
                  (typeof rawOwnership?.leaseAmount === 'string'
                    ? rawOwnership.leaseAmount
                    : undefined) ?? parsedOwnership?.leaseAmount,
                leaseCurrency:
                  (typeof rawOwnership?.leaseCurrency === 'string'
                    ? rawOwnership.leaseCurrency
                    : undefined) ?? parsedOwnership?.leaseCurrency,
                purchasePrice:
                  (typeof rawOwnership?.purchasePrice === 'string'
                    ? rawOwnership.purchasePrice
                    : undefined) ?? parsedOwnership?.purchasePrice,
                downPayment:
                  (typeof rawOwnership?.downPayment === 'string'
                    ? rawOwnership.downPayment
                    : undefined) ?? parsedOwnership?.downPayment,
                financedAmount:
                  (typeof rawOwnership?.financedAmount === 'string'
                    ? rawOwnership.financedAmount
                    : undefined) ?? parsedOwnership?.financedAmount,
                interestRate:
                  (typeof rawOwnership?.interestRate === 'string'
                    ? rawOwnership.interestRate
                    : undefined) ?? parsedOwnership?.interestRate,
                numberOfInstallments:
                  typeof rawOwnership?.numberOfInstallments === 'number'
                    ? rawOwnership.numberOfInstallments
                    : parsedOwnership?.numberOfInstallments,
                investorName:
                  (typeof rawOwnership?.investorName === 'string'
                    ? rawOwnership.investorName
                    : undefined) ?? parsedOwnership?.investorName,
                investorReference:
                  (typeof rawOwnership?.investorReference === 'string'
                    ? rawOwnership.investorReference
                    : undefined) ?? parsedOwnership?.investorReference,
                lenderName:
                  (typeof rawOwnership?.lenderName === 'string'
                    ? rawOwnership.lenderName
                    : undefined) ?? parsedOwnership?.lenderName,
                expectedReturnOn:
                  (typeof rawOwnership?.expectedReturnOn === 'string'
                    ? rawOwnership.expectedReturnOn
                    : undefined) ?? parsedOwnership?.expectedReturnOn,
              }
            : parsedOwnership

        return {
          ...parsed,
          salikTagNumber: keep('salikTagNumber') ?? parsed.salikTagNumber,
          mulkiyaNumber: keep('mulkiyaNumber') ?? parsed.mulkiyaNumber,
          latitude: keep('latitude') ?? parsed.latitude,
          longitude: keep('longitude') ?? parsed.longitude,
          purchasedOn: keep('purchasedOn') ?? parsed.purchasedOn,
          featureOnWebsite:
            typeof raw.featureOnWebsite === 'boolean'
              ? raw.featureOnWebsite
              : Boolean(parsed.featureOnWebsite),
          ownership,
          hasPhoto:
            typeof raw.hasPhoto === 'boolean' ? raw.hasPhoto : Boolean(parsed.hasPhoto),
        }
      },
      providesTags: (_result, _error, id) => [{ type: 'Vehicle', id }],
    }),
    createVehicle: builder.mutation<{ id?: string }, VehicleCreateBody>({
      query: (body) => ({ url: API_ENDPOINTS.vehicles, method: 'POST', body }),
      transformResponse: readCreatedId,
      invalidatesTags: (result, error) =>
        error
          ? []
          : [
              { type: 'Vehicles', id: 'LIST' },
              { type: 'Vehicles', id: 'STATS' },
              { type: 'VehicleMakes', id: 'LIST' },
              { type: 'VehicleTypes', id: 'LIST' },
              ...(result?.id ? [{ type: 'Vehicle' as const, id: result.id }] : []),
            ],
    }),
    updateVehicle: builder.mutation<unknown, { id: string; body: VehicleUpdateBody }>({
      query: ({ id, body }) => ({ url: vehicleUrl(id), method: 'PATCH', body }),
      invalidatesTags: (_result, error, argument) =>
        error
          ? []
          : [
              { type: 'Vehicle', id: argument.id },
              { type: 'Vehicles', id: 'LIST' },
              { type: 'Vehicles', id: 'STATS' },
              { type: 'VehicleMakes', id: 'LIST' },
              { type: 'VehicleTypes', id: 'LIST' },
            ],
    }),
    uploadVehiclePhoto: builder.mutation<
      unknown,
      { id: string; body: { filename: string; mimeType: string; contentBase64: string } }
    >({
      query: ({ id, body }) => ({
        url: vehicleUrl(id, '/photo'),
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, error, argument) =>
        error
          ? []
          : [
              { type: 'Vehicle', id: argument.id },
              { type: 'Vehicle', id: `${argument.id}:photo` },
              { type: 'Vehicles', id: 'LIST' },
              { type: 'Vehicles', id: 'STATS' },
            ],
    }),
    /** Cached as a Blob; components create/revoke object URLs per mount. */
    getVehiclePhoto: builder.query<Blob, string>({
      query: (id) => ({
        url: vehicleUrl(id, '/photo'),
        headers: { Accept: 'image/*,*/*' },
        responseHandler: async (response) => {
          if (!response.ok) {
            throw new Error(`Photo request failed (${response.status})`)
          }
          return response.blob()
        },
      }),
      providesTags: (_result, _error, id) => [{ type: 'Vehicle', id: `${id}:photo` }],
    }),
    changeVehicleStatus: builder.mutation<unknown, { id: string; body: ChangeStatusBody }>({
      query: ({ id, body }) => ({ url: vehicleUrl(id, '/status'), method: 'POST', body }),
      invalidatesTags: (_result, error, argument) =>
        error
          ? []
          : [
              { type: 'Vehicle', id: argument.id },
              history(argument.id),
              { type: 'Vehicles', id: 'LIST' },
              { type: 'Vehicles', id: 'STATS' },
            ],
    }),
    deleteVehicle: builder.mutation<unknown, string>({
      query: (id) => ({ url: vehicleUrl(id), method: 'DELETE' }),
      invalidatesTags: (_result, error, id) =>
        error
          ? []
          : [
              { type: 'Vehicle', id },
              { type: 'Vehicles', id: 'LIST' },
              { type: 'Vehicles', id: 'STATS' },
            ],
    }),
    getVehicleStatusHistory: builder.query<Paginated<VehicleStatusEvent>, VehicleSubListQuery>({
      query: (query) => ({ url: vehicleUrl(query.id, '/status-history'), params: subListParams(query) }),
      transformResponse: (response: unknown) => parsePage(statusEventSchema, response, LOAD_ERROR),
      providesTags: (_result, _error, query) => [history(query.id)],
    }),

    getVehicleRates: builder.query<Paginated<VehicleRate>, VehicleSubListQuery>({
      query: (query) => ({ url: vehicleUrl(query.id, '/rates'), params: subListParams(query) }),
      transformResponse: (response: unknown) => parsePage(vehicleRateSchema, response, LOAD_ERROR),
      providesTags: (_result, _error, query) => [rates(query.id)],
    }),
    createVehicleRate: builder.mutation<unknown, { id: string; body: RateCreateBody }>({
      query: ({ id, body }) => ({ url: vehicleUrl(id, '/rates'), method: 'POST', body }),
      // A new card supersedes the active one, so the whole list is refetched.
      invalidatesTags: (_result, error, argument) =>
        error ? [] : [rates(argument.id), { type: 'Vehicle', id: argument.id }],
    }),

    getVehicleDocuments: builder.query<Paginated<VehicleDocument>, VehicleSubListQuery>({
      query: (query) => ({ url: vehicleUrl(query.id, '/documents'), params: subListParams(query) }),
      transformResponse: (response: unknown) =>
        parsePage(vehicleDocumentSchema, response, LOAD_ERROR),
      providesTags: (_result, _error, query) => [documents(query.id)],
    }),
    createVehicleDocument: builder.mutation<unknown, { id: string; body: DocumentCreateBody }>({
      query: ({ id, body }) => ({ url: vehicleUrl(id, '/documents'), method: 'POST', body }),
      invalidatesTags: (_result, error, argument) =>
        error ? [] : [documents(argument.id), { type: 'Vehicle', id: argument.id }],
    }),
    archiveVehicleDocument: builder.mutation<unknown, { id: string; documentId: string }>({
      query: ({ id, documentId }) => ({
        url: vehicleUrl(id, `/documents/${encodeURIComponent(documentId)}/archive`),
        method: 'POST',
      }),
      invalidatesTags: (_result, error, argument) =>
        error ? [] : [documents(argument.id), { type: 'Vehicle', id: argument.id }],
    }),

    checkVehicleAvailability: builder.mutation<
      AvailabilityResult,
      { id: string; body: TimeWindowBody }
    >({
      query: ({ id, body }) => ({ url: vehicleUrl(id, '/availability'), method: 'POST', body }),
      transformResponse: (response: unknown) =>
        parseResource(availabilityResultSchema, response, LOAD_ERROR),
    }),
    getVehicleAssignments: builder.query<Paginated<VehicleAssignment>, VehicleSubListQuery>({
      query: (query) => ({
        url: vehicleUrl(query.id, '/assignments'),
        params: subListParams(query),
      }),
      transformResponse: (response: unknown) =>
        parsePage(vehicleAssignmentSchema, response, LOAD_ERROR),
      providesTags: (_result, _error, query) => [assignments(query.id)],
    }),
    createVehicleAssignment: builder.mutation<unknown, { id: string; body: AssignmentCreateBody }>({
      query: ({ id, body }) => ({ url: vehicleUrl(id, '/assignments'), method: 'POST', body }),
      invalidatesTags: (_result, error, argument) => (error ? [] : [assignments(argument.id)]),
    }),
    releaseVehicleAssignment: builder.mutation<unknown, { id: string; assignmentId: string }>({
      query: ({ id, assignmentId }) => ({
        url: vehicleUrl(id, `/assignments/${encodeURIComponent(assignmentId)}/release`),
        method: 'POST',
      }),
      invalidatesTags: (_result, error, argument) => (error ? [] : [assignments(argument.id)]),
    }),
  }),
})

export const {
  useGetVehiclesQuery,
  useGetVehicleStatsQuery,
  useGetVehicleQuery,
  useGetVehicleMakesQuery,
  useGetVehicleTypesQuery,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useUploadVehiclePhotoMutation,
  useGetVehiclePhotoQuery,
  useDeleteVehicleMutation,
  useChangeVehicleStatusMutation,
  useGetVehicleStatusHistoryQuery,
  useGetVehicleRatesQuery,
  useCreateVehicleRateMutation,
  useGetVehicleDocumentsQuery,
  useCreateVehicleDocumentMutation,
  useArchiveVehicleDocumentMutation,
  useCheckVehicleAvailabilityMutation,
  useGetVehicleAssignmentsQuery,
  useCreateVehicleAssignmentMutation,
  useReleaseVehicleAssignmentMutation,
} = vehiclesApi
