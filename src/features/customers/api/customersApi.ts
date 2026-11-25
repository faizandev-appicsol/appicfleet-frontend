import { API_ENDPOINTS } from '@/config/constants'
import { env } from '@/config/env'
import {
  customerContactSchema,
  customerDetailSchema,
  customerDocumentSchema,
  customerListItemSchema,
  customerStatsSchema,
  duplicateReviewSchema,
  ocrRunSchema,
  type CustomerContact,
  type CustomerDetail,
  type CustomerDocument,
  type CustomerListItem,
  type CustomerListQuery,
  type CustomerStats,
  type CustomerStatsQuery,
  type CustomerScope,
  type DuplicateReview,
  type OcrRun,
  type ContactCreatePayload,
  type ContactUpdatePayload,
  type CustomerCreatePayload,
  type CustomerUpdatePayload,
  type UploadDocumentBody,
} from '@/features/customers/schemas/customer.schema'
import { baseApi } from '@/lib/api/baseApi'
import { parsePage, parseResource, unwrapEnvelope } from '@/lib/api/envelope'
import { buildListParams } from '@/lib/api/params'
import { isRecord } from '@/lib/utils/typeGuards'
import type { Paginated } from '@/types/pagination'

const LOAD_ERROR = 'customers.loadError'

function customerUrl(id: string, path = ''): string {
  return `${API_ENDPOINTS.customers}/${encodeURIComponent(id)}${path}`
}

const contactsTag = (id: string) => ({ type: 'Customer' as const, id: `${id}:contacts` })
const documentsTag = (id: string) => ({ type: 'Customer' as const, id: `${id}:documents` })
const duplicatesTag = (id: string) => ({ type: 'Customer' as const, id: `${id}:duplicates` })
const ocrTag = (customerId: string, documentId: string) => ({
  type: 'Customer' as const,
  id: `${customerId}:ocr:${documentId}`,
})

function readAccessToken(state: unknown): string | null {
  if (!isRecord(state) || !isRecord(state.auth)) return null
  return typeof state.auth.accessToken === 'string' ? state.auth.accessToken : null
}

function readCreatedId(response: unknown): { id?: string } {
  const body = unwrapEnvelope(response)
  return isRecord(body) && typeof body.id === 'string' ? { id: body.id } : {}
}

