import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/redux/hooks";

const PublicNavbar = () => {
  const navigate = useNavigate();
  const { token, user, hasLoggedInBefore } = useAppSelector((state) => state.auth);
  const isAuthenticated = !!token && !!user;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 text-black shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/home">
            <div className="flex items-center space-x-2">
              <span className="text-xl w-40 h-30 font-bold transition-colors duration-300">
                <img
                  src="https://res.cloudinary.com/pitz/image/upload/v1759998717/shuletrack_landscape_logo-100_gcmpht__1_-removebg-preview_kibgoq.png"
                  alt="Shuletrack"
                />
              </span>
            </div>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/about"
              className="text-black transition-colors font-medium hover:text-[#f7c624] hover:scale-105 transform duration-200"
            >
              About Us
            </Link>
            <Link
              to="/features"
              className="text-black transition-colors font-medium hover:text-[#f7c624] hover:scale-105 transform duration-200"
            >
              Features
            </Link>
            <Link
              to="/contact"
              className="text-black transition-colors font-medium hover:text-[#f7c624] hover:scale-105 transform duration-200"
            >
              Contact
            </Link>
          </div>
          <Button
            className="bg-[#10213f] hover:bg-[#f7c624] text-white border-0 px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
            onClick={() => {
              if (isAuthenticated) {
                navigate("/");
              } else if (hasLoggedInBefore) {
                navigate("/login");
              } else {
                navigate("/register");
              }
            }}
          >
            {isAuthenticated
              ? "Dashboard"
              : hasLoggedInBefore
              ? "Login"
              : "Get Started"}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;

