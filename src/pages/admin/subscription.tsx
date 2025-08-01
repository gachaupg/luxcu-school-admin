import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchSubscriptionPlans } from "@/redux/slices/subscriptionSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  Users,
  Bus,
  MessageSquare,
  Map,
  BarChart3,
  Settings,
  Shield,
  Zap,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminSubscription() {
  const dispatch = useDispatch<AppDispatch>();
  const { plans, loading, error } = useSelector(
    (state: RootState) => state.subscription
  );

  useEffect(() => {
    dispatch(fetchSubscriptionPlans());
  }, [dispatch]);

  const getFeatureIcon = (featureName: string) => {
    switch (featureName) {
      case "sms_notifications":
        return MessageSquare;
      case "whatsapp_integration":
        return MessageSquare;
      case "realtime_tracking":
        return Map;
      case "parent_app_access":
        return Users;
      case "basic_reports":
        return BarChart3;
      case "driver_management":
        return Users;
      case "route_optimization":
        return Map;
      case "advanced_analytics":
        return BarChart3;
      case "api_access":
        return Settings;
      default:
        return Check;
    }
  };

  const formatPrice = (price: string) => {
    return parseFloat(price).toLocaleString("en-US", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24 mb-4" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((j) => (
                      <Skeleton key={j} className="h-4 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-red-800 font-semibold">
              Error Loading Subscription Plans
            </h2>
            <p className="text-red-600">{error}</p>
            <Button
              onClick={() => dispatch(fetchSubscriptionPlans())}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Subscription Plans Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            View and manage available subscription plans for schools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="relative">
              {!plan.is_active && (
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary">Inactive</Badge>
                </div>
              )}

              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">
                    {plan.name
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </CardTitle>
                  {plan.is_active && (
                    <Badge variant="default" className="bg-green-500">
                      Active
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-sm">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Base Price:
                    </span>
                    <span className="font-semibold">
                      {formatPrice(plan.base_price)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Per Student:
                    </span>
                    <span className="font-semibold">
                      {formatPrice(plan.price_per_student)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Per Bus:
                    </span>
                    <span className="font-semibold">
                      {formatPrice(plan.price_per_bus)}
                    </span>
                  </div>
                </div>

                {/* Limits */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Limits
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center">
                      <div className="font-semibold">
                        {plan.features_json.max_students}
                      </div>
                      <div className="text-gray-500">Students</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">
                        {plan.features_json.max_parents}
                      </div>
                      <div className="text-gray-500">Parents</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">
                        {plan.features_json.max_buses}
                      </div>
                      <div className="text-gray-500">Buses</div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Features
                  </h4>
                  <div className="space-y-1">
                    {Object.entries(plan.features_json).map(([key, value]) => {
                      if (typeof value === "boolean") {
                        const Icon = getFeatureIcon(key);
                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center gap-2">
                              {value ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <X className="h-4 w-4 text-red-500" />
                              )}
                              <span className="capitalize">
                                {key.replace(/_/g, " ")}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>

                {/* Billing Cycle */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">
                      Billing Cycle:
                    </span>
                    <Badge variant="outline" className="capitalize">
                      {plan.default_billing_cycle}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {plans.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                No Subscription Plans Found
              </h3>
              <p>No subscription plans are currently available.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
