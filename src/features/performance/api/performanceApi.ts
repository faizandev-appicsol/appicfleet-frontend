import { API_ENDPOINTS } from '@/config/constants'
import { baseApi } from '@/lib/api/baseApi'
import { unwrapEnvelope } from '@/lib/api/envelope'
import { buildListParams } from '@/lib/api/params'

type ListQuery = {
  page?: number
  pageSize?: number
  status?: string
  cycleId?: string
  employeeId?: string
}

const base = API_ENDPOINTS.performance

export const performanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPerformanceSummary: builder.query<Record<string, unknown>, void>({
      query: () => ({ url: `${base}/summary` }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['PerformanceSummary'],
    }),
    getPerformanceAnalytics: builder.query<Record<string, unknown>, { cycleId?: string } | void>({
      query: (query) => ({
        url: `${base}/analytics`,
        params: query ? buildListParams(query as never) : undefined,
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['PerformanceAnalytics'],
    }),
    getPerformanceCycles: builder.query<Record<string, unknown>, ListQuery>({
      query: (query) => ({
        url: `${base}/cycles`,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['PerformanceCycles'],
    }),
    transitionPerformanceCycle: builder.mutation<
      Record<string, unknown>,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `${base}/cycles/${id}/transition`,
        method: 'POST',
        body: { status },
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['PerformanceCycles', 'PerformanceSummary'],
    }),
    getPerformanceReviews: builder.query<Record<string, unknown>, ListQuery>({
      query: (query) => ({
        url: `${base}/reviews`,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['PerformanceReviews'],
    }),
    finalizePerformanceReview: builder.mutation<
      Record<string, unknown>,
      { id: string; finalRating?: number; finalComments?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `${base}/reviews/${id}/finalize`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['PerformanceReviews', 'PerformanceSummary', 'PerformanceAnalytics'],
    }),
    getPerformanceGoals: builder.query<Record<string, unknown>, ListQuery>({
      query: (query) => ({
        url: `${base}/goals`,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['PerformanceGoals'],
    }),
    getPerformancePips: builder.query<Record<string, unknown>, ListQuery>({
      query: (query) => ({
        url: `${base}/pips`,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['PerformancePips'],
    }),
    getDevelopmentPlans: builder.query<Record<string, unknown>, ListQuery>({
      query: (query) => ({
        url: `${base}/development-plans`,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['PerformanceDevelopment'],
    }),
  }),
})

export const {
  useGetPerformanceSummaryQuery,
  useGetPerformanceAnalyticsQuery,
  useGetPerformanceCyclesQuery,
  useTransitionPerformanceCycleMutation,
  useGetPerformanceReviewsQuery,
  useFinalizePerformanceReviewMutation,
  useGetPerformanceGoalsQuery,
  useGetPerformancePipsQuery,
  useGetDevelopmentPlansQuery,
} = performanceApi
