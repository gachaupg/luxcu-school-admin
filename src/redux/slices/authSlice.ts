import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import api from "@/config/api";
import { API_ENDPOINTS } from "@/utils/api";
import { isTokenExpired } from "@/utils/auth";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_image: string | null;
  user_type: string;
  phone_number: string;
  two_factor_enabled: boolean;
  last_login_ip: string | null;
  account_verified: boolean;
  last_password_change: string | null;
  failed_login_attempts: number;
  staff_profile: any | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  userId: number | null;
  verificationStatus: "idle" | "pending" | "verified" | "failed";
  isInitialized: boolean;
}

interface LoginResponse {
  status: string;
  message: string;
  user_id: number;
  token?: string;
  user?: User;
}

interface OTPVerificationResponse {
  token: string;
  user: User;
}

interface ApiError {
  message: string;
}

// Helper function to initialize token from localStorage
const getInitialToken = (): string | null => {
  try {
    // First try direct token storage (simpler and more reliable)
    const directToken = localStorage.getItem("token");
    if (directToken && !isTokenExpired(directToken)) {
      console.log("Found valid token in direct storage");
      return directToken;
    }

    // Fallback to Redux Persist storage
    const persistAuth = localStorage.getItem("persist:auth");
    if (persistAuth) {
      const parsed = JSON.parse(persistAuth);
      const authState = JSON.parse(parsed.token || "null");
      if (authState && !isTokenExpired(authState)) {
        console.log("Found valid token in Redux Persist storage");
        return authState;
      }
    }

    console.log("No valid token found in localStorage");
  } catch (error) {
    console.error("Error parsing persisted token:", error);
  }
  return null;
};

// Helper function to initialize user from localStorage
const getInitialUser = (): User | null => {
  try {
    const userData = localStorage.getItem("persist:auth");
    if (userData) {
      const parsed = JSON.parse(userData);
      const userState = JSON.parse(parsed.user || "null");
      return userState;
    }
  } catch (error) {
    console.error("Error parsing persisted user:", error);
  }
  return null;
};

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  userId: null,
  verificationStatus: "idle",
  isInitialized: false,
};

// Note: API headers will be set by the auth interceptor in api.ts
// No need to set them here during module initialization

export const login = createAsyncThunk<
  { token: string; user: User },
  { phone_number: string; password: string },
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", API_ENDPOINTS.LOGIN, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Accept", "application/json");

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.data?.token) {
            const { token, user } = data.data;
            // Note: API headers will be set by the auth interceptor
            resolve({ token, user });
          } else {
            reject(rejectWithValue("Invalid response from server"));
          }
        } catch (error) {
          reject(rejectWithValue("Failed to parse server response"));
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(
            rejectWithValue(
              errorData.message || "Login failed. Please try again."
            )
          );
        } catch (error) {
          reject(rejectWithValue("Login failed. Please try again."));
        }
      }
    };

    xhr.onerror = function () {
      reject(rejectWithValue("Network error occurred"));
    };

    xhr.send(JSON.stringify(credentials));
  });
});

export const verifyOTP = createAsyncThunk<
  OTPVerificationResponse,
  { user_id: string; otp_code: string; purpose: string },
  { rejectValue: string }
>("auth/verifyOTP", async (otpData, { rejectWithValue }) => {
  try {
    const response = await api.post<OTPVerificationResponse>(
      API_ENDPOINTS.VERIFY_OTP,
      otpData
    );
    // Note: API headers will be set by the auth interceptor
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiError>;
    return rejectWithValue(
      axiosError.response?.data?.message || "OTP verification failed"
    );
  }
});

export const register = createAsyncThunk<
  { token: string; user: User },
  { phone_number: string; password: string },
  { rejectValue: string }
>("auth/register", async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post<{ data: { token: string; user: User } }>(
      API_ENDPOINTS.REGISTER,
      credentials
    );
    if (response.data.data?.token) {
      const { token, user } = response.data.data;
      // Note: API headers will be set by the auth interceptor
      return { token, user };
    } else {
      return rejectWithValue("Invalid response from server");
    }
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(
      axiosError.response?.data?.message || "Registration failed"
    );
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.userId = null;
      state.verificationStatus = "idle";
      state.isInitialized = true;
      localStorage.removeItem("schoolId");
      localStorage.removeItem("persist:auth");
      localStorage.removeItem("token");
      // Note: API headers will be cleared by the auth interceptor
    },
    clearError: (state) => {
      state.error = null;
    },
    resetVerificationStatus: (state) => {
      state.verificationStatus = "idle";
    },
    checkTokenExpiration: (state) => {
      if (state.token && isTokenExpired(state.token)) {
        state.user = null;
        state.token = null;
        state.userId = null;
        state.verificationStatus = "idle";
        state.isInitialized = true;
        localStorage.removeItem("schoolId");
        localStorage.removeItem("persist:auth");
        localStorage.removeItem("token");
        // Note: API headers will be cleared by the auth interceptor
      }
    },
    initializeAuth: (state) => {
      // Check if we have valid persisted data
      const persistedToken = getInitialToken();
      const persistedUser = getInitialUser();

      console.log("initializeAuth debug:", {
        persistedToken: persistedToken ? "exists" : "null",
        persistedUser: persistedUser ? "exists" : "null",
        currentStateToken: state.token ? "exists" : "null",
        currentStateUser: state.user ? "exists" : "null",
      });

      if (persistedToken && persistedUser) {
        state.token = persistedToken;
        state.user = persistedUser;
        console.log("Restored auth state from localStorage");
      }

      state.isInitialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle Redux Persist rehydration
      .addCase("persist/REHYDRATE", (state, action: any) => {
        console.log("REHYDRATE debug:", {
          hasPayload: !!action.payload,
          hasAuth: !!action.payload?.auth,
          token: action.payload?.auth?.token ? "exists" : "null",
          user: action.payload?.auth?.user ? "exists" : "null",
        });

        if (action.payload?.auth) {
          const { token, user } = action.payload.auth;
          if (token && user && !isTokenExpired(token)) {
            state.token = token;
            state.user = user;
            console.log("Restored auth state from Redux Persist");
          } else {
            console.log("Token expired or invalid, clearing auth state");
            state.token = null;
            state.user = null;
          }
        }
        state.isInitialized = true;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isInitialized = true;
        // Store token in localStorage for API interceptor
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed. Please try again.";
        state.isInitialized = true;
      })
      // OTP Verification
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        verifyOTP.fulfilled,
        (state, action: PayloadAction<OTPVerificationResponse>) => {
          state.loading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.verificationStatus = "verified";
          state.isInitialized = true;
          // Store token in localStorage for API interceptor
          localStorage.setItem("token", action.payload.token);
        }
      )
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "OTP verification failed";
        state.verificationStatus = "failed";
        state.isInitialized = true;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isInitialized = true;
        // Store token in localStorage for API interceptor
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed";
        state.isInitialized = true;
      });
  },
});

export const {
  logout,
  clearError,
  resetVerificationStatus,
  checkTokenExpiration,
  initializeAuth,
} = authSlice.actions;
export default authSlice.reducer;
