import { configureStore } from '@reduxjs/toolkit';
import userMediaSlice from './userMediaSlice';
import userSlice from './userSlice';

const store = configureStore({
  reducer: {
    [userMediaSlice.name]: userMediaSlice.reducer,
    [userSlice.name]: userSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
