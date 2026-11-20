import { API_ENDPOINTS } from '@/config/constants'
import { baseApi } from '@/lib/api/baseApi'
import { unwrapEnvelope } from '@/lib/api/envelope'
import { buildListParams } from '@/lib/api/params'

type ListQuery = {
  page?: number
  pageSize?: number
  status?: string
  employeeId?: string
  payrollPeriodId?: string
  payrollRunId?: string
  q?: string
}

export const payrollApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayrollSummary: builder.query<Record<string, unknown>, void>({
      query: () => ({ url: `${API_ENDPOINTS.payroll}/summary` }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['PayrollSummary'],
    }),
    getPayrollPeriods: builder.query<Record<string, unknown>, ListQuery>({
      query: (query) => ({
        url: `${API_ENDPOINTS.payroll}/periods`,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['PayrollPeriods'],
    }),
    createPayrollPeriod: builder.mutation<Record<string, unknown>, Record<string, unknown>>({
      query: (body) => ({ url: `${API_ENDPOINTS.payroll}/periods`, method: 'POST', body }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['PayrollPeriods', 'PayrollSummary'],
    }),
    getPayrollRuns: builder.query<Record<string, unknown>, ListQuery>({
      query: (query) => ({
        url: `${API_ENDPOINTS.payroll}/runs`,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['PayrollRuns'],
    }),
    getPayrollRun: builder.query<Record<string, unknown>, string>({
      query: (id) => ({ url: `${API_ENDPOINTS.payroll}/runs/${id}` }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: (_r, _e, id) => [{ type: 'PayrollRuns', id }],
    }),
    getPayrollRunReview: builder.query<Record<string, unknown>, string>({
      query: (id) => ({ url: `${API_ENDPOINTS.payroll}/runs/${id}/review` }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: (_r, _e, id) => [{ type: 'PayrollRuns', id }],
    }),
    createPayrollRun: builder.mutation<Record<string, unknown>, Record<string, unknown>>({
      query: (body) => ({ url: `${API_ENDPOINTS.payroll}/runs`, method: 'POST', body }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['PayrollRuns', 'PayrollSummary', 'PayrollPeriods'],
    }),
    calculatePayrollRun: builder.mutation<Record<string, unknown>, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `${API_ENDPOINTS.payroll}/runs/${id}/calculate`,
        method: 'POST',
        body: reason ? { reason } : {},
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['PayrollRuns', 'PayrollSummary'],
    }),
    submitPayrollRun: builder.mutation<Record<string, unknown>, string>({
      query: (id) => ({ url: `${API_ENDPOINTS.payroll}/runs/${id}/submit`, method: 'POST' }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['PayrollRuns', 'PayrollSummary'],
    }),
    approvePayrollRun: builder.mutation<Record<string, unknown>, string>({
      query: (id) => ({ url: `${API_ENDPOINTS.payroll}/runs/${id}/approve`, method: 'POST' }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['PayrollRuns', 'PayrollPayslips', 'PayrollSummary'],
    }),
    payPayrollRun: builder.mutation<Record<string, unknown>, { id: string; paymentMethod?: string }>({
      query: ({ id, paymentMethod }) => ({
        url: `${API_ENDPOINTS.payroll}/runs/${id}/pay`,
        method: 'POST',
        body: paymentMethod ? { paymentMethod } : {},
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['PayrollRuns', 'PayrollPayments', 'PayrollSummary'],
    }),
    getSalaryComponents: builder.query<Record<string, unknown>, ListQuery>({
      query: (query) => ({
        url: `${API_ENDPOINTS.payroll}/components`,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['PayrollCompensation'],
    }),
    getCompensationAssignments: builder.query<Record<string, unknown>, ListQuery>({
      query: (query) => ({
        url: `${API_ENDPOINTS.payroll}/assignments`,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['PayrollCompensation'],
    }),
    createSalaryComponent: builder.mutation<Record<string, unknown>, Record<string, unknown>>({
      query: (body) => ({ url: `${API_ENDPOINTS.payroll}/components`, method: 'POST', body }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['PayrollCompensation'],
    }),
    assignCompensation: builder.mutation<Record<string, unknown>, Record<string, unknown>>({
      query: (body) => ({ url: `${API_ENDPOINTS.payroll}/assignments`, method: 'POST', body }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['PayrollCompensation'],
    }),
    getPayrollAdjustments: builder.query<Record<string, unknown>, ListQuery>({
      query: (query) => ({
        url: `${API_ENDPOINTS.payroll}/adjustments`,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['PayrollAdjustments'],
    }),
    createPayrollAdjustment: builder.mutation<Record<string, unknown>, Record<string, unknown>>({
      query: (body) => ({ url: `${API_ENDPOINTS.payroll}/adjustments`, method: 'POST', body }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['PayrollAdjustments'],
    }),
    approvePayrollAdjustment: builder.mutation<Record<string, unknown>, string>({
      query: (id) => ({
        url: `${API_ENDPOINTS.payroll}/adjustments/${id}/approve`,
        method: 'POST',
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['PayrollAdjustments'],
    }),
    getPayslips: builder.query<Record<string, unknown>, ListQuery>({
      query: (query) => ({
        url: `${API_ENDPOINTS.payroll}/payslips`,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['PayrollPayslips'],
    }),
    downloadPayslip: builder.query<Record<string, unknown>, string>({
      query: (id) => ({ url: `${API_ENDPOINTS.payroll}/payslips/${id}/download` }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
    }),
    getPayrollPayments: builder.query<Record<string, unknown>, ListQuery>({
      query: (query) => ({
        url: `${API_ENDPOINTS.payroll}/payments`,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['PayrollPayments'],
    }),
  }),
})

export const {
  useGetPayrollSummaryQuery,
  useGetPayrollPeriodsQuery,
  useCreatePayrollPeriodMutation,
  useGetPayrollRunsQuery,
  useGetPayrollRunQuery,
  useGetPayrollRunReviewQuery,
  useCreatePayrollRunMutation,
  useCalculatePayrollRunMutation,
  useSubmitPayrollRunMutation,
  useApprovePayrollRunMutation,
  usePayPayrollRunMutation,
  useGetSalaryComponentsQuery,
  useGetCompensationAssignmentsQuery,
  useCreateSalaryComponentMutation,
  useAssignCompensationMutation,
  useGetPayrollAdjustmentsQuery,
  useCreatePayrollAdjustmentMutation,
  useApprovePayrollAdjustmentMutation,
  useGetPayslipsQuery,
  useLazyDownloadPayslipQuery,
  useGetPayrollPaymentsQuery,
} = payrollApi
