import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/config/api";
import { API_ENDPOINTS } from "@/utils/api";
import { AxiosError } from "axios";

export interface Report {
  id: number;
  trip: number;
  trip_route: string | null;
  school_name: string | null;
  is_complete: boolean;
  is_archived: boolean;
  students_picked_up: number;
  students_dropped_off: number;
  total_students: number;
  no_show_students: number;
  efficiency_score: number;
  on_time_pickups: number;
  on_time_dropoffs: number;
  emergency_incidents: number;
  max_speed: number;
  avg_speed?: number;
  route_deviation_distance: number;
  actual_duration: string;
  actual_duration_str: string;
  scheduled_duration: string;
  scheduled_duration_str: string;
  average_pickup_delay: string;
  average_dropoff_delay: string;
  idle_time: string;
  traffic_conditions: string;
  weather_conditions: string;
  generated_at: string;
  updated_at: string;
}

export interface ReportsMetrics {
  summary: {
    total_reports: number;
    completed_reports: number;
    completion_rate: number;
    archived_reports: number;
  };
  students: {
    total_planned: number;
    total_picked_up: number;
    total_dropped_off: number;
    total_no_shows: number;
    pickup_rate: number;
    dropoff_rate: number;
  };
  performance: {
    avg_efficiency_score: number;
    on_time_pickup_rate: number;
    on_time_dropoff_rate: number;
    duration_efficiency: number;
  };
  safety: {
    total_emergencies: number;
    reports_with_emergencies: number;
    emergency_rate: number;
  };
  operations: {
    avg_scheduled_duration: number | null;
    avg_actual_duration: number | null;
    max_speed_recorded: number | null;
    avg_max_speed: number | null;
    avg_route_deviation_meters: number | null;
  };
}

export interface ReportsPagination {
  current_page: number;
  total_pages: number;
  total_reports: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
  next_page: number | null;
  previous_page: number | null;
}

export interface ReportsFilters {
  school_id?: number;
  start_date?: string;
  end_date?: string;
  driver_id?: number;
  route_id?: number;
  status?: string;
  page?: number;
}

export interface ReportsResponse {
  school: {
    id: number | null;
    name: string;
  };
  filters_applied: ReportsFilters;
  metrics: ReportsMetrics;
  pagination: ReportsPagination;
  results: Report[];
}

interface ReportsState {
  reports: Report[];
  metrics: ReportsMetrics | null;
  pagination: ReportsPagination | null;
  filters: ReportsFilters;
  loading: boolean;
  error: string | null;
}

const initialState: ReportsState = {
  reports: [],
  metrics: null,
  pagination: null,
  filters: {},
  loading: false,
  error: null,
};

export const fetchReports = createAsyncThunk<
  ReportsResponse,
  ReportsFilters,
  { rejectValue: string }
>("reports/fetchReports", async (filters, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();

    if (filters.school_id) {
      params.append("school_id", filters.school_id.toString());
    }
    if (filters.start_date) {
      params.append("start_date", filters.start_date);
    }
    if (filters.end_date) {
      params.append("end_date", filters.end_date);
    }
    if (filters.driver_id) {
      params.append("driver_id", filters.driver_id.toString());
    }
    if (filters.route_id) {
      params.append("route_id", filters.route_id.toString());
    }
    if (filters.status) {
      params.append("status", filters.status);
    }
    if (filters.page) {
      params.append("page", filters.page.toString());
    }

    const url = `${API_ENDPOINTS.REPORTS}?${params.toString()}`;
    const response = await api.get(url);

    console.log("Raw reports response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching reports:", error);
    const errorMessage =
      error instanceof AxiosError
        ? error.response?.data?.message || error.message
        : "Failed to fetch reports";
    return rejectWithValue(errorMessage);
  }
});

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    clearReports: (state) => {
      state.reports = [];
      state.metrics = null;
      state.pagination = null;
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload.results;
        state.metrics = action.payload.metrics;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch reports";
      });
  },
});

export const { clearReports, setFilters, clearFilters } = reportsSlice.actions;
export default reportsSlice.reducer;
