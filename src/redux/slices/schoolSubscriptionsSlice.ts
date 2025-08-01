import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_ENDPOINTS } from "@/utils/api";
import { apiRequestWithRetry } from "@/utils/api";

export interface SchoolSubscription {
  id: string;
  school: number;
  school_name: string;
  plan: string;
  plan_name: string;
  price_charged: string;
  billing_cycle: "monthly" | "annually";
  start_date: string;
  end_date: string | null;
  next_billing_date: string | null;
  status: "pending" | "active" | "cancelled" | "expired";
  external_subscription_id: string | null;
  payment_method_last4: string | null;
  current_students_count: number;
  current_buses_count: number;
  current_parents_count: number;
  managed_by: number;
  calculated_cost: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSchoolSubscriptionData {
  school: number;
  plan: string;
  billing_cycle: "monthly" | "annually";
  start_date: string;
}

export interface UpdateSchoolSubscriptionData {
  status?: "pending" | "active" | "cancelled" | "expired";
  end_date?: string;
  next_billing_date?: string;
}

interface SchoolSubscriptionsState {
  subscriptions: SchoolSubscription[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
}

const initialState: SchoolSubscriptionsState = {
  subscriptions: [],
  loading: false,
  error: null,
  creating: false,
  updating: false,
};

// Async thunks
export const fetchSchoolSubscriptions = createAsyncThunk(
  "schoolSubscriptions/fetchSchoolSubscriptions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequestWithRetry(
        `${API_ENDPOINTS.SCHOOL_SUBSCRIPTIONS}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle throttling/rate limiting
        if (
          response.status === 429 ||
          errorData.detail?.includes("throttled")
        ) {
          const retryAfter =
            errorData.detail?.match(/(\d+) seconds?/)?.[1] || 20;
          throw new Error(
            `Rate limited. Please wait ${retryAfter} seconds before trying again.`
          );
        }

        // Handle other errors
        if (errorData.message) {
          throw new Error(errorData.message);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();
      console.log("School subscriptions API response:", data);

      return data.data || data;
    } catch (error) {
      console.error("Error fetching school subscriptions:", error);
      return rejectWithValue("Failed to fetch school subscriptions");
    }
  }
);

export const fetchSchoolSubscriptionById = createAsyncThunk(
  "schoolSubscriptions/fetchSchoolSubscriptionById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.SCHOOL_SUBSCRIPTIONS}/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Error fetching school subscription:", error);
      return rejectWithValue("Failed to fetch school subscription");
    }
  }
);

export const createSchoolSubscription = createAsyncThunk(
  "schoolSubscriptions/createSchoolSubscription",
  async (
    subscriptionData: CreateSchoolSubscriptionData,
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.SCHOOL_SUBSCRIPTIONS}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(subscriptionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create subscription");
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Error creating school subscription:", error);
      return rejectWithValue("Failed to create school subscription");
    }
  }
);

export const updateSchoolSubscription = createAsyncThunk(
  "schoolSubscriptions/updateSchoolSubscription",
  async (
    {
      id,
      updateData,
    }: { id: string; updateData: UpdateSchoolSubscriptionData },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.SCHOOL_SUBSCRIPTIONS}${id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update subscription");
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Error updating school subscription:", error);
      return rejectWithValue("Failed to update school subscription");
    }
  }
);

const schoolSubscriptionsSlice = createSlice({
  name: "schoolSubscriptions",
  initialState,
  reducers: {
    clearSchoolSubscriptionsError: (state) => {
      state.error = null;
    },
    clearSchoolSubscriptions: (state) => {
      state.subscriptions = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch school subscriptions
    builder
      .addCase(fetchSchoolSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchoolSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions = action.payload;
        state.error = null;
      })
      .addCase(fetchSchoolSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch school subscription by ID
    builder
      .addCase(fetchSchoolSubscriptionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchoolSubscriptionById.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.subscriptions.findIndex(
          (sub) => sub.id === action.payload.id
        );
        if (index !== -1) {
          state.subscriptions[index] = action.payload;
        } else {
          state.subscriptions.unshift(action.payload);
        }
        state.error = null;
      })
      .addCase(fetchSchoolSubscriptionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create school subscription
    builder
      .addCase(createSchoolSubscription.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createSchoolSubscription.fulfilled, (state, action) => {
        state.creating = false;
        state.subscriptions.unshift(action.payload);
        state.error = null;
      })
      .addCase(createSchoolSubscription.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      });

    // Update school subscription
    builder
      .addCase(updateSchoolSubscription.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateSchoolSubscription.fulfilled, (state, action) => {
        state.updating = false;
        const index = state.subscriptions.findIndex(
          (sub) => sub.id === action.payload.id
        );
        if (index !== -1) {
          state.subscriptions[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateSchoolSubscription.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSchoolSubscriptionsError, clearSchoolSubscriptions } =
  schoolSubscriptionsSlice.actions;

export default schoolSubscriptionsSlice.reducer;
