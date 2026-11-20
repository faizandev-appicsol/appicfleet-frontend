import { API_ENDPOINTS } from '@/config/constants'
import { baseApi } from '@/lib/api/baseApi'
import { unwrapEnvelope } from '@/lib/api/envelope'
import { buildListParams } from '@/lib/api/params'

type ListQuery = {
  page?: number
  pageSize?: number
  status?: string
  employeeId?: string
  fromDate?: string
  toDate?: string
  q?: string
}

const base = API_ENDPOINTS.workforce

export const workforceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWorkforceSummary: builder.query<Record<string, unknown>, void>({
      query: () => ({ url: `${base}/summary` }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['WorkforceSummary'],
    }),
    getTodayAttendance: builder.query<Record<string, unknown>, void>({
      query: () => ({ url: `${base}/attendance/today` }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['WorkforceAttendance'],
    }),
    getAttendanceList: builder.query<Record<string, unknown>, ListQuery>({
      query: (query) => ({
        url: `${base}/attendance`,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['WorkforceAttendance'],
    }),
    clockIn: builder.mutation<Record<string, unknown>, Record<string, unknown>>({
      query: (body) => ({ url: `${base}/attendance/clock-in`, method: 'POST', body }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['WorkforceAttendance', 'WorkforceSummary'],
    }),
    clockOut: builder.mutation<Record<string, unknown>, Record<string, unknown>>({
      query: (body) => ({ url: `${base}/attendance/clock-out`, method: 'POST', body }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['WorkforceAttendance', 'WorkforceSummary'],
    }),
    getSchedules: builder.query<Record<string, unknown>, ListQuery>({
      query: (query) => ({
        url: `${base}/schedules`,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['WorkforceSchedules'],
    }),
    createSchedule: builder.mutation<Record<string, unknown>, Record<string, unknown>>({
      query: (body) => ({ url: `${base}/schedules`, method: 'POST', body }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['WorkforceSchedules'],
    }),
    getShifts: builder.query<Record<string, unknown>, ListQuery>({
      query: (query) => ({
        url: `${base}/shifts`,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['WorkforceShifts'],
    }),
    createShift: builder.mutation<Record<string, unknown>, Record<string, unknown>>({
      query: (body) => ({ url: `${base}/shifts`, method: 'POST', body }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['WorkforceShifts'],
    }),
    getLeaveRequests: builder.query<Record<string, unknown>, ListQuery>({
      query: (query) => ({
        url: `${base}/leave/requests`,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['WorkforceLeave'],
    }),
    getLeaveBalances: builder.query<Record<string, unknown>, ListQuery>({
      query: (query) => ({
        url: `${base}/leave/balances`,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['WorkforceLeave'],
    }),
    getLeaveTypes: builder.query<Record<string, unknown>, ListQuery>({
      query: (query) => ({
        url: `${base}/leave/types`,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['WorkforceLeave'],
    }),
    submitLeaveRequest: builder.mutation<Record<string, unknown>, Record<string, unknown>>({
      query: (body) => ({ url: `${base}/leave/requests`, method: 'POST', body }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['WorkforceLeave', 'WorkforceSummary'],
    }),
    approveLeaveRequest: builder.mutation<Record<string, unknown>, string>({
      query: (id) => ({ url: `${base}/leave/requests/${id}/approve`, method: 'POST', body: {} }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['WorkforceLeave', 'WorkforceSummary'],
    }),
    getHolidays: builder.query<Record<string, unknown>, ListQuery>({
      query: (query) => ({
        url: `${base}/holidays`,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['WorkforceHolidays'],
    }),
    createHoliday: builder.mutation<Record<string, unknown>, Record<string, unknown>>({
      query: (body) => ({ url: `${base}/holidays`, method: 'POST', body }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['WorkforceHolidays'],
    }),
    getOvertime: builder.query<Record<string, unknown>, ListQuery>({
      query: (query) => ({
        url: `${base}/overtime`,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['WorkforceOvertime'],
    }),
    createOvertime: builder.mutation<Record<string, unknown>, Record<string, unknown>>({
      query: (body) => ({ url: `${base}/overtime`, method: 'POST', body }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['WorkforceOvertime'],
    }),
    approveOvertime: builder.mutation<Record<string, unknown>, string>({
      query: (id) => ({ url: `${base}/overtime/${id}/approve`, method: 'POST', body: {} }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      invalidatesTags: ['WorkforceOvertime', 'WorkforceSummary'],
    }),
  }),
})

export const {
  useGetWorkforceSummaryQuery,
  useGetTodayAttendanceQuery,
  useGetAttendanceListQuery,
  useClockInMutation,
  useClockOutMutation,
  useGetSchedulesQuery,
  useCreateScheduleMutation,
  useGetShiftsQuery,
  useCreateShiftMutation,
  useGetLeaveRequestsQuery,
  useGetLeaveBalancesQuery,
  useGetLeaveTypesQuery,
  useSubmitLeaveRequestMutation,
  useApproveLeaveRequestMutation,
  useGetHolidaysQuery,
  useCreateHolidayMutation,
  useGetOvertimeQuery,
  useCreateOvertimeMutation,
  useApproveOvertimeMutation,
} = workforceApi
