import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle,
  Mail,
  Phone,
  ArrowLeft,
  Building2,
} from "lucide-react";

const Verification = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50 p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
            <Clock className="h-10 w-10 text-amber-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-slate-900 mb-2">
            Registration Under Review
          </CardTitle>
          <CardDescription className="text-lg text-slate-600">
            Thank you for registering your school with LuxCub. We're currently
            reviewing your application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Badge */}
          <div className="text-center">
            <Badge
              variant="secondary"
              className="bg-amber-100 text-amber-800 border-amber-200 px-4 py-2 text-base"
            >
              <Clock className="h-4 w-4 mr-2" />
              Pending Verification
            </Badge>
          </div>

          {/* What happens next */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">
              What happens next?
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-sm font-semibold text-emerald-600">
                    1
                  </span>
                </div>
                <div>
                  <p className="text-slate-700 font-medium">
                    Application Review
                  </p>
                  <p className="text-slate-600 text-sm">
                    Our team will review your school information and verify
                    details.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-sm font-semibold text-emerald-600">
                    2
                  </span>
                </div>
                <div>
                  <p className="text-slate-700 font-medium">
                    Contact Verification
                  </p>
                  <p className="text-slate-600 text-sm">
                    We'll contact you to verify your information and discuss
                    setup.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-sm font-semibold text-emerald-600">
                    3
                  </span>
                </div>
                <div>
                  <p className="text-slate-700 font-medium">Account Setup</p>
                  <p className="text-slate-600 text-sm">
                    Once approved, we'll set up your account and provide access
                    credentials.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Expected Timeline
            </h3>
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span className="text-slate-700 font-medium">
                    Application Submitted
                  </span>
                </div>
                <span className="text-sm text-slate-500">Today</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <span className="text-slate-700 font-medium">
                    Under Review
                  </span>
                </div>
                <span className="text-sm text-slate-500">
                  1-2 business days
                </span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-500 font-medium">
                    Account Setup
                  </span>
                </div>
                <span className="text-sm text-slate-500">
                  2-3 business days
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Need Help?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <Mail className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Email Support
                  </p>
                  <p className="text-xs text-slate-600">hello@luxcub.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <Phone className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Phone Support
                  </p>
                  <p className="text-xs text-slate-600">+1 (555) 123-4567</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/home")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => navigate("/login")}
            >
              Try Demo Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Verification;
