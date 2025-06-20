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

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  userId: null,
  verificationStatus: "idle",
};

// Check token expiration on initial load
if (initialState.token && isTokenExpired(initialState.token)) {
  initialState.token = null;
}

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
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
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
    if (response.data.token) {
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;
    }
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
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
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
      localStorage.removeItem("schoolId");
      delete api.defaults.headers.common["Authorization"];
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
        delete api.defaults.headers.common["Authorization"];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed. Please try again.";
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
        }
      )
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "OTP verification failed";
        state.verificationStatus = "failed";
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
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed";
      });
  },
});

export const {
  logout,
  clearError,
  resetVerificationStatus,
  checkTokenExpiration,
} = authSlice.actions;
export default authSlice.reducer;
