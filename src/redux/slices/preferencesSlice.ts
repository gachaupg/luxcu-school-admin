import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface UserPreferences {
  // Dashboard Preferences
  showAnalytics: boolean;
  showRecentActivity: boolean;
  showNotificationsPanel: boolean;

  // Data Preferences
  allowDataExport: boolean;
  autoBackup: boolean;

  // Theme & Appearance
  theme: "light" | "dark" | "auto";
  language: "en" | "sw" | "fr";
}

interface PreferencesState {
  preferences: UserPreferences;
  loading: boolean;
  error: string | null;
}

const initialState: PreferencesState = {
  preferences: {
    showAnalytics: true,
    showRecentActivity: true,
    showNotificationsPanel: true,
    allowDataExport: true,
    autoBackup: true,
    theme: "light",
    language: "en",
  },
  loading: false,
  error: null,
};

// Async thunk to fetch user preferences
export const fetchUserPreferences = createAsyncThunk(
  "preferences/fetchUserPreferences",
  async (_, { rejectWithValue }) => {
    try {
      // Try to load from localStorage first
      const stored = localStorage.getItem("userPreferences");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // If parsing fails, use defaults
        }
      }
      // Return default preferences since API doesn't exist
      return initialState.preferences;
    } catch (error: any) {
      return rejectWithValue("Failed to fetch preferences");
    }
  }
);

// Async thunk to update user preferences
export const updateUserPreferences = createAsyncThunk(
  "preferences/updateUserPreferences",
  async (preferences: Partial<UserPreferences>, { rejectWithValue }) => {
    try {
      // Save to localStorage for persistence
      const current = JSON.parse(
        localStorage.getItem("userPreferences") || "{}"
      );
      const updated = { ...current, ...preferences };
      localStorage.setItem("userPreferences", JSON.stringify(updated));

      // Return the updated preferences
      return preferences;
    } catch (error: any) {
      return rejectWithValue("Failed to update preferences");
    }
  }
);

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    setPreference: (
      state,
      action: PayloadAction<{ key: keyof UserPreferences; value: any }>
    ) => {
      const { key, value } = action.payload;
      state.preferences[key] = value;
    },
    resetPreferences: (state) => {
      state.preferences = initialState.preferences;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch preferences
      .addCase(fetchUserPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = { ...state.preferences, ...action.payload };
      })
      .addCase(fetchUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update preferences
      .addCase(updateUserPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = { ...state.preferences, ...action.payload };
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setPreference, resetPreferences } = preferencesSlice.actions;
export default preferencesSlice.reducer;
