import { API_ENDPOINTS } from "@/utils/api";

export interface School {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  principal: {
    name: string;
    phone: string;
    email: string;
  };
  isActive: boolean;
  location: string;
  type: "primary" | "secondary" | "both";
  capacity: number;
  currentStudents: number;
  createdAt: string;
  updatedAt: string;
  subscription?: string;
  staff?: number;
  lastActive?: string;
}

export interface CreateSchoolData {
  name: string;
  address: string;
  phone: string;
  email: string;
  principal: {
    name: string;
    phone: string;
    email: string;
  };
  location: string;
  type: "primary" | "secondary" | "both";
  capacity: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalSchools: number;
  activeSubscriptions: number;
  revenue: number;
  pendingApprovals: number;
  activeUsers: number;
  inactiveUsers: number;
  premiumSchools: number;
  activeSchools: number;
  inactiveSchools: number;
}

class SchoolsService {
  private baseUrl = API_ENDPOINTS.SCHOOLS;

  async getAllSchools(): Promise<School[]> {
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
      console.log("Schools API response:", data);

      // Handle different response structures
      let schoolsData = data.data || data;

      // Ensure we have an array
      if (!Array.isArray(schoolsData)) {
        console.error("Invalid schools response - not an array:", schoolsData);
        return [];
      }

      // Validate and clean each school object
      const validatedSchools = schoolsData
        .map((school: any, index: number) => {
          if (!school || typeof school !== "object") {
            console.warn(`Invalid school at index ${index}:`, school);
            return null;
          }

          // Map API response structure to our interface
          return {
            _id: school.id?.toString() || school._id || `temp-${index}`,
            name: school.name || school.school_name || "Unknown School",
            address: school.address || school.location || "",
            phone: school.phone || school.contact_number || "",
            email: school.email || "",
            principal: {
              name: school.principal?.name || "School Administrator",
              phone: school.principal?.phone || school.contact_number || "",
              email: school.principal?.email || school.email || "",
            },
            isActive: school.is_active !== undefined ? school.is_active : true,
            location: school.location || "",
            type: school.type || "primary",
            capacity: school.capacity || 0,
            currentStudents: school.current_students || school.students || 0,
            createdAt:
              school.created_at || school.createdAt || new Date().toISOString(),
            updatedAt:
              school.updated_at || school.updatedAt || new Date().toISOString(),
            subscription: school.subscription || "Basic",
            staff: school.staff || 0,
            lastActive: school.last_active || school.lastActive || "Never",
          };
        })
        .filter(Boolean); // Remove null entries

      console.log("Validated schools:", validatedSchools);
      return validatedSchools;
    } catch (error) {
      console.error("Error fetching schools:", error);
      throw error;
    }
  }

  async getSchoolById(id: string): Promise<School> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
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
      console.log("School details response:", data);

      // Handle different response structures
      let schoolData = data.data || data;

      // Validate school object
      if (!schoolData || typeof schoolData !== "object") {
        throw new Error("Invalid school data received");
      }

      // Ensure required fields exist
      const validatedSchool: School = {
        _id: schoolData.id?.toString() || schoolData._id || id,
        name: schoolData.name || schoolData.school_name || "Unknown School",
        address: schoolData.address || schoolData.location || "",
        phone: schoolData.phone || schoolData.contact_number || "",
        email: schoolData.email || "",
        principal: {
          name: schoolData.principal?.name || "School Administrator",
          phone: schoolData.principal?.phone || schoolData.contact_number || "",
          email: schoolData.principal?.email || schoolData.email || "",
        },
        isActive:
          schoolData.is_active !== undefined ? schoolData.is_active : true,
        location: schoolData.location || "",
        type: schoolData.type || "primary",
        capacity: schoolData.capacity || 0,
        currentStudents:
          schoolData.current_students || schoolData.students || 0,
        createdAt:
          schoolData.created_at ||
          schoolData.createdAt ||
          new Date().toISOString(),
        updatedAt:
          schoolData.updated_at ||
          schoolData.updatedAt ||
          new Date().toISOString(),
        subscription: schoolData.subscription || "Basic",
        staff: schoolData.staff || 0,
        lastActive: schoolData.last_active || schoolData.lastActive || "Never",
      };

      console.log("Validated school:", validatedSchool);
      return validatedSchool;
    } catch (error) {
      console.error("Error fetching school:", error);
      throw error;
    }
  }

  async createSchool(schoolData: CreateSchoolData): Promise<School> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(schoolData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Error creating school:", error);
      throw error;
    }
  }

  async updateSchool(
    id: string,
    schoolData: Partial<CreateSchoolData>
  ): Promise<School> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(schoolData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Error updating school:", error);
      throw error;
    }
  }

  async deleteSchool(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
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
      console.error("Error deleting school:", error);
      throw error;
    }
  }

  async toggleSchoolStatus(id: string): Promise<School> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/toggle`, {
        method: "PATCH",
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
      console.error("Error toggling school status:", error);
      throw error;
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`, {
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
      console.error("Error fetching dashboard stats:", error);
      // Return mock data if API is not available
      return {
        totalUsers: 1247,
        totalSchools: 89,
        activeSubscriptions: 76,
        revenue: 45600,
        pendingApprovals: 12,
        activeUsers: 1189,
        inactiveUsers: 58,
        premiumSchools: 23,
      };
    }
  }
}

export const schoolsService = new SchoolsService();
