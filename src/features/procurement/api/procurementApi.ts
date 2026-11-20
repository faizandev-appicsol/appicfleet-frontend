import { API_ENDPOINTS } from '@/config/constants'
import {
  expenseDetailSchema,
  expenseSchema,
  lpoDetailSchema,
  lpoSchema,
  reminderSchema,
  vendorBillDetailSchema,
  vendorBillSchema,
  vendorDetailSchema,
  vendorSchema,
  workOrderDetailSchema,
  workOrderSchema,
  type Expense,
  type ExpenseDetail,
  type ExpenseWriteBody,
  type ListQuery,
  type Lpo,
  type LpoDetail,
  type LpoWriteBody,
  type Reminder,
  type ReminderWriteBody,
  type Vendor,
  type VendorBill,
  type VendorBillDetail,
  type VendorBillWriteBody,
  type VendorDetail,
  type VendorWriteBody,
  type WorkOrder,
  type WorkOrderDetail,
  type WorkOrderWriteBody,
} from '@/features/procurement/schemas/procurement.schema'
import { baseApi } from '@/lib/api/baseApi'
import { parsePage, parseResource } from '@/lib/api/envelope'
import { buildListParams } from '@/lib/api/params'
import type { Paginated } from '@/types/pagination'

const vendorsTag = { type: 'Vendors' as const, id: 'LIST' }
const lposTag = { type: 'Lpos' as const, id: 'LIST' }
const billsTag = { type: 'VendorBills' as const, id: 'LIST' }
const expensesTag = { type: 'Expenses' as const, id: 'LIST' }
const workOrdersTag = { type: 'WorkOrders' as const, id: 'LIST' }
const remindersTag = { type: 'ServiceReminders' as const, id: 'LIST' }

