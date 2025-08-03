import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/config/api";

// Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  base_price: string;
  price_per_student: string;
  price_per_bus: string;
  features_json: {
    max_students: number;
    max_parents: number;
    max_buses: number;
    sms_notifications: boolean;
    whatsapp_integration: boolean;
    realtime_tracking: boolean;
    parent_app_access: boolean;
    basic_reports: boolean;
    driver_management: boolean;
    route_optimization: boolean;
    advanced_analytics: boolean;
    api_access: boolean;
  };
  is_active: boolean;
  default_billing_cycle: string;
}

interface SubscriptionState {
  plans: SubscriptionPlan[];
  loading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  plans: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchSubscriptionPlans = createAsyncThunk(
  "subscription/fetchPlans",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("subscription-plans/");
      // Ensure we return an array even if the API returns a different structure
      const plans = Array.isArray(response.data)
        ? response.data
        : response.data?.results || response.data?.data || [];
      return plans;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch subscription plans";
      return rejectWithValue(errorMessage);
    }
  }
);

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    clearSubscription: (state) => {
      state.plans = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Subscription Plans
      .addCase(fetchSubscriptionPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload;
      })
      .addCase(fetchSubscriptionPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSubscription } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
