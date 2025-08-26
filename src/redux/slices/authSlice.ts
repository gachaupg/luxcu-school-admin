import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import api from "@/config/api";
import { API_ENDPOINTS } from "@/utils/api";
import { isTokenExpired, getStoredToken, clearAuthData } from "@/utils/auth";

interface SchoolSubscription {
  id: string;
  plan_name: string;
  status: string;
  billing_cycle: string;
  school_name: string;
  school_to_pay: boolean;
  parents_to_pay: boolean;
  start_date: string;
  end_date: string | null;
  next_billing_date: string | null;
  total_amount: number;
  payment_responsibility: string;
}

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
  school_subscription?: SchoolSubscription;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  userId: number | null;
  verificationStatus: "idle" | "pending" | "verified" | "failed";
  isInitialized: boolean;
  hasLoggedInBefore: boolean; // New field to track login history
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
  return getStoredToken();
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
    // Error parsing persisted user
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
  hasLoggedInBefore: false, // Initialize the new field
};

// Note: API headers will be set by the auth interceptor in api.ts
// No need to set them here during module initialization

// Helper function to check subscription restrictions
const checkSubscriptionRestrictions = (user: User): string | null => {
  const subscription = user.school_subscription;
  
  if (!subscription) {
    return null; // No subscription data, allow login
  }

  // If school_to_pay is true, don't restrict even if status is not active
  if (subscription.school_to_pay) {
    return null; // Allow login regardless of status
  }

  // If school_to_pay is false and status is not active, restrict login
  if (!subscription.school_to_pay && subscription.status !== "active") {
    let errorMessage = "Access denied. ";
    
    switch (subscription.status) {
      case "suspended":
        errorMessage += "Your school subscription has been suspended due to payment issues. Please contact your school administrator to resolve this.";
        break;
      case "expired":
        errorMessage += "Your school subscription has expired. Please contact your school administrator to renew the subscription.";
        break;
      case "cancelled":
        errorMessage += "Your school subscription has been cancelled. Please contact your school administrator to reactivate the subscription.";
        break;
      case "pending":
        errorMessage += "Your school subscription is pending activation. Please contact your school administrator.";
        break;
      default:
        errorMessage += `Your school subscription is ${subscription.status}. Please contact your school administrator to resolve payment issues.`;
    }
    
    return errorMessage;
  }

  return null; // Allow login
};

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
            
            // Check subscription restrictions
            const restrictionError = checkSubscriptionRestrictions(user);
            if (restrictionError) {
              reject(rejectWithValue(restrictionError));
              return;
            }
            
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
      // Don't reset hasLoggedInBefore - keep the login history
      clearAuthData();
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
        // Only logout if token is actually expired
        state.user = null;
        state.token = null;
        state.userId = null;
        state.verificationStatus = "idle";
        state.isInitialized = true;
        // Don't reset hasLoggedInBefore - keep the login history
        clearAuthData();
        // Note: API headers will be cleared by the auth interceptor
      }
    },
    initializeAuth: (state) => {
      // Check if we have valid persisted data
      const persistedToken = getInitialToken();
      const persistedUser = getInitialUser();

      if (persistedToken && persistedUser && !isTokenExpired(persistedToken)) {
        state.token = persistedToken;
        state.user = persistedUser;
        state.hasLoggedInBefore = true; // Set to true if persisted data exists
      } else {
        // Clear invalid persisted data
        if (persistedToken && isTokenExpired(persistedToken)) {
          clearAuthData();
        }
        
        // Check if user has logged in before (even if currently logged out)
        const hasLoggedInBefore = localStorage.getItem("hasLoggedInBefore") === "true";
        state.hasLoggedInBefore = hasLoggedInBefore;
        
        // Ensure we're in a clean logged-out state
        state.token = null;
        state.user = null;
        state.userId = null;
        state.verificationStatus = "idle";
      }

      state.isInitialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle Redux Persist rehydration
      .addCase("persist/REHYDRATE", (state, action: any) => {
        if (action.payload?.auth) {
          const { token, user } = action.payload.auth;
          if (token && user && !isTokenExpired(token)) {
            state.token = token;
            state.user = user;
            state.hasLoggedInBefore = true; // Set to true if persisted data exists
          } else {
            state.token = null;
            state.user = null;
            state.hasLoggedInBefore = false; // Reset if persisted data is invalid
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
        state.hasLoggedInBefore = true; // Set to true on successful login
        // Store token in localStorage for API interceptor
        localStorage.setItem("token", action.payload.token);
        // Store login history flag
        localStorage.setItem("hasLoggedInBefore", "true");
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
          state.hasLoggedInBefore = true; // Set to true on successful OTP verification
          // Store token in localStorage for API interceptor
          localStorage.setItem("token", action.payload.token);
          // Store login history flag
          localStorage.setItem("hasLoggedInBefore", "true");
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
        state.hasLoggedInBefore = true; // Set to true on successful registration
        // Store token in localStorage for API interceptor
        localStorage.setItem("token", action.payload.token);
        // Store login history flag
        localStorage.setItem("hasLoggedInBefore", "true");
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
