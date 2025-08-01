import api from "@/config/api";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  base_price: string;
  price_per_student: string;
  price_per_bus: string;
  features_json: {
    max_students: number;
    max_parents: number;
    max_buses: number;
    sms_notifications: boolean;
    whatsapp_integration: boolean;
    realtime_tracking: boolean;
    parent_app_access: boolean;
    basic_reports: boolean;
    driver_management: boolean;
    route_optimization: boolean;
    advanced_analytics: boolean;
    api_access: boolean;
    geofencing: boolean;
    speed_monitoring: boolean;
    fuel_tracking: boolean;
    maintenance_tracking: boolean;
    custom_integrations: boolean;
    priority_support: boolean;
  };
  is_active: boolean;
  default_billing_cycle: "monthly" | "annually" | "quarterly";
}

export interface CreateSubscriptionPlanRequest {
  name: string;
  description: string;
  base_price: string;
  price_per_student: string;
  price_per_bus: string;
  features_json: SubscriptionPlan["features_json"];
  is_active: boolean;
  default_billing_cycle: "monthly" | "annually" | "quarterly";
}

export const subscriptionPlanService = {
  // Get all subscription plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await api.get("/subscription-plans/");
      return response.data;
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      throw error;
    }
  },

  // Create a new subscription plan
  async createSubscriptionPlan(
    plan: CreateSubscriptionPlanRequest
  ): Promise<SubscriptionPlan> {
    try {
      const response = await api.post("/subscription-plans/", plan);
      return response.data;
    } catch (error) {
      console.error("Error creating subscription plan:", error);
      throw error;
    }
  },

  // Update a subscription plan
  async updateSubscriptionPlan(
    id: string,
    plan: Partial<CreateSubscriptionPlanRequest>
  ): Promise<SubscriptionPlan> {
    try {
      const response = await api.put(`/subscription-plans/${id}/`, plan);
      return response.data;
    } catch (error) {
      console.error("Error updating subscription plan:", error);
      throw error;
    }
  },

  // Delete a subscription plan
  async deleteSubscriptionPlan(id: string): Promise<void> {
    try {
      await api.delete(`/subscription-plans/${id}/`);
    } catch (error) {
      console.error("Error deleting subscription plan:", error);
      throw error;
    }
  },

  // Get a single subscription plan
  async getSubscriptionPlan(id: string): Promise<SubscriptionPlan> {
    try {
      const response = await api.get(`/subscription-plans/${id}/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching subscription plan:", error);
      throw error;
    }
  },
};
