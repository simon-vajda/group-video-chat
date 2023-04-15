import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getServerUrl } from '../App';

interface SignupBody {
  name: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
  keepLoggedIn?: boolean;
}

interface LoginResponse {
  token: string;
}

const baseUrl = `${getServerUrl()}/api/v1/auth`;

const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (body: SignupBody) => ({
        url: 'signup',
        method: 'POST',
        body,
      }),
    }),
    login: builder.mutation<LoginResponse, LoginBody>({
      query: (body) => ({
        url: 'login',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useSignupMutation, useLoginMutation } = authApi;
export default authApi;
