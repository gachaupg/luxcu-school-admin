import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/config/api";
import { API_ENDPOINTS } from "@/utils/api";
import { AxiosError } from "axios";

export interface Route {
  id?: number;
  name: string;
  school: number;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  total_distance: number;
  estimated_duration: string;
  is_active: boolean;
  schedule_days: string[];
  traffic_factor: number;
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
    const response = await api.post(API_ENDPOINTS.ROUTES, routeData);
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(
      axiosError.response?.data?.message || "Failed to add route"
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
    let url = API_ENDPOINTS.ROUTES;

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
      axiosError.response?.data?.message || "Failed to fetch routes"
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
      });
  },
});

export const { clearRoutesError } = routesSlice.actions;
export default routesSlice.reducer;
