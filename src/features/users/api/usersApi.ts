import { API_ENDPOINTS } from '@/config/constants'
import { USERS_PAGE_SIZE } from '@/features/users/constants'
import {
  userListSchema,
  userResponseSchema,
  type User,
  type UserCreateBody,
  type UserListQuery,
  type UserUpdateValues,
} from '@/features/users/schemas/user.schema'
import { baseApi } from '@/lib/api/baseApi'
import { parseResource } from '@/lib/api/envelope'
import { buildListParams } from '@/lib/api/params'
import type { Paginated } from '@/types/pagination'

const LOAD_ERROR = 'users.loadError'

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<Paginated<User>, UserListQuery>({
      query: (query) => ({
        url: API_ENDPOINTS.users,
        params: buildListParams({ ...query, pageSize: query.pageSize ?? USERS_PAGE_SIZE }),
      }),
      transformResponse: (response: unknown) => parseResource(userListSchema, response, LOAD_ERROR),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((user) => ({ type: 'User' as const, id: user.id })),
              { type: 'Users' as const, id: 'LIST' },
            ]
          : [{ type: 'Users' as const, id: 'LIST' }],
    }),
    getUser: builder.query<User, string>({
      query: (id) => `${API_ENDPOINTS.users}/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) =>
        parseResource(userResponseSchema, response, LOAD_ERROR),
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),
    createUser: builder.mutation<User, UserCreateBody>({
      query: (body) => ({
        url: API_ENDPOINTS.users,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) =>
        parseResource(userResponseSchema, response, LOAD_ERROR),
      invalidatesTags: (_result, error) => (error ? [] : [{ type: 'Users', id: 'LIST' }]),
    }),
    updateUser: builder.mutation<User, { id: string; body: UserUpdateValues }>({
      query: ({ id, body }) => ({
        url: `${API_ENDPOINTS.users}/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: unknown) =>
        parseResource(userResponseSchema, response, LOAD_ERROR),
      invalidatesTags: (_result, error, argument) =>
        error
          ? []
          : [
              { type: 'User', id: argument.id },
              { type: 'Users', id: 'LIST' },
            ],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `${API_ENDPOINTS.users}/${encodeURIComponent(id)}`,
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

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi
