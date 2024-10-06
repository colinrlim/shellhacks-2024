import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export interface SettingsState {
  account: {
    name: string;
    email: string;
  };
  security: {
    twoFactorEnabled: boolean;
    emailVerificationCode?: string;
    emailVerified?: boolean;
    passwordResetConfirmationCode?: string;
  };
  interface: {
    theme: "light" | "dark";
    fontSize: "small" | "medium" | "large";
    language: "en";
  };
  data: {
    dataExportRequested: boolean;
  };
  legal: {
    marketingConsent: boolean;
  };
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  account: {
    name: "",
    email: "",
  },
  security: {
    twoFactorEnabled: false,
  },
  interface: {
    theme: "light",
    fontSize: "medium",
    language: "en",
  },
  data: {
    dataExportRequested: false,
  },
  legal: {
    marketingConsent: false,
  },
  loading: false,
  error: null,
};

export const fetchSettings = createAsyncThunk(
  "settings/fetchSettings",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/settings/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to fetch settings");
    }
  }
);

export const updateSettings = createAsyncThunk(
  "settings/updateSettings",
  async (
    { userId, settings }: { userId: string; settings: Partial<SettingsState> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.put(`/api/settings/${userId}`, settings);
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to update settings");
    }
  }
);

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    resetSettings: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchSettings.fulfilled,
        (state, action: PayloadAction<SettingsState>) => {
          state.loading = false;
          return { ...state, ...action.payload };
        }
      )
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateSettings.fulfilled,
        (state, action: PayloadAction<SettingsState>) => {
          state.loading = false;
          return { ...state, ...action.payload };
        }
      )
      .addCase(updateSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
