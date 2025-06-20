import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { API_BASE_URL } from "@/utils/api";
import { handleApiError } from "@/utils/errorHandler";
import { store } from "@/redux/store";

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

    // Log request details
    console.debug("API Request", {
      method: requestConfig.method,
      url: requestConfig.url,
      timeout: requestConfig.timeout,
    });

    return requestConfig;
  });

  return instance;
};

const addAuthInterceptor = (instance: AxiosInstance): AxiosInstance => {
  instance.interceptors.request.use(
    (config) => {
      // Get token from Redux store instead of localStorage
      const state = store.getState();
      const token = state.auth.token;

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

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    handleApiError(error);
    return Promise.reject(error);
  }
);

export default api;
