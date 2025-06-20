import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/config/api";
import { API_ENDPOINTS } from "@/utils/api";
import { AxiosError } from "axios";

export interface Trip {
  id?: number;
  route: number;
  driver: number;
  vehicle: number;
  school: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  start_time: string;
  end_time?: string;
  students_count: number;
  created_at: string;
  updated_at: string;
  // Additional fields for display
  route_name?: string;
  driver_name?: string;
  vehicle_registration?: string;
}

interface TripsState {
  trips: Trip[];
  loading: boolean;
  error: string | null;
}

const initialState: TripsState = {
  trips: [],
  loading: false,
  error: null,
};

export const fetchTrips = createAsyncThunk<
  Trip[],
  { schoolId?: number } | void,
  { rejectValue: string }
>("trips/fetchTrips", async (params, { rejectWithValue }) => {
  try {
    const schoolId = typeof params === "object" ? params.schoolId : undefined;
    let url = API_ENDPOINTS.TRIPS;

    if (schoolId) {
      url += `?school=${schoolId}`;
    }

    const response = await api.get(url);
    return response.data?.data || response.data || [];
  } catch (error) {
    if (error instanceof AxiosError) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch trips"
      );
    }
    return rejectWithValue("Failed to fetch trips");
  }
});

export const createTrip = createAsyncThunk<
  Trip,
  Omit<Trip, "id" | "created_at" | "updated_at">,
  { rejectValue: string }
>("trips/createTrip", async (tripData, { rejectWithValue }) => {
  try {
    const response = await api.post(API_ENDPOINTS.TRIPS, tripData);
    return response.data?.data || response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create trip"
      );
    }
    return rejectWithValue("Failed to create trip");
  }
});

export const updateTrip = createAsyncThunk<
  Trip,
  { id: number; tripData: Partial<Trip> },
  { rejectValue: string }
>("trips/updateTrip", async ({ id, tripData }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`${API_ENDPOINTS.TRIPS}${id}/`, tripData);
    return response.data?.data || response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update trip"
      );
    }
    return rejectWithValue("Failed to update trip");
  }
});

const tripsSlice = createSlice({
  name: "trips",
  initialState,
  reducers: {
    clearTripsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Trips
      .addCase(fetchTrips.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.loading = false;
        state.trips = action.payload;
      })
      .addCase(fetchTrips.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch trips";
      })
      // Create Trip
      .addCase(createTrip.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTrip.fulfilled, (state, action) => {
        state.loading = false;
        state.trips.push(action.payload);
      })
      .addCase(createTrip.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to create trip";
      })
      // Update Trip
      .addCase(updateTrip.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTrip.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.trips.findIndex(
          (trip) => trip.id === action.payload.id
        );
        if (index !== -1) {
          state.trips[index] = action.payload;
        }
      })
      .addCase(updateTrip.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to update trip";
      });
  },
});

export const { clearTripsError } = tripsSlice.actions;
export default tripsSlice.reducer;
