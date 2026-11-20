import { API_ENDPOINTS } from '@/config/constants'
import { investorSchema, type Investor } from '@/features/investors/schemas/investor.schema'
import { baseApi } from '@/lib/api/baseApi'
import { parseResource, unwrapEnvelope } from '@/lib/api/envelope'
import { buildListParams } from '@/lib/api/params'
import { z } from 'zod'

const listSchema = z.object({
  items: z.array(investorSchema),
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number().optional(),
})

export type CreateInvestorBody = {
  organizationId?: string
  displayName: string
  legalName?: string
  contactEmail: string
  phone?: string
  notes?: string
  scope?: {
    legalEntityIds?: string[]
    branchIds?: string[]
    vehicleIds?: string[]
    reportKeys?: string[]
  }
}

export const investorsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInvestors: builder.query<
      z.infer<typeof listSchema>,
      { page?: number; pageSize?: number; search?: string; status?: string; organizationId?: string }
    >({
      query: (query) => ({
        url: API_ENDPOINTS.investors,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) =>
        parseResource(listSchema, response, 'investors.loadError'),
      providesTags: ['Investors'],
    }),
    getInvestor: builder.query<Investor, string>({
      query: (id) => ({ url: `${API_ENDPOINTS.investors}/${id}` }),
      transformResponse: (response: unknown) =>
        parseResource(investorSchema, response, 'investors.loadError'),
      providesTags: (_r, _e, id) => [{ type: 'Investor', id }],
    }),
    createInvestor: builder.mutation<Investor, CreateInvestorBody>({
      query: (body) => ({ url: API_ENDPOINTS.investors, method: 'POST', body }),
      transformResponse: (response: unknown) =>
        parseResource(investorSchema, response, 'investors.loadError'),
      invalidatesTags: ['Investors'],
    }),
    updateInvestor: builder.mutation<Investor, { id: string; body: Partial<CreateInvestorBody> }>({
      query: ({ id, body }) => ({
        url: `${API_ENDPOINTS.investors}/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: unknown) =>
        parseResource(investorSchema, response, 'investors.loadError'),
      invalidatesTags: (_r, _e, arg) => ['Investors', { type: 'Investor', id: arg.id }],
    }),
    inviteInvestor: builder.mutation<
      { investorId: string; invitationId: string; expiresAt: string; token: string },
      string
    >({
      query: (id) => ({ url: `${API_ENDPOINTS.investors}/${id}/invite`, method: 'POST' }),
      transformResponse: (response: unknown) =>
        unwrapEnvelope(response) as {
          investorId: string
          invitationId: string
          expiresAt: string
          token: string
        },
      invalidatesTags: (_r, _e, id) => ['Investors', { type: 'Investor', id }],
    }),
    suspendInvestor: builder.mutation<Investor, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `${API_ENDPOINTS.investors}/${id}/suspend`,
        method: 'POST',
        body: { reason },
      }),
      transformResponse: (response: unknown) =>
        parseResource(investorSchema, response, 'investors.loadError'),
      invalidatesTags: (_r, _e, arg) => ['Investors', { type: 'Investor', id: arg.id }],
    }),
    revokeInvestor: builder.mutation<Investor, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `${API_ENDPOINTS.investors}/${id}/revoke`,
        method: 'POST',
        body: { reason },
      }),
      transformResponse: (response: unknown) =>
        parseResource(investorSchema, response, 'investors.loadError'),
      invalidatesTags: (_r, _e, arg) => ['Investors', { type: 'Investor', id: arg.id }],
    }),
    activateInvestor: builder.mutation<Investor, string>({
      query: (id) => ({ url: `${API_ENDPOINTS.investors}/${id}/activate`, method: 'POST' }),
      transformResponse: (response: unknown) =>
        parseResource(investorSchema, response, 'investors.loadError'),
      invalidatesTags: (_r, _e, id) => ['Investors', { type: 'Investor', id }],
    }),
    replaceInvestorAccess: builder.mutation<
      Investor,
      {
        id: string
        body: {
          legalEntityIds?: string[]
          branchIds?: string[]
          vehicleIds?: string[]
          reportKeys?: string[]
          reason?: string
        }
      }
    >({
      query: ({ id, body }) => ({
        url: `${API_ENDPOINTS.investors}/${id}/access`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: unknown) =>
        parseResource(investorSchema, response, 'investors.loadError'),
      invalidatesTags: (_r, _e, arg) => ['Investors', { type: 'Investor', id: arg.id }],
    }),
    getInvestorActivity: builder.query<{ items: Array<Record<string, unknown>> }, string>({
      query: (id) => ({ url: `${API_ENDPOINTS.investors}/${id}/activity` }),
      transformResponse: (response: unknown) =>
        unwrapEnvelope(response) as { items: Array<Record<string, unknown>> },
      providesTags: (_r, _e, id) => [{ type: 'Investor', id }],
    }),
  }),
})

export const {
  useGetInvestorsQuery,
  useGetInvestorQuery,
  useCreateInvestorMutation,
  useUpdateInvestorMutation,
  useInviteInvestorMutation,
  useSuspendInvestorMutation,
  useRevokeInvestorMutation,
  useActivateInvestorMutation,
  useReplaceInvestorAccessMutation,
  useGetInvestorActivityQuery,
} = investorsApi
