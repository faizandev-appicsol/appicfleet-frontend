import { API_ENDPOINTS } from '@/config/constants'
import {
  einvoiceSchema,
  taxCodeSchema,
  taxOverviewSchema,
  taxPeriodSchema,
  taxTransactionSchema,
  type EInvoice,
  type ListQuery,
  type TaxCode,
  type TaxPeriod,
  type TaxTransaction,
} from '@/features/tax/schemas/tax.schema'
import { baseApi } from '@/lib/api/baseApi'
import { parsePage, parseResource, unwrapEnvelope } from '@/lib/api/envelope'
import { buildListParams } from '@/lib/api/params'
import type { Paginated } from '@/types/pagination'
import { z } from 'zod'

const codesTag = { type: 'TaxCodes' as const, id: 'LIST' }
const txTag = { type: 'TaxTransactions' as const, id: 'LIST' }
const periodsTag = { type: 'TaxPeriods' as const, id: 'LIST' }
const einvoicesTag = { type: 'EInvoices' as const, id: 'LIST' }

export const taxApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTaxOverview: builder.query<z.infer<typeof taxOverviewSchema>, { legalEntityId?: string } | void>({
      query: (query) => ({ url: `${API_ENDPOINTS.tax}/overview`, params: query ?? {} }),
      transformResponse: (response: unknown) => parseResource(taxOverviewSchema, response, 'tax.loadError'),
    }),
    getTaxCodes: builder.query<Paginated<TaxCode>, ListQuery>({
      query: (query) => ({ url: `${API_ENDPOINTS.tax}/codes`, params: buildListParams(query) }),
      transformResponse: (response: unknown) => parsePage(taxCodeSchema, response, 'tax.loadError'),
      providesTags: [codesTag],
    }),
    seedTaxCodes: builder.mutation<{ created: number; total: number }, { legalEntityId?: string }>({
      query: (body) => ({ url: `${API_ENDPOINTS.tax}/codes/seed`, method: 'POST', body }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as { created: number; total: number },
      invalidatesTags: [codesTag],
    }),
    createTaxCode: builder.mutation<TaxCode, Record<string, unknown>>({
      query: (body) => ({ url: `${API_ENDPOINTS.tax}/codes`, method: 'POST', body }),
      transformResponse: (response: unknown) => parseResource(taxCodeSchema, response, 'tax.loadError'),
      invalidatesTags: [codesTag],
    }),
    getTaxPeriods: builder.query<TaxPeriod[], { legalEntityId?: string } | void>({
      query: (query) => ({ url: `${API_ENDPOINTS.tax}/periods`, params: query ?? {} }),
      transformResponse: (response: unknown) => z.array(taxPeriodSchema).parse(unwrapEnvelope(response)),
      providesTags: [periodsTag],
    }),
    createTaxPeriod: builder.mutation<TaxPeriod, Record<string, unknown>>({
      query: (body) => ({ url: `${API_ENDPOINTS.tax}/periods`, method: 'POST', body }),
      transformResponse: (response: unknown) => parseResource(taxPeriodSchema, response, 'tax.loadError'),
      invalidatesTags: [periodsTag],
    }),
    taxPeriodAction: builder.mutation<TaxPeriod, { id: string; action: 'lock' | 'reopen'; reason: string }>({
      query: ({ id, action, reason }) => ({
        url: `${API_ENDPOINTS.tax}/periods/${encodeURIComponent(id)}/${action}`,
        method: 'POST',
        body: { reason },
      }),
      transformResponse: (response: unknown) => parseResource(taxPeriodSchema, response, 'tax.loadError'),
      invalidatesTags: [periodsTag],
    }),
    getTaxTransactions: builder.query<Paginated<TaxTransaction>, ListQuery>({
      query: (query) => ({ url: `${API_ENDPOINTS.tax}/transactions`, params: buildListParams(query) }),
      transformResponse: (response: unknown) => parsePage(taxTransactionSchema, response, 'tax.loadError'),
      providesTags: [txTag],
    }),
    getVatReport: builder.query<
      { rows: Array<Record<string, string | number>>; note?: string },
      { legalEntityId: string; taxPeriodId?: string }
    >({
      query: (query) => ({ url: `${API_ENDPOINTS.tax}/reports/vat`, params: query }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as { rows: Array<Record<string, string | number>>; note?: string },
    }),
    getTaxConfiguration: builder.query<Record<string, unknown>, { legalEntityId: string }>({
      query: (query) => ({ url: `${API_ENDPOINTS.tax}/configuration`, params: query }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
    }),
    updateTaxConfiguration: builder.mutation<Record<string, unknown>, Record<string, unknown>>({
      query: (body) => ({ url: `${API_ENDPOINTS.tax}/configuration`, method: 'PUT', body }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
    }),
    getEInvoices: builder.query<Paginated<EInvoice>, ListQuery>({
      query: (query) => ({ url: `${API_ENDPOINTS.tax}/einvoices`, params: buildListParams(query) }),
      transformResponse: (response: unknown) => parsePage(einvoiceSchema, response, 'tax.loadError'),
      providesTags: [einvoicesTag],
    }),
    getEInvoice: builder.query<EInvoice & { submissions?: unknown[]; history?: unknown[] }, string>({
      query: (id) => `${API_ENDPOINTS.tax}/einvoices/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) => parseResource(einvoiceSchema, response, 'tax.loadError') as EInvoice,
      providesTags: (_r, _e, id) => [{ type: 'EInvoice', id }],
    }),
    generateEInvoice: builder.mutation<EInvoice, { invoiceId: string }>({
      query: (body) => ({ url: `${API_ENDPOINTS.tax}/einvoices/generate`, method: 'POST', body }),
      transformResponse: (response: unknown) => parseResource(einvoiceSchema, response, 'tax.loadError'),
      invalidatesTags: [einvoicesTag],
    }),
    einvoiceAction: builder.mutation<EInvoice, { id: string; action: 'submit' | 'retry' | 'cancel'; body?: unknown }>({
      query: ({ id, action, body }) => ({
        url: `${API_ENDPOINTS.tax}/einvoices/${encodeURIComponent(id)}/${action}`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => parseResource(einvoiceSchema, response, 'tax.loadError'),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'EInvoice', id }, einvoicesTag],
    }),
  }),
})

export const {
  useGetTaxOverviewQuery,
  useGetTaxCodesQuery,
  useSeedTaxCodesMutation,
  useCreateTaxCodeMutation,
  useGetTaxPeriodsQuery,
  useCreateTaxPeriodMutation,
  useTaxPeriodActionMutation,
  useGetTaxTransactionsQuery,
  useGetVatReportQuery,
  useGetTaxConfigurationQuery,
  useUpdateTaxConfigurationMutation,
  useGetEInvoicesQuery,
  useGetEInvoiceQuery,
  useGenerateEInvoiceMutation,
  useEinvoiceActionMutation,
} = taxApi
