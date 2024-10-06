// @/store/slices/uiSlice
// This is the UI slice of the Redux store. It contains the UI state and reducers for opening and closing the profile modal.

// Imports
import Logger from "@/utils/logger";
import { createSlice } from "@reduxjs/toolkit";

// UI state interface
interface UIState {
  dismissedResetTip: boolean;
}

// Initial state of UI slice
const initialState: UIState = {
  dismissedResetTip: false,
};

// UI slice
const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    dismissResetTip(state) {
      state.dismissedResetTip = true;
      Logger.info("Reset tip dismissed");
    },
  },
});

export const { dismissResetTip } = uiSlice.actions;

export default uiSlice.reducer;
