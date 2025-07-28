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
  NOTIFICATIONS: `${API_BASE_URL}/school-admin-notifications/`,
  NOTIFICATIONS_CREATE: `${API_BASE_URL}/school-admin-notifications/`,
  CSV_UPLOAD: `${API_BASE_URL}/csv-upload/`,
  REPORTS: `${API_BASE_URL}/reports/`,
  // Add other endpoints as needed
};
