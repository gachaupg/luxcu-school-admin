import axios, { AxiosInstance } from "axios";
import { API_BASE_URL } from "@/utils/api";
import { handleApiError } from "@/utils/errorHandler";

interface ApiClientConfig {
  timeout?: number;
  baseURL?: string;
}

interface EndpointConfig {
  timeout?: number;
  retry?: number;
}

const DEFAULT_CONFIG: ApiClientConfig = {
  timeout: 30000, // 30 seconds default timeout
  baseURL: API_BASE_URL,
};

// Configure specific endpoints with custom timeouts
const ENDPOINT_SPECIFIC_CONFIG: Record<string, EndpointConfig> = {
  "/parents": { timeout: 45000 }, // Longer timeout for parent operations
  "/students": { timeout: 45000 }, // Longer timeout for student operations
  // Add more endpoint-specific configurations as needed
};

const createAxiosInstance = (
  config: ApiClientConfig = DEFAULT_CONFIG
): AxiosInstance => {
  const instance = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    withCredentials: true,
  });

  // Request interceptor with timeout override
  instance.interceptors.request.use((requestConfig) => {
    const endpoint = requestConfig.url || "";
    const endpointConfig = ENDPOINT_SPECIFIC_CONFIG[endpoint];

    if (endpointConfig) {
      requestConfig.timeout = endpointConfig.timeout || config.timeout;
    }

  

    return requestConfig;
  });

  return instance;
};

const addAuthInterceptor = (instance: AxiosInstance): AxiosInstance => {
  instance.interceptors.request.use(
    (config) => {
      // Simple token extraction - try multiple sources
      let token = null;

      // Method 1: Try direct token storage
      token = localStorage.getItem("token");

      // Method 2: Try Redux Persist if direct method fails
      if (!token) {
        try {
          const persistData = localStorage.getItem("persist:auth");
          if (persistData) {
            const parsed = JSON.parse(persistData);
            if (parsed.token) {
              token = JSON.parse(parsed.token);
              // Handle double-stringification
              if (typeof token === "string") {
                try {
                  token = JSON.parse(token);
                } catch (e) {
                  // Keep original if second parse fails
                }
              }
            }
          }
        } catch (error) {
          // console.warn("Error parsing persist data:", error);
        }
      }

      // Force token extraction from multiple sources
      if (!token) {
        // Try Redux Persist directly
        const persistData = localStorage.getItem("persist:auth");
        if (persistData) {
          try {
            const parsed = JSON.parse(persistData);
            if (parsed.token) {
              token = JSON.parse(parsed.token);
              if (typeof token === "string") {
                try {
                  token = JSON.parse(token);
                } catch (e) {
                  // Keep original if second parse fails
                }
              }
            }
          } catch (e) {
            // console.warn("Error parsing persist data:", e);
          }
        }
      }

      // Set Authorization header if token found
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
       
        // Check if user is logged in
        const persistData = localStorage.getItem("persist:auth");
        if (persistData) {
          // console.log(
          //   "User appears to be logged in but token extraction failed"
          // );
          // console.log(
          //   "Raw persist data:",
          //   persistData.substring(0, 200) + "..."
          // );
        } else {
          // console.log("User is NOT logged in - need to login first");
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
  );
  return instance;
};

// Create the API instance with default configuration
const api = createAxiosInstance();

// Add auth interceptor
addAuthInterceptor(api);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401) {
      // Clear auth data from localStorage
      localStorage.removeItem("persist:auth");
      localStorage.removeItem("schoolId");
      localStorage.removeItem("token");
      // Redirect to login page instead of home
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Handle other authentication errors
    if (error.response?.status === 403) {
      
      localStorage.removeItem("persist:auth");
      localStorage.removeItem("schoolId");
      localStorage.removeItem("token");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Only call handleApiError for other errors
    handleApiError(error);
    return Promise.reject(error);
  }
);

export default api;
