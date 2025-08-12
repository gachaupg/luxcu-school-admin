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
import { Loader2, Building2, User, Package, Check, MapPin, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const SchoolRegistration = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { registrationLoading, registrationError, registrationSuccess } =
    useSelector((state: RootState) => state.schools);

  const [formData, setFormData] = useState({
    schoolName: "",
    schoolType: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    website: "",
    principalName: "",
    principalPhone: "",
    principalEmail: "", // This field now stores admin email
    adminPassword: "", // Admin password field
    description: "",
    longitude: "",
    latitude: "",
    operatingHoursStart: "06:30",
    operatingHoursEnd: "18:00",
    estimatedStudents: "",
    estimatedBuses: "",
    estimatedParents: "",
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
    } else {
      // Redirect to subscription selection if no plan is selected
      toast({
        title: "No Plan Selected",
        description: "Please select a subscription plan first.",
      });
      navigate("/subscription-selection");
    }
  }, [location.state, navigate, toast]);

  // Handle registration success and error states
  useEffect(() => {
    if (registrationSuccess) {
      toast({
        title: "Registration Successful",
        description: "Your school has been registered successfully!",
      });
    }
  }, [registrationSuccess, toast]);

  useEffect(() => {
    if (registrationError) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: registrationError,
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    const requiredFields = {
      schoolName: "School Name",
      address: "Address",
      city: "City",
      state: "State/Province",
      phone: "School Phone",
      email: "School Email",
      principalName: "Principal Name",
      principalPhone: "Principal Phone",
      principalEmail: "Admin Email",
      adminPassword: "Admin Password",
      estimatedStudents: "Estimated Number of Students",
      estimatedBuses: "Estimated Number of Buses",
      estimatedParents: "Estimated Number of Parents",
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
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (formData.principalPhone && !validatePhone(formData.principalPhone)) {
      newErrors.principalPhone = "Please enter a valid phone number";
    }

    if (formData.principalEmail && !validateEmail(formData.principalEmail)) {
      newErrors.principalEmail = "Please enter a valid admin email address";
    }

    // Password validation
    if (formData.adminPassword && formData.adminPassword.length < 6) {
      newErrors.adminPassword = "Password must be at least 6 characters long";
    }

    // Website validation (optional but if provided, should be valid)
    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      newErrors.website =
        "Please enter a valid website URL (include http:// or https://)";
    }

    // Number validation
    if (
      formData.estimatedStudents &&
      (isNaN(Number(formData.estimatedStudents)) ||
        Number(formData.estimatedStudents) <= 0)
    ) {
      newErrors.estimatedStudents = "Please enter a valid number of students";
    }

    if (
      formData.estimatedBuses &&
      (isNaN(Number(formData.estimatedBuses)) ||
        Number(formData.estimatedBuses) <= 0)
    ) {
      newErrors.estimatedBuses = "Please enter a valid number of buses";
    }

    if (
      formData.estimatedParents &&
      (isNaN(Number(formData.estimatedParents)) ||
        Number(formData.estimatedParents) <= 0)
    ) {
      newErrors.estimatedParents = "Please enter a valid number of parents";
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
          )}&types=establishment&components=country:ke&key=AIzaSyA4HtS4auqymgQwjbXKXRr1tyBEVFAyOzs`
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
            )}&types=establishment&components=country:ke&key=AIzaSyA4HtS4auqymgQwjbXKXRr1tyBEVFAyOzs`
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
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address,geometry&key=AIzaSyA4HtS4auqymgQwjbXKXRr1tyBEVFAyOzs`
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
          address: data.result.formatted_address || description,
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
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address,geometry&key=AIzaSyA4HtS4auqymgQwjbXKXRr1tyBEVFAyOzs`
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
              address: altData.result.formatted_address || description,
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
        address: description,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
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
        school_location: `${formData.address}, ${formData.city}, ${formData.state}`,
        school_description: formData.description,
        school_contact_number: formatPhoneNumber(formData.phone),
        school_email: formData.email,
        longitude: parseFloat(formData.longitude) || 36.689,
        latitude: parseFloat(formData.latitude) || -1.3197,
        operating_hours_start: formData.operatingHoursStart,
        operating_hours_end: formData.operatingHoursEnd,
        admin_first_name:
          formData.principalName.split(" ")[0] || formData.principalName,
        admin_last_name:
          formData.principalName.split(" ").slice(1).join(" ") ||
          formData.principalName,
        admin_phone_number: formatPhoneNumber(formData.principalPhone),
        admin_email: formData.principalEmail, // Changed from admin_number to admin_email
        admin_password: formData.adminPassword, // Use the password from form
        selected_plan_id: selectedPlan?.id || "1",
        billing_cycle: selectedPlan?.default_billing_cycle || "monthly",
        estimated_students: parseInt(formData.estimatedStudents) || 400,
        estimated_buses: parseInt(formData.estimatedBuses) || 4,
        estimated_parents: parseInt(formData.estimatedParents) || 800,
      };


      // Dispatch the registration action
      const result = await dispatch(
        registerSchool(registrationPayload)
      ).unwrap();


      toast({
        title: "Registration Submitted",
        description:
          "Your school registration has been submitted successfully. You can now log in with your admin credentials.",
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50 p-4">
      <Card className="w-full max-w-4xl shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
            <Building2 className="h-6 w-6 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Register Your School
          </CardTitle>
          <CardDescription className="text-base text-slate-600">
            Join LuxCub and transform your school transportation management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-slate-900 flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-emerald-600" />
                School Information
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="space-y-2">
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

                <div className="space-y-2">
                  <Label htmlFor="schoolType">School Type *</Label>
                  <Input
                    id="schoolType"
                    name="schoolType"
                    value={formData.schoolType}
                    onChange={handleInputChange}
                    placeholder="Primary, Secondary, etc."
                    required
                    className={errors.schoolType ? "border-red-500" : ""}
                  />
                  {errors.schoolType && (
                    <p className="text-sm text-red-500">{errors.schoolType}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://www.school.edu"
                    className={errors.website ? "border-red-500" : ""}
                  />
                  {errors.website && (
                    <p className="text-sm text-red-500">{errors.website}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <div className="relative address-search-container">
                    <div className="flex gap-2">
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={(e) => {
                          handleInputChange(e);
                          debouncedSearch(e.target.value);
                        }}
                        placeholder="Search for school location..."
                        required
                        className={errors.address ? "border-red-500" : ""}
                      />
                      {isSearchingLocation && (
                        <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
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
                  {errors.address && (
                    <p className="text-sm text-red-500">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      required
                      className={errors.city ? "border-red-500" : ""}
                    />
                    {errors.city && (
                      <p className="text-sm text-red-500">{errors.city}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province *</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      required
                      className={errors.state ? "border-red-500" : ""}
                    />
                    {errors.state && (
                      <p className="text-sm text-red-500">{errors.state}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="ZIP code"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">School Phone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g., 0723456789"
                    required
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">School Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email address"
                    required
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://www.school.edu"
                  className={errors.website ? "border-red-500" : ""}
                />
                {errors.website && (
                  <p className="text-sm text-red-500">{errors.website}</p>
                )}
              </div>
            </div>

            {selectedPlan && (
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-slate-900 flex items-center">
                  <Package className="h-4 w-4 mr-2 text-emerald-600" />
                  Selected Subscription Plan
                </h3>
                <Card className="border-emerald-200 bg-emerald-50">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-emerald-800 text-sm">
                        {selectedPlan.name
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </h4>
                      <Badge className="bg-emerald-600 text-white text-xs">
                        {formatPrice(selectedPlan.base_price)}/month
                      </Badge>
                    </div>
                    <p className="text-xs text-emerald-700 mb-2">
                      {selectedPlan.description}
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-semibold text-emerald-600">
                          {selectedPlan.features_json.max_students}
                        </div>
                        <div className="text-emerald-600 text-xs">Students</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-emerald-600">
                          {selectedPlan.features_json.max_buses}
                        </div>
                        <div className="text-emerald-600 text-xs">Buses</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-emerald-600">
                          {selectedPlan.default_billing_cycle}
                        </div>
                        <div className="text-emerald-600 text-xs">Billing</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

                         <div className="space-y-3">
               <h3 className="text-base font-semibold text-slate-900 flex items-center">
                 <User className="h-4 w-4 mr-2 text-emerald-600" />
                 Admin Information
               </h3>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="principalName">Admin Name *</Label>
                   <Input
                     id="principalName"
                     name="principalName"
                     value={formData.principalName}
                     onChange={handleInputChange}
                     placeholder="Admin's full name"
                     required
                     className={errors.principalName ? "border-red-500" : ""}
                   />
                   {errors.principalName && (
                     <p className="text-sm text-red-500">
                       {errors.principalName}
                     </p>
                   )}
                 </div>

                 <div className="space-y-2">
                   <Label htmlFor="principalPhone">Admin Phone *</Label>
                   <Input
                     id="principalPhone"
                     name="principalPhone"
                     type="tel"
                     value={formData.principalPhone}
                     onChange={handleInputChange}
                     placeholder="e.g., 0723456789"
                     required
                     className={errors.principalPhone ? "border-red-500" : ""}
                   />
                   {errors.principalPhone && (
                     <p className="text-sm text-red-500">
                       {errors.principalPhone}
                     </p>
                   )}
                 </div>
               </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="principalEmail">Admin Email *</Label>
                  <Input
                    id="principalEmail"
                    name="principalEmail"
                    type="email"
                    value={formData.principalEmail}
                    onChange={handleInputChange}
                    placeholder="admin@schoolname.com"
                    required
                    className={errors.principalEmail ? "border-red-500" : ""}
                  />
                  {errors.principalEmail && (
                    <p className="text-sm text-red-500">
                      {errors.principalEmail}
                    </p>
                  )}
                </div>

                                 <div className="space-y-2">
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
                     <p className="text-sm text-red-500">
                       {errors.adminPassword}
                     </p>
                   )}
                 </div>
              </div>
            </div>

                         <div className="space-y-3">
               <h3 className="text-base font-semibold text-slate-900">
                 Additional Information
               </h3>

               <div className="space-y-3">
                 <div className="space-y-2">
                   <Label htmlFor="description">School Description</Label>
                   <Textarea
                     id="description"
                     name="description"
                     value={formData.description}
                     onChange={handleInputChange}
                     placeholder="Tell us about your school, number of students, transportation needs, etc."
                     rows={3}
                   />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   <div className="space-y-2">
                     <Label htmlFor="operatingHoursStart">
                       Operating Hours Start
                     </Label>
                     <Input
                       id="operatingHoursStart"
                       name="operatingHoursStart"
                       type="time"
                       value={formData.operatingHoursStart}
                       onChange={handleInputChange}
                     />
                   </div>

                   <div className="space-y-2">
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

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                   <div className="space-y-2">
                     <Label htmlFor="estimatedStudents">
                       Estimated Number of Students *
                     </Label>
                     <Input
                       id="estimatedStudents"
                       name="estimatedStudents"
                       type="number"
                       value={formData.estimatedStudents}
                       onChange={handleInputChange}
                       placeholder="e.g., 400"
                       required
                       className={errors.estimatedStudents ? "border-red-500" : ""}
                     />
                     {errors.estimatedStudents && (
                       <p className="text-sm text-red-500">
                         {errors.estimatedStudents}
                       </p>
                     )}
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="estimatedBuses">
                       Estimated Number of Buses *
                     </Label>
                     <Input
                       id="estimatedBuses"
                       name="estimatedBuses"
                       type="number"
                       value={formData.estimatedBuses}
                       onChange={handleInputChange}
                       placeholder="e.g., 4"
                       required
                       className={errors.estimatedBuses ? "border-red-500" : ""}
                     />
                     {errors.estimatedBuses && (
                       <p className="text-sm text-red-500">
                         {errors.estimatedBuses}
                       </p>
                     )}
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="estimatedParents">
                       Estimated Number of Parents *
                     </Label>
                     <Input
                       id="estimatedParents"
                       name="estimatedParents"
                       type="number"
                       value={formData.estimatedParents}
                       onChange={handleInputChange}
                       placeholder="e.g., 800"
                       required
                       className={errors.estimatedParents ? "border-red-500" : ""}
                     />
                     {errors.estimatedParents && (
                       <p className="text-sm text-red-500">
                         {errors.estimatedParents}
                       </p>
                     )}
                   </div>
                 </div>
               </div>
             </div>

            <Alert>
              <AlertDescription>
                By submitting this form, you agree to our terms of service and
                privacy policy. We will review your application and contact you
                within 24-48 hours.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/home")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                disabled={registrationLoading}
              >
                {registrationLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Registration"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolRegistration;
