import { API_ENDPOINTS } from '@/config/constants'
import {
  investorContractItemSchema,
  investorFinancialSchema,
  investorFleetItemSchema,
  investorOverviewSchema,
  investorProfileSchema,
  type InvestorFinancial,
  type InvestorOverview,
  type InvestorProfile,
} from '@/features/investor-portal/schemas/investorPortal.schema'
import { baseApi } from '@/lib/api/baseApi'
import { parseResource, unwrapEnvelope } from '@/lib/api/envelope'
import { buildListParams } from '@/lib/api/params'
import { z } from 'zod'

type PortalQuery = {
  page?: number
  pageSize?: number
  preset?: string
  from?: string
  to?: string
  status?: string
  key?: string
}

function portalParams(query?: PortalQuery) {
  return buildListParams({
    page: query?.page,
    pageSize: query?.pageSize,
    preset: query?.preset,
    from: query?.from,
    to: query?.to,
    status: query?.status,
    key: query?.key,
  } as never)
}

const paginatedFleetSchema = z.object({
  items: z.array(investorFleetItemSchema),
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number().optional(),
})

const paginatedContractsSchema = z.object({
  items: z.array(investorContractItemSchema),
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number().optional(),
})

export const investorPortalApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInvestorOverview: builder.query<InvestorOverview, PortalQuery | void>({
      query: (query) => ({
        url: `${API_ENDPOINTS.investor}/overview`,
        params: portalParams(query ?? undefined),
      }),
      transformResponse: (response: unknown) =>
        parseResource(investorOverviewSchema, response, 'investorPortal.loadError'),
      providesTags: ['InvestorPortal'],
    }),
    getInvestorFleet: builder.query<z.infer<typeof paginatedFleetSchema>, PortalQuery | void>({
      query: (query) => ({
        url: `${API_ENDPOINTS.investor}/fleet`,
        params: portalParams(query ?? undefined),
      }),
      transformResponse: (response: unknown) =>
        parseResource(paginatedFleetSchema, response, 'investorPortal.loadError'),
      providesTags: ['InvestorPortal'],
    }),
    getInvestorPerformance: builder.query<Record<string, unknown>, PortalQuery | void>({
      query: (query) => ({
        url: `${API_ENDPOINTS.investor}/performance`,
        params: portalParams(query ?? undefined),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['InvestorPortal'],
    }),
    getInvestorFinancial: builder.query<InvestorFinancial, PortalQuery | void>({
      query: (query) => ({
        url: `${API_ENDPOINTS.investor}/financial-summary`,
        params: portalParams(query ?? undefined),
      }),
      transformResponse: (response: unknown) =>
        parseResource(investorFinancialSchema, response, 'investorPortal.loadError'),
      providesTags: ['InvestorPortal'],
    }),
    getInvestorContracts: builder.query<z.infer<typeof paginatedContractsSchema>, PortalQuery | void>({
      query: (query) => ({
        url: `${API_ENDPOINTS.investor}/contracts`,
        params: portalParams(query ?? undefined),
      }),
      transformResponse: (response: unknown) =>
        parseResource(paginatedContractsSchema, response, 'investorPortal.loadError'),
      providesTags: ['InvestorPortal'],
    }),
    getInvestorReports: builder.query<{ items: Array<{ key: string; allowed: boolean }> }, void>({
      query: () => ({ url: `${API_ENDPOINTS.investor}/reports` }),
      transformResponse: (response: unknown) =>
        unwrapEnvelope(response) as { items: Array<{ key: string; allowed: boolean }> },
      providesTags: ['InvestorPortal'],
    }),
    getInvestorProfile: builder.query<InvestorProfile, void>({
      query: () => ({ url: `${API_ENDPOINTS.investor}/profile` }),
      transformResponse: (response: unknown) =>
        parseResource(investorProfileSchema, response, 'investorPortal.loadError'),
      providesTags: ['InvestorPortal'],
    }),
    updateInvestorProfile: builder.mutation<InvestorProfile, { displayName?: string; phone?: string | null }>({
      query: (body) => ({
        url: `${API_ENDPOINTS.investor}/profile`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: unknown) =>
        parseResource(investorProfileSchema, response, 'investorPortal.loadError'),
      invalidatesTags: ['InvestorPortal'],
    }),
    acceptInvestorInvite: builder.mutation<
      unknown,
      { token: string; password: string; name?: string }
    >({
      query: (body) => ({
        url: `${API_ENDPOINTS.investor}/invitations/accept`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response),
    }),
  }),
})

export const {
  useGetInvestorOverviewQuery,
  useGetInvestorFleetQuery,
  useGetInvestorPerformanceQuery,
  useGetInvestorFinancialQuery,
  useGetInvestorContractsQuery,
  useGetInvestorReportsQuery,
  useGetInvestorProfileQuery,
  useUpdateInvestorProfileMutation,
  useAcceptInvestorInviteMutation,
} = investorPortalApi
