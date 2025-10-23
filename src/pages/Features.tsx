import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bus,
  Shield,
  Users,
  Clock,
  TrendingUp,
  CheckCircle,
  Fingerprint,
  MapPin,
  Smartphone,
  BarChart3,
  Lock,
} from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";

const Features = () => {
  const [animatedSections, setAnimatedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Set page title
    document.title = "Features - Shuletrack | School Bus Tracking & Management";
    
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
      icon: <Bus className="h-8 w-8 text-[#f7c624]" />,
      title: "Real-time GPS Tracking",
      description:
        "Track every school bus in real-time with precise location data and live updates for parents and administrators.",
      ticks: [
        "Live location updates every 30 seconds",
        "Route deviation alerts",
        "ETA predictions",
        "Historical route tracking",
        "Multi-device access",
      ],
    },
    {
      icon: <Shield className="h-8 w-8 text-[#f7c624]" />,
      title: "Advanced Safety Features",
      description:
        "Comprehensive safety monitoring including speed alerts, route compliance, and emergency response systems.",
      ticks: [
        "Speed monitoring & alerts",
        "Emergency SOS system",
        "Driver behavior tracking",
        "Weather condition alerts",
        "Real-time incident reporting",
      ],
    },
    {
      icon: <Fingerprint className="h-8 w-8 text-[#f7c624]" />,
      title: "Biometric Login for Students",
      description:
        "Secure biometric authentication for students to check in when dropped off and picked up, ensuring accurate attendance tracking.",
      ticks: [
        "Fingerprint & facial recognition",
        "Automatic attendance tracking",
        "Drop-off & pick-up verification",
        "Parent notification system",
        "Secure data encryption",
      ],
    },
    {
      icon: <Users className="h-8 w-8 text-[#f7c624]" />,
      title: "Parent Portal",
      description:
        "Dedicated mobile app for parents to track their child's bus location and receive real-time notifications.",
      ticks: [
        "Real-time bus tracking",
        "Push notifications",
        "Multiple child support",
        "Schedule management",
        "Direct communication with drivers",
      ],
    },
    {
      icon: <Clock className="h-8 w-8 text-[#f7c624]" />,
      title: "Live Updates",
      description:
        "Instant notifications for delays, route changes, and arrival times to keep everyone informed.",
      ticks: [
        "Delay notifications",
        "Route change alerts",
        "Arrival time updates",
        "Weather-related updates",
        "Emergency announcements",
      ],
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-[#f7c624]" />,
      title: "Analytics Dashboard",
      description:
        "Comprehensive reporting and analytics to optimize operations and improve efficiency.",
      ticks: [
        "Performance metrics",
        "Cost analysis reports",
        "Route optimization data",
        "Safety incident tracking",
        "Custom report generation",
      ],
    },
  ];

  const fleetFeatures = [
    {
      icon: <Bus className="h-12 w-12 text-[#f7c624]" />,
      title: "GPS Tracking",
      description:
        "Real-time location monitoring for every school bus with precise GPS coordinates and live updates every 30 seconds.",
      ticks: ["Live location updates", "Route history tracking", "Speed monitoring"],
    },
    {
      icon: <Shield className="h-12 w-12 text-[#f7c624]" />,
      title: "Safety Monitoring",
      description:
        "Advanced safety protocols with real-time alerts for speed violations, route deviations, and emergency situations.",
      ticks: ["Speed limit alerts", "Emergency response", "Driver behavior monitoring"],
    },
    {
      icon: <MapPin className="h-12 w-12 text-[#f7c624]" />,
      title: "Route Optimization",
      description:
        "AI-powered route planning that optimizes pickups, drop-offs, and fuel efficiency while reducing travel time.",
      ticks: ["AI route planning", "Fuel cost reduction", "Traffic optimization"],
    },
    {
      icon: <Smartphone className="h-12 w-12 text-[#f7c624]" />,
      title: "Mobile App",
      description:
        "Dedicated mobile applications for drivers, parents, and administrators with real-time notifications and updates.",
      ticks: ["Driver app", "Parent portal", "Admin dashboard"],
    },
    {
      icon: <BarChart3 className="h-12 w-12 text-[#f7c624]" />,
      title: "Analytics & Reports",
      description:
        "Comprehensive reporting and analytics to optimize operations, reduce costs, and improve efficiency.",
      ticks: ["Performance metrics", "Cost analysis", "Custom reports"],
    },
    {
      icon: <Lock className="h-12 w-12 text-[#f7c624]" />,
      title: "Security & Compliance",
      description:
        "Enterprise-grade security with FERPA compliance and data protection for student safety and privacy.",
      ticks: ["FERPA compliant", "Data encryption", "Access controls"],
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

  return (
    <div className="min-h-screen bg-slate-900">
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
        
        .section-animate {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .section-animate.animate {
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
      `}</style>

      <PublicNavbar />

      {/* Page Title */}
      <div className="pt-24 pb-8 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Our <span className="text-[#f7c624]">Features</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Everything you need for safe and efficient school transportation
          </p>
        </div>
      </div>

      {/* Main Features Grid */}
      <section id="features" className={`py-16 bg-slate-900 section-animate ${animatedSections.has("features") ? "animate" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group bg-slate-700 rounded-2xl overflow-hidden card-animate ${animatedSections.has("features") ? "animate" : ""}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl group-hover:text-[#f7c624] transition-colors font-semibold text-white">
                      {feature.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base group-hover:text-slate-300 transition-colors leading-relaxed text-slate-400 mb-6">
                    {feature.description}
                  </CardDescription>
                  <div className="space-y-3">
                    {feature.ticks.map((tick, tickIndex) => (
                      <div key={tickIndex} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-5 h-5 bg-[#f7c624] rounded-full flex items-center justify-center mt-0.5">
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{tick}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className={`py-16 bg-slate-900 section-animate ${animatedSections.has("benefits") ? "animate" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Schools Choose
              <span className="text-[#f7c624] block">Shuletrack</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 group hover:translate-x-2 transition-transform duration-300"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-[#f7c624]/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle className="h-5 w-5 text-[#f7c624]" />
                </div>
                <span className="text-slate-300 group-hover:text-[#f7c624] transition-colors text-lg">
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet Management Section */}
      <section id="fleet" className={`py-16 bg-slate-900 section-animate ${animatedSections.has("fleet") ? "animate" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#f7c624]/20 text-[#f7c624] border-[#f7c624]/30 px-4 py-2 rounded-full">
              Fleet Management
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Modern School Bus Fleet
              <span className="text-[#f7c624] block">Management</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              See how our platform manages real school bus fleets with advanced
              tracking and safety features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {fleetFeatures.map((feature, index) => (
              <Card
                key={index}
                className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-slate-700 rounded-2xl overflow-hidden group card-animate ${animatedSections.has("fleet") ? "animate" : ""}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-4">
                  <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl group-hover:text-[#f7c624] transition-colors font-semibold text-white">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base group-hover:text-slate-300 transition-colors leading-relaxed text-slate-300 mb-6">
                    {feature.description}
                  </CardDescription>
                  <div className="space-y-3">
                    {feature.ticks.map((tick, tickIndex) => (
                      <div key={tickIndex} className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4 text-[#f7c624] flex-shrink-0" />
                        <span className="text-sm text-slate-300">{tick}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className={`py-20 bg-slate-900 section-animate ${animatedSections.has("cta") ? "animate" : ""}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your
            <span className="block">School Transportation?</span>
          </h2>
          <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
            Join hundreds of schools that have already improved their
            transportation operations with Shuletrack.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/contact">
              <Button size="lg" className="bg-[#f7c624] hover:bg-[#f7c624]/90">
                Contact Us
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                Learn About Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default Features;

