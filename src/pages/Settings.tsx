import { useState, useEffect, useRef } from "react";
import { SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/AppSidebar";
import { HeaderBar } from "../components/HeaderBar";
import {
  Settings,
  Check,
  Edit2,
  Building2,
  Save,
  Loader2,
  MapPin,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchSchools } from "@/redux/slices/schoolsSlice";
import {
  fetchUserPreferences,
  updateUserPreferences,
  setPreference,
  UserPreferences,
} from "@/redux/slices/preferencesSlice";
import { useTheme } from "@/contexts/ThemeContext";
import api from "@/config/api";
import { API_ENDPOINTS } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

declare global {
  interface Window {
    google: typeof google;
  }
}

const TABS = [
  "School Details",
  "Notification Settings",
  "Email Settings",
  "Push Notifications",
  "School Policies",
  "Personalization",
];

const NOTIF_TYPES = [
  { label: "SMS Notifications" },
  { label: "Email Notifications" },
  { label: "Push Notifications" },
];

const RECIPIENTS = [
  { label: "Parents" },
  { label: "Drivers" },
  { label: "Staff" },
];

const MESSAGE_CARDS = [
  { title: "Trip Started", recipient: "Parents" },
  { title: "Trip Ended", recipient: "Parents" },
  { title: "SOS Alert", recipient: "Parents" },
  { title: "Trip Delayed", recipient: "Parents" },
  { title: "Trip Started", recipient: "Driver" },
  { title: "Trip Ended", recipient: "Driver" },
  { title: "Trip Delayed", recipient: "Driver" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCard, setSelectedCard] = useState(0);
  const [isUpdatingSchool, setIsUpdatingSchool] = useState(false);
  const [schoolFormData, setSchoolFormData] = useState({
    name: "",
    location: "",
    description: "",
    contact_number: "",
    email: "",
    operating_hours_start: "08:00",
    operating_hours_end: "16:00",
    notification_enabled: true,
    allow_parent_tracking: true,
    is_active: true,
    longitude_point: null as number | null,
    latitude_point: null as number | null,
    school_longitude: null as number | null,
    school_latitude: null as number | null,
  });

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const schoolLocationInputRef = useRef<HTMLInputElement>(null);

  const dispatch = useAppDispatch();
  const { schools, loading } = useAppSelector((state) => state.schools);
  const { user } = useAppSelector((state) => state.auth);
  const {
    preferences = {
      showAnalytics: true,
      showRecentActivity: true,
      showNotificationsPanel: true,
      allowDataExport: true,
      autoBackup: true,
      theme: "light",
      language: "en",
    },
    loading: preferencesLoading,
  } = useAppSelector((state) => state.preferences);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // Get current school for the logged-in admin
  const currentSchool = schools.find((school) => school.admin === user?.id);

  useEffect(() => {
    dispatch(fetchSchools());
    dispatch(fetchUserPreferences());
  }, [dispatch]);

  // Load Google Maps script
  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initializeAutocomplete();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA4HtS4auqymgQwjbXKXRr1tyBEVFAyOzs&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsMapLoaded(true);
      initializeAutocomplete();
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup script if component unmounts
      const existingScript = document.querySelector(
        `script[src*="maps.googleapis.com"]`
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  // Reinitialize autocomplete when refs are available
  useEffect(() => {
    if (
      isMapLoaded &&
      (locationInputRef.current || schoolLocationInputRef.current)
    ) {
      initializeAutocomplete();
    }
  }, [isMapLoaded, activeTab]);

  const initializeAutocomplete = () => {
    // Add custom styling to the autocomplete dropdown
    const style = document.createElement("style");
    style.textContent = `
      .pac-container {
        border-radius: 0.5rem;
        margin-top: 0.5rem;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        border: 1px solid #e5e7eb;
        background-color: white;
        z-index: 1000;
        max-height: 300px;
        overflow-y: auto;
      }
      .pac-item {
        padding: 0.75rem 1rem;
        cursor: pointer;
        font-size: 0.875rem;
        line-height: 1.25rem;
        border-bottom: 1px solid #f3f4f6;
        transition: background-color 0.2s;
      }
      .pac-item:last-child {
        border-bottom: none;
      }
      .pac-item:hover {
        background-color: #f3f4f6;
      }
      .pac-item-query {
        font-size: 0.875rem;
        color: #1f2937;
        font-weight: 500;
      }
      .pac-icon {
        margin-right: 0.75rem;
        color: #6b7280;
      }
      .pac-matched {
        font-weight: 600;
        color: #2563eb;
      }
    `;
    document.head.appendChild(style);

    // Setup location autocomplete
    if (locationInputRef.current) {
      const locationAutocomplete = new google.maps.places.Autocomplete(
        locationInputRef.current,
        {
          types: ["geocode", "establishment"],
          fields: ["geometry", "formatted_address", "name"],
        }
      );

      // Handle location selection
      locationAutocomplete.addListener("place_changed", () => {
        const place = locationAutocomplete.getPlace();
        if (place.geometry) {
          const lat = place.geometry.location?.lat() || 0;
          const lng = place.geometry.location?.lng() || 0;
          setSchoolFormData((prev) => ({
            ...prev,
            latitude_point: lat,
            longitude_point: lng,
            location: place.formatted_address || place.name || prev.location,
          }));
        }
      });

      // Prevent form submission on enter key
      locationInputRef.current.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
        }
      });
    }

    // Setup school location autocomplete
    if (schoolLocationInputRef.current) {
      const schoolLocationAutocomplete = new google.maps.places.Autocomplete(
        schoolLocationInputRef.current,
        {
          types: ["establishment"],
          fields: ["geometry", "formatted_address", "name"],
        }
      );

      // Handle school location selection
      schoolLocationAutocomplete.addListener("place_changed", () => {
        const place = schoolLocationAutocomplete.getPlace();
        if (place.geometry) {
          const lat = place.geometry.location?.lat() || 0;
          const lng = place.geometry.location?.lng() || 0;
          setSchoolFormData((prev) => ({
            ...prev,
            school_latitude: lat,
            school_longitude: lng,
          }));
        }
      });

      // Prevent form submission on enter key
      schoolLocationInputRef.current.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
        }
      });
    }
  };

  useEffect(() => {
    if (currentSchool) {
    

      setSchoolFormData({
        name: currentSchool.name || "",
        location: currentSchool.location || "",
        description: currentSchool.description || "",
        contact_number: currentSchool.contact_number || "",
        email: currentSchool.email || "",
        operating_hours_start:
          currentSchool.operating_hours_start?.substring(0, 5) || "08:00",
        operating_hours_end:
          currentSchool.operating_hours_end?.substring(0, 5) || "16:00",
        notification_enabled: currentSchool.notification_enabled || true,
        allow_parent_tracking: currentSchool.allow_parent_tracking || true,
        is_active: currentSchool.is_active || true,
        longitude_point: currentSchool.longitude_point || null,
        latitude_point: currentSchool.latitude_point || null,
        school_longitude: currentSchool.school_longitude || null,
        school_latitude: currentSchool.school_latitude || null,
      });
    }
  }, [currentSchool]);

  const handleSchoolUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool) return;

    setIsUpdatingSchool(true);
    try {
      const updateData = {
        ...schoolFormData,
        operating_hours_start: `${schoolFormData.operating_hours_start}:00`,
        operating_hours_end: `${schoolFormData.operating_hours_end}:00`,
        longitude_point: schoolFormData.longitude_point,
        latitude_point: schoolFormData.latitude_point,
        school_longitude: schoolFormData.school_longitude,
        school_latitude: schoolFormData.school_latitude,
      };

      await api.put(`${API_ENDPOINTS.SCHOOLS}${currentSchool.id}/`, updateData);

      // Refresh schools data
      dispatch(fetchSchools()).catch((error) => {
        // The API interceptor should handle token expiration automatically
      });

      toast({
        title: "Success",
        description: "School details updated successfully",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update school details";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingSchool(false);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | boolean | number | null
  ) => {
    setSchoolFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePreferenceChange = async (
    key: keyof UserPreferences,
    value: UserPreferences[keyof UserPreferences]
  ) => {
    try {
      // Update local state immediately for better UX
      dispatch(setPreference({ key, value }));

      // Update on server
      await dispatch(updateUserPreferences({ [key]: value })).unwrap();

      toast({
        title: "Success",
        description: "Preference updated successfully",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update preference";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Helper function to safely render values
  const safeRenderValue = (value: any): string => {
    if (value === null || value === undefined) {
      return "Not set";
    }
    if (typeof value === "object") {
      return "Complex data (not displayed)";
    }
    return String(value);
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Sidebar */}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 px-8 py-6 bg-background overflow-y-auto">
          <div className="mb-4 flex items-center gap-3">
            <Settings style={{ color: '#f7c624' }} size={32} />
            <h2 className="text-2xl font-bold text-foreground">Settings</h2>
          </div>
          {/* Tabs */}
          <div className="flex gap-8 border-b mb-6 overflow-x-auto bg-background sticky top-0 z-10 py-2">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                className={`pb-2 text-lg font-medium transition-colors whitespace-nowrap ${
                  i === activeTab
                    ? "border-b-2"
                    : "text-muted-foreground"
                }`}
                style={{
                  borderColor: i === activeTab ? '#f7c624' : undefined,
                  color: i === activeTab ? '#f7c624' : undefined,
                }}
                onMouseEnter={(e) => {
                  if (i !== activeTab) {
                    e.currentTarget.style.color = '#f7c624';
                  }
                }}
                onMouseLeave={(e) => {
                  if (i !== activeTab) {
                    e.currentTarget.style.color = '';
                  }
                }}
                onClick={() => setActiveTab(i)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* School Details Content */}
          {activeTab === 0 && (
            <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-200px)] pr-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 style={{ color: '#f7c624' }} size={24} />
                    School Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Loading school details...</span>
                    </div>
                  ) : currentSchool ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">School Name</Label>
                          <div className="p-3 bg-gray-50 border rounded-md text-gray-700">
                            {schoolFormData.name}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <div className="p-3 bg-gray-50 border rounded-md text-gray-700">
                            {schoolFormData.location}
                          </div>
                        </div>
                      </div>

                      {/* School Location Search */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" style={{ color: '#f7c624' }} />
                          <h3 className="text-lg font-semibold text-gray-800">
                            School Location Search
                          </h3>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="school_location">
                            School Location Coordinates
                          </Label>
                          <div className="p-3 bg-gray-50 border rounded-md text-gray-700">
                            {typeof schoolFormData.school_latitude ===
                              "number" &&
                            typeof schoolFormData.school_longitude === "number"
                              ? `${safeRenderValue(
                                  schoolFormData.school_latitude
                                )}, ${safeRenderValue(
                                  schoolFormData.school_longitude
                                )}`
                              : "Not set"}
                          </div>
                          <p className="text-sm text-gray-500">
                            School-specific coordinates for precise location
                            tracking
                          </p>
                        </div>
                      </div>

                      {/* Coordinates Display */}
                      {(schoolFormData.latitude_point ||
                        schoolFormData.longitude_point) && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" style={{ color: '#f7c624' }} />
                            <span>General coordinates set</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="latitude">Latitude</Label>
                              <div className="p-3 bg-gray-50 border rounded-md text-gray-700">
                                {safeRenderValue(schoolFormData.latitude_point)}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="longitude">Longitude</Label>
                              <div className="p-3 bg-gray-50 border rounded-md text-gray-700">
                                {safeRenderValue(
                                  schoolFormData.longitude_point
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* School Specific Coordinates Display */}
                      {(schoolFormData.school_latitude ||
                        schoolFormData.school_longitude) && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 text-blue-500" />
                            <span>School-specific coordinates set</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="school_latitude">
                                School Latitude
                              </Label>
                              <div className="p-3 bg-gray-50 border rounded-md text-gray-700">
                                {safeRenderValue(
                                  schoolFormData.school_latitude
                                )}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="school_longitude">
                                School Longitude
                              </Label>
                              <div className="p-3 bg-gray-50 border rounded-md text-gray-700">
                                {safeRenderValue(
                                  schoolFormData.school_longitude
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <div className="p-3 bg-gray-50 border rounded-md text-gray-700 min-h-[80px]">
                          {schoolFormData.description ||
                            "No description available"}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="contact_number">Contact Number</Label>
                          <div className="p-3 bg-gray-50 border rounded-md text-gray-700">
                            {schoolFormData.contact_number}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <div className="p-3 bg-gray-50 border rounded-md text-gray-700">
                            {schoolFormData.email}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="operating_hours_start">
                            Operating Hours Start
                          </Label>
                          <div className="p-3 bg-gray-50 border rounded-md text-gray-700">
                            {schoolFormData.operating_hours_start}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="operating_hours_end">
                            Operating Hours End
                          </Label>
                          <div className="p-3 bg-gray-50 border rounded-md text-gray-700">
                            {schoolFormData.operating_hours_end}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          School Features
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="notification_enabled">
                                Enable Notifications
                              </Label>
                              <p className="text-sm text-gray-500">
                                Allow the school to send notifications to
                                parents and drivers
                              </p>
                            </div>
                            <div className="p-2 bg-gray-50 border rounded-md">
                              <span
                                className={`px-2 py-1 rounded text-sm font-medium ${
                                  schoolFormData.notification_enabled
                                    ? "text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                                style={{
                                  backgroundColor: schoolFormData.notification_enabled ? '#f7c624' : undefined,
                                }}
                              >
                                {schoolFormData.notification_enabled
                                  ? "Enabled"
                                  : "Disabled"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="allow_parent_tracking">
                                Allow Parent Tracking
                              </Label>
                              <p className="text-sm text-gray-500">
                                Allow parents to track their children's bus
                                location
                              </p>
                            </div>
                            <div className="p-2 bg-gray-50 border rounded-md">
                              <span
                                className={`px-2 py-1 rounded text-sm font-medium ${
                                  schoolFormData.allow_parent_tracking
                                    ? "text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                                style={{
                                  backgroundColor: schoolFormData.allow_parent_tracking ? '#f7c624' : undefined,
                                }}
                              >
                                {schoolFormData.allow_parent_tracking
                                  ? "Enabled"
                                  : "Disabled"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="is_active">School Active</Label>
                              <p className="text-sm text-gray-500">
                                Enable or disable the school account
                              </p>
                            </div>
                            <div className="p-2 bg-gray-50 border rounded-md">
                              <span
                                className={`px-2 py-1 rounded text-sm font-medium ${
                                  schoolFormData.is_active
                                    ? "text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                                style={{
                                  backgroundColor: schoolFormData.is_active ? '#f7c624' : undefined,
                                }}
                              >
                                {schoolFormData.is_active
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-6">
                        <div className="text-sm text-gray-500 italic">
                          School information is read-only. Contact your
                          administrator for updates.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No school found
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        You don't have access to any school details.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notification Settings Content */}
          {activeTab === 1 && (
            <div>
              {/* Notification Types & Recipients */}
              <div className="flex flex-wrap gap-12 mb-8">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Notification Types
                  </h3>
                  <div className="flex flex-col gap-3">
                    {NOTIF_TYPES.map((type) => (
                      <div key={type.label} className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f7c624' }}>
                          <span className="w-3 h-3 bg-white rounded-full block" />
                        </span>
                        <span className="text-gray-700">{type.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Notification Recipients
                  </h3>
                  <div className="flex flex-col gap-3">
                    {RECIPIENTS.map((rec, i) => (
                      <label
                        key={rec.label}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={i < 2}
                          readOnly
                          className="w-4 h-4"
                          style={{ accentColor: '#f7c624' }}
                        />
                        <span className="text-gray-700">{rec.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex-1 flex justify-end items-start">
                  <button className="text-white px-4 py-2 rounded transition" style={{ backgroundColor: '#f7c624' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e6b91a'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f7c624'}>
                    New Message
                  </button>
                </div>
              </div>
              {/* Message Customization */}
              <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {MESSAGE_CARDS.map((card, i) => (
                  <div
                    key={card.title + card.recipient}
                    className={`border rounded-lg p-4 flex justify-between items-center cursor-pointer transition ${
                      selectedCard === i
                        ? "shadow-lg"
                        : "border-gray-200"
                    }`}
                    style={{
                      borderColor: selectedCard === i ? '#f7c624' : undefined,
                    }}
                    onClick={() => setSelectedCard(i)}
                  >
                    <div>
                      <div className="font-semibold text-gray-800">
                        {card.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {card.recipient}
                      </div>
                    </div>
                    <button className="flex items-center gap-1 hover:underline" style={{ color: '#f7c624' }}>
                      Edit <Edit2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              {/* Preview */}
              <div className="bg-white rounded-lg shadow p-6 mb-4">
                <div className="text-xs text-gray-400 mb-1">SMS</div>
                <div className="font-bold text-lg text-gray-800 mb-2">
                  Trip Started
                </div>
                <div className="text-gray-700">
                  Your child's trip has started. The bus has departed from
                  [Starting Location] and is en route. Track live updates in the
                  app. 🚌
                </div>
              </div>
              <div className="flex justify-end">
                <button className="bg-white border px-8 py-2 rounded transition" style={{ borderColor: '#f7c624', color: '#f7c624' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7c624'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Email Settings Content */}
          {activeTab === 2 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings style={{ color: '#f7c624' }} size={24} />
                    Email Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="smtp_server">SMTP Server</Label>
                      <Input
                        id="smtp_server"
                        placeholder="smtp.gmail.com"
                        defaultValue="smtp.gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp_port">SMTP Port</Label>
                      <Input
                        id="smtp_port"
                        placeholder="587"
                        defaultValue="587"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email_username">Email Username</Label>
                      <Input
                        id="email_username"
                        placeholder="your-email@gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email_password">Email Password</Label>
                      <Input
                        id="email_password"
                        type="password"
                        placeholder="Enter email password"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Email Templates
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="welcome_email">Welcome Email</Label>
                          <p className="text-sm text-gray-500">
                            Send welcome email to new parents
                          </p>
                        </div>
                        <Switch id="welcome_email" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="trip_notifications">
                            Trip Notifications
                          </Label>
                          <p className="text-sm text-gray-500">
                            Send email notifications for trip updates
                          </p>
                        </div>
                        <Switch id="trip_notifications" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="weekly_reports">Weekly Reports</Label>
                          <p className="text-sm text-gray-500">
                            Send weekly trip reports to parents
                          </p>
                        </div>
                        <Switch id="weekly_reports" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button className="text-white" style={{ backgroundColor: '#f7c624' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e6b91a'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f7c624'}>
                      Save Email Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Push Notifications Content */}
          {activeTab === 3 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings style={{ color: '#f7c624' }} size={24} />
                    Push Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Notification Types
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="trip_started">Trip Started</Label>
                          <p className="text-sm text-gray-500">
                            Notify when bus trip begins
                          </p>
                        </div>
                        <Switch id="trip_started" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="trip_ended">Trip Ended</Label>
                          <p className="text-sm text-gray-500">
                            Notify when bus trip ends
                          </p>
                        </div>
                        <Switch id="trip_ended" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="trip_delayed">Trip Delayed</Label>
                          <p className="text-sm text-gray-500">
                            Notify when bus is delayed
                          </p>
                        </div>
                        <Switch id="trip_delayed" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="sos_alerts">SOS Alerts</Label>
                          <p className="text-sm text-gray-500">
                            Emergency notifications
                          </p>
                        </div>
                        <Switch id="sos_alerts" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="route_changes">Route Changes</Label>
                          <p className="text-sm text-gray-500">
                            Notify about route modifications
                          </p>
                        </div>
                        <Switch id="route_changes" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Notification Schedule
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="quiet_hours_start">
                          Quiet Hours Start
                        </Label>
                        <Input
                          id="quiet_hours_start"
                          type="time"
                          defaultValue="22:00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quiet_hours_end">Quiet Hours End</Label>
                        <Input
                          id="quiet_hours_end"
                          type="time"
                          defaultValue="07:00"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button className="text-white" style={{ backgroundColor: '#f7c624' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e6b91a'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f7c624'}>
                      Save Push Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* School Policies Content */}
          {activeTab === 4 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings style={{ color: '#f7c624' }} size={24} />
                    School Policies
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Transportation Policies
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="pickup_time">
                          Maximum Pickup Wait Time (minutes)
                        </Label>
                        <Input
                          id="pickup_time"
                          type="number"
                          placeholder="15"
                          defaultValue="15"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="late_policy">Late Student Policy</Label>
                        <Textarea
                          id="late_policy"
                          placeholder="Enter late student policy..."
                          rows={3}
                          defaultValue="Students who are more than 5 minutes late for pickup will be left behind and parents will be notified immediately."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="safety_policy">Safety Policy</Label>
                        <Textarea
                          id="safety_policy"
                          placeholder="Enter safety policy..."
                          rows={3}
                          defaultValue="All students must wear seatbelts. No eating or drinking on the bus. Students must remain seated during the journey."
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Communication Policies
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="parent_notifications">
                            Parent Notifications
                          </Label>
                          <p className="text-sm text-gray-500">
                            Allow parents to receive notifications
                          </p>
                        </div>
                        <Switch id="parent_notifications" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="driver_communication">
                            Driver Communication
                          </Label>
                          <p className="text-sm text-gray-500">
                            Allow direct communication with drivers
                          </p>
                        </div>
                        <Switch id="driver_communication" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="emergency_contacts">
                            Emergency Contact Access
                          </Label>
                          <p className="text-sm text-gray-500">
                            Allow access to emergency contact information
                          </p>
                        </div>
                        <Switch id="emergency_contacts" defaultChecked />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button className="text-white" style={{ backgroundColor: '#f7c624' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e6b91a'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f7c624'}>
                      Save Policies
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Personalization Content */}
          {activeTab === 5 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings style={{ color: '#f7c624' }} size={24} />
                    Personalization Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {preferencesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Loading preferences...</span>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">
                          Theme & Appearance
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="theme">Theme</Label>
                            <p className="text-sm text-muted-foreground">
                              Choose how the application theme should behave.
                              Light/Dark will override your system setting,
                              while System will follow your OS preference.
                            </p>
                            <select
                              id="theme"
                              className="w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none bg-background border-border text-foreground"
                              style={{ '--tw-ring-color': '#f7c624' } as React.CSSProperties}
                              value={theme}
                              onChange={(e) =>
                                setTheme(
                                  e.target.value as "light" | "dark" | "auto"
                                )
                              }
                            >
                              <option value="light">
                                Light Theme (Force Light Mode)
                              </option>
                              <option value="dark">
                                Dark Theme (Force Dark Mode)
                              </option>
                              <option value="auto">
                                System (Follow OS Setting)
                              </option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
