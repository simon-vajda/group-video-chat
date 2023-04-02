import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Peer } from '../components/CallPage';
import { RootState } from './store';

type ChatItem = {
  author: Peer;
  message: string;
  timeStamp: number;
};

type ChatState = {
  chatItems: ChatItem[];
};

const initialState: ChatState = {
  chatItems: [],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addChatItem: (state: ChatState, { payload }: PayloadAction<ChatItem>) => {
      state.chatItems.push(payload);
    },
    setChatItems: (
      state: ChatState,
      { payload }: PayloadAction<ChatItem[]>,
    ) => {
      state.chatItems = payload;
    },
  },
});

export const selectChat = (state: RootState) => state.chat;

export const { addChatItem, setChatItems } = chatSlice.actions;

export default chatSlice;
