import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/config/api";
import { API_ENDPOINTS } from "@/utils/api";
import { AxiosError } from "axios";

export interface Student {
  id?: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  date_of_birth: string;
  school: number;
  parent: number;
  admission_number: string;
  grade: number;
  gender: string;
  section: string;
  medical_conditions: string;
  emergency_contacts: Array<{
    name: string;
    phone: string;
  }>;
  transport_enabled: boolean;
}

interface StudentsState {
  students: Student[];
  loading: boolean;
  error: string | null;
}

const initialState: StudentsState = {
  students: [],
  loading: false,
  error: null,
};

export const createStudent = createAsyncThunk<
  Student,
  Omit<Student, "id">,
  { rejectValue: string }
>("students/createStudent", async (studentData, { rejectWithValue }) => {
  try {
    const response = await api.post(API_ENDPOINTS.STUDENTS, studentData);

    // Handle different response structures
    const createdStudent = response.data?.data || response.data;

    // Validate that we have a proper student object
    if (!createdStudent || typeof createdStudent !== "object") {
      return rejectWithValue("Invalid student data received from server");
    }

    // Ensure required fields are present
    if (!createdStudent.first_name || !createdStudent.last_name) {
      return rejectWithValue("Student data missing required fields");
    }

    return createdStudent;
  } catch (error) {
    if (error instanceof AxiosError) {
      // Return the original error data structure to preserve field-specific errors
      return rejectWithValue(
        JSON.stringify(
          error.response?.data || { message: "Failed to create student" }
        )
      );
    }
    return rejectWithValue("Failed to create student");
  }
});

export const fetchStudents = createAsyncThunk<
  Student[],
  { schoolId?: number } | void,
  { rejectValue: string }
>("students/fetchStudents", async (params, { rejectWithValue }) => {
  try {
    const schoolId = typeof params === "object" ? params.schoolId : undefined;
    let url = API_ENDPOINTS.STUDENTS;

    if (schoolId) {
      url += `?school=${schoolId}`;
    }

    const response = await api.get(url);

    // Check if response.data.data exists, otherwise use response.data
    const studentsData = response.data?.data || response.data;

    // Ensure we always return an array
    if (!Array.isArray(studentsData)) {
      return [];
    }

    return studentsData;
  } catch (error) {
    if (error instanceof AxiosError) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch students"
      );
    }
    return rejectWithValue("Failed to fetch students");
  }
});

export const updateStudent = createAsyncThunk<
  Student,
  { id: number; data: Partial<Student> },
  { rejectValue: string }
>("students/updateStudent", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`${API_ENDPOINTS.STUDENTS}${id}/`, data);

    // Handle different response structures
    const updatedStudent = response.data?.data || response.data;

    // Validate that we have a proper student object
    if (!updatedStudent || typeof updatedStudent !== "object") {
      return rejectWithValue("Invalid student data received from server");
    }

    return updatedStudent;
  } catch (error) {
    if (error instanceof AxiosError) {
      // Return the original error data structure to preserve field-specific errors
      return rejectWithValue(
        JSON.stringify(
          error.response?.data || { message: "Failed to update student" }
        )
      );
    }
    return rejectWithValue("Failed to update student");
  }
});

export const deleteStudent = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("students/deleteStudent", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`${API_ENDPOINTS.STUDENTS}${id}/`);
    return id;
  } catch (error) {
    if (error instanceof AxiosError) {
      // Return the original error data structure to preserve field-specific errors
      return rejectWithValue(
        JSON.stringify(
          error.response?.data || { message: "Failed to delete student" }
        )
      );
    }
    return rejectWithValue("Failed to delete student");
  }
});

const studentsSlice = createSlice({
  name: "students",
  initialState,
  reducers: {
    clearStudentsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Student
      .addCase(createStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStudent.fulfilled, (state, action) => {
        state.loading = false;

        // Validate payload before adding to state
        if (
          action.payload &&
          typeof action.payload === "object" &&
          action.payload.first_name
        ) {
          state.students.push(action.payload);
        } else {
          state.error = "Invalid student data received";
        }
      })
      .addCase(createStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create student";
      })
      // Fetch Students
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch students";
      })
      // Update Student
      .addCase(updateStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.students.findIndex(
          (s) => s.id === action.payload.id
        );

        if (index !== -1) {
          state.students[index] = action.payload;
        } else {
          state.students.push(action.payload);
        }
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update student";
      })
      // Delete Student
      .addCase(deleteStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.students = state.students.filter((s) => s.id !== action.payload);
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete student";
      });
  },
});

export const { clearStudentsError } = studentsSlice.actions;
export default studentsSlice.reducer;
