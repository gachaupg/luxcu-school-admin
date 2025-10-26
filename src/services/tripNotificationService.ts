import api from "@/config/api";

const FCM_SERVER_URL = "https://fcm-nhzp.onrender.com";

export interface TripNotificationPayload {
  title: string;
  body: string;
  data?: {
    tripId?: string;
    routeName?: string;
    driverName?: string;
    vehicleRegistration?: string;
    status?: string;
    tripType?: string;
    scheduledStartTime?: string;
    [key: string]: any;
  };
}

export interface TripNotificationRequest {
  fcmTokens: string[];
  notification: TripNotificationPayload;
  schoolId: number;
  tripId?: string;
}

class TripNotificationService {
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

  async sendTripNotification(
    fcmTokens: string[],
    notification: TripNotificationPayload,
    tripId?: string
  ): Promise<boolean> {
    try {
     
      
      const token = await this.getAuthToken();
      const schoolId = await this.getSchoolId();

     
      if (!token) {
        
        return false;
      }

      if (fcmTokens.length === 0) {
        return false;
      }

      const payload: TripNotificationRequest = {
        fcmTokens,
        notification,
        schoolId,
        tripId,
      };

      const response = await fetch(`${FCM_SERVER_URL}/sendNotification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`FCM notification failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Trip status change notifications
  async notifyTripStatusChange(
    trip: any,
    newStatus: string,
    fcmTokens: string[]
  ): Promise<boolean> {
    const statusMessages = {
      scheduled: "Trip has been scheduled",
      preparing: "Trip is being prepared",
      ongoing: "Trip is now in progress",
      completed: "Trip has been completed",
      cancelled: "Trip has been cancelled",
      delayed: "Trip has been delayed",
    };

    const notification: TripNotificationPayload = {
      title: `Trip Status Update - ${trip.route_name || `Route ${trip.route}`}`,
      body: `${statusMessages[newStatus as keyof typeof statusMessages] || `Trip status changed to ${newStatus}`}`,
      data: {
        tripId: trip.id?.toString(),
        routeName: trip.route_name || `Route ${trip.route}`,
        driverName: trip.driver_name || `Driver ${trip.driver}`,
        vehicleRegistration: trip.vehicle_registration || `Vehicle ${trip.vehicle}`,
        status: newStatus,
        tripType: trip.trip_type,
        scheduledStartTime: trip.scheduled_start_time,
        type: "trip_status_change",
      },
    };

    return this.sendTripNotification(fcmTokens, notification, trip.id?.toString());
  }

  // New trip creation notifications
  async notifyNewTripCreated(
    trip: any,
    fcmTokens: string[]
  ): Promise<boolean> {
    const notification: TripNotificationPayload = {
      title: "New Trip Created",
      body: `A new ${trip.trip_type} trip has been scheduled for ${trip.route_name || `Route ${trip.route}`}`,
      data: {
        tripId: trip.id?.toString(),
        routeName: trip.route_name || `Route ${trip.route}`,
        driverName: trip.driver_name || `Driver ${trip.driver}`,
        vehicleRegistration: trip.vehicle_registration || `Vehicle ${trip.vehicle}`,
        status: trip.status,
        tripType: trip.trip_type,
        scheduledStartTime: trip.scheduled_start_time,
        type: "new_trip_created",
      },
    };

    return this.sendTripNotification(fcmTokens, notification, trip.id?.toString());
  }

  // Trip delay notifications
  async notifyTripDelay(
    trip: any,
    delayReason: string,
    fcmTokens: string[]
  ): Promise<boolean> {
    const notification: TripNotificationPayload = {
      title: `Trip Delayed - ${trip.route_name || `Route ${trip.route}`}`,
      body: `The trip has been delayed. Reason: ${delayReason}`,
      data: {
        tripId: trip.id?.toString(),
        routeName: trip.route_name || `Route ${trip.route}`,
        driverName: trip.driver_name || `Driver ${trip.driver}`,
        vehicleRegistration: trip.vehicle_registration || `Vehicle ${trip.vehicle}`,
        status: "delayed",
        tripType: trip.trip_type,
        scheduledStartTime: trip.scheduled_start_time,
        delayReason,
        type: "trip_delay",
      },
    };

    return this.sendTripNotification(fcmTokens, notification, trip.id?.toString());
  }

  // Trip cancellation notifications
  async notifyTripCancellation(
    trip: any,
    cancellationReason: string,
    fcmTokens: string[]
  ): Promise<boolean> {
    const notification: TripNotificationPayload = {
      title: `Trip Cancelled - ${trip.route_name || `Route ${trip.route}`}`,
      body: `The trip has been cancelled. Reason: ${cancellationReason}`,
      data: {
        tripId: trip.id?.toString(),
        routeName: trip.route_name || `Route ${trip.route}`,
        driverName: trip.driver_name || `Driver ${trip.driver}`,
        vehicleRegistration: trip.vehicle_registration || `Vehicle ${trip.vehicle}`,
        status: "cancelled",
        tripType: trip.trip_type,
        scheduledStartTime: trip.scheduled_start_time,
        cancellationReason,
        type: "trip_cancellation",
      },
    };

    return this.sendTripNotification(fcmTokens, notification, trip.id?.toString());
  }

  // Emergency trip notifications
  async notifyTripEmergency(
    trip: any,
    emergencyMessage: string,
    fcmTokens: string[]
  ): Promise<boolean> {
    const notification: TripNotificationPayload = {
      title: `🚨 EMERGENCY - ${trip.route_name || `Route ${trip.route}`}`,
      body: emergencyMessage,
      data: {
        tripId: trip.id?.toString(),
        routeName: trip.route_name || `Route ${trip.route}`,
        driverName: trip.driver_name || `Driver ${trip.driver}`,
        vehicleRegistration: trip.vehicle_registration || `Vehicle ${trip.vehicle}`,
        status: trip.status,
        tripType: trip.trip_type,
        scheduledStartTime: trip.scheduled_start_time,
        emergencyMessage,
        type: "trip_emergency",
        priority: "high",
      },
    };

    return this.sendTripNotification(fcmTokens, notification, trip.id?.toString());
  }
}

export const tripNotificationService = new TripNotificationService();
