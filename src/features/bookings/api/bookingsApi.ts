import { API_ENDPOINTS } from '@/config/constants'
import {
  availabilityResultSchema,
  bookingHistorySchema,
  bookingSchema,
  calendarResultSchema,
  type AvailableVehicle,
  type Booking,
  type BookingHistoryEvent,
  type BookingListQuery,
  type BookingWriteBody,
  type CalendarResult,
} from '@/features/bookings/schemas/booking.schema'
import { baseApi } from '@/lib/api/baseApi'
import { parsePage, parseResource } from '@/lib/api/envelope'
import { buildListParams } from '@/lib/api/params'
import type { Paginated } from '@/types/pagination'
import { z } from 'zod'

const LOAD_ERROR = 'bookings.loadError'

function bookingUrl(id: string, path = ''): string {
  return `${API_ENDPOINTS.bookings}/${encodeURIComponent(id)}${path}`
}

const listTag = { type: 'Bookings' as const, id: 'LIST' }
const calendarTag = { type: 'Bookings' as const, id: 'CALENDAR' }
const detailTag = (id: string) => ({ type: 'Booking' as const, id })

export const bookingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBookings: builder.query<Paginated<Booking>, BookingListQuery>({
      query: (query) => ({ url: API_ENDPOINTS.bookings, params: buildListParams(query) }),
      transformResponse: (response: unknown) => parsePage(bookingSchema, response, LOAD_ERROR),
      providesTags: (result) =>
        result
          ? [...result.items.map((item) => detailTag(item.id)), listTag]
          : [listTag],
    }),
    getBookingCalendar: builder.query<
      CalendarResult,
      {
        from: string
        to: string
        branchId?: string
        status?: string
        vehicleId?: string
        customerId?: string
        category?: string
        source?: string
        organizationId?: string
      }
    >({
      query: (params) => ({ url: `${API_ENDPOINTS.bookings}/calendar`, params }),
      transformResponse: (response: unknown) =>
        parseResource(calendarResultSchema, response, LOAD_ERROR),
      providesTags: [calendarTag],
    }),
    getBookingAvailability: builder.query<
      { items: AvailableVehicle[]; startsAt: string; endsAt: string },
      {
        startsAt: string
        endsAt: string
        branchId?: string
        category?: string
        ownershipType?: string
        organizationId?: string
      }
    >({
      query: (params) => ({ url: `${API_ENDPOINTS.bookings}/availability`, params }),
      transformResponse: (response: unknown) =>
        parseResource(availabilityResultSchema, response, LOAD_ERROR),
    }),
    getBooking: builder.query<Booking, string>({
      query: (id) => bookingUrl(id),
      transformResponse: (response: unknown) => parseResource(bookingSchema, response, LOAD_ERROR),
      providesTags: (_result, _error, id) => [detailTag(id)],
    }),
    getBookingHistory: builder.query<BookingHistoryEvent[], string>({
      query: (id) => bookingUrl(id, '/history'),
      transformResponse: (response: unknown) =>
        parseResource(z.array(bookingHistorySchema), response, LOAD_ERROR),
      providesTags: (_result, _error, id) => [{ type: 'Booking', id: `${id}:history` }],
    }),
    createBooking: builder.mutation<Booking, BookingWriteBody>({
      query: (body) => ({ url: API_ENDPOINTS.bookings, method: 'POST', body }),
      transformResponse: (response: unknown) => parseResource(bookingSchema, response, LOAD_ERROR),
      invalidatesTags: [listTag, calendarTag],
    }),
    updateBooking: builder.mutation<Booking, { id: string; body: Partial<BookingWriteBody> }>({
      query: ({ id, body }) => ({ url: bookingUrl(id), method: 'PATCH', body }),
      transformResponse: (response: unknown) => parseResource(bookingSchema, response, LOAD_ERROR),
      invalidatesTags: (_result, _error, { id }) => [detailTag(id), listTag, calendarTag],
    }),
    holdBooking: builder.mutation<Booking, { id: string; holdMinutes?: number }>({
      query: ({ id, holdMinutes }) => ({
        url: bookingUrl(id, '/hold'),
        method: 'POST',
        body: { holdMinutes },
      }),
      transformResponse: (response: unknown) => parseResource(bookingSchema, response, LOAD_ERROR),
      invalidatesTags: (_result, _error, { id }) => [
        detailTag(id),
        { type: 'Booking', id: `${id}:history` },
        listTag,
        calendarTag,
      ],
    }),
    confirmBooking: builder.mutation<Booking, string>({
      query: (id) => ({ url: bookingUrl(id, '/confirm'), method: 'POST' }),
      transformResponse: (response: unknown) => parseResource(bookingSchema, response, LOAD_ERROR),
      invalidatesTags: (_result, _error, id) => [
        detailTag(id),
        { type: 'Booking', id: `${id}:history` },
        listTag,
        calendarTag,
      ],
    }),
    cancelBooking: builder.mutation<Booking, { id: string; reason: string }>({
      query: ({ id, reason }) => ({ url: bookingUrl(id, '/cancel'), method: 'POST', body: { reason } }),
      transformResponse: (response: unknown) => parseResource(bookingSchema, response, LOAD_ERROR),
      invalidatesTags: (_result, _error, { id }) => [
        detailTag(id),
        { type: 'Booking', id: `${id}:history` },
        listTag,
        calendarTag,
      ],
    }),
    releaseBooking: builder.mutation<Booking, string>({
      query: (id) => ({ url: bookingUrl(id, '/release'), method: 'POST' }),
      transformResponse: (response: unknown) => parseResource(bookingSchema, response, LOAD_ERROR),
      invalidatesTags: (_result, _error, id) => [
        detailTag(id),
        { type: 'Booking', id: `${id}:history` },
        listTag,
        calendarTag,
      ],
    }),
    convertBooking: builder.mutation<Booking, string>({
      query: (id) => ({ url: bookingUrl(id, '/convert'), method: 'POST' }),
      transformResponse: (response: unknown) => parseResource(bookingSchema, response, LOAD_ERROR),
      invalidatesTags: (_result, _error, id) => [
        detailTag(id),
        { type: 'Booking', id: `${id}:history` },
        listTag,
        calendarTag,
        { type: 'Contracts', id: 'LIST' },
      ],
    }),
    expireHolds: builder.mutation<{ expired: number }, void>({
      query: () => ({ url: `${API_ENDPOINTS.bookings}/holds/expire`, method: 'POST' }),
      transformResponse: (response: unknown) =>
        parseResource(z.object({ expired: z.number() }), response, LOAD_ERROR),
      invalidatesTags: [listTag, calendarTag],
    }),
  }),
})

export const {
  useGetBookingsQuery,
  useGetBookingCalendarQuery,
  useGetBookingAvailabilityQuery,
  useGetBookingQuery,
  useGetBookingHistoryQuery,
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useHoldBookingMutation,
  useConfirmBookingMutation,
  useCancelBookingMutation,
  useReleaseBookingMutation,
  useConvertBookingMutation,
  useExpireHoldsMutation,
} = bookingsApi
