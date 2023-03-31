import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getServerUrl } from '../App';

const baseUrl = `${getServerUrl()}/api/v1/`;

export const roomApi = createApi({
  reducerPath: 'roomApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    checkRoom: builder.query<boolean, string>({
      query: (roomId) => `room/${roomId}`,
      transformResponse: (response: { exists: boolean }) => response.exists,
    }),
    createRoom: builder.query<string, void>({
      query: () => `room/create`,
      transformResponse: (response: { roomId: string }) => response.roomId,
    }),
  }),
});

export const {
  useCheckRoomQuery,
  useLazyCheckRoomQuery,
  useLazyCreateRoomQuery,
} = roomApi;