export const customersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query<Paginated<CustomerListItem>, CustomerListQuery>({
      query: (query) => ({
        url: API_ENDPOINTS.customers,
        params: buildListParams(query),
      }),
      transformResponse: (response: unknown) =>
        parsePage(customerListItemSchema, response, LOAD_ERROR),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({ type: 'Customer' as const, id: item.id })),
              { type: 'Customers' as const, id: 'LIST' },
            ]
          : [{ type: 'Customers' as const, id: 'LIST' }],
    }),
    getCustomerStats: builder.query<CustomerStats, CustomerStatsQuery | void>({
      query: (query) => ({
        url: `${API_ENDPOINTS.customers}/stats`,
        params: query
          ? Object.fromEntries(
              Object.entries(query).filter(([, value]) => value !== undefined && value !== ''),
            )
          : undefined,
      }),
      transformResponse: (response: unknown) =>
        parseResource(customerStatsSchema, response, LOAD_ERROR),
      providesTags: [{ type: 'Customers', id: 'LIST' }],
    }),
    getCustomer: builder.query<CustomerDetail, { id: string; reveal?: boolean }>({
      query: ({ id, reveal }) => ({
        url: customerUrl(id),
        params: reveal ? { reveal: 'true' } : undefined,
      }),
      transformResponse: (response: unknown) =>
        parseResource(customerDetailSchema, response, LOAD_ERROR),
      providesTags: (_result, _error, { id }) => [{ type: 'Customer', id }],
    }),
    createCustomer: builder.mutation<{ id?: string }, CustomerCreatePayload>({
      query: (body) => ({ url: API_ENDPOINTS.customers, method: 'POST', body }),
      transformResponse: (response: unknown) => readCreatedId(response),
      invalidatesTags: [{ type: 'Customers', id: 'LIST' }],
    }),
    updateCustomer: builder.mutation<CustomerDetail, { id: string; body: CustomerUpdatePayload }>({
      query: ({ id, body }) => ({ url: customerUrl(id), method: 'PATCH', body }),
      transformResponse: (response: unknown) =>
        parseResource(customerDetailSchema, response, LOAD_ERROR),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Customer', id },
        { type: 'Customers', id: 'LIST' },
        duplicatesTag(id),
      ],
    }),
    deleteCustomer: builder.mutation<void, string>({
      query: (id) => ({ url: customerUrl(id), method: 'DELETE' }),
      invalidatesTags: (_result, error, id) =>
        error
          ? []
          : [
              { type: 'Customer', id },
              { type: 'Customers', id: 'LIST' },
            ],
    }),
    changeCustomerStatus: builder.mutation<
      CustomerDetail,
      { id: string; status: string; reason?: string }
    >({
      query: ({ id, status, reason }) => ({
        url: customerUrl(id, '/status'),
        method: 'POST',
        body: { status, reason },
      }),
      transformResponse: (response: unknown) =>
        parseResource(customerDetailSchema, response, LOAD_ERROR),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Customer', id },
        { type: 'Customers', id: 'LIST' },
      ],
    }),
    getCustomerContacts: builder.query<Paginated<CustomerContact>, CustomerScope>({
      query: ({ customerId, page, pageSize, reveal }) => ({
        url: customerUrl(customerId, '/contacts'),
        params: { ...buildListParams({ page, pageSize }), ...(reveal ? { reveal: 'true' } : {}) },
      }),
      transformResponse: (response: unknown) =>
        parsePage(customerContactSchema, response, LOAD_ERROR),
      providesTags: (_result, _error, { customerId }) => [contactsTag(customerId)],
    }),
    createCustomerContact: builder.mutation<
      CustomerContact,
      { customerId: string; body: ContactCreatePayload }
    >({
      query: ({ customerId, body }) => ({
        url: customerUrl(customerId, '/contacts'),
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) =>
        parseResource(customerContactSchema, response, LOAD_ERROR),
      invalidatesTags: (_result, _error, { customerId }) => [contactsTag(customerId)],
    }),
    updateCustomerContact: builder.mutation<
      CustomerContact,
      { customerId: string; contactId: string; body: ContactUpdatePayload }
    >({
      query: ({ customerId, contactId, body }) => ({
        url: customerUrl(customerId, `/contacts/${encodeURIComponent(contactId)}`),
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: unknown) =>
        parseResource(customerContactSchema, response, LOAD_ERROR),
      invalidatesTags: (_result, _error, { customerId }) => [contactsTag(customerId)],
    }),
    deactivateCustomerContact: builder.mutation<
      CustomerContact,
      { customerId: string; contactId: string }
    >({
      query: ({ customerId, contactId }) => ({
        url: customerUrl(customerId, `/contacts/${encodeURIComponent(contactId)}/deactivate`),
        method: 'POST',
      }),
      transformResponse: (response: unknown) =>
        parseResource(customerContactSchema, response, LOAD_ERROR),
      invalidatesTags: (_result, _error, { customerId }) => [contactsTag(customerId)],
    }),
    getCustomerDocuments: builder.query<
      Paginated<CustomerDocument>,
      CustomerScope & { status?: string; documentType?: string }
    >({
      query: ({ customerId, page, pageSize, status, documentType }) => ({
        url: customerUrl(customerId, '/documents'),
        params: buildListParams({ page, pageSize, status, documentType }),
      }),
      transformResponse: (response: unknown) =>
        parsePage(customerDocumentSchema, response, LOAD_ERROR),
      providesTags: (_result, _error, { customerId }) => [documentsTag(customerId)],
    }),
    uploadCustomerDocument: builder.mutation<
      CustomerDocument,
      { customerId: string; body: UploadDocumentBody }
    >({
      query: ({ customerId, body }) => ({
        url: customerUrl(customerId, '/documents'),
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) =>
        parseResource(customerDocumentSchema, response, LOAD_ERROR),
      invalidatesTags: (_result, _error, { customerId }) => [
        documentsTag(customerId),
        { type: 'Customer', id: customerId },
        { type: 'Customers', id: 'LIST' },
      ],
    }),
    archiveCustomerDocument: builder.mutation<
      CustomerDocument,
      { customerId: string; documentId: string }
    >({
      query: ({ customerId, documentId }) => ({
        url: customerUrl(
          customerId,
          `/documents/${encodeURIComponent(documentId)}/archive`,
        ),
        method: 'POST',
      }),
      transformResponse: (response: unknown) =>
        parseResource(customerDocumentSchema, response, LOAD_ERROR),
      invalidatesTags: (_result, _error, { customerId }) => [
        documentsTag(customerId),
        { type: 'Customer', id: customerId },
      ],
    }),
    openCustomerDocument: builder.mutation<
      void,
      { customerId: string; documentId: string; filename: string; intent: 'view' | 'download' }
    >({
      queryFn: async ({ customerId, documentId, filename, intent }, api) => {
        const token = readAccessToken(api.getState())
        const url = `${env.apiUrl}${customerUrl(customerId, `/documents/${encodeURIComponent(documentId)}/content`)}?intent=${intent}`
        try {
          const response = await fetch(url, {
            credentials: 'include',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          })
          if (!response.ok) {
            return { error: { status: response.status, data: undefined } }
          }
          const blob = await response.blob()
          const objectUrl = URL.createObjectURL(blob)
          if (intent === 'download') {
            const anchor = document.createElement('a')
            anchor.href = objectUrl
            anchor.download = filename
            anchor.click()
            URL.revokeObjectURL(objectUrl)
          } else {
            window.open(objectUrl, '_blank', 'noopener')
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
          }
          return { data: undefined }
        } catch {
          return { error: { status: 'FETCH_ERROR', error: 'Network request failed' } }
        }
      },
    }),
    previewCustomerDocument: builder.mutation<
      string,
      { customerId: string; documentId: string }
    >({
      queryFn: async ({ customerId, documentId }, api) => {
        const token = readAccessToken(api.getState())
        const url = `${env.apiUrl}${customerUrl(customerId, `/documents/${encodeURIComponent(documentId)}/content`)}?intent=view`
        try {
          const response = await fetch(url, {
            credentials: 'include',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          })
          if (!response.ok) {
            return { error: { status: response.status, data: undefined } }
          }
          const objectUrl = URL.createObjectURL(await response.blob())
          return { data: objectUrl }
        } catch {
          return { error: { status: 'FETCH_ERROR', error: 'Network request failed' } }
        }
      },
    }),
    getOcrRuns: builder.query<Paginated<OcrRun>, CustomerScope & { documentId: string }>({
      query: ({ customerId, documentId, page, pageSize, reveal }) => ({
        url: customerUrl(customerId, `/documents/${encodeURIComponent(documentId)}/ocr`),
        params: { ...buildListParams({ page, pageSize }), ...(reveal ? { reveal: 'true' } : {}) },
      }),
      transformResponse: (response: unknown) => parsePage(ocrRunSchema, response, LOAD_ERROR),
      providesTags: (_result, _error, { customerId, documentId }) => [ocrTag(customerId, documentId)],
    }),
    startOcr: builder.mutation<OcrRun, { customerId: string; documentId: string }>({
      query: ({ customerId, documentId }) => ({
        url: customerUrl(customerId, `/documents/${encodeURIComponent(documentId)}/ocr`),
        method: 'POST',
      }),
      transformResponse: (response: unknown) => parseResource(ocrRunSchema, response, LOAD_ERROR),
      invalidatesTags: (_result, _error, { customerId, documentId }) => [
        ocrTag(customerId, documentId),
        documentsTag(customerId),
        { type: 'Customer', id: customerId },
        { type: 'Customers', id: 'LIST' },
      ],
    }),
    reviewOcr: builder.mutation<
      OcrRun,
      {
        customerId: string
        documentId: string
        runId: string
        decision: 'approve' | 'reject'
        fields?: Array<{ key: string; value: string }>
      }
    >({
      query: ({ customerId, documentId, runId, decision, fields }) => ({
        url: customerUrl(
          customerId,
          `/documents/${encodeURIComponent(documentId)}/ocr/${encodeURIComponent(runId)}/review`,
        ),
        method: 'POST',
        body: { decision, fields },
      }),
      transformResponse: (response: unknown) => parseResource(ocrRunSchema, response, LOAD_ERROR),
      invalidatesTags: (_result, _error, { customerId, documentId }) => [
        ocrTag(customerId, documentId),
        documentsTag(customerId),
        { type: 'Customer', id: customerId },
      ],
    }),
    getCustomerDuplicates: builder.query<Paginated<DuplicateReview>, CustomerScope & { status?: string }>({
      query: ({ customerId, page, pageSize, status }) => ({
        url: customerUrl(customerId, '/duplicates'),
        params: buildListParams({ page, pageSize, status }),
      }),
      transformResponse: (response: unknown) =>
        parsePage(duplicateReviewSchema, response, LOAD_ERROR),
      providesTags: (_result, _error, { customerId }) => [duplicatesTag(customerId)],
    }),
    reviewDuplicate: builder.mutation<
      DuplicateReview,
      { customerId: string; reviewId: string; status: string; note?: string }
    >({
      query: ({ customerId, reviewId, status, note }) => ({
        url: customerUrl(customerId, `/duplicates/${encodeURIComponent(reviewId)}`),
        method: 'POST',
        body: { status, note },
      }),
      transformResponse: (response: unknown) =>
        parseResource(duplicateReviewSchema, response, LOAD_ERROR),
      invalidatesTags: (_result, _error, { customerId }) => [duplicatesTag(customerId)],
    }),
  }),
})

export const {
  useGetCustomersQuery,
  useGetCustomerStatsQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useChangeCustomerStatusMutation,
  useGetCustomerContactsQuery,
  useCreateCustomerContactMutation,
  useUpdateCustomerContactMutation,
  useDeactivateCustomerContactMutation,
  useGetCustomerDocumentsQuery,
  useUploadCustomerDocumentMutation,
  useArchiveCustomerDocumentMutation,
  useOpenCustomerDocumentMutation,
  usePreviewCustomerDocumentMutation,
  useGetOcrRunsQuery,
  useStartOcrMutation,
  useReviewOcrMutation,
  useGetCustomerDuplicatesQuery,
  useReviewDuplicateMutation,
} = customersApi
