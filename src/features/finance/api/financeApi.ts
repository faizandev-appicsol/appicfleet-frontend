import { API_ENDPOINTS } from '@/config/constants'
import {
  depositDetailSchema,
  depositSchema,
  invoiceDetailSchema,
  invoiceSchema,
  noteDetailSchema,
  noteSchema,
  paymentDetailSchema,
  paymentSchema,
  receiptSchema,
  type Deposit,
  type DepositDetail,
  type DepositListQuery,
  type Invoice,
  type InvoiceDetail,
  type InvoiceListQuery,
  type InvoiceWriteBody,
  type CreditNote,
  type NoteDetail,
  type Payment,
  type PaymentDetail,
  type PaymentListQuery,
  type PaymentWriteBody,
  type Receipt,
} from '@/features/finance/schemas/finance.schema'
import { baseApi } from '@/lib/api/baseApi'
import { parsePage, parseResource } from '@/lib/api/envelope'
import { buildListParams } from '@/lib/api/params'
import type { Paginated } from '@/types/pagination'

const invoiceTag = { type: 'Invoices' as const, id: 'LIST' }
const paymentTag = { type: 'Payments' as const, id: 'LIST' }
const receiptTag = { type: 'Receipts' as const, id: 'LIST' }
const creditTag = { type: 'CreditNotes' as const, id: 'LIST' }
const debitTag = { type: 'DebitNotes' as const, id: 'LIST' }
const depositTag = { type: 'Deposits' as const, id: 'LIST' }

