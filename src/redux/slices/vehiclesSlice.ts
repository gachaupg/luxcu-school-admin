import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/config/api";
import { API_ENDPOINTS } from "@/utils/api";
import { AxiosError } from "axios";
import { store } from "@/redux/store";

export interface Vehicle {
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

    console.log("Fetching vehicles from URL:", url);
    const response = await api.get(url);
    console.log("Vehicles response:", response.data);

    // Check if the response has the expected structure
    if (Array.isArray(response.data)) {
      console.log(
        "Vehicles data is an array with",
        response.data.length,
        "items"
      );
      // Validate each vehicle has required fields
      const validatedVehicles = response.data.filter((vehicle) => {
        if (!vehicle || typeof vehicle !== "object") {
          console.warn("Invalid vehicle data:", vehicle);
          return false;
        }
        return true;
      });
      console.log("Validated vehicles:", validatedVehicles);
      return validatedVehicles;
    } else if (
      response.data &&
      response.data.data &&
      Array.isArray(response.data.data)
    ) {
      console.log("Vehicles data is nested in data.data");
      return response.data.data;
    } else {
      console.log("Unexpected vehicles response structure:", response.data);
      return [];
    }
  } catch (error: unknown) {
    console.error("Error fetching vehicles:", error);
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
    // Return the original error data structure to preserve field-specific errors
    return rejectWithValue(
      JSON.stringify(
        apiError.response?.data || { message: "Failed to add vehicle" }
      )
    );
  }
});

export const deleteVehicle = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("vehicles/deleteVehicle", async (id, { rejectWithValue }) => {
  try {
    console.log(`Deleting vehicle ${id}`);
    console.log(`API URL: ${API_ENDPOINTS.VEHICLES}${id}/`);

    // Get the current auth token for debugging
    const state = store.getState();
    const token = state.auth.token;
    console.log("Auth token present:", !!token);

    const response = await api.delete(`${API_ENDPOINTS.VEHICLES}${id}/`);
    console.log("Delete response:", response);
    console.log("Vehicle deleted successfully");
    return id;
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      response:
        error instanceof AxiosError ? error.response : "Not an Axios error",
      status:
        error instanceof AxiosError ? error.response?.status : "No status",
      data: error instanceof AxiosError ? error.response?.data : "No data",
    });

    if (error instanceof AxiosError) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete vehicle"
      );
    }
    return rejectWithValue("Failed to delete vehicle");
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
      })
      // Delete Vehicle
      .addCase(deleteVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = state.vehicles.filter(
          (vehicle) => vehicle.id !== action.payload
        );
      })
      .addCase(deleteVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to delete vehicle";
      });
  },
});

export const { clearVehiclesError } = vehiclesSlice.actions;
export default vehiclesSlice.reducer;
