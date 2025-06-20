import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

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

export const staffService = {
  // Get all staff members
  getAllStaff: async () => {
    const response = await axios.get(`${API_URL}/staff/`);
    return response.data;
  },

  // Add new staff member
  addStaff: async (staffData: StaffData) => {
    const response = await axios.post(`${API_URL}/staff/`, staffData);
    return response.data;
  },

  // Update staff member
  updateStaff: async (id: string, staffData: Partial<StaffData>) => {
    const response = await axios.patch(`${API_URL}/staff/${id}/`, staffData);
    return response.data;
  },

  // Delete staff member
  deleteStaff: async (id: string) => {
    const response = await axios.delete(`${API_URL}/staff/${id}/`);
    return response.data;
  },

  // Get staff member by ID
  getStaffById: async (id: string) => {
    const response = await axios.get(`${API_URL}/staff/${id}/`);
    return response.data;
  },
};
