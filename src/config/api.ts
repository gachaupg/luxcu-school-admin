import axios, { AxiosInstance } from "axios";
import { API_BASE_URL } from "@/utils/api";
import { handleApiError } from "@/utils/errorHandler";
import { getStoredToken, clearAuthData } from "@/utils/auth";

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
      // Use the utility function for token extraction
      const token = getStoredToken();

      // Set Authorization header if token found
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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

// Track if we're already handling a 401 error to prevent loops
let isHandlingAuthError = false;

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !isHandlingAuthError) {
      isHandlingAuthError = true;
      
      // Use utility function to clear auth data
      clearAuthData();
      
      // Reset the flag after a short delay
      setTimeout(() => {
        isHandlingAuthError = false;
      }, 1000);
      
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    // Handle other authentication errors
    if (error.response?.status === 403 && !isHandlingAuthError) {
      isHandlingAuthError = true;
      
      // Use utility function to clear auth data
      clearAuthData();
      
      setTimeout(() => {
        isHandlingAuthError = false;
      }, 1000);
      
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    // Only call handleApiError for other errors
    handleApiError(error);
    return Promise.reject(error);
  }
);

export default api;
