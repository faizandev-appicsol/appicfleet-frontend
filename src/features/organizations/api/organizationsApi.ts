import { API_ENDPOINTS } from '@/config/constants'
import {
  organizationResponseSchema,
  type Organization,
  type OrganizationFormValues,
  type OrganizationListQuery,
  type OrganizationUpdateBody,
} from '@/features/organizations/schemas/organization.schema'
import { baseApi } from '@/lib/api/baseApi'
import { parsePage, parseResource } from '@/lib/api/envelope'
import { buildListParams } from '@/lib/api/params'
import type { Paginated } from '@/types/pagination'

const LOAD_ERROR = 'organizations.loadError'

export const organizationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizations: builder.query<Paginated<Organization>, OrganizationListQuery>({
      query: (query) => ({
        url: API_ENDPOINTS.organizations,
        params: buildListParams(query),
      }),
      transformResponse: (response: unknown) =>
        parsePage(organizationResponseSchema, response, LOAD_ERROR),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({ type: 'Organization' as const, id: item.id })),
              { type: 'Organizations' as const, id: 'LIST' },
            ]
          : [{ type: 'Organizations' as const, id: 'LIST' }],
    }),
    getOrganization: builder.query<Organization, string>({
      query: (id) => `${API_ENDPOINTS.organizations}/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) =>
        parseResource(organizationResponseSchema, response, LOAD_ERROR),
      providesTags: (_result, _error, id) => [{ type: 'Organization', id }],
    }),
    createOrganization: builder.mutation<Organization, OrganizationFormValues>({
      query: (body) => ({
        url: API_ENDPOINTS.organizations,
        method: 'POST',
        body: { name: body.name.trim(), code: body.code.trim(), status: body.status },
      }),
      transformResponse: (response: unknown) =>
        parseResource(organizationResponseSchema, response, LOAD_ERROR),
      invalidatesTags: (_result, error) => (error ? [] : [{ type: 'Organizations', id: 'LIST' }]),
    }),
    updateOrganization: builder.mutation<
      Organization,
      { id: string; body: OrganizationUpdateBody }
    >({
      query: ({ id, body }) => ({
        url: `${API_ENDPOINTS.organizations}/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: unknown) =>
        parseResource(organizationResponseSchema, response, LOAD_ERROR),
      invalidatesTags: (_result, error, argument) =>
        error
          ? []
          : [
              { type: 'Organization', id: argument.id },
              { type: 'Organizations', id: 'LIST' },
              // The profile embeds the organization name.
              'Auth',
            ],
    }),
  }),
})

export const {
  useGetOrganizationsQuery,
  useGetOrganizationQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
} = organizationsApi
