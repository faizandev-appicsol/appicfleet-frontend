import { API_ENDPOINTS } from '@/config/constants'
import { baseApi } from '@/lib/api/baseApi'
import { unwrapEnvelope } from '@/lib/api/envelope'
import { buildListParams } from '@/lib/api/params'

type ListQuery = {
  page?: number
  pageSize?: number
  status?: string
  stageCode?: string
  candidateId?: string
  requisitionId?: string
  q?: string
}

const base = API_ENDPOINTS.recruitment

export const recruitmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRecruitmentSummary: builder.query<Record<string, unknown>, void>({
      query: () => ({ url: `${base}/summary` }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['RecruitmentSummary'],
    }),
    getRecruitmentStages: builder.query<Record<string, unknown>, void>({
      query: () => ({ url: `${base}/stages` }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['RecruitmentStages'],
    }),
    getRequisitions: builder.query<Record<string, unknown>, ListQuery>({
      query: (query) => ({
        url: `${base}/requisitions`,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['RecruitmentRequisitions'],
    }),
    createRequisition: builder.mutation<Record<string, unknown>, Record<string, unknown>>({
      query: (body) => ({ url: `${base}/requisitions`, method: 'POST', body }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['RecruitmentRequisitions', 'RecruitmentSummary'],
    }),
    submitRequisition: builder.mutation<Record<string, unknown>, string>({
      query: (id) => ({ url: `${base}/requisitions/${id}/submit`, method: 'POST' }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['RecruitmentRequisitions', 'RecruitmentSummary'],
    }),
    approveRequisition: builder.mutation<
      Record<string, unknown>,
      { id: string; approve: boolean; notes?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `${base}/requisitions/${id}/approve`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['RecruitmentRequisitions', 'RecruitmentSummary'],
    }),
    transitionRequisition: builder.mutation<
      Record<string, unknown>,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `${base}/requisitions/${id}/transition`,
        method: 'POST',
        body: { status },
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['RecruitmentRequisitions', 'RecruitmentSummary'],
    }),
    getPostings: builder.query<Record<string, unknown>, ListQuery>({
      query: (query) => ({
        url: `${base}/postings`,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['RecruitmentPostings'],
    }),
    createPosting: builder.mutation<Record<string, unknown>, Record<string, unknown>>({
      query: (body) => ({ url: `${base}/postings`, method: 'POST', body }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['RecruitmentPostings'],
    }),
    publishPosting: builder.mutation<Record<string, unknown>, string>({
      query: (id) => ({ url: `${base}/postings/${id}/publish`, method: 'POST' }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['RecruitmentPostings'],
    }),
    getCandidates: builder.query<Record<string, unknown>, ListQuery>({
      query: (query) => ({
        url: `${base}/candidates`,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['RecruitmentCandidates'],
    }),
    getCandidate: builder.query<Record<string, unknown>, string>({
      query: (id) => ({ url: `${base}/candidates/${id}` }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: (_r, _e, id) => [{ type: 'RecruitmentCandidate', id }],
    }),
    createCandidate: builder.mutation<Record<string, unknown>, Record<string, unknown>>({
      query: (body) => ({ url: `${base}/candidates`, method: 'POST', body }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['RecruitmentCandidates', 'RecruitmentSummary'],
    }),
    addCandidateNote: builder.mutation<
      Record<string, unknown>,
      { id: string; content: string; applicationId?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `${base}/candidates/${id}/notes`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: (_r, _e, arg) => [{ type: 'RecruitmentCandidate', id: arg.id }],
    }),
    getApplications: builder.query<Record<string, unknown>, ListQuery>({
      query: (query) => ({
        url: `${base}/applications`,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['RecruitmentApplications'],
    }),
    createApplication: builder.mutation<Record<string, unknown>, Record<string, unknown>>({
      query: (body) => ({ url: `${base}/applications`, method: 'POST', body }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['RecruitmentApplications', 'RecruitmentSummary'],
    }),
    changeApplicationStage: builder.mutation<
      Record<string, unknown>,
      { id: string; stageCode: string; reason?: string; notes?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `${base}/applications/${id}/stage`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['RecruitmentApplications', 'RecruitmentSummary'],
    }),
    getInterviews: builder.query<Record<string, unknown>, ListQuery>({
      query: (query) => ({
        url: `${base}/interviews`,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['RecruitmentInterviews'],
    }),
    scheduleInterview: builder.mutation<Record<string, unknown>, Record<string, unknown>>({
      query: (body) => ({ url: `${base}/interviews`, method: 'POST', body }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['RecruitmentInterviews', 'RecruitmentSummary'],
    }),
    completeInterview: builder.mutation<Record<string, unknown>, string>({
      query: (id) => ({ url: `${base}/interviews/${id}/complete`, method: 'POST' }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['RecruitmentInterviews'],
    }),
    cancelInterview: builder.mutation<Record<string, unknown>, string>({
      query: (id) => ({ url: `${base}/interviews/${id}/cancel`, method: 'POST' }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['RecruitmentInterviews'],
    }),
    submitInterviewFeedback: builder.mutation<
      Record<string, unknown>,
      { id: string; recommendation: string; rating?: number; strengths?: string; concerns?: string; notes?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `${base}/interviews/${id}/feedback`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['RecruitmentInterviews'],
    }),
    getOffers: builder.query<Record<string, unknown>, ListQuery>({
      query: (query) => ({
        url: `${base}/offers`,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['RecruitmentOffers'],
    }),
    createOffer: builder.mutation<Record<string, unknown>, Record<string, unknown>>({
      query: (body) => ({ url: `${base}/offers`, method: 'POST', body }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['RecruitmentOffers', 'RecruitmentSummary'],
    }),
    submitOffer: builder.mutation<Record<string, unknown>, string>({
      query: (id) => ({ url: `${base}/offers/${id}/submit`, method: 'POST' }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['RecruitmentOffers'],
    }),
    approveOffer: builder.mutation<
      Record<string, unknown>,
      { id: string; approve: boolean; reason?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `${base}/offers/${id}/approve`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['RecruitmentOffers', 'RecruitmentSummary'],
    }),
    sendOffer: builder.mutation<Record<string, unknown>, string>({
      query: (id) => ({ url: `${base}/offers/${id}/send`, method: 'POST' }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['RecruitmentOffers', 'RecruitmentSummary'],
    }),
    respondOffer: builder.mutation<
      Record<string, unknown>,
      { id: string; accept: boolean; notes?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `${base}/offers/${id}/respond`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['RecruitmentOffers', 'RecruitmentSummary'],
    }),
    convertHire: builder.mutation<Record<string, unknown>, Record<string, unknown>>({
      query: (body) => ({ url: `${base}/hire`, method: 'POST', body }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: [
        'RecruitmentOffers',
        'RecruitmentOnboarding',
        'RecruitmentCandidates',
        'RecruitmentSummary',
        'HrEmployees',
      ],
    }),
    getOnboardings: builder.query<Record<string, unknown>, ListQuery>({
      query: (query) => ({
        url: `${base}/onboarding`,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['RecruitmentOnboarding'],
    }),
    getOnboarding: builder.query<Record<string, unknown>, string>({
      query: (id) => ({ url: `${base}/onboarding/${id}` }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['RecruitmentOnboarding'],
    }),
    completeOnboardingTask: builder.mutation<
      Record<string, unknown>,
      { id: string; evidenceStorageKey?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `${base}/onboarding/tasks/${id}/complete`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['RecruitmentOnboarding'],
    }),
    completeOnboarding: builder.mutation<
      Record<string, unknown>,
      { id: string; overrideReason?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `${base}/onboarding/${id}/complete`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['RecruitmentOnboarding', 'RecruitmentSummary'],
    }),
  }),
})

export const {
  useGetRecruitmentSummaryQuery,
  useGetRecruitmentStagesQuery,
  useGetRequisitionsQuery,
  useCreateRequisitionMutation,
  useSubmitRequisitionMutation,
  useApproveRequisitionMutation,
  useTransitionRequisitionMutation,
  useGetPostingsQuery,
  useCreatePostingMutation,
  usePublishPostingMutation,
  useGetCandidatesQuery,
  useGetCandidateQuery,
  useCreateCandidateMutation,
  useAddCandidateNoteMutation,
  useGetApplicationsQuery,
  useCreateApplicationMutation,
  useChangeApplicationStageMutation,
  useGetInterviewsQuery,
  useScheduleInterviewMutation,
  useCompleteInterviewMutation,
  useCancelInterviewMutation,
  useSubmitInterviewFeedbackMutation,
  useGetOffersQuery,
  useCreateOfferMutation,
  useSubmitOfferMutation,
  useApproveOfferMutation,
  useSendOfferMutation,
  useRespondOfferMutation,
  useConvertHireMutation,
  useGetOnboardingsQuery,
  useGetOnboardingQuery,
  useCompleteOnboardingTaskMutation,
  useCompleteOnboardingMutation,
} = recruitmentApi
