import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/config/api";
import { API_ENDPOINTS } from "@/utils/api";
import { AxiosError } from "axios";

export interface Driver {
  id: number;
  user_details: {
    id?: number;
    phone_number: string;
    user_type: string;
    email: string;
    first_name: string;
    last_name: string;
    username?: string;
    profile_image?: string | null;
  };
  license_number: string;
  license_expiry: string;
  license_class: string;
  school: number;
  is_available: boolean;
  current_location:
    | {
        latitude: number;
        longitude: number;
      }
    | string;
  safety_rating: number;
  on_time_rating: number;
  last_health_check: string;
  last_background_check: string;
}

// Interface for creating a driver (API expects user_data)
export interface CreateDriverData {
  user_data: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    password: string;
    confirm_password: string;
    user_type: string;
    profile_image?: string | null;
  };
  license_number: string;
  license_expiry: string;
  license_class: string;
  school: number;
  is_available: boolean;
  current_location: {
    latitude: number;
    longitude: number;
  };
  safety_rating: number;
  on_time_rating: number;
  last_health_check: string;
  last_background_check: string;
}

interface DriversState {
  drivers: Driver[];
  loading: boolean;
  error: string | null;
}

const initialState: DriversState = {
  drivers: [],
  loading: false,
  error: null,
};

export const addDriver = createAsyncThunk<
  Driver,
  CreateDriverData,
  { rejectValue: string }
>("drivers/addDriver", async (driverData, { rejectWithValue }) => {
  try {
    console.log("Sending driver data:", driverData);
    const response = await api.post(API_ENDPOINTS.DRIVERS, driverData);
    console.log("Add driver response:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("Add driver error:", error);
    const axiosError = error as AxiosError<{ message: string }>;
    // Return the original error data structure to preserve field-specific errors
    return rejectWithValue(
      JSON.stringify(
        axiosError.response?.data || { message: "Failed to add driver" }
      )
    );
  }
});

export const fetchDrivers = createAsyncThunk<
  Driver[],
  void,
  { rejectValue: string }
>("drivers/fetchDrivers", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get(API_ENDPOINTS.DRIVERS);
    console.log("API Response:", response.data);
    console.log("Response data type:", typeof response.data);
    console.log("Is array:", Array.isArray(response.data));

    if (Array.isArray(response.data)) {
      console.log("Returning array directly:", response.data);
      return response.data;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      console.log("Returning data.data array:", response.data.data);
      return response.data.data;
    } else {
      console.error("Invalid response format:", response.data);
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Error fetching drivers:", error);
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(
      axiosError.response?.data?.message || "Failed to fetch drivers"
    );
  }
});

export const deleteDriver = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("drivers/deleteDriver", async (id, { rejectWithValue }) => {
  try {
    console.log(`Deleting driver ${id}`);
    await api.delete(`${API_ENDPOINTS.DRIVERS}${id}/`);
    console.log("Driver deleted successfully");
    return id;
  } catch (error) {
    console.error("Error deleting driver:", error);
    if (error instanceof AxiosError) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete driver"
      );
    }
    return rejectWithValue("Failed to delete driver");
  }
});

const driversSlice = createSlice({
  name: "drivers",
  initialState,
  reducers: {
    clearDriversError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Driver
      .addCase(addDriver.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addDriver.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers.push(action.payload);
      })
      .addCase(addDriver.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to add driver";
      })
      // Fetch Drivers
      .addCase(fetchDrivers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers = action.payload;
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch drivers";
      })
      // Delete Driver
      .addCase(deleteDriver.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDriver.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers = state.drivers.filter(
          (driver) => driver.id !== action.payload
        );
      })
      .addCase(deleteDriver.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete driver";
      });
  },
});

export const { clearDriversError } = driversSlice.actions;
export default driversSlice.reducer;
