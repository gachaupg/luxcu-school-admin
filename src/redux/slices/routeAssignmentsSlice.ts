import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/config/api";
import { API_ENDPOINTS } from "@/utils/api";
import { AxiosError } from "axios";

export interface RouteAssignment {
  id?: number;
  student: number;
  route: number;
  pickup_stop: number | null;
  dropoff_stop: number | null;
  is_active: boolean;
  schedule_days: string[];
}

interface RouteAssignmentsState {
  assignments: RouteAssignment[];
  loading: boolean;
  error: string | null;
}

const initialState: RouteAssignmentsState = {
  assignments: [],
  loading: false,
  error: null,
};

export const createRouteAssignment = createAsyncThunk<
  RouteAssignment,
  Omit<RouteAssignment, "id">,
  { rejectValue: string }
>(
  "routeAssignments/createAssignment",
  async (assignmentData, { rejectWithValue }) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.ROUTE_ASSIGNMENTS,
        assignmentData
      );
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        JSON.stringify(
          axiosError.response?.data || {
            message: "Failed to create route assignment",
          }
        )
      );
    }
  }
);

export const fetchRouteAssignments = createAsyncThunk<
  RouteAssignment[],
  { schoolId?: number } | void,
  { rejectValue: string }
>("routeAssignments/fetchAssignments", async (params, { rejectWithValue }) => {
  try {
    const schoolId = typeof params === "object" ? params.schoolId : undefined;
    let url = API_ENDPOINTS.ROUTE_ASSIGNMENTS;

    if (schoolId) {
      url += `?school=${schoolId}`;
    }

    const response = await api.get(url);
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(
      axiosError.response?.data?.message || "Failed to fetch route assignments"
    );
  }
});

export const updateRouteAssignment = createAsyncThunk<
  RouteAssignment,
  { id: number; data: Partial<RouteAssignment> },
  { rejectValue: string }
>(
  "routeAssignments/updateAssignment",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `${API_ENDPOINTS.ROUTE_ASSIGNMENTS}${id}/`,
        data
      );
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        JSON.stringify(
          axiosError.response?.data || {
            message: "Failed to update route assignment",
          }
        )
      );
    }
  }
);

export const deleteRouteAssignment = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("routeAssignments/deleteAssignment", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`${API_ENDPOINTS.ROUTE_ASSIGNMENTS}${id}/`);
    return id;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(
      JSON.stringify(
        axiosError.response?.data || {
          message: "Failed to delete route assignment",
        }
      )
    );
  }
});

const routeAssignmentsSlice = createSlice({
  name: "routeAssignments",
  initialState,
  reducers: {
    clearRouteAssignmentsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Route Assignment
      .addCase(createRouteAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRouteAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments.push(action.payload);
      })
      .addCase(createRouteAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to create route assignment";
      })
      // Fetch Route Assignments
      .addCase(fetchRouteAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRouteAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = action.payload;
      })
      .addCase(fetchRouteAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to fetch route assignments";
      })
      // Update Route Assignment
      .addCase(updateRouteAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRouteAssignment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.assignments.findIndex(
          (assignment) => assignment.id === action.payload.id
        );
        if (index !== -1) {
          state.assignments[index] = action.payload;
        }
      })
      .addCase(updateRouteAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to update route assignment";
      })
      // Delete Route Assignment
      .addCase(deleteRouteAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRouteAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = state.assignments.filter(
          (assignment) => assignment.id !== action.payload
        );
      })
      .addCase(deleteRouteAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to delete route assignment";
      });
  },
});

export const { clearRouteAssignmentsError } = routeAssignmentsSlice.actions;
export default routeAssignmentsSlice.reducer;
