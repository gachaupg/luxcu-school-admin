import api from "@/config/api";
import { API_ENDPOINTS } from "@/utils/api";
import { DEFAULT_SCHOOL_ADMIN_ROLE } from "@/utils/roleDefaults";

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

export const roleService = {
  // Get all roles for a school
  getRoles: async (schoolId: number) => {
    const response = await api.get(
      `${API_ENDPOINTS.SCHOOLS_ROLES}?school=${schoolId}`
    );
    return response.data.data || response.data;
  },

  // Get role by ID
  getRoleById: async (roleId: number) => {
    const response = await api.get(`${API_ENDPOINTS.SCHOOLS_ROLES}/${roleId}/`);
    return response.data.data || response.data;
  },

  // Create new role
  createRole: async (roleData: CreateRoleData) => {
    const response = await api.post(
      `${API_ENDPOINTS.SCHOOLS_ROLES}/`,
      roleData
    );
    return response.data.data || response.data;
  },

  // Update role
  updateRole: async (roleId: number, roleData: Partial<CreateRoleData>) => {
    const response = await api.put(
      `${API_ENDPOINTS.SCHOOLS_ROLES}/${roleId}/`,
      roleData
    );
    return response.data.data || response.data;
  },

  // Delete role
  deleteRole: async (roleId: number) => {
    const response = await api.delete(
      `${API_ENDPOINTS.SCHOOLS_ROLES}/${roleId}/`
    );
    return response.data;
  },

  // Create school admin role (default role)
  createSchoolAdminRole: async (schoolId: number) => {
    const roleData = {
      ...DEFAULT_SCHOOL_ADMIN_ROLE,
      school: schoolId,
    };
    const response = await api.post(
      `${API_ENDPOINTS.SCHOOLS_ROLES}/`,
      roleData
    );
    return response.data.data || response.data;
  },

  // Check if school admin role exists
  checkSchoolAdminRole: async (schoolId: number) => {
    try {
      const roles = await roleService.getRoles(schoolId);
      return roles.some((role: Role) => role.name === "school_admin");
    } catch (error) {
      // Error checking school admin role
      return false;
    }
  },

  // Get role permissions as readable text
  getPermissionDisplayName: (permission: string) => {
    return permission
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  },

  // Validate role data
  validateRoleData: (roleData: CreateRoleData) => {
    const errors: string[] = [];

    if (!roleData.name || roleData.name.trim() === "") {
      errors.push("Role name is required");
    }

    if (!roleData.description || roleData.description.trim() === "") {
      errors.push("Role description is required");
    }

    if (!roleData.school || roleData.school <= 0) {
      errors.push("Valid school ID is required");
    }

    if (!roleData.permissions || roleData.permissions.length === 0) {
      errors.push("At least one permission is required");
    }

    return errors;
  },
};
