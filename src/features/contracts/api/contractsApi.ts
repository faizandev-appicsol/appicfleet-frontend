import { z } from 'zod'
import { API_ENDPOINTS } from '@/config/constants'
import {
  contractDetailSchema,
  contractDocumentSchema,
  contractSchema,
  contractStatsSchema,
  quoteSchema,
  type Contract,
  type ContractDetail,
  type ContractListQuery,
  type ContractStats,
  type ContractStatsQuery,
  type ContractWriteBody,
} from '@/features/contracts/schemas/contract.schema'
import { baseApi } from '@/lib/api/baseApi'
import { parsePage, parseResource } from '@/lib/api/envelope'
import { buildListParams } from '@/lib/api/params'
import type { Paginated } from '@/types/pagination'

const LOAD_ERROR = 'contracts.loadError'
const listTag = { type: 'Contracts' as const, id: 'LIST' }
const customerListTag = { type: 'Customers' as const, id: 'LIST' }
const detailTag = (id: string) => ({ type: 'Contract' as const, id })

function url(id: string, path = ''): string {
  return `${API_ENDPOINTS.contracts}/${encodeURIComponent(id)}${path}`
}

const invalidates = (id: string) => [detailTag(id), listTag]

export const contractsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContracts: builder.query<Paginated<Contract>, ContractListQuery>({
      query: (query) => ({ url: API_ENDPOINTS.contracts, params: buildListParams(query) }),
      transformResponse: (response: unknown) => parsePage(contractSchema, response, LOAD_ERROR),
      providesTags: (result) => (result ? [...result.items.map((item) => detailTag(item.id)), listTag] : [listTag]),
    }),
    getContractStats: builder.query<ContractStats, ContractStatsQuery | void>({
      query: (query) => ({
        url: `${API_ENDPOINTS.contracts}/stats`,
        params: query
          ? Object.fromEntries(
              Object.entries(query).filter(([, value]) => value !== undefined && value !== ''),
            )
          : undefined,
      }),
      transformResponse: (response: unknown) =>
        parseResource(contractStatsSchema, response, LOAD_ERROR),
      providesTags: [listTag],
    }),
    getContract: builder.query<ContractDetail, string>({
      query: (id) => url(id),
      transformResponse: (response: unknown) => parseResource(contractDetailSchema, response, LOAD_ERROR),
      providesTags: (_result, _error, id) => [detailTag(id)],
    }),
    getContractQuote: builder.query<
      { currency: string; unitAmount: string; quantityDays: number; totalAmount: string; rateType: string; kind: string } | null,
      { vehicleId: string; startsAt: string; endsAt: string; organizationId?: string }
    >({
      query: (params) => ({ url: `${API_ENDPOINTS.contracts}/quote`, params }),
      transformResponse: (response: unknown) => parseResource(quoteSchema, response, LOAD_ERROR),
    }),
    createContract: builder.mutation<ContractDetail, ContractWriteBody>({
      query: (body) => ({ url: API_ENDPOINTS.contracts, method: 'POST', body }),
      transformResponse: (response: unknown) => parseResource(contractDetailSchema, response, LOAD_ERROR),
      invalidatesTags: (_result, _error, body) =>
        body.newCustomer ? [listTag, customerListTag] : [listTag],
    }),
    updateContract: builder.mutation<ContractDetail, { id: string; body: Partial<ContractWriteBody> }>({
      query: ({ id, body }) => ({ url: url(id), method: 'PATCH', body }),
      transformResponse: (response: unknown) => parseResource(contractDetailSchema, response, LOAD_ERROR),
      invalidatesTags: (_result, _error, { id, body }) =>
        body.newCustomer
          ? [...invalidates(id), customerListTag]
          : invalidates(id),
    }),
    convertBookingToContract: builder.mutation<ContractDetail, string>({
      query: (bookingId) => ({
        url: `${API_ENDPOINTS.contracts}/from-booking/${encodeURIComponent(bookingId)}`,
        method: 'POST',
      }),
      transformResponse: (response: unknown) => parseResource(contractDetailSchema, response, LOAD_ERROR),
      invalidatesTags: [listTag, 'Bookings', 'Booking'],
    }),
    contractAction: builder.mutation<ContractDetail, { id: string; action: string; body?: unknown }>({
      query: ({ id, action, body }) => ({ url: url(id, action), method: 'POST', body }),
      transformResponse: (response: unknown) => parseResource(contractDetailSchema, response, LOAD_ERROR),
      invalidatesTags: (_result, _error, { id }) => invalidates(id),
    }),
    uploadContractDocument: builder.mutation<
      ContractDocument,
      {
        id: string
        body: {
          documentType: string
          filename: string
          mimeType: string
          contentBase64: string
        }
      }
    >({
      query: ({ id, body }) => ({ url: url(id, '/documents'), method: 'POST', body }),
      transformResponse: (response: unknown) => parseResource(contractDocumentSchema, response, LOAD_ERROR),
      invalidatesTags: (_result, _error, { id }) => invalidates(id),
    }),
    getContractDocumentContent: builder.query<Blob, { id: string; documentId: string }>({
      query: ({ id, documentId }) => ({
        url: url(id, `/documents/${encodeURIComponent(documentId)}/content`),
        responseHandler: async (response) => {
          if (!response.ok) throw new Error(`Contract document request failed (${response.status})`)
          return response.blob()
        },
      }),
    }),
    deleteContractDocument: builder.mutation<{ id: string }, { id: string; documentId: string }>({
      query: ({ id, documentId }) => ({
        url: url(id, `/documents/${encodeURIComponent(documentId)}`),
        method: 'DELETE',
      }),
      transformResponse: (response: unknown) =>
        parseResource(z.object({ id: z.string() }), response, LOAD_ERROR),
      invalidatesTags: (_result, _error, { id }) => invalidates(id),
    }),
  }),
})

export const {
  useGetContractsQuery,
  useGetContractStatsQuery,
  useGetContractQuery,
  useGetContractQuoteQuery,
  useCreateContractMutation,
  useUpdateContractMutation,
  useConvertBookingToContractMutation,
  useContractActionMutation,
  useUploadContractDocumentMutation,
  useLazyGetContractDocumentContentQuery,
  useDeleteContractDocumentMutation,
} = contractsApi