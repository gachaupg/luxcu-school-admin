import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Pricing() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { plans, loading, error } = useSelector(
    (state: RootState) => state.subscription
  );
  const [billingCycle, setBillingCycle] = useState<"month" | "year">("month");

  useEffect(() => {
    dispatch(fetchSubscriptionPlans());
  }, [dispatch]);

  const handlePlanSelection = (plan: any) => {
    // Store the selected plan in localStorage
    localStorage.setItem("selectedSubscriptionPlan", JSON.stringify(plan));

    // Navigate to school registration with the selected plan
    navigate("/register", {
      state: { selectedPlan: plan },
    });
  };

  const getFeatureIcon = (featureName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      students: <Users className="h-4 w-4" />,
      drivers: <Bus className="h-4 w-4" />,
      vehicles: <Bus className="h-4 w-4" />,
      tracking: <Map className="h-4 w-4" />,
      analytics: <BarChart3 className="h-4 w-4" />,
      support: <MessageSquare className="h-4 w-4" />,
      security: <Shield className="h-4 w-4" />,
      optimization: <Zap className="h-4 w-4" />,
      custom: <Settings className="h-4 w-4" />,
    };

    return iconMap[featureName.toLowerCase()] || <Check className="h-4 w-4" />;
  };

  const getDiscountedPrice = (price: number) => {
    if (billingCycle === "year") {
      return Math.round(price * 12 * 0.8); // 20% discount for annual
    }
    return price;
  };

  const getBillingText = (plan: any) => {
    if (plan.id === "custom") return "Contact us";

    if (billingCycle === "year") {
      return `KSH ${getDiscountedPrice(plan.price).toLocaleString()}/year`;
    }
    return `KSH ${plan.price.toLocaleString()}/${plan.billingCycle}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-2/3 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-96 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Error Loading Pricing
            </h1>
            <p className="text-gray-600 mb-8">
              Unable to load pricing information. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 pt-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <Badge
            variant="secondary"
            className="bg-emerald-100 text-emerald-800 mb-4"
          >
            Pricing Plans
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose the Perfect Plan for Your School
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Flexible pricing options designed to meet the needs of schools of
            all sizes. Start with what you need and scale as you grow.
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => setBillingCycle("month")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === "month"
                  ? "bg-emerald-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("year")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === "year"
                  ? "bg-emerald-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Yearly
              <span className="ml-1 text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative h-full transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? "ring-2 ring-emerald-500 shadow-lg"
                  : "hover:scale-105"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 flex-1">
                {/* Pricing */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900">
                    {plan.id === "custom"
                      ? "Custom"
                      : `KSH ${getDiscountedPrice(
                          plan.price
                        ).toLocaleString()}`}
                  </div>
                  <div className="text-gray-600">{getBillingText(plan)}</div>
                  {billingCycle === "year" && plan.id !== "custom" && (
                    <div className="text-sm text-green-600 font-medium mt-1">
                      Save KSH{" "}
                      {(
                        plan.price * 12 -
                        getDiscountedPrice(plan.price)
                      ).toLocaleString()}
                      /year
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {plan.features?.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => handlePlanSelection(plan)}
                  className={`w-full ${
                    plan.popular
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-gray-900 hover:bg-gray-800"
                  } text-white`}
                >
                  {plan.id === "custom" ? "Contact Sales" : "Get Started"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I change my plan later?
                </h3>
                <p className="text-gray-600">
                  Yes, you can upgrade or downgrade your plan at any time.
                  Changes will be reflected in your next billing cycle.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Is there a setup fee?
                </h3>
                <p className="text-gray-600">
                  No setup fees for any of our plans. You only pay the monthly
                  or yearly subscription fee.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-gray-600">
                  We accept all major credit cards, bank transfers, and mobile
                  money payments for your convenience.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Do you offer a free trial?
                </h3>
                <p className="text-gray-600">
                  Yes, we offer a 14-day free trial for all plans so you can
                  experience our platform before committing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
