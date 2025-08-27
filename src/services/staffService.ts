import { API_ENDPOINTS } from "@/utils/api";

export interface StaffUser {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  confirm_password: string;
}

export interface StaffData {
  employee_id: string;
  role: number;
  school: number;
  status: string;
  user: StaffUser;
}

export interface Staff {
  id: number;
  employee_id: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    profile_image: string | null;
    user_type: string;
    phone_number: string;
    two_factor_enabled: boolean;
    last_login_ip: string | null;
    account_verified: boolean;
    last_password_change: string | null;
    failed_login_attempts: number;
    staff_profile: {
      id: number;
      employee_id: string;
      role: number;
      role_name: string;
      school: number;
      school_name: string;
      status: string;
      is_on_duty: boolean;
    };
  };
  role: number;
  role_details: {
    id: number;
    name: string;
    description: string;
    is_system_role: boolean;
    parent_role: number | null;
    school: number;
  };
  school: number;
  school_details: {
    id: number;
    name: string;
    location: string;
    description: string;
    logo: string | null;
    contact_number: string;
    email: string;
    admin: number;
    admin_details: any;
    longitude_point: any;
    latitude_point: any;
    location_coordinates: {
      longitude: number;
      latitude: number;
    };
    operating_hours_start: string;
    operating_hours_end: string;
    is_active: boolean;
    notification_enabled: boolean;
    allow_parent_tracking: boolean;
  };
  date_joined: string;
  status: "active" | "inactive" | "pending";
  can_manage_routes: boolean;
  can_manage_vehicles: boolean;
  can_view_student_trips: boolean;
  can_manage_staff: boolean;
  is_on_duty: boolean;
  last_activity: string | null;
}

class StaffService {
  private baseUrl = API_ENDPOINTS.STAFF;

  async getAllStaff(): Promise<Staff[]> {
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
      // Error fetching staff
      throw error;
    }
  }

  async addStaff(staffData: StaffData): Promise<Staff> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(staffData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      // Error adding staff
      throw error;
    }
  }

  async updateStaff(id: string, staffData: Partial<StaffData>): Promise<Staff> {
    try {
      const response = await fetch(`${this.baseUrl}${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(staffData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      // Error updating staff
      throw error;
    }
  }

  async deleteStaff(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}${id}/`, {
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
      // Error deleting staff
      throw error;
    }
  }

  async getStaffById(id: string): Promise<Staff> {
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
      // Error fetching staff by ID
      throw error;
    }
  }
}

export const staffService = new StaffService();