export const procurementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVendors: builder.query<Paginated<Vendor>, ListQuery>({
      query: (query) => ({ url: API_ENDPOINTS.vendors, params: buildListParams(query) }),
      transformResponse: (response: unknown) => parsePage(vendorSchema, response, 'procurement.loadError'),
      providesTags: (result) =>
        result ? [...result.items.map((item) => ({ type: 'Vendor' as const, id: item.id })), vendorsTag] : [vendorsTag],
    }),
    getVendor: builder.query<VendorDetail, string>({
      query: (id) => `${API_ENDPOINTS.vendors}/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) => parseResource(vendorDetailSchema, response, 'procurement.loadError'),
      providesTags: (_r, _e, id) => [{ type: 'Vendor', id }],
    }),
    createVendor: builder.mutation<VendorDetail, VendorWriteBody>({
      query: (body) => ({ url: API_ENDPOINTS.vendors, method: 'POST', body }),
      transformResponse: (response: unknown) => parseResource(vendorDetailSchema, response, 'procurement.loadError'),
      invalidatesTags: [vendorsTag],
    }),
    updateVendor: builder.mutation<VendorDetail, { id: string; body: Partial<VendorWriteBody> & { status?: string } }>({
      query: ({ id, body }) => ({ url: `${API_ENDPOINTS.vendors}/${encodeURIComponent(id)}`, method: 'PATCH', body }),
      transformResponse: (response: unknown) => parseResource(vendorDetailSchema, response, 'procurement.loadError'),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Vendor', id }, vendorsTag],
    }),
    vendorAction: builder.mutation<VendorDetail, { id: string; action: string; body?: unknown }>({
      query: ({ id, action, body }) => ({
        url: `${API_ENDPOINTS.vendors}/${encodeURIComponent(id)}/${action}`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => parseResource(vendorDetailSchema, response, 'procurement.loadError'),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Vendor', id }, vendorsTag],
    }),

    getLpos: builder.query<Paginated<Lpo>, ListQuery>({
      query: (query) => ({ url: API_ENDPOINTS.lpos, params: buildListParams(query) }),
      transformResponse: (response: unknown) => parsePage(lpoSchema, response, 'procurement.loadError'),
      providesTags: (result) =>
        result ? [...result.items.map((item) => ({ type: 'Lpo' as const, id: item.id })), lposTag] : [lposTag],
    }),
    getLpo: builder.query<LpoDetail, string>({
      query: (id) => `${API_ENDPOINTS.lpos}/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) => parseResource(lpoDetailSchema, response, 'procurement.loadError'),
      providesTags: (_r, _e, id) => [{ type: 'Lpo', id }],
    }),
    createLpo: builder.mutation<LpoDetail, LpoWriteBody>({
      query: (body) => ({ url: API_ENDPOINTS.lpos, method: 'POST', body }),
      transformResponse: (response: unknown) => parseResource(lpoDetailSchema, response, 'procurement.loadError'),
      invalidatesTags: [lposTag],
    }),
    updateLpo: builder.mutation<LpoDetail, { id: string; body: Partial<LpoWriteBody> }>({
      query: ({ id, body }) => ({ url: `${API_ENDPOINTS.lpos}/${encodeURIComponent(id)}`, method: 'PATCH', body }),
      transformResponse: (response: unknown) => parseResource(lpoDetailSchema, response, 'procurement.loadError'),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Lpo', id }, lposTag],
    }),
    lpoAction: builder.mutation<LpoDetail, { id: string; action: string; body?: unknown }>({
      query: ({ id, action, body }) => ({
        url: `${API_ENDPOINTS.lpos}/${encodeURIComponent(id)}/${action}`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => parseResource(lpoDetailSchema, response, 'procurement.loadError'),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Lpo', id }, lposTag],
    }),

    getVendorBills: builder.query<Paginated<VendorBill>, ListQuery>({
      query: (query) => ({ url: API_ENDPOINTS.vendorBills, params: buildListParams(query) }),
      transformResponse: (response: unknown) => parsePage(vendorBillSchema, response, 'procurement.loadError'),
      providesTags: (result) =>
        result
          ? [...result.items.map((item) => ({ type: 'VendorBill' as const, id: item.id })), billsTag]
          : [billsTag],
    }),
    getVendorBill: builder.query<VendorBillDetail, string>({
      query: (id) => `${API_ENDPOINTS.vendorBills}/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) => parseResource(vendorBillDetailSchema, response, 'procurement.loadError'),
      providesTags: (_r, _e, id) => [{ type: 'VendorBill', id }],
    }),
    createVendorBill: builder.mutation<VendorBillDetail, VendorBillWriteBody>({
      query: (body) => ({ url: API_ENDPOINTS.vendorBills, method: 'POST', body }),
      transformResponse: (response: unknown) => parseResource(vendorBillDetailSchema, response, 'procurement.loadError'),
      invalidatesTags: [billsTag],
    }),
    vendorBillAction: builder.mutation<VendorBillDetail, { id: string; action: string; body?: unknown }>({
      query: ({ id, action, body }) => ({
        url: `${API_ENDPOINTS.vendorBills}/${encodeURIComponent(id)}/${action}`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => parseResource(vendorBillDetailSchema, response, 'procurement.loadError'),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'VendorBill', id }, billsTag],
    }),

    getExpenseCategories: builder.query<Array<{ id: string; code: string; name: string }>, void>({
      query: () => `${API_ENDPOINTS.expenses}/categories`,
      transformResponse: (response: unknown) => {
        const envelope = response as { data?: Array<{ id: string; code: string; name: string }> }
        return envelope.data ?? []
      },
    }),
    getExpenses: builder.query<Paginated<Expense>, ListQuery>({
      query: (query) => ({ url: API_ENDPOINTS.expenses, params: buildListParams(query) }),
      transformResponse: (response: unknown) => parsePage(expenseSchema, response, 'procurement.loadError'),
      providesTags: (result) =>
        result
          ? [...result.items.map((item) => ({ type: 'Expense' as const, id: item.id })), expensesTag]
          : [expensesTag],
    }),
    getExpense: builder.query<ExpenseDetail, string>({
      query: (id) => `${API_ENDPOINTS.expenses}/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) => parseResource(expenseDetailSchema, response, 'procurement.loadError'),
      providesTags: (_r, _e, id) => [{ type: 'Expense', id }],
    }),
    createExpense: builder.mutation<ExpenseDetail, ExpenseWriteBody>({
      query: (body) => ({ url: API_ENDPOINTS.expenses, method: 'POST', body }),
      transformResponse: (response: unknown) => parseResource(expenseDetailSchema, response, 'procurement.loadError'),
      invalidatesTags: [expensesTag],
    }),
    updateExpense: builder.mutation<ExpenseDetail, { id: string; body: Partial<ExpenseWriteBody> }>({
      query: ({ id, body }) => ({ url: `${API_ENDPOINTS.expenses}/${encodeURIComponent(id)}`, method: 'PATCH', body }),
      transformResponse: (response: unknown) => parseResource(expenseDetailSchema, response, 'procurement.loadError'),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Expense', id }, expensesTag],
    }),
    expenseAction: builder.mutation<ExpenseDetail, { id: string; action: string; body?: unknown }>({
      query: ({ id, action, body }) => ({
        url: `${API_ENDPOINTS.expenses}/${encodeURIComponent(id)}/${action}`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => parseResource(expenseDetailSchema, response, 'procurement.loadError'),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Expense', id }, expensesTag],
    }),

    getWorkOrders: builder.query<Paginated<WorkOrder>, ListQuery>({
      query: (query) => ({ url: API_ENDPOINTS.workOrders, params: buildListParams(query) }),
      transformResponse: (response: unknown) => parsePage(workOrderSchema, response, 'procurement.loadError'),
      providesTags: (result) =>
        result
          ? [...result.items.map((item) => ({ type: 'WorkOrder' as const, id: item.id })), workOrdersTag]
          : [workOrdersTag],
    }),
    getWorkOrder: builder.query<WorkOrderDetail, string>({
      query: (id) => `${API_ENDPOINTS.workOrders}/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) => parseResource(workOrderDetailSchema, response, 'procurement.loadError'),
      providesTags: (_r, _e, id) => [{ type: 'WorkOrder', id }],
    }),
    createWorkOrder: builder.mutation<WorkOrderDetail, WorkOrderWriteBody>({
      query: (body) => ({ url: API_ENDPOINTS.workOrders, method: 'POST', body }),
      transformResponse: (response: unknown) => parseResource(workOrderDetailSchema, response, 'procurement.loadError'),
      invalidatesTags: [workOrdersTag],
    }),
    updateWorkOrder: builder.mutation<WorkOrderDetail, { id: string; body: Partial<WorkOrderWriteBody> }>({
      query: ({ id, body }) => ({
        url: `${API_ENDPOINTS.workOrders}/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: unknown) => parseResource(workOrderDetailSchema, response, 'procurement.loadError'),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'WorkOrder', id }, workOrdersTag],
    }),
    workOrderAction: builder.mutation<WorkOrderDetail, { id: string; action: string; body?: unknown }>({
      query: ({ id, action, body }) => ({
        url: `${API_ENDPOINTS.workOrders}/${encodeURIComponent(id)}/${action}`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => parseResource(workOrderDetailSchema, response, 'procurement.loadError'),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'WorkOrder', id }, workOrdersTag],
    }),

    getServiceReminders: builder.query<Paginated<Reminder>, ListQuery>({
      query: (query) => ({ url: API_ENDPOINTS.serviceReminders, params: buildListParams(query) }),
      transformResponse: (response: unknown) => parsePage(reminderSchema, response, 'procurement.loadError'),
      providesTags: (result) =>
        result
          ? [...result.items.map((item) => ({ type: 'ServiceReminder' as const, id: item.id })), remindersTag]
          : [remindersTag],
    }),
    createServiceReminder: builder.mutation<Reminder, ReminderWriteBody>({
      query: (body) => ({ url: API_ENDPOINTS.serviceReminders, method: 'POST', body }),
      transformResponse: (response: unknown) => parseResource(reminderSchema, response, 'procurement.loadError'),
      invalidatesTags: [remindersTag],
    }),
    reminderAction: builder.mutation<Reminder, { id: string; action: string; body?: unknown }>({
      query: ({ id, action, body }) => ({
        url: `${API_ENDPOINTS.serviceReminders}/${encodeURIComponent(id)}/${action}`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => parseResource(reminderSchema, response, 'procurement.loadError'),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'ServiceReminder', id }, remindersTag],
    }),
  }),
})

export const {
  useGetVendorsQuery,
  useGetVendorQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useVendorActionMutation,
  useGetLposQuery,
  useGetLpoQuery,
  useCreateLpoMutation,
  useUpdateLpoMutation,
  useLpoActionMutation,
  useGetVendorBillsQuery,
  useGetVendorBillQuery,
  useCreateVendorBillMutation,
  useVendorBillActionMutation,
  useGetExpenseCategoriesQuery,
  useGetExpensesQuery,
  useGetExpenseQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useExpenseActionMutation,
  useGetWorkOrdersQuery,
  useGetWorkOrderQuery,
  useCreateWorkOrderMutation,
  useUpdateWorkOrderMutation,
  useWorkOrderActionMutation,
  useGetServiceRemindersQuery,
  useCreateServiceReminderMutation,
  useReminderActionMutation,
} = procurementApi
