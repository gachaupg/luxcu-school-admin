import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/config/api";
import { API_ENDPOINTS } from "@/utils/api";

interface Vehicle {
  id?: number;
  registration_number: string;
  vehicle_type: string;
  capacity: number;
  school: number;
  driver: number;
  manufacturer: string;
  model: string;
  year: number;
  fuel_type: string;
  is_active: boolean;
  mileage: number;
  has_gps: boolean;
  has_camera: boolean;
  has_emergency_button: boolean;
}

interface VehiclesState {
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
}

const initialState: VehiclesState = {
  vehicles: [],
  loading: false,
  error: null,
};

export const fetchVehicles = createAsyncThunk<
  Vehicle[],
  { schoolId?: number } | void,
  { rejectValue: string }
>("vehicles/fetchVehicles", async (params, { rejectWithValue }) => {
  try {
    const schoolId = typeof params === "object" ? params.schoolId : undefined;
    let url = API_ENDPOINTS.VEHICLES;

    if (schoolId) {
      url += `?school=${schoolId}`;
    }

    const response = await api.get(url);
    return response.data;
  } catch (error: unknown) {
    const apiError = error as {
      response?: { data?: { message?: string }; status?: number };
    };
    return rejectWithValue(
      apiError.response?.data?.message || "Failed to fetch vehicles"
    );
  }
});

export const addVehicle = createAsyncThunk<
  Vehicle,
  Vehicle,
  { rejectValue: string }
>("vehicles/addVehicle", async (vehicle, { rejectWithValue }) => {
  try {
    const response = await api.post(API_ENDPOINTS.VEHICLES, vehicle);
    return response.data;
  } catch (error: unknown) {
    const apiError = error as {
      response?: { data?: { message?: string }; status?: number };
    };
    return rejectWithValue(
      apiError.response?.data?.message || "Failed to add vehicle"
    );
  }
});

const vehiclesSlice = createSlice({
  name: "vehicles",
  initialState,
  reducers: {
    clearVehiclesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Vehicles
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = action.payload;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch vehicles";
      })
      // Add Vehicle
      .addCase(addVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles.push(action.payload);
      })
      .addCase(addVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to add vehicle";
      });
  },
});

export const { clearVehiclesError } = vehiclesSlice.actions;
export default vehiclesSlice.reducer;
