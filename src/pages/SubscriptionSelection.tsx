import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "@/redux/store";
import {
  fetchSubscriptionPlans,
  SubscriptionPlan,
} from "@/redux/slices/subscriptionSlice";
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
  ArrowRight,
  Phone,
  Mail,
  MapPin as LocationIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import AppNavbar from "@/components/AppNavbar";

export default function SubscriptionSelection() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { plans, loading, error } = useSelector(
    (state: RootState) => state.subscription
  );
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
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

  const getPlanBadge = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes("basic") || name.includes("starter")) {
      return { text: "Starter", variant: "secondary" as const };
    } else if (name.includes("pro") || name.includes("professional")) {
      return { text: "Popular", variant: "default" as const };
    } else if (name.includes("enterprise") || name.includes("premium")) {
      return { text: "Enterprise", variant: "default" as const };
    }
    return null;
  };

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes("basic") || name.includes("starter")) {
      return <Users className="h-6 w-6" />;
    } else if (name.includes("pro") || name.includes("professional")) {
      return <TrendingUp className="h-6 w-6" />;
    } else if (name.includes("enterprise") || name.includes("premium")) {
      return <Crown className="h-6 w-6" />;
    }
    return <Bus className="h-6 w-6" />;
  };

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };

  const handleContinue = () => {
    if (selectedPlan) {
      // Store selected plan in localStorage for registration page
      localStorage.setItem(
        "selectedSubscriptionPlan",
        JSON.stringify(selectedPlan)
      );
      navigate("/register", {
        state: {
          selectedPlan: selectedPlan,
          fromSubscription: true,
        },
      });
    }
  };

  // Ensure plans is an array and handle edge cases
  const plansArray = Array.isArray(plans) ? plans : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navbar */}
      <AppNavbar onMenuClick={() => {}} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px- py-1">
        <div className="text-center mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 ">
            Select Your Perfect
            <span className="text-emerald-600 block">Subscription Plan</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Choose the plan that best fits your school's needs. You can always
            upgrade or downgrade later.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {plansArray.map((plan) => {
            const badge = getPlanBadge(plan.name);
            const planIcon = getPlanIcon(plan.name);
            const isSelected = selectedPlan?.id === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative border-2 transition-all duration-300 hover:-translate-y-1 rounded-xl overflow-hidden cursor-pointer ${
                  isSelected
                    ? "border-emerald-600 shadow-lg scale-102 bg-emerald-50"
                    : "border-slate-200 shadow-md hover:shadow-lg bg-white"
                }`}
                onClick={() => handlePlanSelect(plan)}
              >
                {!plan.is_active && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge variant="secondary">Inactive</Badge>
                  </div>
                )}

                {isSelected && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-emerald-600 text-white">
                      Selected
                    </Badge>
                  </div>
                )}

                {badge && !isSelected && (
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

                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                      {planIcon}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900 mb-2">
                    {plan.name
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </CardTitle>
                  <CardDescription className="text-slate-600 text-sm">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-6">
                  {/* Pricing */}
                  <div className="text-center mb-4">
                    <div className="mb-2">
                      <span className="text-2xl font-bold text-slate-900">
                        {formatPrice(plan.base_price)}
                      </span>
                      <span className="text-slate-600">/month</span>
                    </div>
                    <div className="text-xs text-slate-500 space-y-1">
                      <div>
                        + {formatPrice(plan.price_per_student)} per student
                      </div>
                      <div>+ {formatPrice(plan.price_per_bus)} per bus</div>
                    </div>
                  </div>

                  {/* Limits */}
                  <div className="mb-4">
                    <h4 className="font-medium text-slate-900 mb-2 text-center text-sm">
                      Plan Limits
                    </h4>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-1 bg-slate-50 rounded">
                        <div className="font-semibold text-emerald-600">
                          {plan.features_json.max_students}
                        </div>
                        <div className="text-slate-500 text-xs">Students</div>
                      </div>
                      <div className="text-center p-1 bg-slate-50 rounded">
                        <div className="font-semibold text-emerald-600">
                          {plan.features_json.max_parents}
                        </div>
                        <div className="text-slate-500 text-xs">Parents</div>
                      </div>
                      <div className="text-center p-1 bg-slate-50 rounded">
                        <div className="font-semibold text-emerald-600">
                          {plan.features_json.max_buses}
                        </div>
                        <div className="text-slate-500 text-xs">Buses</div>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-4">
                    <h4 className="font-medium text-slate-900 mb-2 text-sm">
                      Features
                    </h4>
                    <div className="space-y-1">
                      {Object.entries(plan.features_json).map(
                        ([key, value]) => {
                          if (typeof value === "boolean") {
                            const Icon = getFeatureIcon(key);
                            return (
                              <div
                                key={key}
                                className="flex items-center justify-between text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  {value ? (
                                    <Check className="h-3 w-3 text-emerald-500" />
                                  ) : (
                                    <X className="h-3 w-3 text-red-500" />
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
                  <div className="pt-3 border-t border-slate-200 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Billing Cycle:</span>
                      <Badge variant="outline" className="capitalize text-xs">
                        {plan.default_billing_cycle}
                      </Badge>
                    </div>
                  </div>

                  {/* Continue Button - Show inside card when selected */}
                  {isSelected && (
                    <div className="pt-3 border-t border-slate-200">
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
                        onClick={handleContinue}
                      >
                        Continue to Registration
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {plansArray.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                No Subscription Plans Available
              </h3>
              <p>Please contact support to set up subscription plans.</p>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Star className="h-4 w-4 text-emerald-600" />
              <span className="text-emerald-800 font-semibold text-sm">
                All plans include:
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-emerald-700">
              <div className="flex items-center justify-center space-x-2">
                <Check className="h-3 w-3" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Check className="h-3 w-3" />
                <span>Free Setup</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Check className="h-3 w-3" />
                <span>No Hidden Fees</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Bus className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">LuxCub</span>
              </div>
              <p className="text-slate-300 mb-6 leading-relaxed max-w-md">
                Modern school transportation management platform that helps
                schools improve safety, efficiency, and parent satisfaction.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  <Phone className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  <Mail className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  <LocationIcon className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Product</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-slate-300 hover:text-emerald-400 transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-300 hover:text-emerald-400 transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-300 hover:text-emerald-400 transition-colors"
                  >
                    Demo
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-300 hover:text-emerald-400 transition-colors"
                  >
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Company</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-slate-300 hover:text-emerald-400 transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-300 hover:text-emerald-400 transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-300 hover:text-emerald-400 transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-300 hover:text-emerald-400 transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center">
            <p className="text-slate-400">
              © 2024 LuxCub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
