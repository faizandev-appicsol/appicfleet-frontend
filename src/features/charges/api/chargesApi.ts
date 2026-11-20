import { API_ENDPOINTS } from '@/config/constants'
import {
  fineDetailSchema,
  fineSchema,
  importBatchDetailSchema,
  importBatchSchema,
  refundDetailSchema,
  refundSchema,
  tollDetailSchema,
  tollSchema,
  type Fine,
  type FineDetail,
  type FineWriteBody,
  type ImportBatch,
  type ImportBatchDetail,
  type ImportWriteBody,
  type ListQuery,
  type Refund,
  type RefundDetail,
  type RefundWriteBody,
  type Toll,
  type TollDetail,
  type TollWriteBody,
} from '@/features/charges/schemas/charges.schema'
import { baseApi } from '@/lib/api/baseApi'
import { parsePage, parseResource, unwrapEnvelope } from '@/lib/api/envelope'
import { buildListParams } from '@/lib/api/params'
import type { Paginated } from '@/types/pagination'

const finesTag = { type: 'Fines' as const, id: 'LIST' }
const tollsTag = { type: 'Tolls' as const, id: 'LIST' }
const refundsTag = { type: 'Refunds' as const, id: 'LIST' }
const importsTag = { type: 'FineTollImports' as const, id: 'LIST' }

export const chargesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFines: builder.query<Paginated<Fine>, ListQuery>({
      query: (query) => ({ url: API_ENDPOINTS.fines, params: buildListParams(query) }),
      transformResponse: (response: unknown) => parsePage(fineSchema, response, 'charges.loadError'),
      providesTags: (result) =>
        result ? [...result.items.map((item) => ({ type: 'Fine' as const, id: item.id })), finesTag] : [finesTag],
    }),
    getFine: builder.query<FineDetail, string>({
      query: (id) => `${API_ENDPOINTS.fines}/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) => parseResource(fineDetailSchema, response, 'charges.loadError'),
      providesTags: (_r, _e, id) => [{ type: 'Fine', id }],
    }),
    createFine: builder.mutation<FineDetail, FineWriteBody>({
      query: (body) => ({ url: API_ENDPOINTS.fines, method: 'POST', body }),
      transformResponse: (response: unknown) => parseResource(fineDetailSchema, response, 'charges.loadError'),
      invalidatesTags: [finesTag],
    }),
    fineAction: builder.mutation<FineDetail | Record<string, unknown>, { id: string; action: string; body?: unknown }>({
      query: ({ id, action, body }) => ({
        url: `${API_ENDPOINTS.fines}/${encodeURIComponent(id)}/${action}`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as FineDetail,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Fine', id }, finesTag],
    }),

    getTolls: builder.query<Paginated<Toll>, ListQuery>({
      query: (query) => ({ url: API_ENDPOINTS.tolls, params: buildListParams(query) }),
      transformResponse: (response: unknown) => parsePage(tollSchema, response, 'charges.loadError'),
      providesTags: (result) =>
        result ? [...result.items.map((item) => ({ type: 'Toll' as const, id: item.id })), tollsTag] : [tollsTag],
    }),
    getToll: builder.query<TollDetail, string>({
      query: (id) => `${API_ENDPOINTS.tolls}/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) => parseResource(tollDetailSchema, response, 'charges.loadError'),
      providesTags: (_r, _e, id) => [{ type: 'Toll', id }],
    }),
    createToll: builder.mutation<TollDetail, TollWriteBody>({
      query: (body) => ({ url: API_ENDPOINTS.tolls, method: 'POST', body }),
      transformResponse: (response: unknown) => parseResource(tollDetailSchema, response, 'charges.loadError'),
      invalidatesTags: [tollsTag],
    }),
    tollAction: builder.mutation<TollDetail | Record<string, unknown>, { id: string; action: string; body?: unknown }>({
      query: ({ id, action, body }) => ({
        url: `${API_ENDPOINTS.tolls}/${encodeURIComponent(id)}/${action}`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as TollDetail,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Toll', id }, tollsTag],
    }),

    getRefunds: builder.query<Paginated<Refund>, ListQuery>({
      query: (query) => ({ url: API_ENDPOINTS.refunds, params: buildListParams(query) }),
      transformResponse: (response: unknown) => parsePage(refundSchema, response, 'charges.loadError'),
      providesTags: (result) =>
        result
          ? [...result.items.map((item) => ({ type: 'Refund' as const, id: item.id })), refundsTag]
          : [refundsTag],
    }),
    getRefund: builder.query<RefundDetail, string>({
      query: (id) => `${API_ENDPOINTS.refunds}/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) => parseResource(refundDetailSchema, response, 'charges.loadError'),
      providesTags: (_r, _e, id) => [{ type: 'Refund', id }],
    }),
    createRefund: builder.mutation<RefundDetail, RefundWriteBody>({
      query: (body) => ({ url: API_ENDPOINTS.refunds, method: 'POST', body }),
      transformResponse: (response: unknown) => parseResource(refundDetailSchema, response, 'charges.loadError'),
      invalidatesTags: [refundsTag],
    }),
    refundAction: builder.mutation<RefundDetail, { id: string; action: string; body?: unknown }>({
      query: ({ id, action, body }) => ({
        url: `${API_ENDPOINTS.refunds}/${encodeURIComponent(id)}/${action}`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => parseResource(refundDetailSchema, response, 'charges.loadError'),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Refund', id }, refundsTag],
    }),

    getFineTollImports: builder.query<Paginated<ImportBatch>, ListQuery>({
      query: (query) => ({ url: API_ENDPOINTS.fineTollImports, params: buildListParams(query) }),
      transformResponse: (response: unknown) => parsePage(importBatchSchema, response, 'charges.loadError'),
      providesTags: (result) =>
        result
          ? [...result.items.map((item) => ({ type: 'FineTollImport' as const, id: item.id })), importsTag]
          : [importsTag],
    }),
    getFineTollImport: builder.query<ImportBatchDetail, string>({
      query: (id) => `${API_ENDPOINTS.fineTollImports}/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) => parseResource(importBatchDetailSchema, response, 'charges.loadError'),
      providesTags: (_r, _e, id) => [{ type: 'FineTollImport', id }],
    }),
    createFineTollImport: builder.mutation<ImportBatchDetail, ImportWriteBody>({
      query: (body) => ({ url: API_ENDPOINTS.fineTollImports, method: 'POST', body }),
      transformResponse: (response: unknown) => parseResource(importBatchDetailSchema, response, 'charges.loadError'),
      invalidatesTags: [importsTag, finesTag, tollsTag],
    }),
  }),
})

export const {
  useGetFinesQuery,
  useGetFineQuery,
  useCreateFineMutation,
  useFineActionMutation,
  useGetTollsQuery,
  useGetTollQuery,
  useCreateTollMutation,
  useTollActionMutation,
  useGetRefundsQuery,
  useGetRefundQuery,
  useCreateRefundMutation,
  useRefundActionMutation,
  useGetFineTollImportsQuery,
  useGetFineTollImportQuery,
  useCreateFineTollImportMutation,
} = chargesApi
