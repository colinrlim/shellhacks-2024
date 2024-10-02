// @/store/slices/userSlice
/**
 * This is the user slice of the Redux store.
 * It contains the user state and reducers for setting and clearing the user.
 */

// Imports
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// User info interface
interface UserInfo {
  auth0Id: string;
  name: string;
  email: string;
}

// User state interface
interface UserState {
  userInfo: UserInfo | null;
  isAuthenticated: boolean;
  sessionId: string | null;
}

// Initial state of user slice
const initialState: UserState = {
  userInfo: null,
  isAuthenticated: false,
  sessionId: null,
};

// User slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserInfo>) {
      state.userInfo = action.payload;
      state.isAuthenticated = true;

      // generate a new session ID
      state.sessionId = Math.random().toString(36).substring(2);
    },
    clearUser(state) {
      state.userInfo = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
