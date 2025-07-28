import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/config/api";
import { API_ENDPOINTS } from "@/utils/api";
import { AxiosError } from "axios";

export interface Route {
  id?: number;
  name: string;
  school: number;
  driver: number;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  total_distance: number;
  estimated_duration: string;
  is_active: boolean;
  schedule_days: string[];
  traffic_factor: number;
  path?: {
    type: string;
    coordinates: number[][];
  };
}

export interface RouteStop {
  id?: number;
  name: string;
  route: number;
  lat: number;
  lng: number;
  sequence_number: number;
  estimated_arrival_time: string;
  is_pickup: boolean;
  is_dropoff: boolean;
}

interface RoutesState {
  routes: Route[];
  loading: boolean;
  error: string | null;
}

const initialState: RoutesState = {
  routes: [],
  loading: false,
  error: null,
};

export const addRoute = createAsyncThunk<
  Route,
  Omit<Route, "id">,
  { rejectValue: string }
>("routes/addRoute", async (routeData, { rejectWithValue }) => {
  try {
    const schoolId = routeData.school;
    const response = await api.post(
      `${API_ENDPOINTS.ROUTES}${schoolId}/routes/`,
      routeData
    );
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    // Return the original error data structure to preserve field-specific errors
    return rejectWithValue(
      JSON.stringify(
        axiosError.response?.data || { message: "Failed to add route" }
      )
    );
  }
});

export const fetchRoutes = createAsyncThunk<
  Route[],
  { schoolId?: number } | void,
  { rejectValue: string }
>("routes/fetchRoutes", async (params, { rejectWithValue }) => {
  try {
    const schoolId = typeof params === "object" ? params.schoolId : undefined;

    if (!schoolId) {
      throw new Error("School ID is required");
    }

    const url = `${API_ENDPOINTS.ROUTES}${schoolId}/routes/`;
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
      axiosError.response?.data?.message || "Failed to fetch routes"
    );
  }
});

export const deleteRoute = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("routes/deleteRoute", async (id, { rejectWithValue }) => {
  try {
    console.log(`Deleting route ${id}`);
    // Use the direct route deletion endpoint
    await api.delete(`/api/routes/${id}/`);
    console.log("Route deleted successfully");
    return id;
  } catch (error) {
    console.error("Error deleting route:", error);
    if (error instanceof AxiosError) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete route"
      );
    }
    return rejectWithValue("Failed to delete route");
  }
});

export const updateRoute = createAsyncThunk<
  Route,
  { id: number; routeData: Omit<Route, "id"> },
  { rejectValue: string }
>("routes/updateRoute", async ({ id, routeData }, { rejectWithValue }) => {
  try {
    const schoolId = routeData.school;
    const response = await api.put(
      `${API_ENDPOINTS.ROUTES}${schoolId}/routes/${id}/`,
      routeData
    );
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(
      JSON.stringify(
        axiosError.response?.data || { message: "Failed to update route" }
      )
    );
  }
});

export const addRouteStop = createAsyncThunk<
  RouteStop,
  Omit<RouteStop, "id">,
  { rejectValue: string }
>("routes/addRouteStop", async (stopData, { rejectWithValue }) => {
  try {
    const response = await api.post(
      `/api/routes/${stopData.route}/stops/`,
      stopData
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(
      JSON.stringify(
        axiosError.response?.data || { message: "Failed to add route stop" }
      )
    );
  }
});

export const fetchRouteStops = createAsyncThunk<
  RouteStop[],
  number,
  { rejectValue: string }
>("routes/fetchRouteStops", async (routeId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/routes/${routeId}/stops/`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(
      axiosError.response?.data?.message || "Failed to fetch route stops"
    );
  }
});

const routesSlice = createSlice({
  name: "routes",
  initialState,
  reducers: {
    clearRoutesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Route
      .addCase(addRoute.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addRoute.fulfilled, (state, action) => {
        state.loading = false;
        state.routes.push(action.payload);
      })
      .addCase(addRoute.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to add route";
      })
      // Fetch Routes
      .addCase(fetchRoutes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoutes.fulfilled, (state, action) => {
        state.loading = false;
        state.routes = action.payload;
      })
      .addCase(fetchRoutes.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch routes";
      })
      // Delete Route
      .addCase(deleteRoute.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRoute.fulfilled, (state, action) => {
        state.loading = false;
        state.routes = state.routes.filter(
          (route) => route.id !== action.payload
        );
      })
      .addCase(deleteRoute.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to delete route";
      })
      // Update Route
      .addCase(updateRoute.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRoute.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.routes.findIndex(
          (route) => route.id === action.payload.id
        );
        if (index !== -1) {
          state.routes[index] = action.payload;
        }
      })
      .addCase(updateRoute.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to update route";
      })
      // Add Route Stop
      .addCase(addRouteStop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addRouteStop.fulfilled, (state, action) => {
        state.loading = false;
        // Note: Route stops are managed separately, so we don't update the routes array
        // The route stops will be fetched separately when needed
      })
      .addCase(addRouteStop.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to add route stop";
      })
      // Fetch Route Stops
      .addCase(fetchRouteStops.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRouteStops.fulfilled, (state, action) => {
        state.loading = false;
        // Route stops are managed separately, so we don't update the routes array
        // The route stops will be stored in a separate state if needed
      })
      .addCase(fetchRouteStops.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to fetch route stops";
      });
  },
});

export const { clearRoutesError } = routesSlice.actions;
export default routesSlice.reducer;
