// store/slices/uiSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  isProfileModalOpen: boolean;
  isSettingsModalOpen: boolean;
  isGraphModalOpen: boolean;
}

const initialState: UIState = {
  isProfileModalOpen: false,
  isSettingsModalOpen: false,
  isGraphModalOpen: false
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
    openGraphModal(state) {
      state.isGraphModalOpen = true;
    },
    closeGraphModal(state) {
      state.isGraphModalOpen = false;
    },
  },
});

export const {
  openProfileModal,
  closeProfileModal,
  openSettingsModal,
  closeSettingsModal,
  openGraphModal,
  closeGraphModal
} = uiSlice.actions;

export default uiSlice.reducer;
