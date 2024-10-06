import Logger from "@/utils/logger";
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
      Logger.info(`Fetching settings for user ${userId}`);
      const response = await axios.get(`/learn/api/settings/${userId}`);
      Logger.debug(`Settings response for user ${userId}:`, response.data);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        Logger.error(
          `Error fetching settings for user ${userId}:`,
          error.response?.data?.message || error.message
        );
        return rejectWithValue(error.response?.data?.message || error.message);
      }
      Logger.error(`Error fetching settings for user ${userId}:`, error);
      return rejectWithValue("An unexpected error occurred");
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
      Logger.info(`Updating settings for user ${userId}`);
      const response = await axios.put(
        `/learn/api/settings/${userId}`,
        settings
      );
      Logger.debug(`Settings updated for user ${userId}:`, response.data);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        Logger.error(
          `Error updating settings for user ${userId}:`,
          error.response?.data?.message || error.message
        );
        return rejectWithValue(error.response?.data?.message || error.message);
      }
      Logger.error(`Error updating settings for user ${userId}:`, error);
      return rejectWithValue("An unexpected error occurred");
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
          state.error = null;
          Object.assign(state, action.payload);
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
          state.error = null;
          Object.assign(state, action.payload);
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
