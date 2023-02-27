import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

interface UserState {
  name: string;
}

const initialState: UserState = {
  name: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUsername: (state: UserState, { payload }: PayloadAction<string>) => {
      state.name = payload;
    },
  },
});

export const selectUser = (state: RootState) => state.user;

export const { setUsername } = userSlice.actions;

export default userSlice;
