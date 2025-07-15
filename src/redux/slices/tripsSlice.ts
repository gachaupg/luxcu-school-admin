import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/config/api";
import { API_ENDPOINTS } from "@/utils/api";
import { AxiosError } from "axios";

export interface Trip {
  id?: number;
  route: number;
  driver: number;
  vehicle: number;
  school?: number;
  trip_type: "morning" | "afternoon" | "evening";
  status:
    | "scheduled"
    | "preparing"
    | "ongoing"
    | "completed"
    | "cancelled"
    | "delayed";
  scheduled_start_time: string;
  scheduled_end_time: string;
  start_time?: string;
  end_time?: string;
  students_count?: number;
  created_at?: string;
  updated_at?: string;
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
    console.log("Raw trips response:", response.data);

    // Handle paginated response structure
    let tripsData;
    if (response.data && response.data.results) {
      // Paginated response: { count, next, previous, results: [...] }
      tripsData = response.data.results;
    } else if (response.data && Array.isArray(response.data)) {
      // Direct array response
      tripsData = response.data;
    } else if (
      response.data &&
      response.data.data &&
      Array.isArray(response.data.data)
    ) {
      // Nested data response
      tripsData = response.data.data;
    } else {
      tripsData = [];
    }

    // Transform the backend response to match our frontend structure
    const transformedTrips = Array.isArray(tripsData)
      ? tripsData.map((trip) => ({
          ...trip,
          route_name:
            trip.route_name ||
            trip.route_details?.name ||
            `Route ${trip.route}`,
          vehicle_registration:
            trip.vehicle_number ||
            trip.vehicle_details?.license_plate ||
            `Vehicle ${trip.vehicle}`,
          driver_name:
            trip.driver_name ||
            trip.driver_details?.full_name ||
            `Driver ${trip.driver}`,
        }))
      : [];

    console.log("Transformed trips data:", transformedTrips);
    return transformedTrips;
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
  {
    route: number;
    driver: number;
    vehicle: number;
    trip_type: "morning" | "afternoon" | "evening";
    status:
      | "scheduled"
      | "preparing"
      | "ongoing"
      | "completed"
      | "cancelled"
      | "delayed";
    scheduled_start_time: string;
    scheduled_end_time: string;
    school?: number;
  },
  { rejectValue: string }
>("trips/createTrip", async (tripData, { rejectWithValue }) => {
  try {
    console.log("Creating trip with data:", tripData);
    const response = await api.post(API_ENDPOINTS.TRIPS, tripData);
    console.log("Trip creation response:", response.data);

    // Transform the response to match our frontend structure
    const trip = response.data?.data || response.data;
    const transformedTrip = {
      ...trip,
      route_name: trip.route_details?.name || `Route ${trip.route}`,
      vehicle_registration:
        trip.vehicle_details?.license_plate || `Vehicle ${trip.vehicle}`,
      driver_name: trip.driver_details?.full_name || `Driver ${trip.driver}`,
    };

    console.log("Transformed trip:", transformedTrip);
    return transformedTrip;
  } catch (error) {
    console.error("Trip creation error:", error);
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

    // Transform the response to match our frontend structure
    const trip = response.data?.data || response.data;
    const transformedTrip = {
      ...trip,
      route_name: trip.route_details?.name || `Route ${trip.route}`,
      vehicle_registration:
        trip.vehicle_details?.license_plate || `Vehicle ${trip.vehicle}`,
      driver_name: trip.driver_details?.full_name || `Driver ${trip.driver}`,
    };

    return transformedTrip;
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
        state.trips = Array.isArray(action.payload) ? action.payload : [];
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
