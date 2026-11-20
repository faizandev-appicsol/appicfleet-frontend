import { API_ENDPOINTS } from '@/config/constants'
import {
  branchResponseSchema,
  type Branch,
  type BranchCreateBody,
  type BranchListQuery,
  type BranchUpdateBody,
} from '@/features/branches/schemas/branch.schema'
import { baseApi } from '@/lib/api/baseApi'
import { parsePage, parseResource } from '@/lib/api/envelope'
import { buildListParams } from '@/lib/api/params'
import type { Paginated } from '@/types/pagination'

const LOAD_ERROR = 'branches.loadError'

export const branchesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBranches: builder.query<Paginated<Branch>, BranchListQuery>({
      query: (query) => ({
        url: API_ENDPOINTS.branches,
        params: buildListParams(query),
      }),
      transformResponse: (response: unknown) => parsePage(branchResponseSchema, response, LOAD_ERROR),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({ type: 'Branch' as const, id: item.id })),
              { type: 'Branches' as const, id: 'LIST' },
            ]
          : [{ type: 'Branches' as const, id: 'LIST' }],
    }),
    getBranch: builder.query<Branch, string>({
      query: (id) => `${API_ENDPOINTS.branches}/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) =>
        parseResource(branchResponseSchema, response, LOAD_ERROR),
      providesTags: (_result, _error, id) => [{ type: 'Branch', id }],
    }),
    createBranch: builder.mutation<Branch, BranchCreateBody>({
      query: (body) => ({
        url: API_ENDPOINTS.branches,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) =>
        parseResource(branchResponseSchema, response, LOAD_ERROR),
      invalidatesTags: (_result, error) => (error ? [] : [{ type: 'Branches', id: 'LIST' }]),
    }),
    updateBranch: builder.mutation<Branch, { id: string; body: BranchUpdateBody }>({
      query: ({ id, body }) => ({
        url: `${API_ENDPOINTS.branches}/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: unknown) =>
        parseResource(branchResponseSchema, response, LOAD_ERROR),
      invalidatesTags: (_result, error, argument) =>
        error
          ? []
          : [
              { type: 'Branch', id: argument.id },
              { type: 'Branches', id: 'LIST' },
              // Profile and user views embed branch names.
              'Auth',
              { type: 'Users', id: 'LIST' },
            ],
    }),
  }),
})

export const {
  useGetBranchesQuery,
  useGetBranchQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
} = branchesApi
