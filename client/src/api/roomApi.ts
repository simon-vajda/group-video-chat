import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

type RoomResponse = {
  exists: boolean;
};

export const roomApi = createApi({
  reducerPath: 'roomApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:5000/api/v1/' }),
  endpoints: (builder) => ({
    checkRoom: builder.query<boolean, string>({
      query: (roomId) => `room/${roomId}`,
      transformResponse: (response: RoomResponse) => response.exists,
    }),
  }),
});

export const { useCheckRoomQuery, useLazyCheckRoomQuery } = roomApi;
