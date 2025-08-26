import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
  iat: number;
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    const isExpired = decoded.exp < currentTime;

    return isExpired;
  } catch (error) {
    return true;
  }
};

export const getTokenExpirationTime = (token: string): number | null => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.exp * 1000; // Convert to milliseconds
  } catch {
    return null;
  }
};

// Utility function to get token from storage
export const getStoredToken = (): string | null => {
  // Try direct token storage first
  let token = localStorage.getItem("token");
  
  // If no direct token, try Redux persist
  if (!token) {
    try {
      const persistData = localStorage.getItem("persist:auth");
      if (persistData) {
        const parsed = JSON.parse(persistData);
        if (parsed.token) {
          const tokenData = JSON.parse(parsed.token);
          token = typeof tokenData === "string" ? tokenData : JSON.stringify(tokenData);
        }
      }
    } catch (error) {
      // Silently handle parsing errors
    }
  }
  
  return token;
};

// Utility function to clear all auth data
export const clearAuthData = (): void => {
  localStorage.removeItem("persist:auth");
  localStorage.removeItem("schoolId");
  localStorage.removeItem("token");
};

// Utility function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getStoredToken();
  return token !== null && !isTokenExpired(token);
};
