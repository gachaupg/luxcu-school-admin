import api from "@/config/api";

export interface FCMToken {
  id: number;
  token: string;
  user_id: number;
  user_type: 'parent' | 'driver' | 'admin';
  device_type: 'android' | 'ios' | 'web';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class FCMTokenService {
  private async getAuthToken(): Promise<string | null> {
    let token = localStorage.getItem("token");
    
    if (!token) {
      const persistAuth = localStorage.getItem("persist:auth");
      if (persistAuth) {
        try {
          const authData = JSON.parse(persistAuth);
          const userData = JSON.parse(authData.user || "{}");
          token = userData.token;
        } catch (e) {
          console.error("Error parsing persist:auth:", e);
        }
      }
    }

    if (token) {
      // Handle double-stringified token from Redux Persist
      if (token.startsWith('"') && token.endsWith('"')) {
        token = JSON.parse(token);
      }
    }

    return token;
  }

  private async getSchoolId(): Promise<number> {
    const schoolId = localStorage.getItem("schoolId");
    return schoolId ? parseInt(schoolId) : 0;
  }

  // Get FCM tokens for a specific school
  async getSchoolFCMTokens(): Promise<string[]> {
    try {
      const token = await this.getAuthToken();
      const schoolId = await this.getSchoolId();

      if (!token || !schoolId) {
        console.warn("No auth token or school ID available for FCM token fetch");
        return [];
      }

      const response = await api.get(`/fcm-tokens/?school=${schoolId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const tokens = response.data?.results || response.data || [];
      return tokens
        .filter((tokenData: FCMToken) => tokenData.is_active)
        .map((tokenData: FCMToken) => tokenData.token);
    } catch (error) {
      console.error("Error fetching FCM tokens:", error);
      return [];
    }
  }

  // Get FCM tokens for parents only
  async getParentFCMTokens(): Promise<string[]> {
    try {
      const token = await this.getAuthToken();
      const schoolId = await this.getSchoolId();

      if (!token || !schoolId) {
        console.warn("No auth token or school ID available for FCM token fetch");
        return [];
      }

      const response = await api.get(`/fcm-tokens/?school=${schoolId}&user_type=parent`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const tokens = response.data?.results || response.data || [];
      return tokens
        .filter((tokenData: FCMToken) => tokenData.is_active)
        .map((tokenData: FCMToken) => tokenData.token);
    } catch (error) {
      console.error("Error fetching parent FCM tokens:", error);
      return [];
    }
  }

  // Get FCM tokens for drivers only
  async getDriverFCMTokens(): Promise<string[]> {
    try {
      const token = await this.getAuthToken();
      const schoolId = await this.getSchoolId();

      if (!token || !schoolId) {
        console.warn("No auth token or school ID available for FCM token fetch");
        return [];
      }

      const response = await api.get(`/fcm-tokens/?school=${schoolId}&user_type=driver`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const tokens = response.data?.results || response.data || [];
      return tokens
        .filter((tokenData: FCMToken) => tokenData.is_active)
        .map((tokenData: FCMToken) => tokenData.token);
    } catch (error) {
      console.error("Error fetching driver FCM tokens:", error);
      return [];
    }
  }

  // Get FCM tokens for specific trip participants
  async getTripFCMTokens(tripId: number): Promise<string[]> {
    try {
      const token = await this.getAuthToken();
      const schoolId = await this.getSchoolId();

      if (!token || !schoolId) {
        console.warn("No auth token or school ID available for FCM token fetch");
        return [];
      }

      const response = await api.get(`/trips/${tripId}/fcm-tokens/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const tokens = response.data?.tokens || [];
      return tokens.filter((tokenData: FCMToken) => tokenData.is_active)
        .map((tokenData: FCMToken) => tokenData.token);
    } catch (error) {
      console.error("Error fetching trip FCM tokens:", error);
      return [];
    }
  }

  // Register a new FCM token
  async registerFCMToken(
    token: string,
    userType: 'parent' | 'driver' | 'admin',
    deviceType: 'android' | 'ios' | 'web' = 'web'
  ): Promise<boolean> {
    try {
      const authToken = await this.getAuthToken();
      const schoolId = await this.getSchoolId();

      if (!authToken || !schoolId) {
        console.warn("No auth token or school ID available for FCM token registration");
        return false;
      }

      await api.post('/fcm-tokens/', {
        token,
        user_type: userType,
        device_type: deviceType,
        school: schoolId,
        is_active: true,
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      return true;
    } catch (error) {
      console.error("Error registering FCM token:", error);
      return false;
    }
  }

  // Unregister an FCM token
  async unregisterFCMToken(token: string): Promise<boolean> {
    try {
      const authToken = await this.getAuthToken();

      if (!authToken) {
        console.warn("No auth token available for FCM token unregistration");
        return false;
      }

      await api.delete(`/fcm-tokens/?token=${encodeURIComponent(token)}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      return true;
    } catch (error) {
      console.error("Error unregistering FCM token:", error);
      return false;
    }
  }
}

export const fcmTokenService = new FCMTokenService();
