import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  fetchSubscriptionPlans,
  SubscriptionPlan as ApiSubscriptionPlan,
} from "@/redux/slices/subscriptionSlice";
import {
  Check,
  Star,
  Zap,
  Shield,
  Users,
  Car,
  Map,
  FileText,
  Settings,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: string;
  features: string[];
  popular?: boolean;
  icon: React.ComponentType<{
    className?: string;
  }>;
  color: string;
  maxStudents?: number;
  maxDrivers?: number;
  maxVehicles?: number;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for small schools getting started",
    price: 2900,
    billingCycle: "month",
    icon: Car,
    color: "bg-blue-500",
    maxStudents: 50,
    maxDrivers: 5,
    maxVehicles: 3,
    features: [
      "Up to 50 students",
      "5 drivers",
      "3 vehicles",
      "Basic route management",
      "Email support",
      "Mobile app access",
      "Real-time tracking",
      "Basic reporting",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    description: "Ideal for growing schools with more students",
    price: 7900,
    billingCycle: "month",
    icon: Users,
    color: "bg-green-500",
    maxStudents: 200,
    maxDrivers: 15,
    maxVehicles: 10,
    popular: true,
    features: [
      "Up to 200 students",
      "15 drivers",
      "10 vehicles",
      "Advanced route optimization",
      "Priority email support",
      "Custom branding",
      "Advanced analytics",
      "Parent notifications",
      "Driver performance tracking",
      "GPS tracking",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large school districts and organizations",
    price: 19900,
    billingCycle: "month",
    icon: Crown,
    color: "bg-purple-500",
    maxStudents: 1000,
    maxDrivers: 50,
    maxVehicles: 30,
    features: [
      "Up to 1000 students",
      "50 drivers",
      "30 vehicles",
      "Multi-school management",
      "24/7 phone support",
      "Custom integrations",
      "Advanced security",
      "White-label solution",
      "API access",
      "Dedicated account manager",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    description: "Ultimate solution for premium schools",
    price: 39900,
    billingCycle: "month",
    icon: Star,
    color: "bg-yellow-500",
    maxStudents: 2500,
    maxDrivers: 100,
    maxVehicles: 75,
    features: [
      "Up to 2500 students",
      "100 drivers",
      "75 vehicles",
      "AI-powered route optimization",
      "Premium support",
      "Custom development",
      "Advanced security features",
      "Multi-language support",
      "Advanced reporting suite",
      "Predictive analytics",
    ],
  },
  {
    id: "unlimited",
    name: "Unlimited",
    description: "Unlimited everything for the biggest organizations",
    price: 79900,
    billingCycle: "month",
    icon: Zap,
    color: "bg-red-500",
    maxStudents: -1, // Unlimited
    maxDrivers: -1,
    maxVehicles: -1,
    features: [
      "Unlimited students",
      "Unlimited drivers",
      "Unlimited vehicles",
      "Enterprise-grade security",
      "Custom SLA",
      "On-premise deployment option",
      "Full source code access",
      "Custom training",
      "Dedicated support team",
      "Priority feature development",
    ],
  },
  {
    id: "custom",
    name: "Custom",
    description: "Tailored solution for your specific needs",
    price: 0,
    billingCycle: "custom",
    icon: Settings,
    color: "bg-gray-500",
    features: [
      "Custom pricing",
      "Custom features",
      "Custom integrations",
      "Custom deployment",
      "Custom training",
      "Custom support",
      "Custom branding",
      "Custom reporting",
      "Custom security",
      "Custom everything",
    ],
  },
];

export default function Subscription() {
  const dispatch = useDispatch<AppDispatch>();
  const { plans, loading, error } = useSelector(
    (state: RootState) => state.subscription
  );
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"month" | "year">("month");
  const { toast } = useToast();

  useEffect(() => {
    dispatch(fetchSubscriptionPlans());
  }, [dispatch]);

  const handleSubscribe = (planId: string) => {
    setSelectedPlan(planId);
    toast({
      title: "Subscription Selected",
      description: `You've selected the ${
        displayPlans.find((p) => p.id === planId)?.name
      } plan. Redirecting to payment...`,
    });
    // Here you would typically redirect to a payment processor
  };

  const getDiscountedPrice = (price: number) => {
    if (billingCycle === "year") {
      return Math.round(price * 12 * 0.8); // 20% discount for annual
    }
    return price;
  };

  const getBillingText = (plan: SubscriptionPlan) => {
    if (plan.id === "custom") return "Contact us";

    if (billingCycle === "year") {
      return `KSH ${getDiscountedPrice(plan.price).toLocaleString()}/year`;
    }
    return `KSH ${plan.price.toLocaleString()}/${plan.billingCycle}`;
  };

  // Transform API data to match the component's expected format
  const transformApiPlan = (apiPlan: ApiSubscriptionPlan): SubscriptionPlan => {
    const basePrice = parseFloat(apiPlan.base_price);
    const pricePerStudent = parseFloat(apiPlan.price_per_student);
    const pricePerBus = parseFloat(apiPlan.price_per_bus);

    // Calculate total price based on features
    const totalPrice =
      basePrice +
      apiPlan.features_json.max_students * pricePerStudent +
      apiPlan.features_json.max_buses * pricePerBus;

    return {
      id: apiPlan.name,
      name: apiPlan.name
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      description: apiPlan.description,
      price: totalPrice,
      billingCycle:
        apiPlan.default_billing_cycle === "annually" ? "year" : "month",
      icon: Car, // Default icon
      color: "bg-blue-500", // Default color
      maxStudents: apiPlan.features_json.max_students,
      maxDrivers: apiPlan.features_json.max_buses, // Using buses as drivers
      maxVehicles: apiPlan.features_json.max_buses,
      features: [
        `Up to ${apiPlan.features_json.max_students} students`,
        `${apiPlan.features_json.max_buses} buses`,
        apiPlan.features_json.sms_notifications ? "SMS notifications" : null,
        apiPlan.features_json.whatsapp_integration
          ? "WhatsApp integration"
          : null,
        apiPlan.features_json.realtime_tracking ? "Real-time tracking" : null,
        apiPlan.features_json.parent_app_access ? "Parent app access" : null,
        apiPlan.features_json.basic_reports ? "Basic reports" : null,
        apiPlan.features_json.driver_management ? "Driver management" : null,
        apiPlan.features_json.route_optimization ? "Route optimization" : null,
        apiPlan.features_json.advanced_analytics ? "Advanced analytics" : null,
        apiPlan.features_json.api_access ? "API access" : null,
      ].filter(Boolean) as string[],
    };
  };

  // Use API data if available, otherwise fall back to hardcoded data
  const displayPlans =
    plans.length > 0 ? plans.map(transformApiPlan) : subscriptionPlans;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium mb-2">
                Loading Subscription Plans
              </h3>
              <p>Please wait while we fetch the latest plans...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className=" mb-3">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Choose Your Subscription Plan
          </h1>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify- mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border dark:border-gray-700">
            <div className="flex">
              <button
                onClick={() => setBillingCycle("month")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === "month"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("year")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === "year"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Yearly
                <Badge variant="secondary" className="ml-2 text-xs">
                  Save 20%
                </Badge>
              </button>
            </div>
          </div>
        </div>

        {/* Subscription Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 flex flex-col h-full ${
                plan.popular
                  ? "ring-2 ring-green-500 shadow-lg bg-gradient-to-br from-green-50 to-white"
                  : "hover:ring-2 hover:ring-blue-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 mb-3 right-0 bg-green-500 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
                  Most Popular
                </div>
              )}

              <CardHeader className="text-center mt-1 pb-4">
                <div
                  className={`inline-flex items-center gap-2 p-3 rounded-full ${plan.color} text-white mb-4`}
                >
                  <plan.icon className="h-6 w-6" />
                  <CardTitle className={`text-2xl ${plan.color} font-bold`}>
                    {plan.name}{" "}
                  </CardTitle>
                </div>

                <CardDescription className="text-gray-600 dark:text-gray-300">
                  {plan.description}{" "}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 flex-1">
                {/* Pricing */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">
                    {plan.id === "custom"
                      ? "Custom"
                      : `KSH ${getDiscountedPrice(
                          plan.price
                        ).toLocaleString()}`}{" "}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    {getBillingText(plan)}
                  </div>
                  {billingCycle === "year" && plan.id !== "custom" && (
                    <div className="text-sm text-green-600 font-medium mt-1">
                      Save KSH{" "}
                      {(
                        plan.price * 12 -
                        getDiscountedPrice(plan.price)
                      ).toLocaleString()}
                      /year
                    </div>
                  )}{" "}
                </div>

                {/* Limits */}
                {plan.maxStudents !== -1 && (
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {plan.maxStudents === -1 ? "∞" : plan.maxStudents}{" "}
                      </div>
                      <div className="text-gray-600 dark:text-gray-300">
                        Students
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {plan.maxDrivers === -1 ? "∞" : plan.maxDrivers}{" "}
                      </div>
                      <div className="text-gray-600 dark:text-gray-300">
                        Drivers
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {plan.maxVehicles === -1 ? "∞" : plan.maxVehicles}{" "}
                      </div>
                      <div className="text-gray-600 dark:text-gray-300">
                        Vehicles
                      </div>
                    </div>
                  </div>
                )}

                {/* Features */}
                <div className="space-y-3 flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Features:
                  </h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}{" "}
                  </ul>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  className={`w-full ${
                    plan.popular
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                  variant={plan.popular ? "default" : "default"}
                >
                  {plan.id === "custom" ? "Contact Sales" : "Choose Plan"}{" "}
                </Button>
              </CardFooter>
            </Card>
          ))}{" "}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              All Plans Include
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-green-500" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    Security
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Enterprise-grade security
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Map className="h-6 w-6 text-blue-500" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    Real-time Tracking
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Live GPS tracking
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-purple-500" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    Reports
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Comprehensive analytics
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
