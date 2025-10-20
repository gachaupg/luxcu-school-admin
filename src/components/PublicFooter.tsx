import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin as LocationIcon } from "lucide-react";
import DemoRequestModal from "@/components/DemoRequestModal";

const PublicFooter = () => {
  const [showDemoRequestModal, setShowDemoRequestModal] = useState(false);

  return (
    <>
      <footer className="bg-gradient-to-r from-slate-600 via-slate-800 to-slate-900 text-white py-16 shadow-xl shadow-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-40 flex items-center justify-center">
                  <img
                    src="https://res.cloudinary.com/pitz/image/upload/v1759998717/shuletrack_landscape_logo-100_gcmpht__1_-removebg-preview_kibgoq.png"
                    alt="Shuletrack"
                  />
                </div>
              </div>
              <p className="text-slate-300 mb-6 leading-relaxed max-w-md">
                Modern school transportation management platform that helps
                schools improve safety, efficiency, and parent satisfaction.
              </p>

              {/* Contact Information */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <LocationIcon className="h-5 w-5 text-[#f7c624] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">Head Office</h4>
                    <p className="text-slate-300 text-sm">
                      Gesora Road, Utawala, Nairobi
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-[#f7c624] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">
                      Mailing Address
                    </h4>
                    <p className="text-slate-300 text-sm">
                      <a
                        href="mailto:info@eujimsloutions.com"
                        className="text-slate-300 hover:text-[#f7c624] transition-colors"
                      >
                        Inquiry: info@eujimsloutions.com
                      </a>
                    </p>
                    <p className="text-slate-300 text-sm">
                      <a
                        href="mailto:support@eujimsolutions.com"
                        className="text-slate-300 hover:text-[#f7c624] transition-colors"
                      >
                        Support: support@eujimsolutions.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-[#f7c624] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">
                      Business Talk
                    </h4>
                    <p className="text-slate-300 text-sm">
                      <a
                        href="tel:+254113281424"
                        className="text-slate-300 hover:text-[#f7c624] transition-colors"
                      >
                        +254 113281424
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <a
                  href="tel:+254113281424"
                  className="text-slate-400 hover:text-[#f7c624] transition-colors"
                  title="Call us"
                >
                  <Phone className="h-5 w-5" />
                </a>
                <a
                  href="mailto:info@eujimsloutions.com"
                  className="text-slate-400 hover:text-[#f7c624] transition-colors"
                  title="Email us"
                >
                  <Mail className="h-5 w-5" />
                </a>
                <a
                  href="https://maps.google.com/?q=Gesora+Road,+Utawala,+Nairobi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-[#f7c624] transition-colors"
                  title="Visit our office"
                >
                  <LocationIcon className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Product</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/features"
                    className="text-slate-300 hover:text-[#f7c624] transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setShowDemoRequestModal(true)}
                    className="text-slate-300 hover:text-[#f7c624] transition-colors"
                  >
                    Demo
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Company</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/about"
                    className="text-slate-300 hover:text-[#f7c624] transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-slate-300 hover:text-[#f7c624] transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center">
            <p className="text-slate-400">
              © {new Date().getFullYear()} Shule Track. Powered by{" "}
              <a
                href="https://eujimsolutions.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#f7c624] hover:text-[#f7c624]/80 transition-colors"
              >
                EUJIM SOLUTIONS
              </a>
              .
            </p>
          </div>
        </div>
      </footer>

      {/* Demo Request Modal */}
      <DemoRequestModal
        isOpen={showDemoRequestModal}
        onClose={() => setShowDemoRequestModal(false)}
      />
    </>
  );
};

export default PublicFooter;

