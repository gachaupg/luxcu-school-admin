import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  CheckCircle,
  Target,
  Eye,
  Rocket,
  Star,
} from "lucide-react";
import { tokens } from "@/utils/tokens";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";

const About = () => {
  const [animatedSections, setAnimatedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Set page title
    document.title = "About Us - Shuletrack | School Transportation Management";
    
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

  const stats = [
    { number: "50+", label: "Schools Trust Us" },
    { number: "5000+", label: "Students Transported" },
    { number: "99.9%", label: "Uptime Reliability" },
    { number: "4.9/5", label: "Customer Rating" },
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
            About <span className="text-[#f7c624]">Shuletrack</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Leading the future of school transportation in Africa
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <section id="stats" className={`py-12 bg-slate-900 ml-10 mr-10 section-animate ${animatedSections.has("stats") ? "animate" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`text-center group hover:scale-105 transition-transform duration-300 card-animate ${animatedSections.has("stats") ? "animate" : ""}`}
                style={{ transitionDelay: `${index * 100}ms` }}
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

      {/* Mission, Vision, Future Section */}
      <section id="mission" className={`py-16 bg-slate-900 ml-10 mr-10 section-animate ${animatedSections.has("mission") ? "animate" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Mission */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-[#f7c624] to-[#10213f] rounded-xl flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Our Mission</h3>
              </div>
              <p className="text-lg text-slate-300 leading-relaxed">
                To provide schools with innovative transportation solutions that
                enhance safety, improve efficiency, and create peace of mind for
                parents and administrators through cutting-edge technology and
                exceptional service.
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-[#f7c624] rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-3 w-3 text-[#ffffff]" />
                  </div>
                  <p className="text-slate-300 text-sm">Enhance student safety</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-[#f7c624] rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-3 w-3 text-[#ffffff]" />
                  </div>
                  <p className="text-slate-300 text-sm">
                    Improve operational efficiency
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-[#f7c624] rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-3 w-3 text-[#ffffff]" />
                  </div>
                  <p className="text-slate-300 text-sm">Provide peace of mind</p>
                </div>
              </div>
            </div>

            {/* Vision */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-[#f7c624] to-[#10213f] rounded-xl flex items-center justify-center">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Our Vision</h3>
              </div>
              <p className="text-lg text-slate-100 leading-relaxed">
                To become the leading provider of school transportation
                technology in Africa, making safe and efficient school
                transportation accessible to every educational institution while
                setting global standards for innovation.
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-[#f7c624] rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-3 w-3 text-[#ffffff]" />
                  </div>
                  <p className="text-slate-100 text-sm">Lead African innovation</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-[#f7c624] rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-3 w-3 text-[#ffffff]" />
                  </div>
                  <p className="text-slate-100 text-sm">Set global standards</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-[#f7c624] rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-3 w-3 text-[#ffffff]" />
                  </div>
                  <p className="text-slate-100 text-sm">Universal accessibility</p>
                </div>
              </div>
            </div>

            {/* Future */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-[#f7c624] to-[#10213f] rounded-xl flex items-center justify-center">
                  <Rocket className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-100">Our Future</h3>
              </div>
              <p className="text-lg text-slate-100 leading-relaxed">
                We envision a future where every school in Africa has access to
                world-class transportation technology, creating safer, more
                efficient, and environmentally sustainable school transportation
                systems.
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-[#f7c624] rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-3 w-3 text-[#ffffff]" />
                  </div>
                  <p className="text-slate-100 text-sm">AI-powered solutions</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-[#f7c624] rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-3 w-3 text-[#ffffff]" />
                  </div>
                  <p className="text-slate-100 text-sm">Green transportation</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-[#f7c624] rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-3 w-3 text-[#ffffff]" />
                  </div>
                  <p className="text-slate-100 text-sm">Global expansion</p>
                </div>
              </div>
            </div>
          </div>

          {/* Why Choose Section */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-slate-100 mb-8 text-center">
              Why Choose Shule Track?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-[#f7c624] rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-[#f7c624]" />
                </div>
                <p className="text-slate-100">
                  Local expertise with global standards
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-[#f7c624] rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-[#f7c624]" />
                </div>
                <p className="text-slate-100">
                  24/7 customer support in your timezone
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-[#f7c624]/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-[#f7c624]" />
                </div>
                <p className="text-slate-100">
                  Customized solutions for African schools
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Image Section */}
      <section id="benefits" className={`py-16 bg-slate-900 ml-10 mr-10 section-animate ${animatedSections.has("benefits") ? "animate" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
                Join hundreds of schools that have
                <span className="text-[#f7c624] block">
                  transformed their operations
                </span>
              </h2>
              <p className="text-xl text-slate-300 mb-10 leading-relaxed">
                Our platform has helped schools across the country improve their
                transportation efficiency, safety, and parent satisfaction.
              </p>
              <Link to="/features">
                <Button size="lg" className="bg-[#f7c624] hover:bg-[#f7c624]/90">
                  Explore Our Features
                </Button>
              </Link>
            </div>
            <div className="relative">
              <img
                src="https://res.cloudinary.com/pitz/image/upload/v1753866768/images__1_-removebg-preview_gkn47i.png"
                alt="School Bus Fleet"
                className="w-full h-auto rounded-3xl"
              />
              <Card className="absolute -bottom-8 -right-8 p-8 shadow-2xl bg-slate-800 rounded-2xl border border-slate-700">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#f7c624] mb-2">50+</div>
                  <div className="text-lg text-slate-100 mb-3">Schools Trust Us</div>
                  <div className="flex justify-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-500">4.9/5 average rating</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className={`py-20 bg-slate-900 ml-10 mr-10 section-animate ${animatedSections.has("cta") ? "animate" : ""}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
            Join us in revolutionizing school transportation. Contact us today to learn more.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/contact">
              <Button size="lg" className="bg-[#f7c624] hover:bg-[#f7c624]/90">
                Contact Us
              </Button>
            </Link>
            <Link to="/features">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default About;

