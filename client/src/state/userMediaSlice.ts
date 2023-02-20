import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

interface UserMediaState {
  audioDeviceId: string;
  videoDeviceId: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
}

const initialState: UserMediaState = {
  audioDeviceId: '',
  videoDeviceId: '',
  audioEnabled: true,
  videoEnabled: true,
};

const userMediaSlice = createSlice({
  name: 'userMedia',
  initialState,
  reducers: {
    setAudioDeviceId: (state, action: PayloadAction<string>) => {
      state.audioDeviceId = action.payload;
    },
    setVideoDeviceId: (state, action: PayloadAction<string>) => {
      state.videoDeviceId = action.payload;
    },
    setAudioEnabled: (state, action: PayloadAction<boolean>) => {
      state.audioEnabled = action.payload;
    },
    setVideoEnabled: (state, action: PayloadAction<boolean>) => {
      state.videoEnabled = action.payload;
    },
    toggleAudio: (state) => {
      state.audioEnabled = !state.audioEnabled;
    },
    toggleVideo: (state) => {
      state.videoEnabled = !state.videoEnabled;
    },
  },
});

export const selectUserMedia = (state: RootState) => state.userMedia;

export const {
  setAudioDeviceId,
  setVideoDeviceId,
  setAudioEnabled,
  setVideoEnabled,
  toggleAudio,
  toggleVideo,
} = userMediaSlice.actions;

export default userMediaSlice;
