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
    return response.data.data;
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

    console.log("Fetching students from:", url);
    const response = await api.get(url);
    console.log("Students API response:", response.data);
    console.log("Students data structure:", {
      hasData: !!response.data,
      hasDataData: !!response.data?.data,
      dataType: typeof response.data,
      dataDataType: typeof response.data?.data,
      isArray: Array.isArray(response.data),
      dataIsArray: Array.isArray(response.data?.data),
    });

    // Check if response.data.data exists, otherwise use response.data
    const studentsData = response.data?.data || response.data;
    console.log("Final students data to return:", studentsData);
    console.log("Students data type:", typeof studentsData);
    console.log("Students data is array:", Array.isArray(studentsData));

    // Ensure we always return an array
    if (!Array.isArray(studentsData)) {
      console.warn("Students data is not an array, returning empty array");
      return [];
    }

    return studentsData;
  } catch (error) {
    console.error("Error fetching students:", error);
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
    return response.data.data;
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
        console.log("createStudent.fulfilled - payload:", action.payload);
        console.log(
          "createStudent.fulfilled - previous state.students:",
          state.students
        );

        state.loading = false;
        state.students.push(action.payload);

        console.log(
          "createStudent.fulfilled - state.students after push:",
          state.students
        );
        console.log(
          "createStudent.fulfilled - state.students length:",
          state.students.length
        );
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
        console.log("fetchStudents.fulfilled - payload:", action.payload);
        console.log(
          "fetchStudents.fulfilled - payload type:",
          typeof action.payload
        );
        console.log(
          "fetchStudents.fulfilled - is array:",
          Array.isArray(action.payload)
        );
        console.log(
          "fetchStudents.fulfilled - previous state.students:",
          state.students
        );

        state.loading = false;
        state.students = Array.isArray(action.payload) ? action.payload : [];

        console.log(
          "fetchStudents.fulfilled - state.students after update:",
          state.students
        );
        console.log(
          "fetchStudents.fulfilled - state.students length:",
          state.students.length
        );
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
