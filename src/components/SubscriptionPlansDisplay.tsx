import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
  Star,
  Crown,
  TrendingUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SubscriptionPlansDisplay() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { plans, loading, error } = useSelector(
    (state: RootState) => state.subscription
  );

 

  useEffect(() => {
    dispatch(fetchSubscriptionPlans());
  }, [dispatch]);

  const handlePlanSelection = (plan: {
    id: string;
    name: string;
    description: string;
    base_price: string;
    price_per_student: string;
    price_per_bus: string;
    features_json: Record<string, boolean | number>;
    is_active: boolean;
    default_billing_cycle: string;
  }) => {
    // Store the selected plan in localStorage
    localStorage.setItem("selectedSubscriptionPlan", JSON.stringify(plan));

    // Navigate to school registration with the selected plan
    navigate("/register", {
      state: { selectedPlan: plan },
    });
  };

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

  const getPlanBadge = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes("basic") || name.includes("starter")) {
      return { text: "Starter", variant: "secondary" as const };
    } else if (name.includes("standard")) {
      return { text: "Popular", variant: "default" as const };
    } else if (name.includes("pro") || name.includes("professional")) {
      return { text: "Popular", variant: "default" as const };
    } else if (name.includes("enterprise") || name.includes("premium")) {
      return { text: "Enterprise", variant: "default" as const };
    }
    return null;
  };

  const getPlanDisplayName = (planName: string) => {
    const name = planName.toLowerCase();

    if (name.includes("basic")) {
      return "Basic Plan";
    } else if (name.includes("standard")) {
      return "Standard Plan";
    } else if (name.includes("premium")) {
      return "Premium Plan";
    } else if (name.includes("pro") || name.includes("professional")) {
      return "Professional Plan";
    } else if (name.includes("enterprise")) {
      return "Enterprise Plan";
    }
    // Fallback: format the original name
    return planName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes("basic") || name.includes("starter")) {
      return <Users className="h-6 w-6" />;
    } else if (
      name.includes("standard") ||
      name.includes("pro") ||
      name.includes("professional")
    ) {
      return <TrendingUp className="h-6 w-6" />;
    } else if (name.includes("enterprise") || name.includes("premium")) {
      return <Crown className="h-6 w-6" />;
    }
    return <Bus className="h-6 w-6" />;
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Skeleton className="h-8 w-32 mx-auto mb-4" />
            <Skeleton className="h-12 w-96 mx-auto mb-6" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-0 shadow-lg">
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
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <h2 className="text-red-800 font-semibold text-xl mb-2">
              Error Loading Subscription Plans
            </h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button
              onClick={() => dispatch(fetchSubscriptionPlans())}
              className="bg-red-600 hover:bg-red-700"
            >
              Retry
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // Ensure plans is an array and handle edge cases
  const plansArray = Array.isArray(plans) ? plans : [];

  // Fallback plans if no data is available
  const fallbackPlans = [
    {
      id: "1",
      name: "Basic Plan",
      description: "Perfect for small schools getting started",
      base_price: "299.00",
      price_per_student: "5.00",
      price_per_bus: "50.00",
      features_json: {
        max_students: 100,
        max_parents: 200,
        max_buses: 5,
        sms_notifications: true,
        whatsapp_integration: false,
        realtime_tracking: true,
        parent_app_access: true,
        basic_reports: true,
        driver_management: true,
        route_optimization: false,
        advanced_analytics: false,
        api_access: false,
      },
      is_active: true,
      default_billing_cycle: "monthly",
    },
    {
      id: "2",
      name: "Professional Plan",
      description: "Ideal for medium-sized school districts",
      base_price: "599.00",
      price_per_student: "3.00",
      price_per_bus: "40.00",
      features_json: {
        max_students: 500,
        max_parents: 1000,
        max_buses: 20,
        sms_notifications: true,
        whatsapp_integration: true,
        realtime_tracking: true,
        parent_app_access: true,
        basic_reports: true,
        driver_management: true,
        route_optimization: true,
        advanced_analytics: true,
        api_access: false,
      },
      is_active: true,
      default_billing_cycle: "monthly",
    },
    {
      id: "3",
      name: "Enterprise Plan",
      description: "For large school districts with advanced needs",
      base_price: "999.00",
      price_per_student: "2.00",
      price_per_bus: "30.00",
      features_json: {
        max_students: 2000,
        max_parents: 4000,
        max_buses: 50,
        sms_notifications: true,
        whatsapp_integration: true,
        realtime_tracking: true,
        parent_app_access: true,
        basic_reports: true,
        driver_management: true,
        route_optimization: true,
        advanced_analytics: true,
        api_access: true,
      },
      is_active: true,
      default_billing_cycle: "monthly",
    },
  ];

  const displayPlans = plansArray.length > 0 ? plansArray : fallbackPlans;
  const usingFallback = plansArray.length === 0;

  if (displayPlans.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                No Subscription Plans Available
              </h3>
              <p>Please check back later for available plans.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-emerald-100 text-emerald-800 border-emerald-200 px-4 py-2 rounded-full">
            Pricing Plans
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Choose Your Perfect
            <span className="text-emerald-600 block">Subscription Plan</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Flexible pricing options designed to meet the needs of schools of
            all sizes. Start with what you need and scale as you grow.
          </p>
          {usingFallback && (
            <div className="mt-4">
              <Badge
                variant="outline"
                className="bg-yellow-50 text-yellow-700 border-yellow-200"
              >
                Demo Data
              </Badge>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayPlans.map((plan) => {
            const badge = getPlanBadge(plan.name);
            const planIcon = getPlanIcon(plan.name);

            return (
              <Card
                key={plan.id}
                className={`relative border-2 transition-all duration-300 hover:-translate-y-2 rounded-2xl overflow-hidden ${
                  badge?.text === "Popular"
                    ? "border-emerald-600 shadow-xl scale-105"
                    : "border-slate-200 shadow-lg hover:shadow-xl"
                } bg-white`}
              >
                {!plan.is_active && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge variant="secondary">Inactive</Badge>
                  </div>
                )}

                {badge && (
                  <div
                    className={`text-center py-2 text-sm font-medium ${
                      badge.text === "Popular"
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {badge.text}
                  </div>
                )}

                <CardHeader className="text-center pb-6">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                      {planIcon}
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900 mb-2">
                    {getPlanDisplayName(plan.name)}
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-8">
                  {/* Pricing */}
                  <div className="text-center mb-6">
                    <div className="mb-2">
                      <span className="text-3xl font-bold text-slate-900">
                        {formatPrice(plan.base_price)}
                      </span>
                      <span className="text-slate-600">/month</span>
                    </div>
                    <div className="text-sm text-slate-500 space-y-1">
                      <div>
                        + {formatPrice(plan.price_per_student)} per student
                      </div>
                      <div>+ {formatPrice(plan.price_per_bus)} per bus</div>
                    </div>
                  </div>

                  {/* Limits */}
                  <div className="mb-6">
                    <h4 className="font-medium text-slate-900 mb-3 text-center">
                      Plan Limits
                    </h4>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="text-center p-2 bg-slate-50 rounded-lg">
                        <div className="font-semibold text-emerald-600">
                          {plan.features_json.max_students}
                        </div>
                        <div className="text-slate-500 text-xs">Students</div>
                      </div>
                      <div className="text-center p-2 bg-slate-50 rounded-lg">
                        <div className="font-semibold text-emerald-600">
                          {plan.features_json.max_parents}
                        </div>
                        <div className="text-slate-500 text-xs">Parents</div>
                      </div>
                      <div className="text-center p-2 bg-slate-50 rounded-lg">
                        <div className="font-semibold text-emerald-600">
                          {plan.features_json.max_buses}
                        </div>
                        <div className="text-slate-500 text-xs">Buses</div>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="font-medium text-slate-900 mb-3">
                      Features
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(plan.features_json).map(
                        ([key, value]) => {
                          if (typeof value === "boolean") {
                            const Icon = getFeatureIcon(key);
                            return (
                              <div
                                key={key}
                                className="flex items-center justify-between text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  {value ? (
                                    <Check className="h-4 w-4 text-emerald-500" />
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
                        }
                      )}
                    </div>
                  </div>

                  {/* Billing Cycle */}
                  <div className="pt-4 border-t border-slate-200 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Billing Cycle:</span>
                      <Badge variant="outline" className="capitalize">
                        {plan.default_billing_cycle}
                      </Badge>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    className={`w-full py-3 rounded-xl font-medium transition-all duration-200 ${
                      badge?.text === "Popular"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105"
                        : "bg-slate-100 hover:bg-emerald-600 text-slate-700 hover:text-white hover:scale-105"
                    }`}
                    disabled={!plan.is_active}
                    onClick={() => plan.is_active && handlePlanSelection(plan)}
                  >
                    {plan.is_active ? "Get Started" : "Coming Soon"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-emerald-50 p-8 rounded-2xl border border-emerald-200">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Star className="h-5 w-5 text-emerald-600" />
              <span className="text-emerald-800 font-semibold">
                All plans include:
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-emerald-700">
              <div className="flex items-center justify-center space-x-2">
                <Check className="h-4 w-4" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Check className="h-4 w-4" />
                <span>Free Setup</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Check className="h-4 w-4" />
                <span>No Hidden Fees</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
