import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DemoRequestModal from "@/components/DemoRequestModal";
import { useAppSelector } from "@/redux/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  Bus,
  CheckCircle,
  Clock,
  MapPin,
  Play,
  Shield,
  Star,
  Users,
  Zap,
  TrendingUp,
  Award,
  Phone,
  Mail,
  MapPin as LocationIcon,
  ChevronDown,
  ChevronUp,
  Send,
  Globe,
  Headphones,
  MessageSquare,
  Calendar,
  DollarSign,
  Truck,
  Wifi,
  Camera,
  AlertTriangle,
  Building2,
  GraduationCap,
  Route,
  Timer,
  Smartphone,
  Database,
  Lock,
  BarChart3,
} from "lucide-react";

const Landing = () => {
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showDemoRequestModal, setShowDemoRequestModal] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Get authentication state
  const { token, user } = useAppSelector((state) => state.auth);
  const isAuthenticated = !!token && !!user;

  // Check if user has logged in before (has login history)
  const hasLoginHistory = () => {
    // Check if there's any auth data in localStorage
    const persistData = localStorage.getItem("persist:auth");
    const tokenData = localStorage.getItem("token");
    const profileData = localStorage.getItem("profile");

    return !!(persistData || tokenData || profileData);
  };

  const isExistingUser = hasLoginHistory();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const nav = document.querySelector("nav");
      if (nav) {
        if (scrolled > 10) {
          nav.classList.add("shadow-lg", "bg-white/95");
        } else {
          nav.classList.remove("shadow-lg", "bg-white/95");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: <Bus className="h-8 w-8 text-emerald-600" />,
      title: "Real-time GPS Tracking",
      description:
        "Track every school bus in real-time with precise location data and live updates for parents and administrators.",
    },
    {
      icon: <Shield className="h-8 w-8 text-emerald-600" />,
      title: "Advanced Safety Features",
      description:
        "Comprehensive safety monitoring including speed alerts, route compliance, and emergency response systems.",
    },
    {
      icon: <Zap className="h-8 w-8 text-emerald-600" />,
      title: "AI Route Optimization",
      description:
        "Intelligent route planning that reduces fuel costs, travel time, and ensures optimal efficiency.",
    },
    {
      icon: <Users className="h-8 w-8 text-emerald-600" />,
      title: "Parent Portal",
      description:
        "Dedicated mobile app for parents to track their child's bus location and receive real-time notifications.",
    },
    {
      icon: <Clock className="h-8 w-8 text-emerald-600" />,
      title: "Live Updates",
      description:
        "Instant notifications for delays, route changes, and arrival times to keep everyone informed.",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-emerald-600" />,
      title: "Analytics Dashboard",
      description:
        "Comprehensive reporting and analytics to optimize operations and improve efficiency.",
    },
  ];

  const benefits = [
    "Reduce transportation costs by up to 30%",
    "Improve safety with real-time monitoring",
    "Enhance parent satisfaction and communication",
    "Streamline administrative operations",
    "Ensure compliance with transportation regulations",
    "Provide data-driven insights for optimization",
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "School Principal",
      content:
        "The transportation system has revolutionized how we manage our school buses. Parents love the real-time updates!",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Michael Chen",
      role: "Transportation Director",
      content:
        "The analytics and reporting features have made our operations so much more efficient. Highly recommended!",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&sat=-100&brightness=0.8&contrast=1.2",
    },
    {
      name: "Lisa Rodriguez",
      role: "Parent",
      content:
        "Knowing exactly where my child's bus is gives me complete peace of mind. The app is fantastic!",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&sat=-100&brightness=0.8&contrast=1.2",
    },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$299",
      period: "/month",
      description: "Perfect for small schools",
      features: [
        "Up to 10 buses",
        "Real-time GPS tracking",
        "Parent mobile app",
        "Basic reporting",
        "Email support",
      ],
      popular: false,
    },
    {
      name: "Professional",
      price: "$599",
      period: "/month",
      description: "Ideal for medium-sized districts",
      features: [
        "Up to 50 buses",
        "Advanced safety features",
        "AI route optimization",
        "Comprehensive analytics",
        "Priority support",
        "Custom integrations",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$999",
      period: "/month",
      description: "For large school districts",
      features: [
        "Unlimited buses",
        "All features included",
        "Custom development",
        "Dedicated support",
        "White-label options",
        "API access",
      ],
      popular: false,
    },
  ];

  const faqs = [
    {
      question: "How does the GPS tracking work?",
      answer:
        "Our system uses advanced GPS technology to provide real-time location data for every school bus. Parents and administrators can track buses through our mobile app or web dashboard with updates every 30 seconds.",
    },
    {
      question: "Is the system secure and private?",
      answer:
        "Yes, we prioritize security and privacy. All data is encrypted, and we comply with FERPA and other educational privacy regulations. Student information is protected with industry-standard security measures.",
    },
    {
      question: "Can parents track multiple children?",
      answer:
        "Absolutely! Parents can track multiple children from a single account. Each child's bus location and schedule is clearly displayed with individual notifications and updates.",
    },
    {
      question: "What happens during emergencies?",
      answer:
        "Our system includes emergency protocols with instant alerts to administrators, drivers, and parents. We provide real-time communication channels and emergency response coordination.",
    },
    {
      question: "How long does implementation take?",
      answer:
        "Most schools are up and running within 2-3 weeks. Our team handles installation, training, and setup to ensure a smooth transition with minimal disruption to your operations.",
    },
  ];

  const stats = [
    { number: "500+", label: "Schools Trust Us" },
    { number: "50,000+", label: "Students Transported" },
    { number: "99.9%", label: "Uptime Reliability" },
    { number: "4.9/5", label: "Customer Rating" },
  ];

  const contactInfo = [
    {
      icon: <Phone className="h-6 w-6 text-emerald-600" />,
      title: "Phone Support",
      description: "24/7 dedicated support",
      value: "+1 (555) 123-4567",
    },
    {
      icon: <Mail className="h-6 w-6 text-emerald-600" />,
      title: "Email Support",
      description: "Quick response guaranteed",
      value: "hello@luxcub.com",
    },
    {
      icon: <LocationIcon className="h-6 w-6 text-emerald-600" />,
      title: "Office Location",
      description: "Visit our headquarters",
      value: "123 Innovation Drive, Tech City, TC 12345",
    },
  ];

  return (
    <div className="min-h-screen bg-white from-slate-50 via-white to-emerald-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-white">LuxCub</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-white hover:text-emerald-300 transition-colors font-medium"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-white hover:text-emerald-300 transition-colors font-medium"
              >
                Pricing
              </a>
              <a
                href="#contact"
                className="text-white hover:text-emerald-300 transition-colors font-medium"
              >
                Contact
              </a>
            </div>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
              onClick={() => navigate(isAuthenticated ? "/" : "/login")}
            >
              {isAuthenticated
                ? "Dashboard"
                : isExistingUser
                ? "Login"
                : "Get Started"}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 pt-16"
      >
        {/* Enhanced Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated gradient waves */}
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-500 via-cyan-500 to-teal-400 rounded-full opacity-40 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-20 w-80 h-80 bg-gradient-to-tr from-cyan-500 via-emerald-500 to-teal-400 rounded-full opacity-30 blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-emerald-400 via-teal-500 to-cyan-400 rounded-full opacity-25 blur-3xl animate-pulse delay-2000"></div>

          {/* Enhanced floating particles */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-1/4 w-1 h-4 bg-gradient-to-b from-emerald-400 to-transparent opacity-80 animate-bounce"></div>
            <div className="absolute top-40 right-1/3 w-1 h-3 bg-gradient-to-b from-cyan-400 to-transparent opacity-80 animate-bounce delay-300"></div>
            <div className="absolute top-60 left-1/2 w-1 h-5 bg-gradient-to-b from-teal-400 to-transparent opacity-80 animate-bounce delay-600"></div>
            <div className="absolute top-80 right-1/4 w-1 h-4 bg-gradient-to-b from-emerald-400 to-transparent opacity-80 animate-bounce delay-900"></div>
            <div className="absolute top-32 left-3/4 w-1 h-3 bg-gradient-to-b from-cyan-400 to-transparent opacity-80 animate-bounce delay-1200"></div>
          </div>

          {/* Floating orbs with enhanced styling */}
          <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-full opacity-30 blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-full opacity-25 blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/3 left-1/4 w-20 h-20 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-full opacity-20 blur-xl animate-pulse delay-2000"></div>

          {/* Geometric shapes */}
          <div className="absolute top-1/3 left-1/6 w-16 h-16 border border-emerald-400/30 rotate-45 animate-spin-slow"></div>
          <div className="absolute bottom-1/4 right-1/6 w-12 h-12 border border-cyan-400/30 -rotate-45 animate-spin-slow-reverse"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Left Content */}
            <div className="text-left space-y-6">
              {/* Enhanced Badge */}
              <Badge
                variant="secondary"
                className={`inline-flex items-center bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 border-emerald-400/40 px-3 py-1.5 rounded-full transition-all duration-1000 backdrop-blur-sm ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                } hover:scale-105 transition-transform shadow-lg`}
              >
                <Star className="h-3 w-3 mr-2 text-emerald-300 animate-pulse" />
                Trusted by 500+ Schools Nationwide
              </Badge>

              {/* Enhanced Main Headline */}
              <div className="space-y-3">
                <h1
                  className={`text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight transition-all duration-1000 delay-200 ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                >
                  Modern School
                  <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent block">
                    Transportation
                  </span>
                  <span className="text-lg md:text-xl lg:text-2xl font-normal text-white/80 block mt-1">
                    Made Simple
                  </span>
                </h1>
              </div>

              {/* Enhanced Separator line */}
              <div
                className={`w-24 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-1000 delay-300 ${
                  isVisible ? "opacity-100" : "opacity-0"
                }`}
              ></div>

              {/* Enhanced Description */}
              <p
                className={`text-base text-white/90 leading-relaxed max-w-lg transition-all duration-1000 delay-400 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                Transform your school transportation with our comprehensive
                platform. Real-time tracking, smart routes, and complete
                transparency for parents, drivers, and administrators.
              </p>

              {/* Enhanced Call to Action Buttons */}
              <div
                className={`flex flex-col sm:flex-row gap-3 transition-all duration-1000 delay-900 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                <Button
                  size="lg"
                  className="text-sm px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white border-0 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl rounded-xl font-semibold"
                  onClick={() => setShowDemoRequestModal(true)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Request Demo
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-sm px-6 py-3 border-2 border-emerald-400 text-emerald-400 hover:bg-emerald-400/10 hover:scale-105 transition-all duration-300 rounded-xl font-semibold backdrop-blur-sm"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Learn More
                </Button>
              </div>
            </div>

            {/* Enhanced Animated Centerpiece with Moving Car */}
            <div className="relative flex items-center justify-center">
              {/* Main animated circle */}
              <div className="relative w-80 h-80">
                {/* Outer rotating ring with enhanced glow */}
                <div className="absolute inset-0 border-2 border-emerald-400/40 rounded-full animate-spin-slow shadow-lg shadow-emerald-400/20"></div>

                {/* Middle ring with enhanced glow */}
                <div className="absolute inset-4 border-2 border-cyan-400/50 rounded-full animate-spin-slow-reverse shadow-lg shadow-cyan-400/20"></div>

                {/* Inner ring with enhanced glow */}
                <div className="absolute inset-8 border-2 border-teal-400/60 rounded-full animate-spin-slow shadow-lg shadow-teal-400/20"></div>

                {/* Central hub with enhanced styling */}
                <div className="absolute inset-12 bg-gradient-to-br from-emerald-500 via-cyan-500 to-teal-500 rounded-full flex items-center justify-center shadow-2xl">
                  <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                    <Bus className="h-10 w-10 text-white animate-pulse" />
                  </div>
                </div>

                {/* Moving car around the circle */}
                <div className="absolute inset-0 animate-spin-slow">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-6 h-6 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center shadow-lg">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Second moving car in opposite direction */}
                <div className="absolute inset-0 animate-spin-slow-reverse">
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                    <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full flex items-center justify-center shadow-lg">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Enhanced floating elements around the circle */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="w-5 h-5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full animate-bounce shadow-lg"></div>
                </div>
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                  <div className="w-5 h-5 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full animate-bounce delay-300 shadow-lg"></div>
                </div>
                <div className="absolute top-1/2 -left-3 transform -translate-y-1/2">
                  <div className="w-5 h-5 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full animate-bounce delay-600 shadow-lg"></div>
                </div>
                <div className="absolute top-1/2 -right-3 transform -translate-y-1/2">
                  <div className="w-5 h-5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full animate-bounce delay-900 shadow-lg"></div>
                </div>

                {/* Enhanced diagonal floating elements */}
                <div className="absolute top-6 left-6">
                  <div className="w-4 h-4 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full animate-pulse shadow-md"></div>
                </div>
                <div className="absolute top-6 right-6">
                  <div className="w-4 h-4 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full animate-pulse delay-200 shadow-md"></div>
                </div>
                <div className="absolute bottom-6 left-6">
                  <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full animate-pulse delay-400 shadow-md"></div>
                </div>
                <div className="absolute bottom-6 right-6">
                  <div className="w-4 h-4 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full animate-pulse delay-600 shadow-md"></div>
                </div>

                {/* Additional small particles */}
                <div className="absolute top-12 left-12">
                  <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse delay-100"></div>
                </div>
                <div className="absolute top-12 right-12">
                  <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse delay-300"></div>
                </div>
                <div className="absolute bottom-12 left-12">
                  <div className="w-2 h-2 bg-teal-300 rounded-full animate-pulse delay-500"></div>
                </div>
                <div className="absolute bottom-12 right-12">
                  <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse delay-700"></div>
                </div>
              </div>

              {/* Enhanced glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/30 to-cyan-400/30 blur-3xl -z-10 animate-pulse"></div>

              {/* Enhanced data flow lines */}
              <div className="absolute inset-0">
                <svg className="w-full h-full" viewBox="0 0 320 320">
                  <defs>
                    <linearGradient
                      id="dataFlow"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        style={{ stopColor: "#10b981", stopOpacity: 0.8 }}
                      />
                      <stop
                        offset="100%"
                        style={{ stopColor: "#06b6d4", stopOpacity: 0.8 }}
                      />
                    </linearGradient>
                    <linearGradient
                      id="dataFlow2"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        style={{ stopColor: "#06b6d4", stopOpacity: 0.6 }}
                      />
                      <stop
                        offset="100%"
                        style={{ stopColor: "#0d9488", stopOpacity: 0.6 }}
                      />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="160"
                    cy="160"
                    r="150"
                    fill="none"
                    stroke="url(#dataFlow)"
                    strokeWidth="2"
                    strokeDasharray="8,8"
                    className="animate-spin-slow"
                  />
                  <circle
                    cx="160"
                    cy="160"
                    r="130"
                    fill="none"
                    stroke="url(#dataFlow2)"
                    strokeWidth="1.5"
                    strokeDasharray="5,5"
                    className="animate-spin-slow-reverse"
                  />
                  <circle
                    cx="160"
                    cy="160"
                    r="110"
                    fill="none"
                    stroke="url(#dataFlow)"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    className="animate-spin-slow"
                  />
                </svg>
              </div>

              {/* Connection lines between elements */}
              <div className="absolute inset-0">
                <svg className="w-full h-full" viewBox="0 0 320 320">
                  <line
                    x1="160"
                    y1="10"
                    x2="160"
                    y2="310"
                    stroke="url(#dataFlow)"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                  <line
                    x1="10"
                    y1="160"
                    x2="310"
                    y2="160"
                    stroke="url(#dataFlow2)"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                  <line
                    x1="30"
                    y1="30"
                    x2="290"
                    y2="290"
                    stroke="url(#dataFlow)"
                    strokeWidth="1"
                    opacity="0.2"
                  />
                  <line
                    x1="290"
                    y1="30"
                    x2="30"
                    y2="290"
                    stroke="url(#dataFlow2)"
                    strokeWidth="1"
                    opacity="0.2"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 md:w-80 md:h-80 bg-white/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-slate-200 ml-10 mr-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center group hover:scale-105 transition-transform duration-300"
              >
                <div className="text-4xl md:text-5xl font-bold text-emerald-600 mb-3 group-hover:text-emerald-700 transition-colors">
                  {stat.number}
                </div>
                <div className="text-slate-600 group-hover:text-slate-800 transition-colors font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 bg-gradient-to-b from-white to-slate-50 ml-10 mr-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-100 text-emerald-800 border-emerald-200 px-4 py-2 rounded-full">
              Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Everything You Need for
              <span className="text-emerald-600 block">
                Safe Transportation
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Our comprehensive platform provides all the tools needed to manage
              school transportation efficiently and safely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group bg-white rounded-2xl overflow-hidden"
              >
                <CardHeader className="pb-4">
                  <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl group-hover:text-emerald-600 transition-colors font-semibold">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base group-hover:text-slate-700 transition-colors leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white ml-10 mr-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-6 bg-emerald-100 text-emerald-800 border-emerald-200 px-4 py-2 rounded-full">
                Why Choose LuxCub?
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 leading-tight">
                Join hundreds of schools that have
                <span className="text-emerald-600 block">
                  transformed their operations
                </span>
              </h2>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                Our platform has helped schools across the country improve their
                transportation efficiency, safety, and parent satisfaction.
              </p>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 group hover:translate-x-2 transition-transform duration-300"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                    <span className="text-slate-700 group-hover:text-emerald-600 transition-colors text-lg">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://res.cloudinary.com/pitz/image/upload/v1753866768/images__1_-removebg-preview_gkn47i.png"
                alt="School Bus Fleet"
                className="w-full h-auto rounded-3xl"
              />
              <Card className="absolute -bottom-8 -right-8 p-8 shadow-2xl bg-white rounded-2xl border border-slate-200">
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-600 mb-2">
                    500+
                  </div>
                  <div className="text-lg text-slate-600 mb-3">
                    Schools Trust Us
                  </div>
                  <div className="flex justify-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-slate-500">4.9/5 average rating</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* School Bus Fleet Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white ml-10 mr-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-100 text-emerald-800 border-emerald-200 px-4 py-2 rounded-full">
              Fleet Management
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Modern School Bus Fleet
              <span className="text-emerald-600 block">Management</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              See how our platform manages real school bus fleets with advanced
              tracking and safety features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white rounded-2xl overflow-hidden group">
              <CardHeader className="pb-4">
                <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Bus className="h-12 w-12 text-emerald-600" />
                </div>
                <CardTitle className="text-xl group-hover:text-emerald-600 transition-colors font-semibold">
                  GPS Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base group-hover:text-slate-700 transition-colors leading-relaxed">
                  Real-time location monitoring for every school bus with
                  precise GPS coordinates and live updates every 30 seconds.
                </CardDescription>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-slate-600">
                      Live location updates
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-slate-600">
                      Route history tracking
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-slate-600">
                      Speed monitoring
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white rounded-2xl overflow-hidden group">
              <CardHeader className="pb-4">
                <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-12 w-12 text-emerald-600" />
                </div>
                <CardTitle className="text-xl group-hover:text-emerald-600 transition-colors font-semibold">
                  Safety Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base group-hover:text-slate-700 transition-colors leading-relaxed">
                  Advanced safety protocols with real-time alerts for speed
                  violations, route deviations, and emergency situations.
                </CardDescription>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-slate-600">
                      Speed limit alerts
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-slate-600">
                      Emergency response
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-slate-600">
                      Driver behavior monitoring
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white rounded-2xl overflow-hidden group">
              <CardHeader className="pb-4">
                <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-12 w-12 text-emerald-600" />
                </div>
                <CardTitle className="text-xl group-hover:text-emerald-600 transition-colors font-semibold">
                  Route Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base group-hover:text-slate-700 transition-colors leading-relaxed">
                  AI-powered route planning that optimizes pickups, drop-offs,
                  and fuel efficiency while reducing travel time.
                </CardDescription>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-slate-600">
                      AI route planning
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-slate-600">
                      Fuel cost reduction
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-slate-600">
                      Traffic optimization
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white rounded-2xl overflow-hidden group">
              <CardHeader className="pb-4">
                <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Smartphone className="h-12 w-12 text-emerald-600" />
                </div>
                <CardTitle className="text-xl group-hover:text-emerald-600 transition-colors font-semibold">
                  Mobile App
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base group-hover:text-slate-700 transition-colors leading-relaxed">
                  Dedicated mobile applications for drivers, parents, and
                  administrators with real-time notifications and updates.
                </CardDescription>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-slate-600">Driver app</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-slate-600">
                      Parent portal
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-slate-600">
                      Admin dashboard
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white rounded-2xl overflow-hidden group">
              <CardHeader className="pb-4">
                <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-12 w-12 text-emerald-600" />
                </div>
                <CardTitle className="text-xl group-hover:text-emerald-600 transition-colors font-semibold">
                  Analytics & Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base group-hover:text-slate-700 transition-colors leading-relaxed">
                  Comprehensive reporting and analytics to optimize operations,
                  reduce costs, and improve efficiency.
                </CardDescription>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-slate-600">
                      Performance metrics
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-slate-600">
                      Cost analysis
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-slate-600">
                      Custom reports
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white rounded-2xl overflow-hidden group">
              <CardHeader className="pb-4">
                <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Lock className="h-12 w-12 text-emerald-600" />
                </div>
                <CardTitle className="text-xl group-hover:text-emerald-600 transition-colors font-semibold">
                  Security & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base group-hover:text-slate-700 transition-colors leading-relaxed">
                  Enterprise-grade security with FERPA compliance and data
                  protection for student safety and privacy.
                </CardDescription>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-slate-600">
                      FERPA compliant
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-slate-600">
                      Data encryption
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-slate-600">
                      Access controls
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white ml-10 mr-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-100 text-emerald-800 border-emerald-200 px-4 py-2 rounded-full">
              Testimonials
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              What Our Customers
              <span className="text-emerald-600 block">Say</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Hear from school administrators, transportation directors, and
              parents who have transformed their school transportation with
              LuxCub.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white rounded-2xl overflow-hidden"
              >
                <CardContent className="p-8">
                  <div className="flex items-center space-x-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-slate-600 mb-6 leading-relaxed text-lg">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center space-x-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">
                        {testimonial.name}
                      </div>
                      <div className="text-slate-600">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-20 bg-gradient-to-b from-slate-50 to-white ml-10 mr-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-100 text-emerald-800 border-emerald-200 px-4 py-2 rounded-full">
              Pricing
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Simple, Transparent
              <span className="text-emerald-600 block">Pricing</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Choose the plan that fits your school's needs. All plans include
              our core features with no hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`border-2 transition-all duration-300 hover:-translate-y-2 rounded-2xl overflow-hidden ${
                  plan.popular
                    ? "border-emerald-600 shadow-xl scale-105"
                    : "border-slate-200 shadow-lg hover:shadow-xl"
                } bg-white`}
              >
                {plan.popular && (
                  <div className="bg-emerald-600 text-white text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-slate-900 mb-2">
                    {plan.name}
                  </CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-slate-900">
                      {plan.price}
                    </span>
                    <span className="text-slate-600">{plan.period}</span>
                  </div>
                  <CardDescription className="text-slate-600">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-8">
                  <ul className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center space-x-3"
                      >
                        <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full mt-8 py-3 rounded-xl font-medium transition-all duration-200 ${
                      plan.popular
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105"
                        : "bg-slate-100 hover:bg-emerald-600 text-slate-700 hover:text-white hover:scale-105"
                    }`}
                    onClick={() => navigate(isAuthenticated ? "/" : "/login")}
                  >
                    {isAuthenticated
                      ? "Dashboard"
                      : isExistingUser
                      ? "Login"
                      : "Get Started"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white ml-10 mr-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-100 text-emerald-800 border-emerald-200 px-4 py-2 rounded-full">
              FAQ
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Frequently Asked
              <span className="text-emerald-600 block">Questions</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Find answers to common questions about our school transportation
              platform.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                <button
                  onClick={() =>
                    setActiveFAQ(activeFAQ === index ? null : index)
                  }
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-slate-900">
                    {faq.question}
                  </h3>
                  {activeFAQ === index ? (
                    <ChevronUp className="h-5 w-5 text-slate-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-600" />
                  )}
                </button>
                {activeFAQ === index && (
                  <div className="px-6 pb-6">
                    <p className="text-slate-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="py-20 bg-gradient-to-b from-slate-50 to-white ml-10 mr-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-100 text-emerald-800 border-emerald-200 px-4 py-2 rounded-full">
              Contact Us
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Get in Touch
              <span className="text-emerald-600 block">With Our Team</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Ready to transform your school transportation? Contact us today
              for a free consultation and personalized demo.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6">
                  Let's Start a Conversation
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed mb-8">
                  Our team is here to help you understand how LuxCub can
                  transform your school transportation operations. We'll provide
                  a personalized demo and answer all your questions.
                </p>
              </div>

              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 group hover:translate-x-2 transition-transform duration-300"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      {info.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-lg mb-1">
                        {info.title}
                      </div>
                      <div className="text-slate-600 mb-2">
                        {info.description}
                      </div>
                      <div className="text-emerald-600 font-medium">
                        {info.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200">
                <div className="flex items-center space-x-3 mb-4">
                  <Headphones className="h-6 w-6 text-emerald-600" />
                  <h4 className="text-lg font-semibold text-slate-900">
                    Expert Support
                  </h4>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Our dedicated support team is available 24/7 to help you with
                  any questions or technical issues. We're committed to your
                  success.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <Card className="shadow-xl border-0 rounded-2xl overflow-hidden">
              <CardHeader className="bg-emerald-600 text-white">
                <CardTitle className="text-2xl">Send us a Message</CardTitle>
                <CardDescription className="text-emerald-100">
                  Fill out the form below and we'll get back to you within 24
                  hours.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="firstName"
                        className="text-slate-700 font-medium"
                      >
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="lastName"
                        className="text-slate-700 font-medium"
                      >
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-slate-700 font-medium"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@school.edu"
                      className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="school"
                      className="text-slate-700 font-medium"
                    >
                      School/District Name
                    </Label>
                    <Input
                      id="school"
                      placeholder="Your School District"
                      className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="message"
                      className="text-slate-700 font-medium"
                    >
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your transportation needs and how we can help..."
                      rows={4}
                      className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600 transition-colors resize-none"
                    />
                  </div>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-emerald-700 ml-10 mr-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your
            <span className="block">School Transportation?</span>
          </h2>
          <p className="text-xl text-emerald-100 mb-10 leading-relaxed max-w-2xl mx-auto">
            Join hundreds of schools that have already improved their
            transportation operations with LuxCub. Get started today and see the
            difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-white text-emerald-600 hover:bg-emerald-50 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl rounded-xl font-semibold"
                  onClick={() => setShowDemoRequestModal(true)}
            >
              <Play className="h-5 w-5 mr-3" />
             Request a Demo
            </Button>
           
          </div>
        </div>
      </section>

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

      {/* Demo Request Modal */}
      <DemoRequestModal
        isOpen={showDemoRequestModal}
        onClose={() => setShowDemoRequestModal(false)}
      />
    </div>
  );
};

export default Landing;
