export const API_BASE_URL = "https://api.eujimsolutions.com/api";

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/login/`,
  VERIFY_OTP: `${API_BASE_URL}/verify-otp/`,
  REGISTER: `${API_BASE_URL}/register/`,
  SCHOOLS: `${API_BASE_URL}/schools/`,
  PARENTS: `${API_BASE_URL}/parents/`,
  DRIVERS: `${API_BASE_URL}/drivers/`,
  VEHICLES: `${API_BASE_URL}/vehicles/`,
  ROUTES: `${API_BASE_URL}/schools/`, // Will be appended with school_id/routes/
  ROUTE_STOPS: `${API_BASE_URL}/schools/`, // Will be appended with school_id/routes/route-stops/
  ROUTE_ASSIGNMENTS: `${API_BASE_URL}/route-assignments/`,
  STAFF: `${API_BASE_URL}/staff/`,
  SCHOOLS_ROLES: `${API_BASE_URL}/schools-roles`,
  STUDENTS: `${API_BASE_URL}/students/`,
  TRIPS: `${API_BASE_URL}/trips/`,
  GRADES: `${API_BASE_URL}/grades/`,
  PREFERENCES: `${API_BASE_URL}/preferences/`,
  NOTIFICATIONS: `${API_BASE_URL}/parent-notifications/`, // Temporary: use trips endpoint until notifications API is ready
  NOTIFICATIONS_CREATE: `${API_BASE_URL}/parent-notifications/create/`, // Temporary: use trips endpoint until notifications API is ready
  CSV_UPLOAD: `${API_BASE_URL}/csv-upload/`,
  // Add other endpoints as needed
};
