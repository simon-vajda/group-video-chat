import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';
import jwtDecode from 'jwt-decode';

interface UserState {
  id: string;
  name: string;
  email: string;
  token: string;
}

interface JwtPayload {
  id: string;
  name: string;
  email: string;
  iat?: number;
  exp?: number;
}

function getInitialState(): UserState {
  const emptyState = {
    id: '',
    name: '',
    email: '',
    token: '',
  };

  const token = localStorage.getItem('user_token');
  if (token) {
    const data = jwtDecode<JwtPayload>(token);
    if (data.exp && data.exp < Date.now() / 1000) {
      localStorage.removeItem('user_token');
      return emptyState;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      token,
    };
  }

  return emptyState;
}

const initialState = getInitialState();

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state: UserState, { payload: token }: PayloadAction<string>) => {
      const data = jwtDecode<JwtPayload>(token);
      state.id = data.id;
      state.name = data.name;
      state.email = data.email;
      state.token = token;
      localStorage.setItem('user_token', token);
    },
    setUsername: (state: UserState, { payload }: PayloadAction<string>) => {
      state.name = payload;
    },
    logout: (state: UserState) => {
      state.id = '';
      state.name = '';
      state.email = '';
      state.token = '';
      localStorage.removeItem('user_token');
    },
  },
});

export type { JwtPayload };
export const selectUser = (state: RootState) => state.user;
export const { setUser, setUsername, logout } = userSlice.actions;
export default userSlice;
