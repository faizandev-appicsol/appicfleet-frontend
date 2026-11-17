import { USERS_PAGE_SIZE } from '@/features/users/constants'
import {
  userListSchema,
  userResponseSchema,
  type User,
  type UserFormValues,
  type UserListQuery,
  type UserUpdateValues,
} from '@/features/users/schemas/user.schema'
import { baseApi } from '@/lib/api/baseApi'
import type { Paginated } from '@/types/pagination'

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<Paginated<User>, UserListQuery>({
      query: (query) => ({
        url: '/users',
        params: toUserQuery(query),
      }),
      transformResponse: (response: unknown) => {
        const parsed = userListSchema.safeParse(response)
        if (!parsed.success) {
          throw new Error('The user directory response did not match the expected shape.')
        }
        return parsed.data
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((user) => ({ type: 'User' as const, id: user.id })),
              { type: 'Users' as const, id: 'LIST' },
            ]
          : [{ type: 'Users' as const, id: 'LIST' }],
    }),
    getUser: builder.query<User, string>({
      query: (id) => `/users/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) => parseUser(response),
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),
    createUser: builder.mutation<User, UserFormValues>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => parseUser(response),
      invalidatesTags: (_result, error) => (error ? [] : [{ type: 'Users', id: 'LIST' }]),
    }),
    updateUser: builder.mutation<User, { id: string; body: UserUpdateValues }>({
      query: ({ id, body }) => ({
        url: `/users/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: unknown) => parseUser(response),
      invalidatesTags: (_result, error, argument) =>
        error ? [] : [{ type: 'User', id: argument.id }],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${encodeURIComponent(id)}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, error, id) =>
        error
          ? []
          : [
              { type: 'User', id },
              { type: 'Users', id: 'LIST' },
            ],
    }),
  }),
})

function parseUser(response: unknown): User {
  const parsed = userResponseSchema.safeParse(response)
  if (!parsed.success) throw new Error('The user response did not match the expected shape.')
  return parsed.data
}

function toUserQuery(query: UserListQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: query.page ?? 1,
    pageSize: query.pageSize ?? USERS_PAGE_SIZE,
  }
  const search = query.search?.trim()
  if (search) params.search = search
  return params
}

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi
