import { API_ENDPOINTS } from '@/config/constants'
import {
  dashboardOverviewSchema,
  type DashboardOverview,
  type ReportFilters,
} from '@/features/reports/schemas/reports.schema'
import { baseApi } from '@/lib/api/baseApi'
import { parseResource, unwrapEnvelope } from '@/lib/api/envelope'
import { buildListParams } from '@/lib/api/params'

function reportParams(query?: ReportFilters) {
  return buildListParams({
    page: query?.page,
    pageSize: query?.pageSize,
    search: query?.search,
    sort: query?.sort,
    order: query?.order,
    status: query?.status,
    branchId: query?.branchId,
    legalEntityId: query?.legalEntityId,
    organizationId: query?.organizationId,
    preset: query?.preset,
    from: query?.from,
    to: query?.to,
    customerId: query?.customerId,
    vehicleId: query?.vehicleId,
    category: query?.category,
    method: query?.method,
    kind: query?.kind,
    upcomingWindow: query?.upcomingWindow,
    groupBy: query?.groupBy,
    dimension: query?.dimension,
    taxPeriodId: query?.taxPeriodId,
  } as never)
}

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardOverview: builder.query<DashboardOverview, ReportFilters | void>({
      query: (query) => ({
        url: `${API_ENDPOINTS.reporting}/dashboard`,
        params: reportParams(query ?? undefined),
      }),
      transformResponse: (response: unknown) =>
        parseResource(dashboardOverviewSchema, response, 'reports.loadError'),
      providesTags: ['Dashboard'],
    }),
    getReportsOverview: builder.query<Record<string, unknown>, ReportFilters | void>({
      query: (query) => ({
        url: `${API_ENDPOINTS.reporting}/reports/overview`,
        params: reportParams(query ?? undefined),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['Reports'],
    }),
    getBookingReport: builder.query<Record<string, unknown>, ReportFilters>({
      query: (query) => ({
        url: `${API_ENDPOINTS.reporting}/reports/bookings`,
        params: reportParams(query),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['Reports'],
    }),
    getVehicleReport: builder.query<Record<string, unknown>, ReportFilters>({
      query: (query) => ({
        url: `${API_ENDPOINTS.reporting}/reports/vehicles`,
        params: reportParams(query),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['Reports'],
    }),
    getFleetUtilizationReport: builder.query<Record<string, unknown>, ReportFilters>({
      query: (query) => ({
        url: `${API_ENDPOINTS.reporting}/reports/fleet-utilization`,
        params: reportParams(query),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['Reports'],
    }),
    getCustomerReport: builder.query<Record<string, unknown>, ReportFilters>({
      query: (query) => ({
        url: `${API_ENDPOINTS.reporting}/reports/customers`,
        params: reportParams(query),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['Reports'],
    }),
    getContractReport: builder.query<Record<string, unknown>, ReportFilters>({
      query: (query) => ({
        url: `${API_ENDPOINTS.reporting}/reports/contracts`,
        params: reportParams(query),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['Reports'],
    }),
    getPaymentReport: builder.query<Record<string, unknown>, ReportFilters>({
      query: (query) => ({
        url: `${API_ENDPOINTS.reporting}/reports/payments`,
        params: reportParams(query),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['Reports'],
    }),
    getReceivablesReport: builder.query<Record<string, unknown>, ReportFilters | void>({
      query: (query) => ({
        url: `${API_ENDPOINTS.reporting}/reports/receivables`,
        params: reportParams(query ?? undefined),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['Reports'],
    }),
    getExpenseReport: builder.query<Record<string, unknown>, ReportFilters>({
      query: (query) => ({
        url: `${API_ENDPOINTS.reporting}/reports/expenses`,
        params: reportParams(query),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['Reports'],
    }),
    getMaintenanceReport: builder.query<Record<string, unknown>, ReportFilters>({
      query: (query) => ({
        url: `${API_ENDPOINTS.reporting}/reports/maintenance`,
        params: reportParams(query),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['Reports'],
    }),
    getFinesReport: builder.query<Record<string, unknown>, ReportFilters>({
      query: (query) => ({
        url: `${API_ENDPOINTS.reporting}/reports/fines`,
        params: reportParams(query),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['Reports'],
    }),
    getRefundsReport: builder.query<Record<string, unknown>, ReportFilters>({
      query: (query) => ({
        url: `${API_ENDPOINTS.reporting}/reports/refunds`,
        params: reportParams(query),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['Reports'],
    }),
    getEInvoiceReport: builder.query<Record<string, unknown>, ReportFilters | void>({
      query: (query) => ({
        url: `${API_ENDPOINTS.reporting}/reports/e-invoices`,
        params: reportParams(query ?? undefined),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['Reports'],
    }),
    getProfitabilityReport: builder.query<Record<string, unknown>, ReportFilters | void>({
      query: (query) => ({
        url: `${API_ENDPOINTS.reporting}/reports/profitability`,
        params: reportParams(query ?? undefined),
      }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['Reports'],
    }),
  }),
})

export const {
  useGetDashboardOverviewQuery,
  useGetReportsOverviewQuery,
  useGetBookingReportQuery,
  useGetVehicleReportQuery,
  useGetFleetUtilizationReportQuery,
  useGetCustomerReportQuery,
  useGetContractReportQuery,
  useGetPaymentReportQuery,
  useGetReceivablesReportQuery,
  useGetExpenseReportQuery,
  useGetMaintenanceReportQuery,
  useGetFinesReportQuery,
  useGetRefundsReportQuery,
  useGetEInvoiceReportQuery,
  useGetProfitabilityReportQuery,
} = reportsApi
