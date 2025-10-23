import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import DemoRequestModal from "@/components/DemoRequestModal";
import { useAppSelector } from "@/redux/hooks";
import {
  ArrowRight,
  Play,
  Star,
  Bus,
  Shield,
  Users,
  TrendingUp,
  Fingerprint,
  Clock,
} from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";

const Landing = () => {
  const [showDemoRequestModal, setShowDemoRequestModal] = useState(false);
  const navigate = useNavigate();
  const { token, user, hasLoggedInBefore } = useAppSelector((state) => state.auth);
  const isAuthenticated = !!token && !!user;

  React.useEffect(() => {
    document.title = "Shuletrack - Modern School Transportation Management";
  }, []);

  const stats = [
    { number: "50+", label: "Schools Trust Us" },
    { number: "5000+", label: "Students Transported" },
    { number: "99.9%", label: "Uptime Reliability" },
    { number: "4.9/5", label: "Customer Rating" },
  ];

  const features = [
    {
      icon: <Bus className="h-8 w-8 text-[#f7c624]" />,
      title: "Real-time GPS Tracking",
      description: "Track every school bus in real-time with precise location data.",
    },
    {
      icon: <Shield className="h-8 w-8 text-[#f7c624]" />,
      title: "Advanced Safety Features",
      description: "Comprehensive safety monitoring with speed alerts and emergency response.",
    },
    {
      icon: <Fingerprint className="h-8 w-8 text-[#f7c624]" />,
      title: "Biometric Login",
      description: "Secure biometric authentication for accurate attendance tracking.",
    },
    {
      icon: <Users className="h-8 w-8 text-[#f7c624]" />,
      title: "Parent Portal",
      description: "Dedicated mobile app for parents to track their child's bus.",
    },
    {
      icon: <Clock className="h-8 w-8 text-[#f7c624]" />,
      title: "Live Updates",
      description: "Instant notifications for delays, route changes, and arrival times.",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-[#f7c624]" />,
      title: "Analytics Dashboard",
      description: "Comprehensive reporting to optimize operations and efficiency.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 scroll-smooth">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-r from-slate-600 via-slate-800 to-slate-900 shadow-xl shadow-black/30">
        {/* Simple background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
              backgroundSize: "50px 50px",
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto mt-5 px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div className="text-left space-y-6">
              {/* Badge */}
              <div className="opacity-100 mt-16 sm:mt-8 x:mt-16">
                <Badge
                  variant="secondary"
                  className="inline-flex items-center bg-[#f7c624] text-white px-4 py-2 rounded-full font-medium"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Trusted by 50+ Schools Nationwide
                </Badge>
              </div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  <span className="block">Modern School</span>
                  <span className="text-[#f7c624] block">Transportation</span>
                  <span className="text-xl md:text-2xl font-light text-white/80 block mt-2">
                    Made Simple & Secure
                  </span>
                </h1>
              </div>

              {/* Description */}
              <p className="text-lg text-white/80 leading-relaxed max-w-xl">
                Transform your school transportation with our enterprise-grade
                platform. Real-time GPS tracking, AI-powered route optimization,
                and complete transparency for parents, drivers, and
                administrators.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="px-8 py-3 bg-[#f7c624] hover:bg-[#f7c624]/90 text-white border-0 rounded-lg font-semibold"
                  onClick={() => setShowDemoRequestModal(true)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Request Demo
                </Button>
                <Link to="/about">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-3 border-2 border-white/40 text-white hover:bg-white/20 rounded-lg font-semibold"
                >
                  <ArrowRight className="h-4 text-black w-4 mr-2" />
                  <span className="text-black">Learn More</span>
                </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-white/20 bg-[#f7c624] flex items-center justify-center"
                      >
                        <span className="text-white text-xs font-bold">{i}</span>
                      </div>
                    ))}
                  </div>
                  <span className="text-white/70 text-sm">Join 50+ schools</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 text-[#f7c624] fill-current"
                      />
                    ))}
                  </div>
                  <span className="text-white/70 text-sm">4.9/5 rating</span>
                </div>
              </div>
            </div>

            {/* Right Side - Image Display */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-xl">
                <div className="relative">
                  <div className="relative rounded-2xl p-8">
                    <img
                      src="https://res.cloudinary.com/pitz/image/upload/v1756278735/Yellow_School_Bus_on_White_Background_iihnb2.png"
                      alt="School Bus Transportation"
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>

                {/* Status indicators */}
                <div className="absolute bottom-4 left-4 bg-black/70 rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#f7c624] rounded-full"></div>
                    <span className="text-white text-sm font-medium">
                      Live Tracking Active
                    </span>
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-black/70 rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#f7c624] rounded-full"></div>
                    <span className="text-white text-sm font-medium">
                      GPS System Online
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center group hover:scale-105 transition-transform duration-300"
              >
                <div className="text-4xl md:text-5xl font-bold text-[#f7c624] mb-3 group-hover:text-[#f7c624]/80 transition-colors">
                  {stat.number}
                </div>
                <div className="text-slate-100 group-hover:text-slate-600 transition-colors font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Preview Section */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-[#f7c624]/20 text-[#f7c624] border-[#f7c624]/30 px-4 py-2 rounded-full">
              Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Everything You Need for
              <span className="text-[#f7c624] block">Safe Transportation</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Our comprehensive platform provides all the tools needed to manage
              school transportation efficiently and safely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group bg-slate-700 rounded-2xl overflow-hidden p-6"
              >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                  <h3 className="text-xl group-hover:text-[#f7c624] transition-colors font-semibold text-white">
                      {feature.title}
                  </h3>
                  </div>
                <p className="text-base text-slate-400 leading-relaxed">
                    {feature.description}
                </p>
              </Card>
            ))}
          </div>

                <div className="text-center">
            <Link to="/features">
              <Button size="lg" className="bg-[#f7c624] hover:bg-[#f7c624]/90">
                View All Features
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-slate-700 rounded-2xl overflow-hidden p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">About Us</h3>
              <p className="text-slate-300 mb-6">
                Learn more about our mission, vision, and why schools choose Shuletrack.
              </p>
              <Link to="/about">
                <Button variant="outline" className="border-[#f7c624] text-[#f7c624] hover:bg-[#f7c624] hover:text-white">
                  Learn More
                </Button>
              </Link>
              </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-slate-700 rounded-2xl overflow-hidden p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Features</h3>
              <p className="text-slate-300 mb-6">
                Explore our comprehensive platform features and capabilities.
              </p>
              <Link to="/features">
                <Button variant="outline" className="border-[#f7c624] text-[#f7c624] hover:bg-[#f7c624] hover:text-white">
                  View Features
                </Button>
              </Link>
              </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-slate-700 rounded-2xl overflow-hidden p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Contact Us</h3>
              <p className="text-slate-300 mb-6">
                Get in touch with our team to learn how we can help your school.
              </p>
              <Link to="/contact">
                <Button variant="outline" className="border-[#f7c624] text-[#f7c624] hover:bg-[#f7c624] hover:text-white">
                  Contact Us
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your
            <span className="block">School Transportation?</span>
          </h2>
          <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
            Join hundreds of schools that have already improved their
            transportation operations with Shuletrack. Get started today and see the
            difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-white text-[#f7c624] hover:bg-[#f7c624]/10 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl rounded-xl font-semibold"
              onClick={() => setShowDemoRequestModal(true)}
            >
              <Play className="h-5 w-5 mr-3" />
              Request a Demo
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter />

      {/* Demo Request Modal */}
      <DemoRequestModal
        isOpen={showDemoRequestModal}
        onClose={() => setShowDemoRequestModal(false)}
      />
    </div>
  );
};

export default Landing;
