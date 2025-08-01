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

    console.log("Token expiration check:", {
      tokenPreview: token.substring(0, 20) + "...",
      expirationTime: new Date(decoded.exp * 1000).toISOString(),
      currentTime: new Date(currentTime * 1000).toISOString(),
      isExpired,
    });

    return isExpired;
  } catch (error) {
    console.error("Error decoding token:", error);
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
