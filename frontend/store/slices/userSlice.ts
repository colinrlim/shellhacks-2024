import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserInfo {
  auth0Id: string;
  name: string;
  email: string;
}

interface UserState {
  userInfo: UserInfo | null;
  isAuthenticated: boolean;
  sessionId: string | null;
}

const initialState: UserState = {
  userInfo: null,
  isAuthenticated: false,
  sessionId: null,
};

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
