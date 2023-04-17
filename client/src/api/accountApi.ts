import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { getServerUrl } from '../App';

interface UpdateBody {
  name?: string;
  newPassword?: string;
  currentPassword: string;
}

const baseUrl = `${getServerUrl()}/api/v1/account`;

const accountApi = createApi({
  reducerPath: 'accountApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    updateAccount: builder.mutation({
      query: ({ body, token }: { body: UpdateBody; token: string }) => ({
        url: '',
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      }),
    }),
  }),
});

export const { useUpdateAccountMutation } = accountApi;
export default accountApi;
