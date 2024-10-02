// @/store/slices/uiSlice
// This is the UI slice of the Redux store. It contains the UI state and reducers for opening and closing the profile modal.

// Imports
import { createSlice } from "@reduxjs/toolkit";

// UI state interface
interface UIState {
  isProfileModalOpen: boolean;
  dismissedResetTip: boolean;
}

// Initial state of UI slice
const initialState: UIState = {
  isProfileModalOpen: false,
  dismissedResetTip: false,
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
    dismissResetTip(state) {
      state.dismissedResetTip = true;
    },
  },
});

export const { openProfileModal, closeProfileModal, dismissResetTip } =
  uiSlice.actions;

export default uiSlice.reducer;
