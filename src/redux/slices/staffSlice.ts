import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/config/api";
import { API_ENDPOINTS } from "@/utils/api";
import { AxiosError } from "axios";

interface StaffUser {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password?: string;
  confirm_password?: string;
}

interface Staff {
  employee_id: string;
  role: number;
  school: number;
  status: string;
  user: StaffUser;
}

interface StaffState {
  staff: Staff[];
  loading: boolean;
  error: string | null;
}

const initialState: StaffState = {
  staff: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchStaff = createAsyncThunk<
  Staff[],
  { schoolId?: number } | void,
  { rejectValue: string }
>("staff/fetchStaff", async (params, { rejectWithValue }) => {
  try {
    const schoolId = typeof params === "object" ? params.schoolId : undefined;
    let url = API_ENDPOINTS.STAFF;

    if (schoolId) {
      url += `?school=${schoolId}`;
    }

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch staff"
      );
    }
    return rejectWithValue("Failed to fetch staff");
  }
});

export const addStaff = createAsyncThunk(
  "staff/addStaff",
  async (staffData: Staff, { rejectWithValue }) => {
    try {
      const response = await api.post(API_ENDPOINTS.STAFF, staffData);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to add staff"
        );
      }
      return rejectWithValue("Failed to add staff");
    }
  }
);

export const updateStaff = createAsyncThunk(
  "staff/updateStaff",
  async (
    { id, staffData }: { id: string; staffData: Partial<Staff> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(
        `${API_ENDPOINTS.STAFF}${id}/`,
        staffData
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to update staff"
        );
      }
      return rejectWithValue("Failed to update staff");
    }
  }
);

export const deleteStaff = createAsyncThunk(
  "staff/deleteStaff",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`${API_ENDPOINTS.STAFF}${id}/`);
      return id;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to delete staff"
        );
      }
      return rejectWithValue("Failed to delete staff");
    }
  }
);

const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    clearStaffError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Staff
      .addCase(fetchStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.staff = action.payload;
      })
      .addCase(fetchStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch staff";
      })
      // Add Staff
      .addCase(addStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.staff.push(action.payload);
      })
      .addCase(addStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to add staff";
      })
      // Update Staff
      .addCase(updateStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStaff.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.staff.findIndex(
          (staff) => staff.employee_id === action.payload.employee_id
        );
        if (index !== -1) {
          state.staff[index] = action.payload;
        }
      })
      .addCase(updateStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to update staff";
      })
      // Delete Staff
      .addCase(deleteStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.staff = state.staff.filter(
          (staff) => staff.employee_id !== action.payload
        );
      })
      .addCase(deleteStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to delete staff";
      });
  },
});

export const { clearStaffError } = staffSlice.actions;
export default staffSlice.reducer;
