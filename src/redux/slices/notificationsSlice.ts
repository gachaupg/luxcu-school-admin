import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/config/api";
import { API_ENDPOINTS } from "@/utils/api";
import { AxiosError } from "axios";
import { store } from "@/redux/store";

export interface NotificationPayload {
  parent?: number;
  student?: number;
  trip?: number;
  type:
    | "emergency"
    | "info"
    | "warning"
    | "success"
    | "ACTION_REQUIRED"
    | "SYSTEM";
  message: string;
  expires_at?: string;
}

export interface Notification {
  id?: number;
  alert_type: string; // e.g., "attendance_alert", "weather_alert", "traffic_delay"
  severity: "low" | "medium" | "high";
  title: string;
  message: string;
  description?: string;
  student_id?: number;
  trip_id?: number;
  recipients: number[]; // Array of user IDs (parents, drivers, staff, etc.)
  requires_immediate_action?: boolean;
  metadata?: Record<string, any>;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  address?: string;
  created_at?: string;
  updated_at?: string;
  is_read?: boolean;
  school?: number;
  // Legacy fields for backward compatibility
  notification_type?:
    | "ACTION_REQUIRED"
    | "SYSTEM"
    | "INFO"
    | "WARNING"
    | "EMERGENCY";
  parents?: number[];
  drivers?: number[];
  admins?: number[];
  description_legacy?: string;
  payload?: NotificationPayload;
  is_sent?: boolean;
  school_name?: string;
}

interface NotificationsState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  loading: false,
  error: null,
};

export const createNotification = createAsyncThunk<
  Notification,
  Omit<Notification, "id">,
  { rejectValue: string }
>(
  "notifications/createNotification",
  async (notificationData, { rejectWithValue }) => {
    try {

      // Debug token availability
      let token = localStorage.getItem("token");

      if (!token) {
        // Try to get from persist:auth
        const persistAuth = localStorage.getItem("persist:auth");
        if (persistAuth) {
          try {
            const authData = JSON.parse(persistAuth);
            const userData = JSON.parse(authData.user || "{}");
            token = userData.token;
          } catch (e) {
          }
        }
      }

      if (token) {
        // Handle double-stringified token from Redux Persist
        if (token.startsWith('"') && token.endsWith('"')) {
          token = JSON.parse(token);
        }
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } else {
       
      }

      // Ensure school ID is included
      const schoolId = localStorage.getItem("schoolId");

      // Prepare alert data based on the new structure
      const alertData = {
        alert_type: notificationData.alert_type,
        severity: notificationData.severity,
        title: notificationData.title,
        message: notificationData.message,
        description: notificationData.description,
        student_id: notificationData.student_id,
        trip_id: notificationData.trip_id,
        recipients: notificationData.recipients || [],
        requires_immediate_action: notificationData.requires_immediate_action || false,
        metadata: notificationData.metadata || {},
        location: notificationData.location,
        address: notificationData.address,
      };

      // Remove undefined fields
      Object.keys(alertData).forEach(key => {
        if (alertData[key] === undefined) {
          delete alertData[key];
        }
      });

      // Create request config with auth header
      const requestConfig = {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      };

      const response = await api.post(
        API_ENDPOINTS.NOTIFICATIONS_CREATE,
        alertData,
        requestConfig
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to create notification"
        );
      }
      return rejectWithValue("Failed to create notification");
    }
  }
);

export const fetchNotifications = createAsyncThunk<
  Notification[],
  { schoolId?: number } | void,
  { rejectValue: string }
>("notifications/fetchNotifications", async (params, { rejectWithValue }) => {
  try {
    // Debug token availability
    let token = localStorage.getItem("token");

    if (!token) {
      // Try to get from persist:auth
      const persistAuth = localStorage.getItem("persist:auth");
      if (persistAuth) {
        try {
          const authData = JSON.parse(persistAuth);
          const userData = JSON.parse(authData.user || "{}");
          token = userData.token;
        } catch (e) {
        }
      }
    }

    if (token) {
      // Handle double-stringified token from Redux Persist
      if (token.startsWith('"') && token.endsWith('"')) {
        token = JSON.parse(token);
      }
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
    }

    const schoolId = typeof params === "object" ? params.schoolId : undefined;
    let url = API_ENDPOINTS.NOTIFICATIONS;

    if (schoolId) {
      url += `?school=${schoolId}`;
    }

    // Create request config with auth header
    const requestConfig = {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    };

    const response = await api.get(url, requestConfig);

    // Handle paginated response structure
    let notificationsData;
    if (response.data && response.data.results) {
      // Paginated response: { count, next, previous, results: [...] }
      notificationsData = response.data.results;
    } else if (response.data && Array.isArray(response.data)) {
      // Direct array response
      notificationsData = response.data;
    } else if (
      response.data &&
      response.data.data &&
      Array.isArray(response.data.data)
    ) {
      // Nested data response
      notificationsData = response.data.data;
    } else {
      notificationsData = [];
    }

    return notificationsData;
  } catch (error) {
    if (error instanceof AxiosError) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch notifications"
      );
    }
    return rejectWithValue("Failed to fetch notifications");
  }
});

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearNotificationsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Notification
      .addCase(createNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNotification.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications.unshift(action.payload); // Add to beginning of list
      })
      .addCase(createNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create notification";
      })
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch notifications";
      });
  },
});

export const { clearNotificationsError } = notificationsSlice.actions;
export default notificationsSlice.reducer;
