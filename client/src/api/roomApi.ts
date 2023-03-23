import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const roomApi = createApi({
  reducerPath: 'roomApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:5000/api/v1/' }),
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
