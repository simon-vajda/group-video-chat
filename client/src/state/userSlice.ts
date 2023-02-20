import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

interface UserState {
  username: string;
}

const initialState: UserState = {
  username: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUsername: (state: UserState, { payload }: PayloadAction<string>) => {
      state.username = payload;
    },
  },
});

export const selectUser = (state: RootState) => state.user;

export const { setUsername } = userSlice.actions;

export default userSlice;
