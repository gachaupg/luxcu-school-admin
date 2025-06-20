import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/config/api";
import { API_ENDPOINTS } from "@/utils/api";
import { AxiosError } from "axios";

interface AuthorizedPerson {
  name: string;
  relation: string;
  phone: string;
}

interface Parent {
  id: number;
  user: number;
  user_email: string;
  user_full_name: string;
  phone_number?: string;
  address?: string;
  emergency_contact?: string;
  school?: number;
  preferred_contact_method?: string;
  secondary_phone?: string;
  // Keep the nested structure for backward compatibility
  user_data?: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    user_type: string;
    profile_image: string | null;
  };
  authorized_pickup_persons?: {
    persons: AuthorizedPerson[];
  };
}

interface ParentsState {
  parents: Parent[];
  loading: boolean;
  error: string | null;
}

const initialState: ParentsState = {
  parents: [],
  loading: false,
  error: null,
};

export const registerParent = createAsyncThunk<
  Parent,
  {
    user: {
      first_name: string;
      last_name: string;
      email: string;
      phone_number: string;
      password: string;
      confirm_password: string;
      user_type: string;
      profile_image: string | null;
    };
    address: string;
    emergency_contact: string;
    school: number;
    preferred_contact_method: string;
    secondary_phone: string;
    authorized_pickup_persons: {
      persons: AuthorizedPerson[];
    };
  },
  { rejectValue: string }
>("parents/registerParent", async (parentData, { rejectWithValue }) => {
  try {
    // Send all data in a single request to the parents endpoint
    // The API should handle both user creation and parent profile creation
    const payload = {
      user_data: {
        first_name: parentData.user.first_name,
        last_name: parentData.user.last_name,
        email: parentData.user.email,
        phone_number: parentData.user.phone_number,
        password: parentData.user.password,
        confirm_password: parentData.user.confirm_password,
        user_type: parentData.user.user_type,
        profile_image: parentData.user.profile_image,
      },
      address: parentData.address,
      emergency_contact: parentData.emergency_contact,
      school: parentData.school,
      preferred_contact_method: parentData.preferred_contact_method,
      secondary_phone: parentData.secondary_phone,
      authorized_pickup_persons: parentData.authorized_pickup_persons,
    };

    console.log("Creating parent with all data:", payload);
    const response = await api.post(API_ENDPOINTS.PARENTS, payload);
    console.log("Parent creation response:", response.data);
    return response.data;
  } catch (error: unknown) {
    console.error("Parent registration error:", error);
    const apiError = error as {
      response?: {
        data?: {
          message?: string;
          [key: string]: any;
        };
        status?: number;
      };
    };

    // Check for specific field validation errors
    if (apiError.response?.data) {
      const errorData = apiError.response.data;
      console.error("API Error details:", errorData);

      // Look for field-specific errors
      for (const [field, errors] of Object.entries(errorData)) {
        if (Array.isArray(errors) && errors.length > 0) {
          return rejectWithValue(`${field}: ${errors[0]}`);
        }
      }

      // If no specific field errors, return the general message
      if (errorData.message) {
        return rejectWithValue(errorData.message);
      }
    }

    return rejectWithValue("Failed to register parent");
  }
});

export const fetchParents = createAsyncThunk<
  Parent[],
  { schoolId?: number } | void,
  { rejectValue: string }
>("parents/fetchParents", async (params, { rejectWithValue }) => {
  try {
    const schoolId = typeof params === "object" ? params.schoolId : undefined;
    let url = API_ENDPOINTS.PARENTS;

    if (schoolId) {
      url += `?school=${schoolId}`;
    }

    console.log("Fetching parents from:", url);
    const response = await api.get(url);
    console.log("Parents API response:", response.data);

    if (!response.data || !Array.isArray(response.data)) {
      console.error("Invalid parents response format:", response.data);
      return rejectWithValue("Invalid response format from server");
    }

    return response.data;
  } catch (error: unknown) {
    const apiError = error as {
      response?: { data?: { message?: string }; status?: number };
    };
    console.error("Parents fetch error:", {
      error,
      response: apiError.response?.data,
      status: apiError.response?.status,
    });
    return rejectWithValue(
      apiError.response?.data?.message || "Failed to fetch parents"
    );
  }
});

export const fetchParentById = createAsyncThunk<
  Parent,
  { schoolId: number; parentId: number }
>(
  "parents/fetchParentById",
  async ({ schoolId, parentId }, { rejectWithValue }) => {
    try {
      console.log(`Fetching parent ${parentId} for school ${schoolId}`);
      const response = await api.get(`${API_ENDPOINTS.PARENTS}${parentId}/`);
      console.log("Parent response:", response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error fetching parent:", error);
      if (error instanceof AxiosError) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to fetch parent"
        );
      }
      return rejectWithValue("Failed to fetch parent");
    }
  }
);

export const updateParent = createAsyncThunk<
  Parent,
  { id: number; data: Partial<Parent> }
>("parents/updateParent", async ({ id, data }, { rejectWithValue }) => {
  try {
    console.log(`Updating parent ${id} with data:`, data);
    const response = await api.put(`${API_ENDPOINTS.PARENTS}${id}/`, data);
    console.log("Update parent response:", response.data);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error updating parent:", error);
    if (error instanceof AxiosError) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update parent"
      );
    }
    return rejectWithValue("Failed to update parent");
  }
});

export const deleteParent = createAsyncThunk<void, number>(
  "parents/deleteParent",
  async (id, { rejectWithValue }) => {
    try {
      console.log(`Deleting parent ${id}`);
      await api.delete(`${API_ENDPOINTS.PARENTS}${id}/`);
      console.log("Parent deleted successfully");
    } catch (error) {
      console.error("Error deleting parent:", error);
      if (error instanceof AxiosError) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to delete parent"
        );
      }
      return rejectWithValue("Failed to delete parent");
    }
  }
);

const parentsSlice = createSlice({
  name: "parents",
  initialState,
  reducers: {
    clearParentsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register Parent
      .addCase(registerParent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerParent.fulfilled, (state, action) => {
        state.loading = false;
        state.parents.push(action.payload);
      })
      .addCase(registerParent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to register parent";
      })
      // Fetch Parents
      .addCase(fetchParents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchParents.fulfilled, (state, action) => {
        console.log("Setting parents in state:", action.payload);
        state.loading = false;
        state.parents = action.payload;
      })
      .addCase(fetchParents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch parents";
      })
      // Fetch Parent by ID
      .addCase(fetchParentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchParentById.fulfilled, (state, action) => {
        state.loading = false;
        // Update the parent in the list if it exists, otherwise add it
        const index = state.parents.findIndex(
          (parent) => parent.id === action.payload.id
        );
        if (index !== -1) {
          state.parents[index] = action.payload;
        } else {
          state.parents.push(action.payload);
        }
      })
      .addCase(fetchParentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Parent
      .addCase(updateParent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateParent.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.parents.findIndex(
          (parent) => parent.id === action.payload.id
        );
        if (index !== -1) {
          state.parents[index] = action.payload;
        }
      })
      .addCase(updateParent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Parent
      .addCase(deleteParent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteParent.fulfilled, (state, action) => {
        state.loading = false;
        state.parents = state.parents.filter(
          (parent) => parent.id !== action.meta.arg
        );
      })
      .addCase(deleteParent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearParentsError } = parentsSlice.actions;
export default parentsSlice.reducer;
