import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchStudents } from "./studentsSlice";
import { fetchParents } from "./parentsSlice";
import { fetchStaff } from "./staffSlice";
import { fetchVehicles } from "./vehiclesSlice";
import { fetchRoutes } from "./routesSlice";
import type { AppDispatch } from "../store";

interface OverviewStats {
  totalStudents: number;
  totalParents: number;
  totalStaff: number;
  totalVehicles: number;
  totalRoutes: number;
  activeRoutes: number;
}

interface OverviewState {
  stats: OverviewStats;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: OverviewState = {
  stats: {
    totalStudents: 0,
    totalParents: 0,
    totalStaff: 0,
    totalVehicles: 0,
    totalRoutes: 0,
    activeRoutes: 0,
  },
  loading: false,
  error: null,
  lastUpdated: null,
};

export const fetchOverviewData = createAsyncThunk<
  OverviewStats,
  { schoolId: number },
  { rejectValue: string; dispatch: AppDispatch }
>(
  "overview/fetchOverviewData",
  async ({ schoolId }, { rejectWithValue, dispatch }) => {
    try {
      // Fetch all data in parallel
      const [
        studentsResult,
        parentsResult,
        staffResult,
        vehiclesResult,
        routesResult,
      ] = await Promise.allSettled([
        dispatch(fetchStudents({ schoolId })).unwrap(),
        dispatch(fetchParents({ schoolId })).unwrap(),
        dispatch(fetchStaff({ schoolId })).unwrap(),
        dispatch(fetchVehicles({ schoolId })).unwrap(),
        dispatch(fetchRoutes({ schoolId })).unwrap(),
      ]);

      // Extract data from results
      const students =
        studentsResult.status === "fulfilled" ? studentsResult.value : [];
      const parents =
        parentsResult.status === "fulfilled" ? parentsResult.value : [];
      const staff = staffResult.status === "fulfilled" ? staffResult.value : [];
      const vehicles =
        vehiclesResult.status === "fulfilled" ? vehiclesResult.value : [];
      const routes =
        routesResult.status === "fulfilled" ? routesResult.value : [];

      // Calculate stats
      const stats: OverviewStats = {
        totalStudents: students.length,
        totalParents: parents.length,
        totalStaff: staff.length,
        totalVehicles: vehicles.length,
        totalRoutes: routes.length,
        activeRoutes: routes.filter((route: any) => route.is_active).length,
      };

      return stats;
    } catch (error) {
      return rejectWithValue("Failed to fetch overview data");
    }
  }
);

const overviewSlice = createSlice({
  name: "overview",
  initialState,
  reducers: {
    clearOverviewError: (state) => {
      state.error = null;
    },
    resetOverview: (state) => {
      state.stats = initialState.stats;
      state.lastUpdated = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOverviewData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOverviewData.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchOverviewData.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to fetch overview data";
      });
  },
});

export const { clearOverviewError, resetOverview } = overviewSlice.actions;
export default overviewSlice.reducer;
