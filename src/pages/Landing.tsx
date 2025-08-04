import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DemoRequestModal from "@/components/DemoRequestModal";
import ContactForm from "@/components/ContactForm";
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
  Target,
  Eye,
  Rocket,
} from "lucide-react";
import SubscriptionPlansDisplay from "@/components/SubscriptionPlansDisplay";
import { isTokenExpired } from "@/utils/auth";

const Landing = () => {
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showDemoRequestModal, setShowDemoRequestModal] = useState(false);
  const [animatedSections, setAnimatedSections] = useState<Set<string>>(
    new Set()
  );
  const heroRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Get authentication state
  const { token, user } = useAppSelector((state) => state.auth);
  const isAuthenticated = !!token && !!user;

  // Check if user has logged in before (has login history)
  const hasLoginHistory = () => {
    try {
      // Check for valid token in direct storage
      const directToken = localStorage.getItem("token");
      if (directToken && !isTokenExpired(directToken)) {
        return true;
      }

      // Check for valid token in Redux Persist storage
      const persistAuth = localStorage.getItem("persist:auth");
      if (persistAuth) {
        const parsed = JSON.parse(persistAuth);
        const authState = JSON.parse(parsed.token || "null");
        if (authState && !isTokenExpired(authState)) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Error checking login history:", error);
      return false;
    }
  };

  const isExistingUser = hasLoginHistory();

  useEffect(() => {
    setIsVisible(true);

    // Trigger stats animation on page load
    setTimeout(() => {
      const statsSection = document.getElementById("stats");
      if (statsSection) {
        setAnimatedSections((prev) => new Set([...prev, "stats"]));
        const cards = statsSection.querySelectorAll(".card-animate");
        cards.forEach((card, index) => {
          setTimeout(() => {
            card.classList.add("animate");
          }, index * 100);
        });
      }
    }, 500);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const nav = document.querySelector("nav");
      if (nav) {
        if (scrolled > 10) {
          nav.classList.add("shadow-lg", "bg-white/95");
          nav.classList.add("text-slate-900");
          nav.classList.remove("text-white");
        } else {
          nav.classList.remove("shadow-lg", "bg-white/95");
          nav.classList.remove("text-slate-900");
          nav.classList.add("text-white");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Enhanced scroll animation handler with intersection observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute("id");
          if (sectionId && !animatedSections.has(sectionId)) {
            setAnimatedSections((prev) => new Set([...prev, sectionId]));
          }
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [animatedSections]);

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
      icon: <LocationIcon className="h-6 w-6 text-emerald-600" />,
      title: "Head Office",
      description: "Visit our headquarters",
      value: "Gesora Road, Utawala, Nairobi",
      link: "https://maps.google.com/?q=Gesora+Road,+Utawala,+Nairobi",
    },
    {
      icon: <Mail className="h-6 w-6 text-emerald-600" />,
      title: "Mailing Address",
      description: "Get in touch with our team",
      value: "Inquiry: info@eujimsloutions.com",
      link: "mailto:info@eujimsloutions.com",
    },
    {
      icon: <Mail className="h-6 w-6 text-emerald-600" />,
      title: "Support Email",
      description: "Technical support and assistance",
      value: "Support: support@eujimsolutions.com",
      link: "mailto:support@eujimsolutions.com",
    },
    {
      icon: <Phone className="h-6 w-6 text-emerald-600" />,
      title: "Business Talk",
      description: "Call us anytime",
      value: "+254 113281424",
      link: "tel:+254113281424",
    },
    {
      icon: <Phone className="h-6 w-6 text-emerald-600" />,
      title: "Alternative Contact",
      description: "Secondary business line",
      value: "+254 718099959",
      link: "tel:+254718099959",
    },
  ];

  return (
    <div className="min-h-screen bg-white from-slate-50 via-white to-emerald-50 scroll-smooth">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .animate-fade-in-left {
          animation: fadeInLeft 0.8s ease-out forwards;
        }
        
        .animate-fade-in-right {
          animation: fadeInRight 0.8s ease-out forwards;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.6s ease-out forwards;
        }
        
        .section-animate {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .section-animate.animate {
          opacity: 1;
          transform: translateY(0);
        }
        
        /* Make stats section visible by default */
        #stats.section-animate {
          opacity: 1;
          transform: translateY(0);
        }
        
        .card-animate {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-animate.animate {
          opacity: 1;
          transform: translateY(0);
        }
        
        /* Make stats cards visible by default */
        #stats .card-animate {
          opacity: 1;
          transform: translateY(0);
        }
        
        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .slide-in-bottom {
          animation: slideInFromBottom 0.8s ease-out forwards;
        }
        
        .slide-in-left {
          animation: slideInFromLeft 0.8s ease-out forwards;
        }
        
        .slide-in-right {
          animation: slideInFromRight 0.8s ease-out forwards;
        }
        
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent transition-all duration-300 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/home">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold transition-colors duration-300">
                  LuxCub
                </span>
              </div>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#about"
                className="transition-colors font-medium hover:text-emerald-400 hover:scale-105 transform duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("about")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                About Us
              </a>
              <a
                href="#features"
                className="transition-colors font-medium hover:text-emerald-400 hover:scale-105 transform duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Features
              </a>
              <a
                href="#pricing"
                className="transition-colors font-medium hover:text-emerald-400 hover:scale-105 transform duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("pricing")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Pricing
              </a>
              <a
                href="#contact"
                className="transition-colors font-medium hover:text-emerald-400 hover:scale-105 transform duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Contact
              </a>
            </div>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
              onClick={() => {
                if (isAuthenticated) {
                  navigate("/");
                } else if (isExistingUser) {
                  navigate("/login");
                } else {
                  navigate("/subscription-selection");
                }
              }}
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
        {/* Professional Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated gradient orbs */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-bl from-cyan-500/15 via-emerald-500/15 to-teal-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-tr from-teal-500/10 via-emerald-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
          </div>

          {/* Professional grid pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                backgroundSize: "50px 50px",
              }}
            ></div>
          </div>

          {/* Floating geometric elements */}
          <div className="absolute top-1/4 left-1/6 w-2 h-2 bg-emerald-400/60 rounded-full animate-ping"></div>
          <div className="absolute top-1/3 right-1/6 w-1 h-1 bg-cyan-400/60 rounded-full animate-ping delay-1000"></div>
          <div className="absolute bottom-1/3 left-1/5 w-1.5 h-1.5 bg-teal-400/60 rounded-full animate-ping delay-2000"></div>
          <div className="absolute bottom-1/4 right-1/5 w-1 h-1 bg-emerald-400/60 rounded-full animate-ping delay-3000"></div>

          {/* Professional lines */}
          <div className="absolute top-1/2 left-0 w-32 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent"></div>
          <div className="absolute top-1/3 right-0 w-24 h-px bg-gradient-to-l from-transparent via-cyan-400/30 to-transparent"></div>
          <div className="absolute bottom-1/3 left-0 w-20 h-px bg-gradient-to-r from-transparent via-teal-400/30 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="text-left space-y-8">
              {/* Professional Badge */}
              <div
                className={`transition-all duration-1000 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                <Badge
                  variant="secondary"
                  className="inline-flex items-center bg-white/10 backdrop-blur-md text-emerald-300 border-emerald-400/30 px-3 py-1.5 rounded-full font-medium shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <Star className="h-3 w-3 mr-2 text-emerald-300" />
                  Trusted by 500+ Schools Nationwide
                </Badge>
              </div>

              {/* Professional Headline */}
              <div className="space-y-4">
                <h1
                  className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight transition-all duration-1000 delay-200 ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                >
                  <span className="block">Modern School</span>
                  <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent block">
                    Transportation
                  </span>
                  <span className="text-lg md:text-xl lg:text-2xl font-light text-white/90 block mt-1">
                    Made Simple & Secure
                  </span>
                </h1>
              </div>

              {/* Professional Description */}
              <p
                className={`text-lg text-white/80 leading-relaxed max-w-lg transition-all duration-1000 delay-400 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                Transform your school transportation with our enterprise-grade
                platform. Real-time GPS tracking, AI-powered route optimization,
                and complete transparency for parents, drivers, and
                administrators.
              </p>

              {/* Professional CTA Buttons */}
              <div
                className={`flex flex-col sm:flex-row gap-4 transition-all duration-1000 delay-600 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                <Button
                  size="lg"
                  className="text-base px-8 py-4 bg-gradient-to-r from-emerald-600 via-cyan-600 to-teal-600 hover:from-emerald-700 hover:via-cyan-700 hover:to-teal-700 text-white border-0 hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/25 rounded-xl font-semibold group"
                  onClick={() => setShowDemoRequestModal(true)}
                >
                  <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Request Demo
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base px-8 py-4 border-2 border-white/30 text-green-500 hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-xl font-semibold backdrop-blur-md group"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById("about")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <ArrowRight className="h-5 w-5 mr-2 group-hover:translate-x-1 transition-transform" />
                  Learn More
                </Button>
              </div>

              {/* Professional Stats Preview */}
              <div
                className={`flex items-center space-x-6 pt-6 transition-all duration-1000 delay-800 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-white/70 text-sm">
                    Real-time GPS Tracking
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-300"></div>
                  <span className="text-white/70 text-sm">
                    AI Route Optimization
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse delay-600"></div>
                  <span className="text-white/70 text-sm">24/7 Support</span>
                </div>
              </div>
            </div>

            {/* Right Side - Professional Image Display */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-xl">
                {/* Professional image container with glow effect */}
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-teal-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                    <img
                      src="https://res.cloudinary.com/pitz/image/upload/v1753867118/images__1_-removebg-preview_mbnod8.png"
                      alt="School Bus Transportation"
                      className="w-full h-auto object-contain transition-all duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>

                {/* Professional floating indicators */}
                <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -bottom-6 -left-6 w-10 h-10 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg animate-pulse delay-1000">
                  <Bus className="h-5 w-5 text-white" />
                </div>
                <div className="absolute top-1/2 -right-8 w-8 h-8 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-pulse delay-2000">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <div className="absolute top-1/2 -left-8 w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg animate-pulse delay-3000">
                  <Zap className="h-4 w-4 text-white" />
                </div>

                {/* Professional status indicators */}
                <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white text-sm font-medium">
                      Live Tracking
                    </span>
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-500"></div>
                    <span className="text-white text-sm font-medium">
                      GPS Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        id="stats"
        className={`py-12 bg-white border-y border-slate-200 ml-10 mr-10 section-animate ${
          animatedSections.has("stats") ? "animate" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`text-center group hover:scale-105 transition-transform duration-300 card-animate ${
                  animatedSections.has("stats") ? "animate" : ""
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
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

      {/* About Us Section */}
      <section
        id="about"
        className={`py-1 bg-gradient-to-b from-slate-50 to-white ml-10 mr-10 section-animate ${
          animatedSections.has("about") ? "animate" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-emerald-100 text-emerald-800 border-emerald-200 px-4 py-2 rounded-full">
              About Us
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Leading the Future of
              <span className="text-emerald-600 block">
                School Transportation
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              LuxCub is a modern school transportation management platform
              designed to revolutionize how schools handle their transportation
              operations. Based in Nairobi, Kenya, we serve schools across the
              country with cutting-edge technology and exceptional support.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Mission */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Our Mission
                </h3>
              </div>
              <p className="text-lg text-slate-600 leading-relaxed">
                To provide schools with innovative transportation solutions that
                enhance safety, improve efficiency, and create peace of mind for
                parents and administrators through cutting-edge technology and
                exceptional service.
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-3 w-3 text-emerald-600" />
                  </div>
                  <p className="text-slate-600 text-sm">
                    Enhance student safety
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-3 w-3 text-emerald-600" />
                  </div>
                  <p className="text-slate-600 text-sm">
                    Improve operational efficiency
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-3 w-3 text-emerald-600" />
                  </div>
                  <p className="text-slate-600 text-sm">
                    Provide peace of mind
                  </p>
                </div>
              </div>
            </div>

            {/* Vision */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Our Vision
                </h3>
              </div>
              <p className="text-lg text-slate-600 leading-relaxed">
                To become the leading provider of school transportation
                technology in Africa, making safe and efficient school
                transportation accessible to every educational institution while
                setting global standards for innovation.
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-cyan-100 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-3 w-3 text-cyan-600" />
                  </div>
                  <p className="text-slate-600 text-sm">
                    Lead African innovation
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-cyan-100 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-3 w-3 text-cyan-600" />
                  </div>
                  <p className="text-slate-600 text-sm">Set global standards</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-cyan-100 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-3 w-3 text-cyan-600" />
                  </div>
                  <p className="text-slate-600 text-sm">
                    Universal accessibility
                  </p>
                </div>
              </div>
            </div>

            {/* Future */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Rocket className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Our Future
                </h3>
              </div>
              <p className="text-lg text-slate-600 leading-relaxed">
                We envision a future where every school in Africa has access to
                world-class transportation technology, creating safer, more
                efficient, and environmentally sustainable school transportation
                systems.
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-3 w-3 text-teal-600" />
                  </div>
                  <p className="text-slate-600 text-sm">AI-powered solutions</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-3 w-3 text-teal-600" />
                  </div>
                  <p className="text-slate-600 text-sm">Green transportation</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-3 w-3 text-teal-600" />
                  </div>
                  <p className="text-slate-600 text-sm">Global expansion</p>
                </div>
              </div>
            </div>
          </div>

          {/* Why Choose LuxCub Section */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">
              Why Choose LuxCub?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-slate-600">
                  Local expertise with global standards
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-slate-600">
                  24/7 customer support in your timezone
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-slate-600">
                  Customized solutions for African schools
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className={`py-16 bg-gradient-to-b from-white to-slate-50 ml-10 mr-10 section-animate ${
          animatedSections.has("features") ? "animate" : ""
        }`}
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
                className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group bg-white rounded-2xl overflow-hidden card-animate ${
                  animatedSections.has("features") ? "animate" : ""
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
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
      <section
        id="benefits"
        className={`py-16 bg-white ml-10 mr-10 section-animate ${
          animatedSections.has("benefits") ? "animate" : ""
        }`}
      >
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
                    className={`flex items-center space-x-4 group hover:translate-x-2 transition-transform duration-300 ${
                      animatedSections.has("benefits")
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 translate-x-10"
                    }`}
                    style={{
                      transitionDelay: `${index * 150}ms`,
                    }}
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
      <section className="py-16 bg-gradient-to-b from-slate-50 to-white ml-10 mr-10">
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
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white rounded-2xl overflow-hidden group hover-lift">
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
      <section className="py-16 bg-white ml-10 mr-10">
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
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white rounded-2xl overflow-hidden hover-lift"
                style={{
                  animationDelay: `${index * 200}ms`,
                }}
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

      {/* Subscription Plans Section */}
      <section
        id="pricing"
        className={`transition-all duration-1000 ${
          animatedSections.has("pricing")
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
        <SubscriptionPlansDisplay />
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        className={`py-16 bg-white ml-10 mr-10 section-animate ${
          animatedSections.has("faq") ? "animate" : ""
        }`}
      >
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
                className={`border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 ${
                  animatedSections.has("faq")
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
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
        className={`py-16 bg-gradient-to-b from-slate-50 to-white ml-10 mr-10 section-animate ${
          animatedSections.has("contact") ? "animate" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-2 lg:px-2">
          <div className="text-center mb-1">
            <Badge className="mb-4 bg-emerald-100 text-emerald-800 border-emerald-200 px-4 py-2 rounded-full">
              Contact Us
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Get in Touch
            </h2>
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
                    className={`flex items-start space-x-4 group hover:translate-x-2 transition-transform duration-300 ${
                      animatedSections.has("contact")
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 translate-x-10"
                    }`}
                    style={{
                      transitionDelay: `${index * 100}ms`,
                    }}
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
                        {info.link ? (
                          <a
                            href={info.link}
                            target={
                              info.link.startsWith("http")
                                ? "_blank"
                                : undefined
                            }
                            rel={
                              info.link.startsWith("http")
                                ? "noopener noreferrer"
                                : undefined
                            }
                            className="hover:text-emerald-700 transition-colors"
                          >
                            {info.value}
                          </a>
                        ) : (
                          info.value
                        )}
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
                <ContactForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="cta"
        className={`py-20 bg-gradient-to-r from-emerald-600 to-emerald-700 ml-10 mr-10 transition-all duration-1000 ${
          animatedSections.has("cta")
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
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

              {/* Contact Information */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <LocationIcon className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">
                      Head Office
                    </h4>
                    <p className="text-slate-300 text-sm">
                      Gesora Road, Utawala, Nairobi
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">
                      Mailing Address
                    </h4>
                    <p className="text-slate-300 text-sm">
                      <a
                        href="mailto:info@eujimsloutions.com"
                        className="hover:text-emerald-400 transition-colors"
                      >
                        Inquiry: info@eujimsloutions.com
                      </a>
                    </p>
                    <p className="text-slate-300 text-sm">
                      <a
                        href="mailto:support@eujimsolutions.com"
                        className="hover:text-emerald-400 transition-colors"
                      >
                        Support: support@eujimsolutions.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">
                      Business Talk
                    </h4>
                    <p className="text-slate-300 text-sm">
                      <a
                        href="tel:+254113281424"
                        className="hover:text-emerald-400 transition-colors"
                      >
                        +254 113281424
                      </a>
                    </p>
                    <p className="text-slate-300 text-sm">
                      <a
                        href="tel:+254718099959"
                        className="hover:text-emerald-400 transition-colors"
                      >
                        +254 718099959
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <a
                  href="tel:+254113281424"
                  className="text-slate-400 hover:text-emerald-400 transition-colors"
                  title="Call us"
                >
                  <Phone className="h-5 w-5" />
                </a>
                <a
                  href="mailto:info@eujimsloutions.com"
                  className="text-slate-400 hover:text-emerald-400 transition-colors"
                  title="Email us"
                >
                  <Mail className="h-5 w-5" />
                </a>
                <a
                  href="https://maps.google.com/?q=Gesora+Road,+Utawala,+Nairobi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-emerald-400 transition-colors"
                  title="Visit our office"
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
                    href="#features"
                    className="text-slate-300 hover:text-emerald-400 transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-slate-300 hover:text-emerald-400 transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => setShowDemoRequestModal(true)}
                    className="text-slate-300 hover:text-emerald-400 transition-colors"
                  >
                    Demo
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Company</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#about"
                    className="text-slate-300 hover:text-emerald-400 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        .getElementById("about")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-slate-300 hover:text-emerald-400 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        .getElementById("contact")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center">
            <p className="text-slate-400">
              © {new Date().getFullYear()} LuxCub. All rights reserved.
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
