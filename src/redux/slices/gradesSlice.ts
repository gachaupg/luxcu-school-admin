import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/config/api";
import { API_ENDPOINTS } from "@/utils/api";
import { AxiosError } from "axios";

export interface Grade {
  id?: number;
  name: string;
  level: string;
  school: number;
  description: string;
  capacity: number;
}

interface GradesState {
  grades: Grade[];
  loading: boolean;
  error: string | null;
}

const initialState: GradesState = {
  grades: [],
  loading: false,
  error: null,
};

export const createGrade = createAsyncThunk<
  Grade,
  Omit<Grade, "id">,
  { rejectValue: string }
>("grades/createGrade", async (gradeData, { rejectWithValue }) => {
  try {
    const response = await api.post(API_ENDPOINTS.GRADES, gradeData);
    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create grade"
      );
    }
    return rejectWithValue("Failed to create grade");
  }
});

export const fetchGrades = createAsyncThunk<
  Grade[],
  { schoolId?: number } | void,
  { rejectValue: string }
>("grades/fetchGrades", async (params, { rejectWithValue }) => {
  try {
    const schoolId = typeof params === "object" ? params.schoolId : undefined;
    let url = API_ENDPOINTS.GRADES;

    if (schoolId) {
      url += `?school=${schoolId}`;
    }

    console.log("Fetching grades from:", url);
    const response = await api.get(url);
    console.log("Grades API response:", response.data);

    // Handle different possible response structures
    let gradesData;
    if (response.data && typeof response.data === "object") {
      if (Array.isArray(response.data)) {
        gradesData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        gradesData = response.data.data;
      } else if (
        response.data.results &&
        Array.isArray(response.data.results)
      ) {
        gradesData = response.data.results;
      } else {
        gradesData = [];
      }
    } else {
      gradesData = [];
    }

    console.log("Final grades data to return:", gradesData);
    console.log("Grades data type:", typeof gradesData);
    console.log("Grades data is array:", Array.isArray(gradesData));

    return gradesData;
  } catch (error) {
    console.error("Error fetching grades:", error);
    if (error instanceof AxiosError) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch grades"
      );
    }
    return rejectWithValue("Failed to fetch grades");
  }
});

export const updateGrade = createAsyncThunk<
  Grade,
  { id: number; data: Partial<Grade> },
  { rejectValue: string }
>("grades/updateGrade", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`${API_ENDPOINTS.GRADES}${id}/`, data);
    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update grade"
      );
    }
    return rejectWithValue("Failed to update grade");
  }
});

export const deleteGrade = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("grades/deleteGrade", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`${API_ENDPOINTS.GRADES}${id}/`);
    return id;
  } catch (error) {
    if (error instanceof AxiosError) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete grade"
      );
    }
    return rejectWithValue("Failed to delete grade");
  }
});

const gradesSlice = createSlice({
  name: "grades",
  initialState,
  reducers: {
    clearGradesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Grade
      .addCase(createGrade.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGrade.fulfilled, (state, action) => {
        state.loading = false;
        state.grades.push(action.payload);
      })
      .addCase(createGrade.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create grade";
      })
      // Fetch Grades
      .addCase(fetchGrades.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGrades.fulfilled, (state, action) => {
        console.log("fetchGrades.fulfilled - payload:", action.payload);
        console.log(
          "fetchGrades.fulfilled - payload type:",
          typeof action.payload
        );
        console.log(
          "fetchGrades.fulfilled - is array:",
          Array.isArray(action.payload)
        );
        state.loading = false;
        state.grades = Array.isArray(action.payload) ? action.payload : [];
        console.log(
          "fetchGrades.fulfilled - state.grades after update:",
          state.grades
        );
      })
      .addCase(fetchGrades.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch grades";
      })
      // Update Grade
      .addCase(updateGrade.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGrade.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.grades.findIndex((g) => g.id === action.payload.id);
        if (index !== -1) {
          state.grades[index] = action.payload;
        }
      })
      .addCase(updateGrade.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update grade";
      })
      // Delete Grade
      .addCase(deleteGrade.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGrade.fulfilled, (state, action) => {
        state.loading = false;
        state.grades = state.grades.filter((g) => g.id !== action.payload);
      })
      .addCase(deleteGrade.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete grade";
      });
  },
});

export const { clearGradesError } = gradesSlice.actions;
export default gradesSlice.reducer;
