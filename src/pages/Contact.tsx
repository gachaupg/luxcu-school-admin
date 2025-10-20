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
import ContactForm from "@/components/ContactForm";
import DemoRequestModal from "@/components/DemoRequestModal";
import {
  Phone,
  Mail,
  MapPin as LocationIcon,
  Headphones,
  ChevronDown,
  ChevronUp,
  Play,
  Star,
} from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";

const Contact = () => {
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [showDemoRequestModal, setShowDemoRequestModal] = useState(false);
  const [animatedSections, setAnimatedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Set page title
    document.title = "Contact Us - Shuletrack | Get in Touch";
    
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

  const contactInfo = [
    {
      icon: <LocationIcon className="h-6 w-6 text-[#f7c624]" />,
      title: "Head Office",
      description: "Visit our headquarters",
      value: "Gesora Road, Utawala, Nairobi",
      link: "https://maps.google.com/?q=Gesora+Road,+Utawala,+Nairobi",
    },
    {
      icon: <Mail className="h-6 w-6 text-[#f7c624]" />,
      title: "Mailing Address",
      description: "Get in touch with our team",
      value: "Inquiry:info@shuletrack.com",
      link: "mailto:info@shuletrack.com",
    },
    {
      icon: <Mail className="h-6 w-6 text-[#f7c624]" />,
      title: "Support Email",
      description: "Technical support and assistance",
      value: "Support: support@shuletrack.com",
      link: "mailto:support@shuletrack.com",
    },
    {
      icon: <Phone className="h-6 w-6 text-[#f7c624]" />,
      title: "Business Talk",
      description: "Call us anytime",
      value: "+254 113281424",
      link: "tel:+254113281424",
    },
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
            Contact <span className="text-[#f7c624]">Us</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Get in touch with our team. We're here to help!
          </p>
        </div>
      </div>

      {/* Contact Information and Form */}
      <section id="contact" className={`py-16 bg-slate-900 ml-10 mr-10 section-animate ${animatedSections.has("contact") ? "animate" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-2 lg:px-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">
                  Let's Start a Conversation
                </h3>
                <p className="text-lg text-slate-300 leading-relaxed mb-8">
                  Our team is here to help you understand how Shuletrack can
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
                    <div className="flex-shrink-0 w-12 h-12 bg-[#f7c624]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      {info.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-lg mb-1">
                        {info.title}
                      </div>
                      <div className="text-slate-300 mb-2">
                        {info.description}
                      </div>
                      <div className="text-[#f7c624] font-medium">
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
                            className="hover:text-[#f7c624]/80 transition-colors"
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

              <div className="bg-slate-700 p-6 rounded-2xl border border-slate-600">
                <div className="flex items-center space-x-3 mb-4">
                  <Headphones className="h-6 w-6 text-[#f7c624]" />
                  <h4 className="text-lg font-semibold text-white">
                    Expert Support
                  </h4>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Our dedicated support team is available 24/7 to help you with
                  any questions or technical issues. We're committed to your
                  success.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <Card className="shadow-xl border-0 rounded-2xl overflow-hidden bg-slate-800">
              <CardHeader className="bg-slate-700 text-white">
                <CardTitle className="text-2xl">Send us a Message</CardTitle>
                <CardDescription className="text-slate-300">
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

      {/* Testimonials Section */}
      <section id="testimonials" className={`py-16 bg-slate-900 ml-10 mr-10 section-animate ${animatedSections.has("testimonials") ? "animate" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#f7c624]/20 text-[#f7c624] border-[#f7c624]/30 px-4 py-2 rounded-full">
              Testimonials
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              What Our Customers
              <span className="text-[#f7c624] block">Say</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Hear from school administrators, transportation directors, and
              parents who have transformed their school transportation with
              Shuletrack.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-slate-800 rounded-2xl overflow-hidden card-animate ${animatedSections.has("testimonials") ? "animate" : ""}`}
                style={{ transitionDelay: `${index * 100}ms` }}
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
                  <p className="text-slate-300 mb-6 leading-relaxed text-lg">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center space-x-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-white">
                        {testimonial.name}
                      </div>
                      <div className="text-slate-300">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className={`py-16 bg-slate-900 ml-10 mr-10 section-animate ${animatedSections.has("faq") ? "animate" : ""}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#f7c624]/20 text-[#f7c624] border-[#f7c624]/30 px-4 py-2 rounded-full">
              FAQ
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Frequently Asked
              <span className="text-[#f7c624] block">Questions</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Find answers to common questions about our school transportation
              platform.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className={`border border-slate-700 bg-slate-800 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 card-animate ${animatedSections.has("faq") ? "animate" : ""}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <button
                  onClick={() =>
                    setActiveFAQ(activeFAQ === index ? null : index)
                  }
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-700 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-white">
                    {faq.question}
                  </h3>
                  {activeFAQ === index ? (
                    <ChevronUp className="h-5 w-5 text-slate-300" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-300" />
                  )}
                </button>
                {activeFAQ === index && (
                  <div className="px-6 pb-6">
                    <p className="text-slate-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className={`py-20 bg-slate-900 ml-10 mr-10 section-animate ${animatedSections.has("cta") ? "animate" : ""}`}>
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

export default Contact;

