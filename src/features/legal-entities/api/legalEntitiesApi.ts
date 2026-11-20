import { API_ENDPOINTS } from '@/config/constants'
import {
  legalEntityResponseSchema,
  type LegalEntity,
  type LegalEntityCreateBody,
  type LegalEntityListQuery,
  type LegalEntityUpdateBody,
} from '@/features/legal-entities/schemas/legalEntity.schema'
import { baseApi } from '@/lib/api/baseApi'
import { parsePage, parseResource } from '@/lib/api/envelope'
import { buildListParams } from '@/lib/api/params'
import type { Paginated } from '@/types/pagination'

const LOAD_ERROR = 'legalEntities.loadError'

export const legalEntitiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLegalEntities: builder.query<Paginated<LegalEntity>, LegalEntityListQuery>({
      query: (query) => ({
        url: API_ENDPOINTS.legalEntities,
        params: buildListParams(query),
      }),
      transformResponse: (response: unknown) =>
        parsePage(legalEntityResponseSchema, response, LOAD_ERROR),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({ type: 'LegalEntity' as const, id: item.id })),
              { type: 'LegalEntities' as const, id: 'LIST' },
            ]
          : [{ type: 'LegalEntities' as const, id: 'LIST' }],
    }),
    getLegalEntity: builder.query<LegalEntity, string>({
      query: (id) => `${API_ENDPOINTS.legalEntities}/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) =>
        parseResource(legalEntityResponseSchema, response, LOAD_ERROR),
      providesTags: (_result, _error, id) => [{ type: 'LegalEntity', id }],
    }),
    createLegalEntity: builder.mutation<LegalEntity, LegalEntityCreateBody>({
      query: (body) => ({
        url: API_ENDPOINTS.legalEntities,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) =>
        parseResource(legalEntityResponseSchema, response, LOAD_ERROR),
      invalidatesTags: (_result, error) => (error ? [] : [{ type: 'LegalEntities', id: 'LIST' }]),
    }),
    updateLegalEntity: builder.mutation<LegalEntity, { id: string; body: LegalEntityUpdateBody }>({
      query: ({ id, body }) => ({
        url: `${API_ENDPOINTS.legalEntities}/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: unknown) =>
        parseResource(legalEntityResponseSchema, response, LOAD_ERROR),
      invalidatesTags: (_result, error, argument) =>
        error
          ? []
          : [
              { type: 'LegalEntity', id: argument.id },
              { type: 'LegalEntities', id: 'LIST' },
            ],
    }),
  }),
})

export const {
  useGetLegalEntitiesQuery,
  useGetLegalEntityQuery,
  useCreateLegalEntityMutation,
  useUpdateLegalEntityMutation,
} = legalEntitiesApi
