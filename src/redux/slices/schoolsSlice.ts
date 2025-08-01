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
    console.log("Fetching schools from:", API_ENDPOINTS.SCHOOLS);
    const response = await api.get(API_ENDPOINTS.SCHOOLS);
    console.log("Schools API response:", response.data);

    if (!response.data || !Array.isArray(response.data)) {
      console.error("Invalid schools response format:", response.data);
      return rejectWithValue("Invalid response format from server");
    }

    return response.data;
  } catch (error: unknown) {
    const apiError = error as {
      response?: { data?: { message?: string }; status?: number };
    };
    console.error("Schools fetch error:", {
      error,
      response: apiError.response?.data,
      status: apiError.response?.status,
    });
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
    console.log("Registering school with payload:", registrationData);
    const response = await api.post(
      API_ENDPOINTS.SCHOOL_REGISTRATION,
      registrationData
    );
    console.log("School registration response:", response.data);
    return response.data;
  } catch (error: unknown) {
    const apiError = error as {
      response?: { data?: { message?: string }; status?: number };
    };
    console.error("School registration error:", {
      error,
      response: apiError.response?.data,
      status: apiError.response?.status,
    });
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
        state.error = action.payload || "Failed to fetch schools";
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
