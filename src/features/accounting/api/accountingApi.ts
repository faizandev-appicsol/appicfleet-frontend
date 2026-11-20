import { API_ENDPOINTS } from '@/config/constants'
import {
  accountSchema,
  fiscalPeriodSchema,
  fiscalYearSchema,
  journalDetailSchema,
  journalSchema,
  overviewSchema,
  type Account,
  type FiscalPeriod,
  type FiscalYear,
  type Journal,
  type JournalDetail,
  type JournalWriteBody,
  type ListQuery,
} from '@/features/accounting/schemas/accounting.schema'
import { baseApi } from '@/lib/api/baseApi'
import { parsePage, parseResource, unwrapEnvelope } from '@/lib/api/envelope'
import { buildListParams } from '@/lib/api/params'
import type { Paginated } from '@/types/pagination'
import { z } from 'zod'

const accountsTag = { type: 'GlAccounts' as const, id: 'LIST' }
const journalsTag = { type: 'Journals' as const, id: 'LIST' }
const periodsTag = { type: 'FiscalPeriods' as const, id: 'LIST' }

export const accountingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAccountingOverview: builder.query<z.infer<typeof overviewSchema>, { legalEntityId?: string } | void>({
      query: (query) => ({ url: `${API_ENDPOINTS.accounting}/overview`, params: query ?? {} }),
      transformResponse: (response: unknown) => parseResource(overviewSchema, response, 'accounting.loadError'),
    }),
    getAccounts: builder.query<Paginated<Account>, ListQuery>({
      query: (query) => ({ url: `${API_ENDPOINTS.accounting}/accounts`, params: buildListParams(query) }),
      transformResponse: (response: unknown) => parsePage(accountSchema, response, 'accounting.loadError'),
      providesTags: (result) =>
        result ? [...result.items.map((item) => ({ type: 'GlAccount' as const, id: item.id })), accountsTag] : [accountsTag],
    }),
    getAccountTree: builder.query<Account[], void>({
      query: () => `${API_ENDPOINTS.accounting}/accounts/tree`,
      transformResponse: (response: unknown) => {
        const data = unwrapEnvelope(response)
        return z.array(accountSchema).parse(data)
      },
      providesTags: [accountsTag],
    }),
    createAccount: builder.mutation<Account, Record<string, unknown>>({
      query: (body) => ({ url: `${API_ENDPOINTS.accounting}/accounts`, method: 'POST', body }),
      transformResponse: (response: unknown) => parseResource(accountSchema, response, 'accounting.loadError'),
      invalidatesTags: [accountsTag],
    }),
    seedChart: builder.mutation<{ created: number; total: number }, { legalEntityId: string }>({
      query: (body) => ({ url: `${API_ENDPOINTS.accounting}/accounts/seed`, method: 'POST', body }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as { created: number; total: number },
      invalidatesTags: [accountsTag],
    }),
    getJournals: builder.query<Paginated<Journal>, ListQuery>({
      query: (query) => ({ url: `${API_ENDPOINTS.accounting}/journals`, params: buildListParams(query) }),
      transformResponse: (response: unknown) => parsePage(journalSchema, response, 'accounting.loadError'),
      providesTags: (result) =>
        result ? [...result.items.map((item) => ({ type: 'Journal' as const, id: item.id })), journalsTag] : [journalsTag],
    }),
    getJournal: builder.query<JournalDetail, string>({
      query: (id) => `${API_ENDPOINTS.accounting}/journals/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) => parseResource(journalDetailSchema, response, 'accounting.loadError'),
      providesTags: (_r, _e, id) => [{ type: 'Journal', id }],
    }),
    createJournal: builder.mutation<JournalDetail, JournalWriteBody>({
      query: (body) => ({ url: `${API_ENDPOINTS.accounting}/journals`, method: 'POST', body }),
      transformResponse: (response: unknown) => parseResource(journalDetailSchema, response, 'accounting.loadError'),
      invalidatesTags: [journalsTag],
    }),
    journalAction: builder.mutation<JournalDetail, { id: string; action: string; body?: unknown }>({
      query: ({ id, action, body }) => ({
        url: `${API_ENDPOINTS.accounting}/journals/${encodeURIComponent(id)}/${action}`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => parseResource(journalDetailSchema, response, 'accounting.loadError'),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Journal', id }, journalsTag],
    }),
    getFiscalYears: builder.query<FiscalYear[], { legalEntityId?: string } | void>({
      query: (query) => ({ url: `${API_ENDPOINTS.accounting}/fiscal-years`, params: query ?? {} }),
      transformResponse: (response: unknown) => z.array(fiscalYearSchema).parse(unwrapEnvelope(response)),
      providesTags: [periodsTag],
    }),
    getFiscalPeriods: builder.query<FiscalPeriod[], { legalEntityId?: string; fiscalYearId?: string } | void>({
      query: (query) => ({ url: `${API_ENDPOINTS.accounting}/fiscal-periods`, params: query ?? {} }),
      transformResponse: (response: unknown) => z.array(fiscalPeriodSchema).parse(unwrapEnvelope(response)),
      providesTags: [periodsTag],
    }),
    createFiscalYear: builder.mutation<FiscalYear, Record<string, unknown>>({
      query: (body) => ({ url: `${API_ENDPOINTS.accounting}/fiscal-years`, method: 'POST', body }),
      transformResponse: (response: unknown) => parseResource(fiscalYearSchema, response, 'accounting.loadError'),
      invalidatesTags: [periodsTag],
    }),
    createFiscalPeriod: builder.mutation<FiscalPeriod, Record<string, unknown>>({
      query: (body) => ({ url: `${API_ENDPOINTS.accounting}/fiscal-periods`, method: 'POST', body }),
      transformResponse: (response: unknown) => parseResource(fiscalPeriodSchema, response, 'accounting.loadError'),
      invalidatesTags: [periodsTag],
    }),
    periodAction: builder.mutation<FiscalPeriod, { id: string; action: string; reason: string }>({
      query: ({ id, action, reason }) => ({
        url: `${API_ENDPOINTS.accounting}/fiscal-periods/${encodeURIComponent(id)}/${action}`,
        method: 'POST',
        body: { reason },
      }),
      transformResponse: (response: unknown) => parseResource(fiscalPeriodSchema, response, 'accounting.loadError'),
      invalidatesTags: [periodsTag],
    }),
    getTrialBalance: builder.query<
      {
        rows: Array<{ accountCode: string; accountName: string; debitBalance: string; creditBalance: string }>
        totalDebit: string
        totalCredit: string
        difference: string
        balanced: boolean
        periodName?: string
      },
      { fiscalPeriodId: string }
    >({
      query: (query) => ({ url: `${API_ENDPOINTS.accounting}/trial-balance`, params: query }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as {
        rows: Array<{ accountCode: string; accountName: string; debitBalance: string; creditBalance: string }>
        totalDebit: string
        totalCredit: string
        difference: string
        balanced: boolean
        periodName?: string
      },
    }),
    getLedger: builder.query<
      {
        account: { id: string; code: string; name: string }
        items: Array<{
          id: string
          accountingDate?: string
          journalNumber?: string
          description?: string
          debit: string
          credit: string
          runningBalance: string
        }>
        page: number
        pageSize: number
        total: number
      },
      ListQuery & { accountId: string }
    >({
      query: (query) => ({ url: `${API_ENDPOINTS.accounting}/ledger`, params: buildListParams(query) }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as {
        account: { id: string; code: string; name: string }
        items: Array<{
          id: string
          accountingDate?: string
          journalNumber?: string
          description?: string
          debit: string
          credit: string
          runningBalance: string
        }>
        page: number
        pageSize: number
        total: number
      },
    }),
  }),
})

export const {
  useGetAccountingOverviewQuery,
  useGetAccountsQuery,
  useGetAccountTreeQuery,
  useCreateAccountMutation,
  useSeedChartMutation,
  useGetJournalsQuery,
  useGetJournalQuery,
  useCreateJournalMutation,
  useJournalActionMutation,
  useGetFiscalYearsQuery,
  useGetFiscalPeriodsQuery,
  useCreateFiscalYearMutation,
  useCreateFiscalPeriodMutation,
  usePeriodActionMutation,
  useGetTrialBalanceQuery,
  useGetLedgerQuery,
} = accountingApi
