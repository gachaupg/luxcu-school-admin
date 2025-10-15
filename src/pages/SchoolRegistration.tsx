import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { registerSchool } from "@/redux/slices/schoolsSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Building2, User, Package, Check, MapPin, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { GOOGLE_MAPS_API_KEY } from "@/utils/api";

const SchoolRegistration = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { registrationLoading, registrationError, registrationSuccess } =
    useSelector((state: RootState) => state.schools);

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [formData, setFormData] = useState({
    schoolName: "",
    schoolLocation: "",
    schoolDescription: "",
    schoolContactNumber: "",
    schoolEmail: "",
    longitude: "",
    latitude: "",
    operatingHoursStart: "08:00",
    operatingHoursEnd: "15:00",
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPassword: "",
    adminPhoneNumber: "",
  });
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [addressSearch, setAddressSearch] = useState("");
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get selected plan from localStorage or route state
  useEffect(() => {
    const storedPlan = localStorage.getItem("selectedSubscriptionPlan");
    const routeState = location.state?.selectedPlan;

    if (routeState) {
      setSelectedPlan(routeState);
    } else if (storedPlan) {
      setSelectedPlan(JSON.parse(storedPlan));
    }
    // Allow users to access registration form directly without selecting a plan
  }, [location.state]);

  // Handle registration error states
  useEffect(() => {
    if (registrationError) {
      // Parse error message for better user feedback
      let errorTitle = "Registration Failed";
      let errorDescription = registrationError;
      
      if (registrationError.includes("Duplicate entry") && registrationError.includes("username")) {
        errorTitle = "Phone Number Already Registered";
        errorDescription = "This phone number is already registered in our system. Please use a different phone number or try logging in.";
      } else if (registrationError.includes("Duplicate entry") && registrationError.includes("email")) {
        errorTitle = "Email Already Registered";
        errorDescription = "This email is already registered in our system. Please use a different email or try logging in.";
      } else if (registrationError.includes("Duplicate entry")) {
        errorTitle = "Registration Conflict";
        errorDescription = "Some information you provided is already registered in our system. Please check your phone number and email.";
      }
      
      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorDescription,
      });
    }
  }, [registrationError, toast]);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, "");

    // Check for Kenyan phone number patterns
    // 07XXXXXXXX (9 digits starting with 0)
    // 254XXXXXXXX (12 digits starting with 254)
    // +254XXXXXXXX (13 characters starting with +254)
    // 7XXXXXXXX (9 digits starting with 7)

    if (cleaned.startsWith("0") && cleaned.length === 10) {
      return true; // 07XXXXXXXX format
    }

    if (cleaned.startsWith("254") && cleaned.length === 12) {
      return true; // 254XXXXXXXX format
    }

    if (cleaned.startsWith("7") && cleaned.length === 9) {
      return true; // 7XXXXXXXX format (without leading 0)
    }

    // Check if it's already in international format
    if (phone.startsWith("+254") && phone.length === 13) {
      return true;
    }

    return false;
  };

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, "");

    // If it starts with 0, replace with +254
    if (cleaned.startsWith("0")) {
      return "+254" + cleaned.substring(1);
    }

    // If it starts with 254, add +
    if (cleaned.startsWith("254")) {
      return "+" + cleaned;
    }

    // If it already starts with +, return as is
    if (phone.startsWith("+")) {
      return phone;
    }

    // If it's 9 digits and doesn't start with 0, assume it's a local number
    if (cleaned.length === 9) {
      return "+254" + cleaned;
    }

    // Otherwise, return as is
    return phone;
  };

  const validateRequired = (value: string, fieldName: string): string => {
    if (!value || value.trim() === "") {
      return `${fieldName} is required`;
    }
    return "";
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      // Step 1: School Information
      const requiredFields = {
        schoolName: "School Name",
        schoolLocation: "School Location",
        schoolContactNumber: "School Contact Number",
        schoolEmail: "School Email",
      };

      Object.entries(requiredFields).forEach(([field, label]) => {
        const error = validateRequired(
          formData[field as keyof typeof formData],
          label
        );
        if (error) {
          newErrors[field] = error;
        }
      });

      // Email validation
      if (formData.schoolEmail && !validateEmail(formData.schoolEmail)) {
        newErrors.schoolEmail = "Please enter a valid email address";
      }

      // Phone validation
      if (formData.schoolContactNumber && !validatePhone(formData.schoolContactNumber)) {
        newErrors.schoolContactNumber = "Please enter a valid phone number";
      }
    } else if (step === 2) {
      // Step 2: Admin Information
      const requiredFields = {
        adminFirstName: "Admin First Name",
        adminLastName: "Admin Last Name",
        adminEmail: "Admin Email",
        adminPassword: "Admin Password",
        adminPhoneNumber: "Admin Phone Number",
      };

      Object.entries(requiredFields).forEach(([field, label]) => {
        const error = validateRequired(
          formData[field as keyof typeof formData],
          label
        );
        if (error) {
          newErrors[field] = error;
        }
      });

      if (formData.adminPhoneNumber && !validatePhone(formData.adminPhoneNumber)) {
        newErrors.adminPhoneNumber = "Please enter a valid phone number";
      }

      if (formData.adminEmail && !validateEmail(formData.adminEmail)) {
        newErrors.adminEmail = "Please enter a valid admin email address";
      }

      // Password validation
      if (formData.adminPassword && formData.adminPassword.length < 6) {
        newErrors.adminPassword = "Password must be at least 6 characters long";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Google Maps Places API integration
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
 const googleMapsApiKey = GOOGLE_MAPS_API_KEY;
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".address-search-container")) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounced search function
  const debouncedSearch = (query: string) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      if (query.length > 2) {
        searchLocation(query);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    setSearchTimeout(timeout);
  };

  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearchingLocation(true);
    try {
      // Use Google Places API directly with a different CORS proxy
      const response = await fetch(
        `https://api.allorigins.win/raw?url=${encodeURIComponent(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            query
          )}&types=establishment&components=country:ke&key=${googleMapsApiKey}`
        )}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.predictions && data.predictions.length > 0) {
        setSearchResults(data.predictions);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    } catch (error) {
      // Try alternative proxy if first one fails
      try {
        const altResponse = await fetch(
          `https://corsproxy.io/?${encodeURIComponent(
            `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
              query
            )}&types=establishment&components=country:ke&key=${googleMapsApiKey}`
          )}`
        );

        if (altResponse.ok) {
          const altData = await altResponse.json();
          if (altData.predictions && altData.predictions.length > 0) {
            setSearchResults(altData.predictions);
            setShowSearchResults(true);
            return;
          }
        }
      } catch (altError) {
        // console.error("Alternative proxy also failed:", altError);
      }

      // If all proxies fail, show error message
      setSearchResults([]);
      setShowSearchResults(false);
      toast({
        variant: "destructive",
        title: "Search Error",
        description:
          "Could not search for locations. Please try again or enter coordinates manually.",
      });
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const selectLocation = async (placeId: string, description: string) => {
    try {
      // Use Google Places Details API with CORS proxy
      const response = await fetch(
        `https://api.allorigins.win/raw?url=${encodeURIComponent(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address,geometry&key=${googleMapsApiKey}`
        )}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (
        data.result &&
        data.result.geometry &&
        data.result.geometry.location
      ) {
        const { lat, lng } = data.result.geometry.location;

        setFormData((prev) => ({
          ...prev,
          longitude: lng.toString(),
          latitude: lat.toString(),
          schoolLocation: data.result.formatted_address || description,
        }));

        setSearchResults([]);
        setShowSearchResults(false);

        toast({
          title: "Location Selected",
          description:
            "Coordinates have been set based on the selected location.",
        });
      } else {
        throw new Error("No location data found");
      }
    } catch (error) {
      // console.error("Error getting place details:", error);
      // Try alternative proxy
      try {
        const altResponse = await fetch(
          `https://corsproxy.io/?${encodeURIComponent(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address,geometry&key=${googleMapsApiKey}`
          )}`
        );

        if (altResponse.ok) {
          const altData = await altResponse.json();
          if (
            altData.result &&
            altData.result.geometry &&
            altData.result.geometry.location
          ) {
            const { lat, lng } = altData.result.geometry.location;

            setFormData((prev) => ({
              ...prev,
              longitude: lng.toString(),
              latitude: lat.toString(),
              schoolLocation: altData.result.formatted_address || description,
            }));

            setSearchResults([]);
            setShowSearchResults(false);

            toast({
              title: "Location Selected",
              description:
                "Coordinates have been set based on the selected location.",
            });
            return;
          }
        }
      } catch (altError) {
        // console.error("Alternative proxy also failed:", altError);
      }

      // If all proxies fail, show error and set default
      setFormData((prev) => ({
        ...prev,
        longitude: "36.689",
        latitude: "-1.3197",
        schoolLocation: description,
      }));

      setSearchResults([]);
      setShowSearchResults(false);

      toast({
        variant: "destructive",
        title: "Location Error",
        description:
          "Could not get location coordinates. Using default coordinates.",
      });
    }
  };

  const formatPrice = (price: string) => {
    return parseFloat(price).toLocaleString("en-US", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors before proceeding to the next step.",
      });
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate current step before submission
    if (!validateStep(currentStep)) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
      });
      return;
    }

    try {
      // Prepare the registration payload
      const registrationPayload = {
        school_name: formData.schoolName,
        school_location: formData.schoolLocation,
        school_description: formData.schoolDescription,
        school_contact_number: formatPhoneNumber(formData.schoolContactNumber),
        school_email: formData.schoolEmail,
        longitude: parseFloat(formData.longitude) || 36.689,
        latitude: parseFloat(formData.latitude) || -1.3197,
        operating_hours_start: formData.operatingHoursStart,
        operating_hours_end: formData.operatingHoursEnd,
        admin_first_name: formData.adminFirstName,
        admin_last_name: formData.adminLastName,
        admin_phone_number: formatPhoneNumber(formData.adminPhoneNumber),
        admin_email: formData.adminEmail,
        admin_password: formData.adminPassword,
        selected_plan_id: selectedPlan?.id || "1",
        billing_cycle: selectedPlan?.default_billing_cycle || "monthly",
        estimated_students: 100,
        estimated_buses: 2,
        estimated_parents: 200,
      };


      // Dispatch the registration action
      const result = await dispatch(
        registerSchool(registrationPayload)
      ).unwrap();


      toast({
        title: "Registration Successful!",
        description:
          "Your school has been registered successfully. You can now log in with your admin credentials.",
      });

      // Clear stored plan
      localStorage.removeItem("selectedSubscriptionPlan");

      // Navigate to login page
      navigate("/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to submit registration. Please try again.",
      });
    }
  };

  const steps = [
    { number: 1, title: "School Information", icon: Building2 },
    { number: 2, title: "Admin Details", icon: User },
    { number: 3, title: "Review & Submit", icon: Package },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-[#f7c624]/10 p-4">
      <Card className="w-full max-w-4xl shadow-xl">
        <CardHeader className="text-center pb-4">
         
          <CardTitle className="text-2xl font-bold text-slate-900">
            Register Your School
          </CardTitle>
        {/* Step Indicator */}
          <div className="flex items-center justify-center mt-3 space-x-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      currentStep === step.number
                        ? "bg-[#f7c624] border-[#f7c624] text-white"
                        : currentStep > step.number
                        ? "bg-[#f7c624]/20 border-[#f7c624] text-[#f7c624]"
                        : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <p className={`text-xs mt-1 hidden sm:block ${
                    currentStep === step.number ? "text-[#f7c624] font-semibold" : "text-gray-500"
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-12 sm:w-20 transition-all ${
                      currentStep > step.number ? "bg-[#f7c624]" : "bg-gray-300"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardHeader>
        <CardContent className="">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: School Information */}
            {currentStep === 1 && (
                <div className="space-y-5">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-[#f7c624]" />
                    School Information
                  </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2.5">
                  <Label htmlFor="schoolName">School Name *</Label>
                  <Input
                    id="schoolName"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleInputChange}
                    placeholder="Enter school name"
                    required
                    className={errors.schoolName ? "border-red-500" : ""}
                  />
                  {errors.schoolName && (
                    <p className="text-sm text-red-500">{errors.schoolName}</p>
                  )}
                </div>

                <div className="space-y-2.5">
                    <Label htmlFor="schoolLocation">School Location *</Label>
                  <div className="relative address-search-container">
                    <div className="flex gap-2">
                      <Input
                          id="schoolLocation"
                          name="schoolLocation"
                          value={formData.schoolLocation}
                        onChange={(e) => {
                          handleInputChange(e);
                          debouncedSearch(e.target.value);
                        }}
                        placeholder="Search for school location..."
                        required
                          className={errors.schoolLocation ? "border-red-500" : ""}
                      />
                      {isSearchingLocation && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Search Results Dropdown */}
                    {showSearchResults && searchResults.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {searchResults.map((result, index) => (
                          <button
                            key={index}
                            type="button"
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                            onClick={() =>
                              selectLocation(result.place_id, result.description)
                            }
                          >
                            <div className="font-medium text-sm">
                              {result.structured_formatting?.main_text ||
                                result.description}
                            </div>
                            <div className="text-xs text-gray-500">
                              {result.structured_formatting?.secondary_text || ""}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                    {errors.schoolLocation && (
                      <p className="text-sm text-red-500">{errors.schoolLocation}</p>
                  )}
                    <p className="text-xs text-slate-500">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      Start typing to search for your school location. Coordinates will be automatically set.
                    </p>
                  </div>
                </div>

                  <div className="space-y-2.5">
                  <Label htmlFor="schoolDescription">School Description</Label>
                  <Textarea
                    id="schoolDescription"
                    name="schoolDescription"
                    value={formData.schoolDescription}
                      onChange={handleInputChange}
                    placeholder="Brief description of your school"
                    rows={3}
                    />
                  </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2.5">
                    <Label htmlFor="schoolContactNumber">School Contact Number *</Label>
                    <Input
                      id="schoolContactNumber"
                      name="schoolContactNumber"
                      type="tel"
                      value={formData.schoolContactNumber}
                      onChange={handleInputChange}
                      placeholder="e.g., 0725797597 or +254725797597"
                      required
                      className={errors.schoolContactNumber ? "border-red-500" : ""}
                    />
                    {errors.schoolContactNumber && (
                      <p className="text-sm text-red-500">{errors.schoolContactNumber}</p>
                    )}
                   
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor="schoolEmail">School Email *</Label>
                    <Input
                      id="schoolEmail"
                      name="schoolEmail"
                      type="email"
                      value={formData.schoolEmail}
                      onChange={handleInputChange}
                      placeholder="school@example.com"
                      required
                      className={errors.schoolEmail ? "border-red-500" : ""}
                    />
                    {errors.schoolEmail && (
                      <p className="text-sm text-red-500">{errors.schoolEmail}</p>
                    )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2.5">
                    <Label htmlFor="operatingHoursStart">Operating Hours Start</Label>
                  <Input
                      id="operatingHoursStart"
                      name="operatingHoursStart"
                      type="time"
                      value={formData.operatingHoursStart}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2.5">
                    <Label htmlFor="operatingHoursEnd">Operating Hours End</Label>
                  <Input
                      id="operatingHoursEnd"
                      name="operatingHoursEnd"
                      type="time"
                      value={formData.operatingHoursEnd}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2.5">
                    <Label htmlFor="longitude">Longitude (Auto-populated)</Label>
                <Input
                      id="longitude"
                      name="longitude"
                      type="text"
                      value={formData.longitude}
                      readOnly
                      placeholder="Auto-filled from location"
                      className="bg-slate-50"
                  />
                  <p className="text-xs text-slate-500">Automatically set when you search for a location</p>
                </div>

                <div className="space-y-2.5">
                    <Label htmlFor="latitude">Latitude (Auto-populated)</Label>
                  <Input
                      id="latitude"
                      name="latitude"
                      type="text"
                      value={formData.latitude}
                      readOnly
                      placeholder="Auto-filled from location"
                      className="bg-slate-50"
                  />
                  <p className="text-xs text-slate-500">Automatically set when you search for a location</p>
              </div>
            </div>
              </div>
            )}

            {/* Step 2: Admin Information */}
            {currentStep === 2 && (
                <div className="space-y-5">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                    <User className="h-5 w-5 mr-2 text-[#f7c624]" />
                    Admin Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div className="space-y-2.5">
                    <Label htmlFor="adminFirstName">Admin First Name *</Label>
                   <Input
                      id="adminFirstName"
                      name="adminFirstName"
                      value={formData.adminFirstName}
                     onChange={handleInputChange}
                      placeholder="John"
                     required
                      className={errors.adminFirstName ? "border-red-500" : ""}
                    />
                    {errors.adminFirstName && (
                      <p className="text-sm text-red-500">{errors.adminFirstName}</p>
                   )}
                 </div>

                 <div className="space-y-2.5">
                    <Label htmlFor="adminLastName">Admin Last Name *</Label>
                   <Input
                      id="adminLastName"
                      name="adminLastName"
                      value={formData.adminLastName}
                     onChange={handleInputChange}
                      placeholder="Doe"
                     required
                      className={errors.adminLastName ? "border-red-500" : ""}
                    />
                    {errors.adminLastName && (
                      <p className="text-sm text-red-500">{errors.adminLastName}</p>
                   )}
                 </div>
               </div>

                <div className="space-y-2.5">
                  <Label htmlFor="adminEmail">Admin Email *</Label>
                  <Input
                    id="adminEmail"
                    name="adminEmail"
                    type="email"
                    value={formData.adminEmail}
                    onChange={handleInputChange}
                    placeholder="john.doe@samplehighschool.edu"
                    required
                    className={errors.adminEmail ? "border-red-500" : ""}
                  />
                  {errors.adminEmail && (
                    <p className="text-sm text-red-500">{errors.adminEmail}</p>
                  )}
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="adminPhoneNumber">Admin Phone Number *</Label>
                  <Input
                    id="adminPhoneNumber"
                    name="adminPhoneNumber"
                    type="tel"
                    value={formData.adminPhoneNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., 0725797597 or +254725797597"
                    required
                    className={errors.adminPhoneNumber ? "border-red-500" : ""}
                  />
                  {errors.adminPhoneNumber && (
                    <p className="text-sm text-red-500">{errors.adminPhoneNumber}</p>
                  )}
                
                </div>

                                 <div className="space-y-2.5">
                   <Label htmlFor="adminPassword">Admin Password *</Label>
                   <div className="relative">
                     <Input
                       id="adminPassword"
                       name="adminPassword"
                       type={showPassword ? "text" : "password"}
                       value={formData.adminPassword}
                       onChange={handleInputChange}
                       placeholder="Enter admin password"
                       required
                       className={`pr-10 ${errors.adminPassword ? "border-red-500" : ""}`}
                     />
                     <Button
                       type="button"
                       variant="ghost"
                       size="sm"
                       className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                       onClick={() => setShowPassword(!showPassword)}
                     >
                       {showPassword ? (
                         <EyeOff className="h-4 w-4 text-muted-foreground" />
                       ) : (
                         <Eye className="h-4 w-4 text-muted-foreground" />
                       )}
                     </Button>
                   </div>
                   {errors.adminPassword && (
                    <p className="text-sm text-red-500">{errors.adminPassword}</p>
                   )}
                 </div>

              </div>
            )}

            {/* Step 3: Review & Submit */}
            {currentStep === 3 && (
              <div className="space-y-5">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                      <Package className="h-5 w-5 mr-2 text-[#f7c624]" />
                  Review Your Information
                    </h3>

                <div className="space-y-4">
                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-md">School Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="font-semibold">School Name:</span>
                          <p className="text-slate-600">{formData.schoolName || "N/A"}</p>
                        </div>
                        <div>
                          <span className="font-semibold">Location:</span>
                          <p className="text-slate-600">{formData.schoolLocation || "N/A"}</p>
                            </div>
                        <div>
                          <span className="font-semibold">Contact Number:</span>
                          <p className="text-slate-600">{formData.schoolContactNumber || "N/A"}</p>
                          </div>
                        <div>
                          <span className="font-semibold">Email:</span>
                          <p className="text-slate-600">{formData.schoolEmail || "N/A"}</p>
                            </div>
                        <div>
                          <span className="font-semibold">Operating Hours:</span>
                          <p className="text-slate-600">
                            {formData.operatingHoursStart} - {formData.operatingHoursEnd}
                          </p>
                          </div>
                            </div>
                      {formData.schoolDescription && (
                        <div>
                          <span className="font-semibold">Description:</span>
                          <p className="text-slate-600">{formData.schoolDescription}</p>
                          </div>
                      )}
                      </CardContent>
                    </Card>

                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-md">Admin Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="font-semibold">Name:</span>
                          <p className="text-slate-600">
                            {formData.adminFirstName} {formData.adminLastName}
                          </p>
                   </div>
                        <div>
                          <span className="font-semibold">Email:</span>
                          <p className="text-slate-600">{formData.adminEmail || "N/A"}</p>
                   </div>
                        <div>
                          <span className="font-semibold">Phone:</span>
                          <p className="text-slate-600">{formData.adminPhoneNumber || "N/A"}</p>
                   </div>
                 </div>
                    </CardContent>
                  </Card>
                </div>

                <Alert>
                  <AlertDescription>
                    By submitting this form, you agree to our terms of service and
                    privacy policy. We will review your application and contact you
                    within 24-48 hours.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t mt-8">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/home")}
              >
                Cancel
              </Button>
              
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handlePrevious}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
              )}

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  className="flex-1 bg-[#f7c624] hover:bg-[#f7c624]/80"
                  onClick={handleNext}
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="flex-1 bg-[#f7c624] hover:bg-[#f7c624]/80"
                  disabled={registrationLoading}
                >
                  {registrationLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Submit Registration
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolRegistration;
