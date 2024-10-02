// @/store/slices/uiSlice
// This is the UI slice of the Redux store. It contains the UI state and reducers for opening and closing the profile modal.

// Imports
import { createSlice } from "@reduxjs/toolkit";

// UI state interface
interface UIState {
  isProfileModalOpen: boolean;
}

// Initial state of UI slice
const initialState: UIState = {
  isProfileModalOpen: false,
};

// UI slice
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
  },
});

export const { openProfileModal, closeProfileModal } = uiSlice.actions;

export default uiSlice.reducer;
