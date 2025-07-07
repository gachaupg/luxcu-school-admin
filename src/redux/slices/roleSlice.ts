import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/config/api";
import { API_ENDPOINTS } from "@/utils/api";
import { AxiosError } from "axios";
import { getDefaultRoles } from "@/utils/roleDefaults";

export interface Role {
  id: number;
  name: string;
  description: string;
  school: number;
  permissions: string[];
  is_system_role: boolean;
  parent_role?: number;
}

export interface CreateRoleData {
  name: string;
  description: string;
  school: number;
  permissions: string[];
  is_system_role: boolean;
  parent_role?: number;
}

interface RoleState {
  roles: Role[];
  selectedRole: Role | null;
  loading: boolean;
  error: string | null;
}

const initialState: RoleState = {
  roles: [],
  selectedRole: null,
  loading: false,
  error: null,
};

export const fetchRoles = createAsyncThunk<Role[], number>(
  "roles/fetchRoles",
  async (schoolId: number, { rejectWithValue }) => {
    try {
      console.log("Fetching roles for school:", schoolId);
      const response = await api.get(
        `${API_ENDPOINTS.SCHOOLS_ROLES}?school=${schoolId}`
      );
      console.log("Roles response:", response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error fetching roles:", error);
      if (error instanceof AxiosError) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to fetch roles"
        );
      }
      return rejectWithValue("Failed to fetch roles");
    }
  }
);

export const fetchRoleById = createAsyncThunk<
  Role,
  { schoolId: number; roleId: number }
>("roles/fetchRoleById", async ({ schoolId, roleId }, { rejectWithValue }) => {
  try {
    console.log(`Fetching role ${roleId} for school ${schoolId}`);
    const response = await api.get(`${API_ENDPOINTS.SCHOOLS_ROLES}/${roleId}/`);
    console.log("Role response:", response.data);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error fetching role:", error);
    if (error instanceof AxiosError) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch role"
      );
    }
    return rejectWithValue("Failed to fetch role");
  }
});

export const createRole = createAsyncThunk<Role, CreateRoleData>(
  "roles/createRole",
  async (roleData, { rejectWithValue }) => {
    try {
      console.log("Creating role with data:", roleData);
      const response = await api.post(
        `${API_ENDPOINTS.SCHOOLS_ROLES}/`,
        roleData
      );
      console.log("Create role response:", response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error creating role:", error);
      if (error instanceof AxiosError) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to create role"
        );
      }
      return rejectWithValue("Failed to create role");
    }
  }
);

export const updateRole = createAsyncThunk<
  Role,
  { id: number; data: Partial<CreateRoleData> }
>("roles/updateRole", async ({ id, data }, { rejectWithValue }) => {
  try {
    console.log(`Updating role ${id} with data:`, data);
    const response = await api.put(
      `${API_ENDPOINTS.SCHOOLS_ROLES}/${id}/`,
      data
    );
    console.log("Update role response:", response.data);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error updating role:", error);
    if (error instanceof AxiosError) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update role"
      );
    }
    return rejectWithValue("Failed to update role");
  }
});

export const deleteRole = createAsyncThunk<void, number>(
  "roles/deleteRole",
  async (id, { rejectWithValue }) => {
    try {
      console.log(`Deleting role ${id}`);
      await api.delete(`${API_ENDPOINTS.SCHOOLS_ROLES}/${id}/`);
      console.log("Role deleted successfully");
    } catch (error) {
      console.error("Error deleting role:", error);
      if (error instanceof AxiosError) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to delete role"
        );
      }
      return rejectWithValue("Failed to delete role");
    }
  }
);

export const createDefaultRoles = createAsyncThunk<Role[], number>(
  "roles/createDefaultRoles",
  async (schoolId: number, { rejectWithValue }) => {
    try {
      console.log("Creating default roles for school:", schoolId);
      const defaultRoles = getDefaultRoles(schoolId);
      const createdRoles: Role[] = [];

      for (const roleData of defaultRoles) {
        try {
          const response = await api.post(
            `${API_ENDPOINTS.SCHOOLS_ROLES}/`,
            roleData
          );
          createdRoles.push(response.data.data || response.data);
        } catch (error) {
          console.warn(`Failed to create role ${roleData.name}:`, error);
          // Continue with other roles even if one fails
        }
      }

      console.log("Default roles created:", createdRoles);
      return createdRoles;
    } catch (error) {
      console.error("Error creating default roles:", error);
      if (error instanceof AxiosError) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to create default roles"
        );
      }
      return rejectWithValue("Failed to create default roles");
    }
  }
);

const roleSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    clearSelectedRole: (state) => {
      state.selectedRole = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Roles
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Role by ID
      .addCase(fetchRoleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoleById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRole = action.payload;
      })
      .addCase(fetchRoleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Role
      .addCase(createRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.loading = false;
        state.roles.push(action.payload);
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Role
      .addCase(updateRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.roles.findIndex(
          (role) => role.id === action.payload.id
        );
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
        if (state.selectedRole?.id === action.payload.id) {
          state.selectedRole = action.payload;
        }
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Role
      .addCase(deleteRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = state.roles.filter((role) => role.id !== action.meta.arg);
        if (state.selectedRole?.id === action.meta.arg) {
          state.selectedRole = null;
        }
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Default Roles
      .addCase(createDefaultRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDefaultRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles.push(...action.payload);
      })
      .addCase(createDefaultRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedRole } = roleSlice.actions;
export default roleSlice.reducer;
