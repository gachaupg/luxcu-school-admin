export const API_BASE_URL = "https://api.eujimsolutions.com/api";

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/login/`,
  VERIFY_OTP: `${API_BASE_URL}/verify-otp/`,
  REGISTER: `${API_BASE_URL}/register/`,
  SCHOOLS: `${API_BASE_URL}/schools/`,
  SCHOOL_REGISTRATION: `${API_BASE_URL}/school-registration/`,
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
  SUBSCRIPTION_PLANS: `${API_BASE_URL}/subscription-plans/`,
  CONTACT_MESSAGES: `${API_BASE_URL}/contact-messages/`,
  SCHOOL_SUBSCRIPTIONS: `${API_BASE_URL}/school-subscriptions/`,
  INVOICES: `${API_BASE_URL}/invoices/`,
  ACTIVATE_SCHOOL: `${API_BASE_URL}/activate-school/`,
  // Add other endpoints as needed
};

// Utility function for handling API requests with retry logic
export const apiRequestWithRetry = async (
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<Response> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // If successful, return immediately
      if (response.ok) {
        return response;
      }

      // Handle throttling/rate limiting
      if (response.status === 429) {
        const errorData = await response.json().catch(() => ({}));
        const retryAfter = errorData.detail?.match(/(\d+) seconds?/)?.[1] || 20;

        if (attempt < maxRetries) {
         
          await new Promise((resolve) =>
            setTimeout(resolve, parseInt(retryAfter) * 1000)
          );
          continue;
        } else {
          throw new Error(
            `Rate limited. Please wait ${retryAfter} seconds before trying again.`
          );
        }
      }

      // For other errors, throw immediately
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    } catch (error) {
      lastError = error as Error;

      // If it's not a throttling error and we have retries left, wait with exponential backoff
      if (!error.message?.includes("Rate limited") && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
       
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // If we're out of retries or it's a throttling error, throw
      throw error;
    }
  }

  throw lastError || new Error("Request failed after all retries");
};
