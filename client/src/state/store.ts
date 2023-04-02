import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/dist/query';
import { roomApi } from '../api/roomApi';
import userMediaSlice from './userMediaSlice';
import userSlice from './userSlice';
import chatSlice from './chatSlice';

const store = configureStore({
  reducer: {
    [userMediaSlice.name]: userMediaSlice.reducer,
    [userSlice.name]: userSlice.reducer,
    [chatSlice.name]: chatSlice.reducer,
    [roomApi.reducerPath]: roomApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(roomApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;

export default store;
