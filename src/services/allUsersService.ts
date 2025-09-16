import { API_BASE_URL } from "@/utils/api";

export interface AllUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  user_type: string;
  profile_image: string | null;
  account_verified: boolean;
  two_factor_enabled: boolean;
  last_login_ip: string | null;
  last_password_change: string | null;
  failed_login_attempts: number;
  date_joined: string;
  last_login: string | null;
  is_active: boolean;
  is_deleted: boolean;
  school?: {
    id: number;
    name: string;
    location: string;
  };
  role?: {
    id: number;
    name: string;
    description: string;
  };
  staff_profile?: {
    id: number;
    employee_id: string;
    status: string;
    is_on_duty: boolean;
  };
  student_profile?: {
    id: number;
    student_id: string;
    grade: string;
    status: string;
  };
  parent_profile?: {
    id: number;
    status: string;
  };
}

export interface UserUpdateData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  account_verified?: boolean;
  two_factor_enabled?: boolean;
  is_active?: boolean;
}

class AllUsersService {
  private baseUrl = `${API_BASE_URL}/all-users/`;

  async getAllUsers(): Promise<AllUser[]> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw error;
    }
  }

  async getUserById(id: number): Promise<AllUser> {
    try {
      const response = await fetch(`${this.baseUrl}${id}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw error;
    }
  }

  async updateUser(id: number, userData: UserUpdateData): Promise<AllUser> {
    try {
      const response = await fetch(`${this.baseUrl}${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  async softDeleteUser(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/delete-user/${id}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error soft deleting user:", error);
      throw error;
    }
  }

  async restoreUser(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/restore-user/${id}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error restoring user:", error);
      throw error;
    }
  }
}

export const allUsersService = new AllUsersService();




