import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { PeerID } from '../components/CallPage';
import { RootState } from './store';

export type ChatItem = {
  authorId: PeerID;
  author: string;
  message: string;
  timeStamp: number;
};

type CallState = {
  chatItems: ChatItem[];
  handRaised: boolean;
  handRaisedCount: number;
  chatOpen: boolean;
};

const initialState: CallState = {
  chatItems: [],
  handRaised: false,
  handRaisedCount: 0,
  chatOpen: false,
};

const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    addChatItem: (state: CallState, { payload }: PayloadAction<ChatItem>) => {
      state.chatItems.push(payload);
    },
    setChatItems: (
      state: CallState,
      { payload }: PayloadAction<ChatItem[]>,
    ) => {
      state.chatItems = payload;
    },
    setHandRaised: (state: CallState, { payload }: PayloadAction<boolean>) => {
      state.handRaised = payload;
    },
    setHandRaisedCount: (
      state: CallState,
      { payload }: PayloadAction<number>,
    ) => {
      state.handRaisedCount = payload;
    },
    setChatOpen: (state: CallState, { payload }: PayloadAction<boolean>) => {
      state.chatOpen = payload;
    },
    toggleChatOpen: (state: CallState) => {
      state.chatOpen = !state.chatOpen;
    },
  },
});

export const selectCall = (state: RootState) => state.call;

export const {
  addChatItem,
  setChatItems,
  setHandRaised,
  setHandRaisedCount,
  setChatOpen,
  toggleChatOpen,
} = callSlice.actions;

export default callSlice;
