import { API_ENDPOINTS } from '@/config/constants'
import {
  departmentSchema,
  employeeSchema,
  hrDocumentSchema,
  positionSchema,
  type Department,
  type Employee,
  type HrDocument,
  type Position,
} from '@/features/hr/schemas/hr.schema'
import { baseApi } from '@/lib/api/baseApi'
import { parseResource, unwrapEnvelope } from '@/lib/api/envelope'
import { buildListParams } from '@/lib/api/params'
import { z } from 'zod'

const employeeListSchema = z.object({
  items: z.array(employeeSchema),
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number().optional(),
})

const departmentListSchema = z.object({
  items: z.array(departmentSchema),
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number().optional(),
})

const positionListSchema = z.object({
  items: z.array(positionSchema),
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number().optional(),
})

const documentListSchema = z.object({
  items: z.array(hrDocumentSchema),
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number().optional(),
})

export const hrApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHrSummary: builder.query<Record<string, unknown>, void>({
      query: () => ({ url: `${API_ENDPOINTS.hr}/summary` }),
      transformResponse: (response: unknown) => unwrapEnvelope(response) as Record<string, unknown>,
      providesTags: ['HrSummary'],
    }),
    getEmployees: builder.query<
      z.infer<typeof employeeListSchema>,
      {
        page?: number
        pageSize?: number
        search?: string
        status?: string
        branchId?: string
        departmentId?: string
        positionId?: string
        employmentType?: string
      }
    >({
      query: (query) => ({
        url: `${API_ENDPOINTS.hr}/employees`,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) =>
        parseResource(employeeListSchema, response, 'hr.loadError'),
      providesTags: ['HrEmployees'],
    }),
    getEmployee: builder.query<Employee, string>({
      query: (id) => ({ url: `${API_ENDPOINTS.hr}/employees/${id}` }),
      transformResponse: (response: unknown) =>
        parseResource(employeeSchema, response, 'hr.loadError'),
      providesTags: (_r, _e, id) => [{ type: 'HrEmployee', id }],
    }),
    createEmployee: builder.mutation<
      Employee,
      {
        legalEntityId: string
        branchId: string
        firstName: string
        lastName: string
        workEmail?: string
        employmentType?: string
        departmentId?: string
        positionId?: string
        hireDate?: string
      }
    >({
      query: (body) => ({ url: `${API_ENDPOINTS.hr}/employees`, method: 'POST', body }),
      transformResponse: (response: unknown) =>
        parseResource(employeeSchema, response, 'hr.loadError'),
      invalidatesTags: ['HrEmployees', 'HrSummary'],
    }),
    updateEmployee: builder.mutation<Employee, { id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({
        url: `${API_ENDPOINTS.hr}/employees/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: unknown) =>
        parseResource(employeeSchema, response, 'hr.loadError'),
      invalidatesTags: (_r, _e, arg) => ['HrEmployees', { type: 'HrEmployee', id: arg.id }, 'HrSummary'],
    }),
    changeEmployeeStatus: builder.mutation<
      Employee,
      { id: string; status: string; reason?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `${API_ENDPOINTS.hr}/employees/${id}/status`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) =>
        parseResource(employeeSchema, response, 'hr.loadError'),
      invalidatesTags: (_r, _e, arg) => ['HrEmployees', { type: 'HrEmployee', id: arg.id }, 'HrSummary'],
    }),
    getEmployeeDocuments: builder.query<z.infer<typeof documentListSchema>, { employeeId: string }>({
      query: ({ employeeId }) => ({
        url: `${API_ENDPOINTS.hr}/employees/${employeeId}/documents`,
      }),
      transformResponse: (response: unknown) =>
        parseResource(documentListSchema, response, 'hr.loadError'),
      providesTags: ['HrDocuments'],
    }),
    getDocumentExpiry: builder.query<z.infer<typeof documentListSchema>, { days?: number; page?: number }>({
      query: (query) => ({
        url: `${API_ENDPOINTS.hr}/document-expiry`,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) =>
        parseResource(documentListSchema, response, 'hr.loadError'),
      providesTags: ['HrDocuments'],
    }),
    getDepartments: builder.query<
      z.infer<typeof departmentListSchema>,
      { page?: number; pageSize?: number; search?: string; status?: string }
    >({
      query: (query) => ({
        url: `${API_ENDPOINTS.hr}/departments`,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) =>
        parseResource(departmentListSchema, response, 'hr.loadError'),
      providesTags: ['HrDepartments'],
    }),
    createDepartment: builder.mutation<
      Department,
      { legalEntityId: string; name: string; code: string; description?: string; branchId?: string }
    >({
      query: (body) => ({ url: `${API_ENDPOINTS.hr}/departments`, method: 'POST', body }),
      transformResponse: (response: unknown) =>
        parseResource(departmentSchema, response, 'hr.loadError'),
      invalidatesTags: ['HrDepartments'],
    }),
    updateDepartment: builder.mutation<Department, { id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({
        url: `${API_ENDPOINTS.hr}/departments/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: unknown) =>
        parseResource(departmentSchema, response, 'hr.loadError'),
      invalidatesTags: ['HrDepartments'],
    }),
    getPositions: builder.query<
      z.infer<typeof positionListSchema>,
      { page?: number; pageSize?: number; search?: string; departmentId?: string; status?: string }
    >({
      query: (query) => ({
        url: `${API_ENDPOINTS.hr}/positions`,
        params: buildListParams(query as never),
      }),
      transformResponse: (response: unknown) =>
        parseResource(positionListSchema, response, 'hr.loadError'),
      providesTags: ['HrPositions'],
    }),
    createPosition: builder.mutation<
      Position,
      { legalEntityId: string; name: string; code: string; departmentId?: string; description?: string }
    >({
      query: (body) => ({ url: `${API_ENDPOINTS.hr}/positions`, method: 'POST', body }),
      transformResponse: (response: unknown) =>
        parseResource(positionSchema, response, 'hr.loadError'),
      invalidatesTags: ['HrPositions'],
    }),
    updatePosition: builder.mutation<Position, { id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({
        url: `${API_ENDPOINTS.hr}/positions/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: unknown) =>
        parseResource(positionSchema, response, 'hr.loadError'),
      invalidatesTags: ['HrPositions'],
    }),
  }),
})

export const {
  useGetHrSummaryQuery,
  useGetEmployeesQuery,
  useGetEmployeeQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useChangeEmployeeStatusMutation,
  useGetEmployeeDocumentsQuery,
  useGetDocumentExpiryQuery,
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useGetPositionsQuery,
  useCreatePositionMutation,
  useUpdatePositionMutation,
} = hrApi

export type { HrDocument }
