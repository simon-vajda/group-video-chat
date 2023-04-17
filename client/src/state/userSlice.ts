import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

interface UserState {
  id: string;
  name: string;
  email: string;
  token: string;
}

function getInitialState(): UserState {
  const emptyState = {
    id: '',
    name: '',
    email: '',
    token: '',
  };

  const jsonState = localStorage.getItem('user');
  if (jsonState) {
    try {
      const userState = JSON.parse(jsonState) as UserState;
      return userState;
    } catch (e) {}
  }

  return emptyState;
}

const initialState = getInitialState();

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state: UserState, { payload }: PayloadAction<UserState>) => {
      state.id = payload.id;
      state.name = payload.name;
      state.email = payload.email;
      state.token = payload.token;
      localStorage.setItem('user', JSON.stringify(payload));
    },
    setUsername: (state: UserState, { payload }: PayloadAction<string>) => {
      state.name = payload;
      localStorage.setItem('user', JSON.stringify(state));
    },
    logout: (state: UserState) => {
      state.id = '';
      state.name = '';
      state.email = '';
      state.token = '';
      localStorage.removeItem('user');
    },
  },
});

export const selectUser = (state: RootState) => state.user;
export const { setUser, setUsername, logout } = userSlice.actions;
export default userSlice;
