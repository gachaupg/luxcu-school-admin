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

interface SchoolsState {
  schools: School[];
  loading: boolean;
  error: string | null;
}

const initialState: SchoolsState = {
  schools: [],
  loading: false,
  error: null,
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

const schoolsSlice = createSlice({
  name: "schools",
  initialState,
  reducers: {
    clearSchoolsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
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
      });
  },
});

export const { clearSchoolsError } = schoolsSlice.actions;
export default schoolsSlice.reducer;
