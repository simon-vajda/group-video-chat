import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getServerUrl } from '../App';

const baseUrl = `${getServerUrl()}/api/v1/room`;

export const roomApi = createApi({
  reducerPath: 'roomApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    checkRoom: builder.query<boolean, string>({
      query: (roomId) => `/${roomId}`,
      transformResponse: (response: { exists: boolean }) => response.exists,
    }),
    createRoom: builder.query<string, string>({
      query: (token) => ({
        url: '/create',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      transformResponse: (response: { roomId: string }) => response.roomId,
    }),
  }),
});

export const {
  useCheckRoomQuery,
  useLazyCheckRoomQuery,
  useLazyCreateRoomQuery,
} = roomApi;