export const financeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInvoices: builder.query<Paginated<Invoice>, InvoiceListQuery>({
      query: (query) => ({ url: API_ENDPOINTS.invoices, params: buildListParams(query) }),
      transformResponse: (response: unknown) => parsePage(invoiceSchema, response, 'finance.loadError'),
      providesTags: (result) =>
        result ? [...result.items.map((item) => ({ type: 'Invoice' as const, id: item.id })), invoiceTag] : [invoiceTag],
    }),
    getInvoice: builder.query<InvoiceDetail, string>({
      query: (id) => `${API_ENDPOINTS.invoices}/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) => parseResource(invoiceDetailSchema, response, 'finance.loadError'),
      providesTags: (_r, _e, id) => [{ type: 'Invoice', id }],
    }),
    createInvoice: builder.mutation<InvoiceDetail, InvoiceWriteBody>({
      query: (body) => ({ url: API_ENDPOINTS.invoices, method: 'POST', body }),
      transformResponse: (response: unknown) => parseResource(invoiceDetailSchema, response, 'finance.loadError'),
      invalidatesTags: [invoiceTag],
    }),
    updateInvoice: builder.mutation<InvoiceDetail, { id: string; body: Partial<InvoiceWriteBody> }>({
      query: ({ id, body }) => ({ url: `${API_ENDPOINTS.invoices}/${encodeURIComponent(id)}`, method: 'PATCH', body }),
      transformResponse: (response: unknown) => parseResource(invoiceDetailSchema, response, 'finance.loadError'),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Invoice', id }, invoiceTag],
    }),
    invoiceAction: builder.mutation<InvoiceDetail, { id: string; action: string; body?: unknown }>({
      query: ({ id, action, body }) => ({
        url: `${API_ENDPOINTS.invoices}/${encodeURIComponent(id)}/${action}`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => parseResource(invoiceDetailSchema, response, 'finance.loadError'),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Invoice', id }, invoiceTag],
    }),
    getPayments: builder.query<Paginated<Payment>, PaymentListQuery>({
      query: (query) => ({ url: API_ENDPOINTS.payments, params: buildListParams(query) }),
      transformResponse: (response: unknown) => parsePage(paymentSchema, response, 'finance.loadError'),
      providesTags: (result) =>
        result ? [...result.items.map((item) => ({ type: 'Payment' as const, id: item.id })), paymentTag] : [paymentTag],
    }),
    getPayment: builder.query<PaymentDetail, string>({
      query: (id) => `${API_ENDPOINTS.payments}/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) => parseResource(paymentDetailSchema, response, 'finance.loadError'),
      providesTags: (_r, _e, id) => [{ type: 'Payment', id }],
    }),
    createPayment: builder.mutation<PaymentDetail, PaymentWriteBody>({
      query: (body) => ({ url: API_ENDPOINTS.payments, method: 'POST', body }),
      transformResponse: (response: unknown) => parseResource(paymentDetailSchema, response, 'finance.loadError'),
      invalidatesTags: [paymentTag, invoiceTag, receiptTag],
    }),
    paymentAction: builder.mutation<PaymentDetail, { id: string; action: string; body?: unknown }>({
      query: ({ id, action, body }) => ({
        url: `${API_ENDPOINTS.payments}/${encodeURIComponent(id)}/${action}`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => parseResource(paymentDetailSchema, response, 'finance.loadError'),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Payment', id }, paymentTag, invoiceTag, receiptTag],
    }),
    getReceipts: builder.query<Paginated<Receipt>, { page?: number; pageSize?: number; search?: string; status?: string }>({
      query: (query) => ({ url: API_ENDPOINTS.receipts, params: buildListParams(query) }),
      transformResponse: (response: unknown) => parsePage(receiptSchema, response, 'finance.loadError'),
      providesTags: (result) =>
        result ? [...result.items.map((item) => ({ type: 'Receipt' as const, id: item.id })), receiptTag] : [receiptTag],
    }),
    getReceipt: builder.query<Receipt, string>({
      query: (id) => `${API_ENDPOINTS.receipts}/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) => parseResource(receiptSchema, response, 'finance.loadError'),
      providesTags: (_r, _e, id) => [{ type: 'Receipt', id }],
    }),
    getCreditNotes: builder.query<Paginated<CreditNote>, { page?: number; pageSize?: number; search?: string; status?: string }>({
      query: (query) => ({ url: API_ENDPOINTS.creditNotes, params: buildListParams(query) }),
      transformResponse: (response: unknown) => parsePage(noteSchema, response, 'finance.loadError'),
      providesTags: (result) =>
        result
          ? [...result.items.map((item) => ({ type: 'CreditNote' as const, id: item.id })), creditTag]
          : [creditTag],
    }),
    getCreditNote: builder.query<NoteDetail, string>({
      query: (id) => `${API_ENDPOINTS.creditNotes}/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) => parseResource(noteDetailSchema, response, 'finance.loadError'),
      providesTags: (_r, _e, id) => [{ type: 'CreditNote', id }],
    }),
    createCreditNote: builder.mutation<NoteDetail, unknown>({
      query: (body) => ({ url: API_ENDPOINTS.creditNotes, method: 'POST', body }),
      transformResponse: (response: unknown) => parseResource(noteDetailSchema, response, 'finance.loadError'),
      invalidatesTags: [creditTag, invoiceTag],
    }),
    creditNoteAction: builder.mutation<NoteDetail, { id: string; action: string; body?: unknown }>({
      query: ({ id, action, body }) => ({
        url: `${API_ENDPOINTS.creditNotes}/${encodeURIComponent(id)}/${action}`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => parseResource(noteDetailSchema, response, 'finance.loadError'),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'CreditNote', id }, creditTag, invoiceTag],
    }),
    getDebitNotes: builder.query<Paginated<CreditNote>, { page?: number; pageSize?: number; search?: string; status?: string }>({
      query: (query) => ({ url: API_ENDPOINTS.debitNotes, params: buildListParams(query) }),
      transformResponse: (response: unknown) => parsePage(noteSchema, response, 'finance.loadError'),
      providesTags: (result) =>
        result ? [...result.items.map((item) => ({ type: 'DebitNote' as const, id: item.id })), debitTag] : [debitTag],
    }),
    getDebitNote: builder.query<NoteDetail, string>({
      query: (id) => `${API_ENDPOINTS.debitNotes}/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) => parseResource(noteDetailSchema, response, 'finance.loadError'),
      providesTags: (_r, _e, id) => [{ type: 'DebitNote', id }],
    }),
    createDebitNote: builder.mutation<NoteDetail, unknown>({
      query: (body) => ({ url: API_ENDPOINTS.debitNotes, method: 'POST', body }),
      transformResponse: (response: unknown) => parseResource(noteDetailSchema, response, 'finance.loadError'),
      invalidatesTags: [debitTag],
    }),
    debitNoteAction: builder.mutation<NoteDetail, { id: string; action: string; body?: unknown }>({
      query: ({ id, action, body }) => ({
        url: `${API_ENDPOINTS.debitNotes}/${encodeURIComponent(id)}/${action}`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => parseResource(noteDetailSchema, response, 'finance.loadError'),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'DebitNote', id }, debitTag],
    }),
    getDeposits: builder.query<Paginated<Deposit>, DepositListQuery>({
      query: (query) => ({ url: API_ENDPOINTS.deposits, params: buildListParams(query) }),
      transformResponse: (response: unknown) => parsePage(depositSchema, response, 'finance.loadError'),
      providesTags: (result) =>
        result ? [...result.items.map((item) => ({ type: 'Deposit' as const, id: item.id })), depositTag] : [depositTag],
    }),
    getDeposit: builder.query<DepositDetail, string>({
      query: (id) => `${API_ENDPOINTS.deposits}/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) => parseResource(depositDetailSchema, response, 'finance.loadError'),
      providesTags: (_r, _e, id) => [{ type: 'Deposit', id }],
    }),
    createDeposit: builder.mutation<DepositDetail, unknown>({
      query: (body) => ({ url: API_ENDPOINTS.deposits, method: 'POST', body }),
      transformResponse: (response: unknown) => parseResource(depositDetailSchema, response, 'finance.loadError'),
      invalidatesTags: [depositTag],
    }),
    depositAction: builder.mutation<DepositDetail, { id: string; action: string; body?: unknown }>({
      query: ({ id, action, body }) => ({
        url: `${API_ENDPOINTS.deposits}/${encodeURIComponent(id)}/${action}`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => parseResource(depositDetailSchema, response, 'finance.loadError'),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Deposit', id }, depositTag],
    }),
  }),
})

export const {
  useGetInvoicesQuery,
  useGetInvoiceQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useInvoiceActionMutation,
  useGetPaymentsQuery,
  useGetPaymentQuery,
  useCreatePaymentMutation,
  usePaymentActionMutation,
  useGetReceiptsQuery,
  useGetReceiptQuery,
  useGetCreditNotesQuery,
  useGetCreditNoteQuery,
  useCreateCreditNoteMutation,
  useCreditNoteActionMutation,
  useGetDebitNotesQuery,
  useGetDebitNoteQuery,
  useCreateDebitNoteMutation,
  useDebitNoteActionMutation,
  useGetDepositsQuery,
  useGetDepositQuery,
  useCreateDepositMutation,
  useDepositActionMutation,
} = financeApi
