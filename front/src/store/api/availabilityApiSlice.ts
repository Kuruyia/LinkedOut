import { CreateAvailabilityDto } from '@/models/dtos/availability/createAvailabilityDto';
import { UpdateAvailabilityDto } from '@/models/dtos/availability/updateAvailabilityDto';
import { Availability } from '@/models/entities/availability';
import { apiSlice } from '@/store/api/apiSlice';

/**
 * The extended API slice for availabilities.
 */
export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => {
    return {
      getAvailabilities: builder.query<Availability[], void>({
        query: () => 'profile/availabilities',
        providesTags: (result) =>
          result
            ? [
                ...result.map(({ id }) => ({
                  type: 'Availabilities' as const,
                  id,
                })),
                { type: 'Availabilities', id: 'LIST' },
              ]
            : [{ type: 'Availabilities', id: 'LIST' }],
      }),
      getAvailability: builder.query<Availability, string>({
        query: (id) => `profile/availabilities/${id}`,
        providesTags: (_result, _error, id) => [{ type: 'Availabilities', id }],
      }),
      postAvailability: builder.mutation<Availability, CreateAvailabilityDto>({
        query: (body) => ({
          url: 'profile/availabilities',
          method: 'POST',
          body,
        }),
        invalidatesTags: [{ type: 'Availabilities', id: 'LIST' }],
      }),
      patchAvailability: builder.mutation<Availability, UpdateAvailabilityDto>({
        query: (body) => ({
          url: `profile/availabilities/${body.id}`,
          method: 'PATCH',
          body,
        }),
        invalidatesTags: (_result, _error, { id }) => [
          { type: 'Availabilities', id: 'LIST' },
          { type: 'Availabilities', id },
        ],
      }),
      deleteAvailability: builder.mutation<void, string>({
        query: (id) => ({
          url: `profile/availabilities/${id}`,
          method: 'DELETE',
        }),
        invalidatesTags: (_result, _error, id) => [
          { type: 'Availabilities', id: 'LIST' },
          { type: 'Availabilities', id },
        ],
      }),
    };
  },
});

export const {
  useGetAvailabilitiesQuery,
  useGetAvailabilityQuery,
  usePostAvailabilityMutation,
  usePatchAvailabilityMutation,
  useDeleteAvailabilityMutation,
} = extendedApiSlice;
