// store/slices/uiSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  isProfileModalOpen: boolean;
  isSettingsModalOpen: boolean;
}

const initialState: UIState = {
  isProfileModalOpen: false,
  isSettingsModalOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openProfileModal(state) {
      state.isProfileModalOpen = true;
    },
    closeProfileModal(state) {
      state.isProfileModalOpen = false;
    },
    openSettingsModal(state) {
      state.isSettingsModalOpen = true;
    },
    closeSettingsModal(state) {
      state.isSettingsModalOpen = false;
    },
  },
});

export const {
  openProfileModal,
  closeProfileModal,
  openSettingsModal,
  closeSettingsModal,
} = uiSlice.actions;

export default uiSlice.reducer;
