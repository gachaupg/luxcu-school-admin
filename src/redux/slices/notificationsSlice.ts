import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/config/api";
import { API_ENDPOINTS } from "@/utils/api";
import { AxiosError } from "axios";
import { store } from "@/redux/store";

export interface NotificationPayload {
  parent?: number;
  student?: number;
  trip?: number;
  type: "emergency" | "info" | "warning" | "success";
  message: string;
  expires_at?: string;
}

export interface Notification {
  id?: number;
  description: string;
  payload: NotificationPayload;
  created_at?: string;
  updated_at?: string;
  is_read?: boolean;
  is_sent?: boolean;
  school?: number;
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
      console.log("Creating notification with data:", notificationData);

      // Debug token availability
      console.log("Auth token available:", !!localStorage.getItem("token"));
      let token = localStorage.getItem("token");

      if (!token) {
        // Try to get from persist:auth
        const persistAuth = localStorage.getItem("persist:auth");
        if (persistAuth) {
          try {
            const authData = JSON.parse(persistAuth);
            const userData = JSON.parse(authData.user || "{}");
            token = userData.token;
            console.log("Token from persist:auth:", !!token);
          } catch (e) {
            console.log("Error parsing persist:auth:", e);
          }
        }
      }

      if (token) {
        console.log("Token preview:", token.substring(0, 20) + "...");
        // Handle double-stringified token from Redux Persist
        if (token.startsWith('"') && token.endsWith('"')) {
          token = JSON.parse(token);
        }
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } else {
        console.log("No token found, request will be made without auth");
      }

      // Ensure school ID is included
      const schoolId = localStorage.getItem("schoolId");
      const notificationDataWithSchool = {
        ...notificationData,
        school: notificationData.school || parseInt(schoolId || "0"),
      };

      console.log("Notification data with school:", notificationDataWithSchool);

      // Create request config with auth header
      const requestConfig = {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      };

      const response = await api.post(
        API_ENDPOINTS.NOTIFICATIONS_CREATE,
        notificationDataWithSchool,
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
    console.log("Auth token available:", !!localStorage.getItem("token"));
    let token = localStorage.getItem("token");

    if (!token) {
      // Try to get from persist:auth
      const persistAuth = localStorage.getItem("persist:auth");
      if (persistAuth) {
        try {
          const authData = JSON.parse(persistAuth);
          const userData = JSON.parse(authData.user || "{}");
          token = userData.token;
          console.log("Token from persist:auth:", !!token);
        } catch (e) {
          console.log("Error parsing persist:auth:", e);
        }
      }
    }

    if (token) {
      console.log("Token preview:", token.substring(0, 20) + "...");
      // Handle double-stringified token from Redux Persist
      if (token.startsWith('"') && token.endsWith('"')) {
        token = JSON.parse(token);
      }
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      console.log("No token found, request will be made without auth");
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
    console.log("Raw notifications response:", response.data);

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

    console.log("Final notifications data to return:", notificationsData);
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
        console.log("fetchNotifications.fulfilled - payload:", action.payload);
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
