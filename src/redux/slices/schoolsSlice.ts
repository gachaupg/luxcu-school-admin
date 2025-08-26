import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/config/api";
import { API_ENDPOINTS } from "@/utils/api";

interface StaffProfile {
  id: number;
  position: string;
  department: string;
  hire_date: string;
  // Add other staff profile fields as needed
}

interface AdminDetails {
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
  staff_profile: StaffProfile | null;
}

interface School {
  id: number;
  name: string;
  location: string;
  description: string;
  logo: string | null;
  contact_number: string;
  email: string;
  admin: number;
  admin_details: AdminDetails;
  longitude_point: number | null;
  latitude_point: number | null;
  location_coordinates: string | null;
  school_longitude: number | null;
  school_latitude: number | null;
  operating_hours_start: string;
  operating_hours_end: string;
  is_active: boolean;
  notification_enabled: boolean;
  allow_parent_tracking: boolean;
}

interface SchoolRegistrationPayload {
  school_name: string;
  school_location: string;
  school_description: string;
  school_contact_number: string;
  school_email: string;
  longitude: number;
  latitude: number;
  operating_hours_start: string;
  operating_hours_end: string;
  admin_first_name: string;
  admin_last_name: string;
  admin_phone_number: string;
  admin_email: string;
  admin_password: string;
  selected_plan_id: string;
  billing_cycle: string;
  estimated_students: number;
  estimated_buses: number;
}

interface SchoolsState {
  schools: School[];
  loading: boolean;
  error: string | null;
  registrationLoading: boolean;
  registrationError: string | null;
  registrationSuccess: boolean;
}

const initialState: SchoolsState = {
  schools: [],
  loading: false,
  error: null,
  registrationLoading: false,
  registrationError: null,
  registrationSuccess: false,
};

export const fetchSchools = createAsyncThunk<
  School[],
  void,
  { rejectValue: string }
>("schools/fetchSchools", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get(API_ENDPOINTS.SCHOOLS);

    if (!response.data || !Array.isArray(response.data)) {
      return rejectWithValue("Invalid response format from server");
    }

    return response.data;
  } catch (error: unknown) {
    const apiError = error as {
      response?: { data?: { message?: string }; status?: number };
    };
    
    // Check if it's an authentication error
    if (apiError.response?.status === 401 || apiError.response?.status === 403) {
      // Don't set an error for auth issues - let the auth system handle it
      return rejectWithValue("Authentication failed");
    }
    
    // For network errors or other issues, return a user-friendly message
    if (!apiError.response) {
      return rejectWithValue("Network error - please check your connection");
    }
    
    return rejectWithValue(
      apiError.response?.data?.message || "Failed to fetch schools"
    );
  }
});

export const registerSchool = createAsyncThunk<
  { success: boolean; message?: string },
  SchoolRegistrationPayload,
  { rejectValue: string }
>("schools/registerSchool", async (registrationData, { rejectWithValue }) => {
  try {
    const response = await api.post(
      API_ENDPOINTS.SCHOOL_REGISTRATION,
      registrationData
    );
    return response.data;
  } catch (error: unknown) {
    const apiError = error as {
      response?: { data?: { message?: string }; status?: number };
    };
    return rejectWithValue(
      apiError.response?.data?.message || "Failed to register school"
    );
  }
});

const schoolsSlice = createSlice({
  name: "schools",
  initialState,
  reducers: {
    clearSchoolsError: (state) => {
      state.error = null;
    },
    clearRegistrationError: (state) => {
      state.registrationError = null;
    },
    clearRegistrationSuccess: (state) => {
      state.registrationSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Schools
      .addCase(fetchSchools.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchools.fulfilled, (state, action) => {
        state.loading = false;
        state.schools = action.payload;
      })
      .addCase(fetchSchools.rejected, (state, action) => {
        state.loading = false;
        // Only set error for non-auth errors
        const errorMessage = action.payload || "Failed to fetch schools";
        if (!errorMessage.includes('Authentication failed')) {
          state.error = errorMessage;
        }
      })
      // Register School
      .addCase(registerSchool.pending, (state) => {
        state.registrationLoading = true;
        state.registrationError = null;
        state.registrationSuccess = false;
      })
      .addCase(registerSchool.fulfilled, (state) => {
        state.registrationLoading = false;
        state.registrationSuccess = true;
      })
      .addCase(registerSchool.rejected, (state, action) => {
        state.registrationLoading = false;
        state.registrationError = action.payload || "Failed to register school";
      });
  },
});

export const {
  clearSchoolsError,
  clearRegistrationError,
  clearRegistrationSuccess,
} = schoolsSlice.actions;
export default schoolsSlice.reducer;
