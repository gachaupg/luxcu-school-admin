import { SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/AppSidebar";
import { HeaderBar } from "../components/HeaderBar";
import {
  Map,
  MoreVertical,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye as ViewIcon,
  Users,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchRoutes,
  addRoute,
  deleteRoute,
  updateRoute,
  fetchRouteStops,
  Route,
} from "../redux/slices/routesSlice";
import {
  createRouteAssignment,
  fetchRouteAssignments,
  type RouteAssignment,
} from "../redux/slices/routeAssignmentsSlice";
import { fetchStudents, type Student } from "../redux/slices/studentsSlice";
import { fetchDrivers, type Driver } from "../redux/slices/driversSlice";
import { fetchGrades } from "../redux/slices/gradesSlice";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { parseRouteError } from "@/utils/errorHandler";
import { ExportDropdown } from "@/components/ExportDropdown";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { RouteStopModal } from "@/components/RouteStopModal";
import { RouteStopsViewModal } from "@/components/RouteStopsViewModal";

declare global {
  interface Window {
    google: typeof google;
  }
}

const formSchema = z.object({
  name: z.string().min(2, "Route name must be at least 2 characters"),
  school: z.number(),
  driver: z.number().min(1, "Please select a driver"),
  start_lat: z.number(),
  start_lng: z.number(),
  end_lat: z.number(),
  end_lng: z.number(),
  total_distance: z.number(),
  estimated_duration: z.string(),
  is_active: z.boolean(),
  schedule_days: z.array(z.string()),
  traffic_factor: z.number(),
  path: z.string(),
});

const assignmentFormSchema = z.object({
  student: z.number().min(1, "Please select a student"),
  route: z.number().min(1, "Please select a route"),
  pickup_stop: z.number().nullable().optional(),
  dropoff_stop: z.number().nullable().optional(),
  is_active: z.boolean(),
  schedule_days: z
    .array(z.string())
    .min(1, "At least one schedule day is required"),
});

type FormValues = z.infer<typeof formSchema>;
type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;

// Route interface now includes path property

export default function RoutesPage() {
  const dispatch = useAppDispatch();
  const { routes, loading, error } = useAppSelector((state) => state.routes);
  const { students } = useAppSelector((state) => state.students);
  const { drivers } = useAppSelector((state) => state.drivers);
  const { assignments } = useAppSelector((state) => state.routeAssignments);
  const { grades } = useAppSelector((state) => state.grades);
  const data = JSON.parse(localStorage.getItem("profile") || "{}");
  const user = data;
  const { schools } = useAppSelector((state) => state.schools);
  const { toast } = useToast();

  // Debug logging for hot reload issues
  console.log(
    "RoutesPage render - routes:",
    routes?.length,
    "loading:",
    loading,
    "error:",
    error
  );
  console.log("Routes data:", routes);
  console.log("SchoolId from localStorage:", localStorage.getItem("schoolId"));
  console.log("User data:", user);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [startPlace, setStartPlace] = useState("");
  const [endPlace, setEndPlace] = useState("");
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(
    null
  );
  const [calculatedDuration, setCalculatedDuration] = useState<string | null>(
    null
  );
  const [routeStops, setRouteStops] = useState<
    Array<{ name: string; lat: number; lng: number; sequence: number }>
  >([]);
  const [stopSearchTerm, setStopSearchTerm] = useState("");
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);
  const stopSearchInputRef = useRef<HTMLInputElement>(null);

  // Add new state for route stops in assignment
  const [selectedRouteStops, setSelectedRouteStops] = useState<
    Array<{
      id: number;
      name: string;
      lat: number;
      lng: number;
      sequence: number;
      is_pickup?: boolean;
      is_dropoff?: boolean;
    }>
  >([]);
  const [isLoadingStops, setIsLoadingStops] = useState(false);

  // Table state management
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Action modals state
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAssignRouteModalOpen, setIsAssignRouteModalOpen] = useState(false);
  const [isRouteStopModalOpen, setIsRouteStopModalOpen] = useState(false);
  const [selectedRouteForStop, setSelectedRouteForStop] =
    useState<Route | null>(null);
  const [isRouteStopsViewModalOpen, setIsRouteStopsViewModalOpen] =
    useState(false);
  const [selectedRouteForView, setSelectedRouteForView] =
    useState<Route | null>(null);
  const [routeStopsCount, setRouteStopsCount] = useState<
    Record<number, number>
  >({});

  // Student search state
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  // Route search state
  const [routeSearchTerm, setRouteSearchTerm] = useState("");
  // Driver search state
  const [driverSearchTerm, setDriverSearchTerm] = useState("");

  // Filter schools for the current admin
  const filteredSchools =
    schools?.filter((school) => school && school.admin === user?.id) || [];
  const schoolId = localStorage.getItem("schoolId");
  console.log("school", user, schoolId);

  // Filter students for the current school
  const filteredStudents =
    students?.filter(
      (student) => student && student.school === parseInt(schoolId || "0")
    ) || [];

  // Get students who are already assigned to routes
  const assignedStudentIds = new Set(
    assignments?.map((assignment) => assignment?.student) || []
  );

  // Filter out students who are already assigned to routes
  const unassignedStudents = filteredStudents.filter(
    (student) => !assignedStudentIds.has(student.id!)
  );

  // Filter students based on search term (only unassigned students)
  const searchedStudents = unassignedStudents.filter((student) => {
    if (!studentSearchTerm) return true;

    const searchLower = studentSearchTerm.toLowerCase();
    return (
      student.first_name?.toLowerCase().includes(searchLower) ||
      student.last_name?.toLowerCase().includes(searchLower) ||
      student.admission_number?.toLowerCase().includes(searchLower) ||
      `${student.first_name} ${student.last_name}`
        .toLowerCase()
        .includes(searchLower)
    );
  });

  // Filter routes based on search term
  const searchedRoutes = (routes || []).filter((route) => {
    if (!routeSearchTerm) return true;

    const searchLower = routeSearchTerm.toLowerCase();
    return (
      route.name?.toLowerCase().includes(searchLower) ||
      route.total_distance?.toString().includes(searchLower) ||
      route.estimated_duration?.toLowerCase().includes(searchLower)
    );
  });

  // Filter drivers for the current school
  const filteredDrivers =
    drivers?.filter(
      (driver) => driver && driver.school === parseInt(schoolId || "0")
    ) || [];

  // Filter drivers based on search term (name and phone number)
  const searchedDrivers = filteredDrivers.filter((driver) => {
    if (!driverSearchTerm) return true;

    const searchLower = driverSearchTerm.toLowerCase();
    const driverName = `${driver.user_details.first_name || ""} ${
      driver.user_details.last_name || ""
    }`.toLowerCase();
    const driverPhone = (driver.phone_number || "").toLowerCase();

    return (
      driverName.includes(searchLower) || driverPhone.includes(searchLower)
    );
  });

  // Helper functions
  const getGradeName = (gradeId: number | string) => {
    if (!gradeId) return "N/A";
    const grade = grades.find((g) => g.id === Number(gradeId));
    return grade ? grade.name : `Grade ${gradeId}`;
  };

  // Function to decode route path coordinates to location names
  const decodeRouteStops = async (route: Route) => {
    if (!route.path) {
      console.log("No path data found for route:", route.name);
      return [];
    }

    try {
      setIsLoadingStops(true);
      console.log("Route path object:", route.path);
      const coordinates = route.path.coordinates || [];
      console.log("Found coordinates:", coordinates);

      if (coordinates.length === 0) {
        console.log("No coordinates found in path");
        return [];
      }

      const geocoder = new google.maps.Geocoder();
      const stops = [];

      for (let i = 0; i < coordinates.length; i++) {
        const [lng, lat] = coordinates[i];
        console.log(`Geocoding coordinate ${i + 1}:`, { lat, lng });

        try {
          const result = await new Promise<google.maps.GeocoderResult[]>(
            (resolve, reject) => {
              geocoder.geocode(
                { location: { lat, lng } },
                (results, status) => {
                  if (status === "OK" && results) {
                    console.log(
                      `Geocoding successful for coordinate ${i + 1}:`,
                      results[0]?.formatted_address
                    );
                    resolve(results);
                  } else {
                    console.error(
                      `Geocoding failed for coordinate ${i + 1}:`,
                      status
                    );
                    reject(
                      new Error(`Geocoding failed for coordinate ${i + 1}`)
                    );
                  }
                }
              );
            }
          );

          const locationName = result[0]?.formatted_address || `Stop ${i + 1}`;
          console.log(`Adding stop ${i + 1}:`, locationName);
          stops.push({
            id: i + 1,
            name: locationName,
            lat,
            lng,
            sequence: i + 1,
          });
        } catch (error) {
          console.error(`Error geocoding coordinate ${i + 1}:`, error);
          stops.push({
            id: i + 1,
            name: `Stop ${i + 1}`,
            lat,
            lng,
            sequence: i + 1,
          });
        }
      }

      return stops;
    } catch (error) {
      console.error("Error decoding route stops:", error);
      return [];
    } finally {
      setIsLoadingStops(false);
    }
  };

  // Function to handle route selection in assignment form
  const handleRouteSelection = async (routeId: number) => {
    const selectedRoute = routes?.find((route) => route.id === routeId);
    if (selectedRoute) {
      console.log("Selected route:", selectedRoute);
      try {
        // Fetch route stops from API instead of decoding from path
        const response = await dispatch(fetchRouteStops(routeId)).unwrap();
        console.log("Fetched route stops from API:", response);
        setSelectedRouteStops(
          response.map((stop, index) => ({
            id: stop.id || index + 1,
            name: stop.name || `Stop ${index + 1}`,
            lat: stop.lat || 0,
            lng: stop.lng || 0,
            sequence: stop.sequence_number || index + 1,
            is_pickup: stop.is_pickup,
            is_dropoff: stop.is_dropoff,
          }))
        );
      } catch (error) {
        console.error("Error fetching route stops:", error);
        setSelectedRouteStops([]);
        toast({
          title: "Error",
          description: "Failed to fetch route stops",
          variant: "destructive",
        });
      }
    } else {
      setSelectedRouteStops([]);
    }
  };

  const getDriverName = (driverId: number) => {
    if (!driverId) return "N/A";
    const driver = filteredDrivers.find((d) => d.id === driverId);
    return driver
      ? `${driver.user_details.first_name} ${driver.user_details.last_name}`
      : "Unknown Driver";
  };

  // Debug logging
  console.log("All drivers:", drivers);
  console.log("Filtered drivers for school", schoolId, ":", filteredDrivers);

  // Filter and search logic
  const filteredAndSearchedRoutes =
    routes?.filter((route) => {
      // Add null check for route
      if (!route) return false;

      const matchesSearch =
        route.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.schedule_days?.some((day) =>
          day?.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && route.is_active) ||
        (statusFilter === "inactive" && !route.is_active);

      return matchesSearch && matchesStatus;
    }) || [];

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSearchedRoutes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRoutes = filteredAndSearchedRoutes.slice(startIndex, endIndex);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Action handlers
  const handleView = (route: Route) => {
    if (!route) return;
    setSelectedRoute(route);
    setIsViewModalOpen(true);
  };

  const handleEdit = (route: Route) => {
    if (!route) return;
    setSelectedRoute(route);

    // Set the calculated values for display
    setCalculatedDistance(route.total_distance || 0);
    setCalculatedDuration(route.estimated_duration || "00:00:00");

    form.reset({
      name: route.name || "",
      school: route.school || parseInt(schoolId || "1"),
      driver: route.driver || 0,
      start_lat: route.start_lat || 0,
      start_lng: route.start_lng || 0,
      end_lat: route.end_lat || 0,
      end_lng: route.end_lng || 0,
      total_distance: route.total_distance || 0,
      estimated_duration: route.estimated_duration || "00:00:00",
      is_active: route.is_active ?? true,
      schedule_days: route.schedule_days || [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
      ],
      traffic_factor: route.traffic_factor || 1.3,
      path:
        route.path ||
        JSON.stringify({
          type: "LineString",
          coordinates: [
            [0, 0],
            [0, 0],
          ],
        }),
    });

    setIsEditModalOpen(true);
  };

  const handleDelete = (route: Route) => {
    if (!route) return;
    setSelectedRoute(route);
    setIsDeleteDialogOpen(true);
  };

  const handleAddRouteStop = (route: Route) => {
    if (!route) return;
    setSelectedRouteForStop(route);
    setIsRouteStopModalOpen(true);
  };

  const handleViewRouteStops = (route: Route) => {
    if (!route) return;
    setSelectedRouteForView(route);
    setIsRouteStopsViewModalOpen(true);
  };

  const fetchRouteStopsCount = async (routeId: number) => {
    try {
      const response = await dispatch(fetchRouteStops(routeId)).unwrap();
      setRouteStopsCount((prev) => ({
        ...prev,
        [routeId]: response.length,
      }));
    } catch (error) {
      console.error(`Error fetching stops count for route ${routeId}:`, error);
      setRouteStopsCount((prev) => ({
        ...prev,
        [routeId]: 0,
      }));
    }
  };

  const handleAddStop = (name: string, lat: number, lng: number) => {
    console.log("Adding stop:", { name, lat, lng });
    const newStop = {
      name,
      lat,
      lng,
      sequence: routeStops.length + 1,
    };
    console.log("New stop object:", newStop);
    console.log("Current routeStops before adding:", routeStops);
    setRouteStops((prevStops) => {
      const updatedStops = [...prevStops, newStop];
      console.log("Updated routeStops:", updatedStops);
      return updatedStops;
    });
    setStopSearchTerm("");
  };

  const handleRemoveStop = (index: number) => {
    const updatedStops = routeStops.filter((_, i) => i !== index);
    // Update sequence numbers
    const reorderedStops = updatedStops.map((stop, i) => ({
      ...stop,
      sequence: i + 1,
    }));
    setRouteStops(reorderedStops);
  };

  const confirmDelete = async () => {
    try {
      if (!selectedRoute) {
        toast({
          title: "Error",
          description: "No route selected for deletion",
          variant: "destructive",
        });
        return;
      }

      const schoolId = localStorage.getItem("schoolId");
      if (!schoolId) {
        toast({
          title: "Error",
          description: "No school found for the current admin",
          variant: "destructive",
        });
        return;
      }
      await dispatch(deleteRoute(selectedRoute.id!)).unwrap();
      toast({
        title: "Success",
        description: "Route deleted successfully",
      });

      // Refetch data to update the lists
      if (schoolId) {
        dispatch(fetchRoutes({ schoolId: parseInt(schoolId) }));
        dispatch(fetchStudents({ schoolId: parseInt(schoolId) }));
        dispatch(fetchDrivers());
      }

      setIsDeleteDialogOpen(false);
      setSelectedRoute(null);
    } catch (err) {
      console.error("Delete route error:", err);
      let errorMessage = "Failed to delete route";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      school: parseInt(schoolId || "1"),
      driver: 0,
      start_lat: 0,
      start_lng: 0,
      end_lat: 0,
      end_lng: 0,
      total_distance: 0,
      estimated_duration: "00:00:00",
      is_active: true,
      schedule_days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      traffic_factor: 1.3,
      path: JSON.stringify({
        type: "LineString",
        coordinates: [
          [0, 0],
          [0, 0],
        ],
      }),
    },
  });

  const assignmentForm = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      student: 0,
      route: 0,
      pickup_stop: null,
      dropoff_stop: null,
      is_active: true,
      schedule_days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    },
  });

  // Always fetch data on component mount, regardless of existing state
  useEffect(() => {
    const schoolId = localStorage.getItem("schoolId");
    console.log("Routes useEffect - schoolId:", schoolId);

    if (schoolId) {
      console.log("Dispatching fetchRoutes with schoolId:", parseInt(schoolId));
      // Only fetch routes if they don't already exist
      if (!routes || routes.length === 0) {
        dispatch(fetchRoutes({ schoolId: parseInt(schoolId) }));
      }
      dispatch(fetchStudents({ schoolId: parseInt(schoolId) }));
      dispatch(fetchDrivers());
      dispatch(fetchRouteAssignments({ schoolId: parseInt(schoolId) }));
      dispatch(fetchGrades({ schoolId: parseInt(schoolId) }));
    } else {
      console.log("No schoolId found in localStorage");
    }

    // Test toast to verify notifications are working
    toast({
      title: "Routes Page Loaded",
      description: "Notifications are working correctly!",
    });

    // Cleanup function
    return () => {
      // Clear any pending operations if needed
    };
  }, []); // Remove dispatch dependency to ensure it runs on every mount

  // Fetch route stops count when routes are loaded
  useEffect(() => {
    if (routes && routes.length > 0) {
      routes.forEach((route) => {
        if (route.id && !routeStopsCount[route.id]) {
          fetchRouteStopsCount(route.id);
        }
      });
    }
  }, [routes]);

  useEffect(() => {
    // Load Google Maps script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA4HtS4auqymgQwjbXKXRr1tyBEVFAyOzs&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsMapLoaded(true);
      if (startInputRef.current && endInputRef.current) {
        const startAutocomplete = new google.maps.places.Autocomplete(
          startInputRef.current,
          {
            types: ["geocode", "establishment"],
            fields: ["geometry", "formatted_address", "name"],
            componentRestrictions: { country: "ke" },
          }
        );

        const endAutocomplete = new google.maps.places.Autocomplete(
          endInputRef.current,
          {
            types: ["geocode", "establishment"],
            fields: ["geometry", "formatted_address", "name"],
            componentRestrictions: { country: "ke" },
          }
        );

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

        // Handle start location selection
        startAutocomplete.addListener("place_changed", () => {
          const place = startAutocomplete.getPlace();
          if (place.geometry) {
            const lat = place.geometry.location?.lat() || 0;
            const lng = place.geometry.location?.lng() || 0;
            form.setValue("start_lat", lat);
            form.setValue("start_lng", lng);
            const displayAddress = place.name || place.formatted_address || "";
            setStartPlace(displayAddress);
          }
        });

        // Handle end location selection
        endAutocomplete.addListener("place_changed", () => {
          const place = endAutocomplete.getPlace();
          if (place.geometry) {
            const lat = place.geometry.location?.lat() || 0;
            const lng = place.geometry.location?.lng() || 0;
            form.setValue("end_lat", lat);
            form.setValue("end_lng", lng);
            const displayAddress = place.name || place.formatted_address || "";
            setEndPlace(displayAddress);

            // Calculate route if both places are set
            if (startPlace) {
              setIsCalculatingRoute(true);
              const directionsService = new google.maps.DirectionsService();
              const geocoder = new google.maps.Geocoder();

              // First geocode both addresses to ensure we have valid coordinates
              Promise.all([
                new Promise((resolve, reject) => {
                  geocoder.geocode(
                    { address: startPlace },
                    (results, status) => {
                      if (status === "OK" && results?.[0]) {
                        resolve(results[0].geometry.location);
                      } else {
                        reject(new Error("Could not geocode start location"));
                      }
                    }
                  );
                }),
                new Promise((resolve, reject) => {
                  geocoder.geocode(
                    { address: displayAddress },
                    (results, status) => {
                      if (status === "OK" && results?.[0]) {
                        resolve(results[0].geometry.location);
                      } else {
                        reject(new Error("Could not geocode end location"));
                      }
                    }
                  );
                }),
              ])
                .then(([startLocation, endLocation]) => {
                  // Now calculate the route using the geocoded locations
                  directionsService.route(
                    {
                      origin: startLocation as google.maps.LatLng,
                      destination: endLocation as google.maps.LatLng,
                      travelMode: google.maps.TravelMode.DRIVING,
                      unitSystem: google.maps.UnitSystem.METRIC,
                    },
                    (result, status) => {
                      setIsCalculatingRoute(false);
                      if (status === "OK" && result) {
                        const route = result.routes[0];
                        const distance = route.legs[0].distance?.value || 0;
                        const duration = route.legs[0].duration?.value || 0;

                        // Convert distance to kilometers (round to 2 decimal places)
                        const distanceInKm =
                          Math.round((distance / 1000) * 100) / 100;

                        // Convert duration to HH:MM:SS format
                        const hours = Math.floor(duration / 3600);
                        const minutes = Math.floor((duration % 3600) / 60);
                        const seconds = duration % 60;
                        const formattedDuration = `${hours
                          .toString()
                          .padStart(2, "0")}:${minutes
                          .toString()
                          .padStart(2, "0")}:${seconds
                          .toString()
                          .padStart(2, "0")}`;

                        // Update both state and form values
                        setCalculatedDistance(distanceInKm);
                        setCalculatedDuration(formattedDuration);
                        form.setValue("total_distance", distanceInKm);
                        form.setValue("estimated_duration", formattedDuration);
                      } else {
                        setIsCalculatingRoute(false);
                        toast({
                          title: "Error",
                          description:
                            "Could not calculate route. Please check if the locations are valid and try again.",
                          variant: "destructive",
                        });
                      }
                    }
                  );
                })
                .catch((error) => {
                  setIsCalculatingRoute(false);
                  toast({
                    title: "Error",
                    description:
                      error.message ||
                      "Could not calculate route. Please check the locations and try again.",
                    variant: "destructive",
                  });
                });
            }
          }
        });

        // Prevent form submission on enter key and handle click events
        startInputRef.current.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        });
        endInputRef.current.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        });

        // Add stop search autocomplete
        if (stopSearchInputRef.current) {
          const stopAutocomplete = new google.maps.places.Autocomplete(
            stopSearchInputRef.current,
            {
              types: ["geocode", "establishment"],
              fields: ["geometry", "formatted_address", "name"],
              componentRestrictions: { country: "ke" },
            }
          );

          stopAutocomplete.addListener("place_changed", () => {
            console.log("Autocomplete place_changed event triggered");
            const place = stopAutocomplete.getPlace();
            console.log("Selected place:", place);
            if (place.geometry) {
              const lat = place.geometry.location?.lat() || 0;
              const lng = place.geometry.location?.lng() || 0;
              const name = place.name || place.formatted_address || "";
              console.log("Setting stopSearchTerm to:", name);
              // Only update the search term, don't add to stops list
              setStopSearchTerm(name);
              // Clear the autocomplete to prevent it from interfering
              if (stopSearchInputRef.current) {
                stopSearchInputRef.current.value = name;
              }
              // Prevent form submission by stopping event propagation
              setTimeout(() => {
                if (stopSearchInputRef.current) {
                  stopSearchInputRef.current.blur();
                }
              }, 100);
            } else {
              console.log("No geometry found for selected place");
            }
          });
        }

        // Add click event listeners to the autocomplete items
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
              const pacItems = document.querySelectorAll(".pac-item");
              pacItems.forEach((item) => {
                item.addEventListener("click", (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                });
              });
            }
          });
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });

        // Clean up observer on unmount
        return () => {
          observer.disconnect();
        };
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [startPlace]);

  const handleAddRoute = async (values: FormValues) => {
    const schoolId = localStorage.getItem("schoolId");

    if (!schoolId) {
      toast({
        title: "Error",
        description: "No school found for the current admin",
        variant: "destructive",
      });
      return;
    }

    try {
      // Generate path from route stops if available, otherwise from start/end coordinates
      let path;
      if (routeStops.length > 0) {
        const coordinates = routeStops.map((stop) => [stop.lng, stop.lat]);
        path = JSON.stringify({
          type: "LineString",
          coordinates: coordinates,
        });
      } else {
        path = JSON.stringify({
          type: "LineString",
          coordinates: [
            [values.start_lng, values.start_lat],
            [values.end_lng, values.end_lat],
          ],
        });
      }

      const routeData = {
        name: values.name,
        school: parseInt(schoolId || "1"),
        driver: values.driver,
        start_lat: values.start_lat,
        start_lng: values.start_lng,
        end_lat: values.end_lat,
        end_lng: values.end_lng,
        total_distance: values.total_distance,
        estimated_duration: values.estimated_duration,
        is_active: values.is_active,
        schedule_days: values.schedule_days,
        traffic_factor: values.traffic_factor,
        path: path,
      } as Omit<Route, "id"> & { path: string };

      const newRoute = await dispatch(addRoute(routeData)).unwrap();
      toast({
        title: "Success",
        description: "Route added successfully",
      });

      // Refetch data to update the lists
      if (schoolId) {
        dispatch(fetchRoutes({ schoolId: parseInt(schoolId) }));
        dispatch(fetchStudents({ schoolId: parseInt(schoolId) }));
        dispatch(fetchDrivers());
      }

      // Close dialog and reset form
      setIsAddDialogOpen(false);
      form.reset();
      setStartPlace("");
      setEndPlace("");
      setCalculatedDistance(null);
      setCalculatedDuration(null);
      setIsCalculatingRoute(false);
      setRouteStops([]);
      setStopSearchTerm("");
    } catch (err) {
      console.error("Route creation error:", err);

      // Show the actual database error response
      let errorMessage = "Failed to add route";

      if (err instanceof Error) {
        try {
          // Try to parse the error message as JSON to get field-specific errors
          const errorData = JSON.parse(err.message);

          // If it's an object with field errors, display the raw data
          if (typeof errorData === "object" && errorData !== null) {
            errorMessage = JSON.stringify(errorData, null, 2);
          } else {
            errorMessage = err.message;
          }
        } catch (parseError) {
          // If JSON parsing fails, use the original error message
          errorMessage = err.message;
        }
      } else {
        errorMessage = String(err);
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleUpdateRoute = async (values: FormValues) => {
    if (!selectedRoute?.id) {
      toast({
        title: "Error",
        description: "No route selected for update",
        variant: "destructive",
      });
      return;
    }

    const schoolId = localStorage.getItem("schoolId");

    if (!schoolId) {
      toast({
        title: "Error",
        description: "No school found for the current admin",
        variant: "destructive",
      });
      return;
    }

    try {
      // Generate path from route stops if available, otherwise from start/end coordinates
      let path;
      if (routeStops.length > 0) {
        const coordinates = routeStops.map((stop) => [stop.lng, stop.lat]);
        path = JSON.stringify({
          type: "LineString",
          coordinates: coordinates,
        });
      } else {
        path = JSON.stringify({
          type: "LineString",
          coordinates: [
            [values.start_lng, values.start_lat],
            [values.end_lng, values.end_lat],
          ],
        });
      }

      const routeData = {
        name: values.name,
        school: parseInt(schoolId || "1"),
        driver: values.driver,
        start_lat: values.start_lat,
        start_lng: values.start_lng,
        end_lat: values.end_lat,
        end_lng: values.end_lng,
        total_distance: values.total_distance,
        estimated_duration: values.estimated_duration,
        is_active: values.is_active,
        schedule_days: values.schedule_days,
        traffic_factor: values.traffic_factor,
        path: path,
      } as Omit<Route, "id"> & { path: string };

      await dispatch(updateRoute({ id: selectedRoute.id, routeData })).unwrap();

      toast({
        title: "Success",
        description: "Route updated successfully",
      });

      // Refetch data to update the lists
      if (schoolId) {
        dispatch(fetchRoutes({ schoolId: parseInt(schoolId) }));
        dispatch(fetchStudents({ schoolId: parseInt(schoolId) }));
        dispatch(fetchDrivers());
      }

      // Close dialog and reset form
      setIsEditModalOpen(false);
      setSelectedRoute(null);
      form.reset();
      setStartPlace("");
      setEndPlace("");
      setCalculatedDistance(null);
      setCalculatedDuration(null);
      setIsCalculatingRoute(false);
      setRouteStops([]);
      setStopSearchTerm("");
    } catch (err) {
      console.error("Route update error:", err);

      let errorMessage = "Failed to update route";

      if (err instanceof Error) {
        try {
          const errorData = JSON.parse(err.message);
          if (typeof errorData === "object" && errorData !== null) {
            errorMessage = JSON.stringify(errorData, null, 2);
          } else {
            errorMessage = err.message;
          }
        } catch (parseError) {
          errorMessage = err.message;
        }
      } else {
        errorMessage = String(err);
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleAssignRoute = async (values: AssignmentFormValues) => {
    try {
      const assignmentData = {
        student: values.student,
        route: values.route,
        pickup_stop: values.pickup_stop,
        dropoff_stop: values.dropoff_stop,
        is_active: values.is_active,
        schedule_days: values.schedule_days,
      } satisfies Omit<RouteAssignment, "id">;

      await dispatch(createRouteAssignment(assignmentData)).unwrap();
      toast({
        title: "Success",
        description: "Route assigned to student successfully",
      });

      // Close dialog and reset form
      setIsAssignRouteModalOpen(false);
      assignmentForm.reset();
      setSelectedRouteStops([]);
    } catch (err) {
      console.error("Route assignment error:", err);

      let errorMessage = "Failed to assign route to student";

      if (err instanceof Error) {
        try {
          const errorData = JSON.parse(err.message);
          if (typeof errorData === "object" && errorData !== null) {
            errorMessage = JSON.stringify(errorData, null, 2);
          } else {
            errorMessage = err.message;
          }
        } catch (parseError) {
          errorMessage = err.message;
        }
      } else {
        errorMessage = String(err);
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    const schoolId = localStorage.getItem("schoolId");
    if (schoolId) {
      console.log("Manual refresh triggered");
      dispatch(fetchRoutes({ schoolId: parseInt(schoolId) }));
      dispatch(fetchStudents({ schoolId: parseInt(schoolId) }));
      dispatch(fetchDrivers());
      dispatch(fetchRouteAssignments({ schoolId: parseInt(schoolId) }));
      dispatch(fetchGrades({ schoolId: parseInt(schoolId) }));
      toast({
        title: "Refreshing",
        description: "Data is being refreshed...",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 px-2 sm:px-1 py-0 w-full max-w-[98vw] mx-auto">
          <Card className="bg-white shadow-lg border-0 rounded-xl">
            <CardHeader className="border-b border-gray-100 flex flex-row w-full items-center justify-between py-4">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Map className="w-6 h-6 text-green-500" />
                Routes List
              </CardTitle>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
                <Dialog
                  open={isAssignRouteModalOpen}
                  onOpenChange={(open) => {
                    setIsAssignRouteModalOpen(open);
                    if (!open) {
                      assignmentForm.reset();
                      setStudentSearchTerm("");
                      setRouteSearchTerm("");
                      setSelectedRouteStops([]);
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      Assign Route to Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Assign Route to Student</DialogTitle>
                      <div className="text-sm text-muted-foreground">
                        {unassignedStudents.length} students available for route
                        assignment
                        {assignedStudentIds.size > 0 && (
                          <span className="text-amber-600">
                            {" "}
                            ({assignedStudentIds.size} already assigned)
                          </span>
                        )}
                      </div>
                    </DialogHeader>
                    <Form {...assignmentForm}>
                      <form
                        onSubmit={assignmentForm.handleSubmit(
                          handleAssignRoute
                        )}
                        className="space-y-4"
                      >
                        <FormField
                          control={assignmentForm.control}
                          name="student"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Select Student</FormLabel>
                              <Select
                                onValueChange={(value) =>
                                  field.onChange(parseInt(value))
                                }
                                value={field.value.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choose a student" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <div className="flex items-center px-3 pb-2">
                                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                    <input
                                      placeholder="Search students..."
                                      value={studentSearchTerm}
                                      onChange={(e) =>
                                        setStudentSearchTerm(e.target.value)
                                      }
                                      className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                  </div>
                                  <div className="max-h-[200px] overflow-y-auto">
                                    {searchedStudents.length === 0 ? (
                                      <div className="px-3 py-2 text-sm text-muted-foreground">
                                        {studentSearchTerm
                                          ? "No unassigned students found matching your search"
                                          : "No unassigned students available"}
                                      </div>
                                    ) : (
                                      searchedStudents.map((student) => (
                                        <SelectItem
                                          key={student.id}
                                          value={student.id?.toString() || ""}
                                        >
                                          <div className="flex flex-col">
                                            <span className="font-medium">
                                              {student.first_name}{" "}
                                              {student.last_name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                              {student.admission_number} -{" "}
                                              {getGradeName(student.grade)}
                                            </span>
                                          </div>
                                        </SelectItem>
                                      ))
                                    )}
                                  </div>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={assignmentForm.control}
                          name="route"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Select Route</FormLabel>
                              <p className="text-xs text-gray-500 mb-2">
                                Choose a route to see available stops for pickup
                                and dropoff
                              </p>
                              <Select
                                onValueChange={(value) => {
                                  const routeId = parseInt(value);
                                  field.onChange(routeId);
                                  handleRouteSelection(routeId);
                                }}
                                value={field.value.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choose a route" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {/* Route Search Input */}
                                  <div className="flex items-center px-3 pb-2">
                                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                    <input
                                      placeholder="Search routes by name, distance, or duration..."
                                      value={routeSearchTerm}
                                      onChange={(e) =>
                                        setRouteSearchTerm(e.target.value)
                                      }
                                      className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                  </div>
                                  <div className="max-h-[200px] overflow-y-auto">
                                    {searchedRoutes.length === 0 ? (
                                      <div className="px-3 py-2 text-sm text-muted-foreground">
                                        {routeSearchTerm
                                          ? "No routes found matching your search"
                                          : "No routes available"}
                                      </div>
                                    ) : (
                                      searchedRoutes.map((route) => (
                                        <SelectItem
                                          key={route.id}
                                          value={route.id?.toString() || ""}
                                        >
                                          <div className="flex flex-col">
                                            <span className="font-medium">
                                              {route.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                              {route.total_distance}km -{" "}
                                              {route.estimated_duration} -{" "}
                                              {getDriverName(route.driver)}
                                            </span>
                                          </div>
                                        </SelectItem>
                                      ))
                                    )}
                                  </div>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Route Stops Selection */}
                        {isLoadingStops && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-semibold">
                                Route Stops
                              </Label>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                Loading stops...
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedRouteStops.length > 0 && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-semibold">
                                Route Stops ({selectedRouteStops.length} stops
                                found)
                              </Label>
                            </div>

                            <div className="space-y-4">
                              <FormField
                                control={assignmentForm.control}
                                name="pickup_stop"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Route Stop</FormLabel>
                                    <Select
                                      onValueChange={(value) => {
                                        const stopId = parseInt(value);
                                        field.onChange(stopId);
                                        // Also update dropoff_stop with the same value
                                        assignmentForm.setValue(
                                          "dropoff_stop",
                                          stopId
                                        );
                                      }}
                                      value={field.value?.toString() || ""}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select route stop" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {selectedRouteStops.map((stop) => (
                                          <SelectItem
                                            key={stop.id}
                                            value={stop.id.toString()}
                                          >
                                            <div className="flex flex-col">
                                              <span className="font-medium">
                                                {stop.name}
                                              </span>
                                              <span className="text-xs text-muted-foreground">
                                                Stop {stop.sequence}
                                              </span>
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    <p className="text-xs text-gray-500 mt-1">
                                      This stop will be used for both pickup and
                                      dropoff
                                    </p>
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Stops Preview */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                Route Stops Preview
                              </Label>
                              <div className="max-h-40 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                                {selectedRouteStops.map((stop) => (
                                  <div
                                    key={stop.id}
                                    className="flex items-center space-x-3 py-2 border-b border-gray-100 last:border-b-0"
                                  >
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                      <span className="text-xs font-medium text-blue-600">
                                        {stop.sequence}
                                      </span>
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-900">
                                        {stop.name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Coordinates: {stop.lat.toFixed(6)},{" "}
                                        {stop.lng.toFixed(6)}
                                      </p>
                                      <div className="flex gap-1 mt-1">
                                        {stop.is_pickup && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs bg-green-50 text-green-700 border-green-200"
                                          >
                                            Pickup
                                          </Badge>
                                        )}
                                        {stop.is_dropoff && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                          >
                                            Dropoff
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      Stop {stop.sequence}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                Select pickup and dropoff stops from the options
                                above to assign to the student.
                              </p>
                            </div>
                          </div>
                        )}

                        {!isLoadingStops &&
                          selectedRouteStops.length === 0 &&
                          assignmentForm.watch("route") && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold">
                                  Route Stops
                                </Label>
                              </div>
                              <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                                  <span className="text-sm text-amber-700">
                                    No stops found for this route. The route may
                                    not have path coordinates defined.
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                        <FormField
                          control={assignmentForm.control}
                          name="is_active"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel>Active Status</FormLabel>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={assignmentForm.control}
                          name="schedule_days"
                          render={() => (
                            <FormItem>
                              <div className="mb-4">
                                <FormLabel>Schedule Days</FormLabel>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                {[
                                  "monday",
                                  "tuesday",
                                  "wednesday",
                                  "thursday",
                                  "friday",
                                  "saturday",
                                  "sunday",
                                ].map((day) => (
                                  <FormField
                                    key={day}
                                    control={assignmentForm.control}
                                    name="schedule_days"
                                    render={({ field }) => {
                                      return (
                                        <FormItem
                                          key={day}
                                          className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(
                                                day
                                              )}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([
                                                      ...field.value,
                                                      day,
                                                    ])
                                                  : field.onChange(
                                                      field.value?.filter(
                                                        (value) => value !== day
                                                      )
                                                    );
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="font-normal capitalize">
                                            {day}
                                          </FormLabel>
                                        </FormItem>
                                      );
                                    }}
                                  />
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            className="bg-green-500 hover:bg-green-600"
                          >
                            Assign Route
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={isAddDialogOpen}
                  onOpenChange={(open) => {
                    setIsAddDialogOpen(open);
                    if (!open) {
                      // Reset form and state when dialog closes
                      form.reset();
                      setStartPlace("");
                      setEndPlace("");
                      setCalculatedDistance(null);
                      setCalculatedDuration(null);
                      setIsCalculatingRoute(false);
                      setDriverSearchTerm("");
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg shadow"
                      onClick={() => setIsAddDialogOpen(true)}
                    >
                      Add New Route
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Route</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(handleAddRoute)}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Route Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter route name"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="driver"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Select Driver</FormLabel>
                                <Select
                                  onValueChange={(value) =>
                                    field.onChange(parseInt(value))
                                  }
                                  value={field.value.toString()}
                                  disabled={searchedDrivers.length === 0}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue
                                        placeholder={
                                          searchedDrivers.length === 0
                                            ? "No drivers available"
                                            : "Choose a driver"
                                        }
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {/* Driver Search Input */}
                                    <div className="flex items-center px-3 pb-2">
                                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                      <input
                                        placeholder="Search drivers by name or phone..."
                                        value={driverSearchTerm}
                                        onChange={(e) =>
                                          setDriverSearchTerm(e.target.value)
                                        }
                                        className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                      />
                                    </div>
                                    <div className="max-h-[200px] overflow-y-auto">
                                      {searchedDrivers.length === 0 ? (
                                        <div className="px-3 py-2 text-sm text-muted-foreground">
                                          {driverSearchTerm
                                            ? "No drivers found matching your search"
                                            : "No drivers available for this school"}
                                        </div>
                                      ) : (
                                        searchedDrivers.map((driver) => (
                                          <SelectItem
                                            key={driver.id}
                                            value={driver.id?.toString() || ""}
                                          >
                                            <div className="flex flex-col">
                                              <span className="font-medium">
                                                {driver.user_details.first_name}{" "}
                                                {driver.user_details.last_name}
                                              </span>
                                              <span className="text-xs text-muted-foreground">
                                                {driver.phone_number ||
                                                  "No phone"}{" "}
                                                - {driver.license_number}
                                              </span>
                                            </div>
                                          </SelectItem>
                                        ))
                                      )}
                                    </div>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                                {filteredDrivers.length === 0 && (
                                  <p className="text-sm text-amber-600 mt-1">
                                    No drivers are available for this school.
                                    Please add drivers first.
                                  </p>
                                )}
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormItem>
                            <FormLabel>Start Location</FormLabel>
                            <FormControl>
                              <Input
                                ref={startInputRef}
                                placeholder="Type to search for a location"
                                value={startPlace}
                                onChange={(e) => setStartPlace(e.target.value)}
                                className="w-full"
                                autoComplete="off"
                              />
                            </FormControl>
                          </FormItem>
                          <FormItem>
                            <FormLabel>End Location</FormLabel>
                            <FormControl>
                              <Input
                                ref={endInputRef}
                                placeholder="Type to search for a location"
                                value={endPlace}
                                onChange={(e) => setEndPlace(e.target.value)}
                                className="w-full"
                                autoComplete="off"
                              />
                            </FormControl>
                          </FormItem>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="total_distance"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Total Distance (km)</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={calculatedDistance ?? field.value}
                                      onChange={(e) => {
                                        const value = parseFloat(
                                          e.target.value
                                        );
                                        setCalculatedDistance(value);
                                        field.onChange(value);
                                      }}
                                      disabled={isCalculatingRoute}
                                    />
                                    {isCalculatingRoute && (
                                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                        Calculating...
                                      </div>
                                    )}
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="estimated_duration"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Estimated Duration (HH:MM:SS)
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      type="text"
                                      value={calculatedDuration ?? field.value}
                                      onChange={(e) => {
                                        setCalculatedDuration(e.target.value);
                                        field.onChange(e.target.value);
                                      }}
                                      disabled={isCalculatingRoute}
                                      placeholder="00:00:00"
                                      pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
                                    />
                                    {isCalculatingRoute && (
                                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                        Calculating...
                                      </div>
                                    )}
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="is_active"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel>Active Status</FormLabel>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="schedule_days"
                          render={() => (
                            <FormItem>
                              <div className="mb-4">
                                <FormLabel>Schedule Days</FormLabel>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                {[
                                  "monday",
                                  "tuesday",
                                  "wednesday",
                                  "thursday",
                                  "friday",
                                  "saturday",
                                  "sunday",
                                ].map((day) => (
                                  <FormField
                                    key={day}
                                    control={form.control}
                                    name="schedule_days"
                                    render={({ field }) => {
                                      return (
                                        <FormItem
                                          key={day}
                                          className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(
                                                day
                                              )}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([
                                                      ...field.value,
                                                      day,
                                                    ])
                                                  : field.onChange(
                                                      field.value?.filter(
                                                        (value) => value !== day
                                                      )
                                                    );
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="font-normal capitalize">
                                            {day}
                                          </FormLabel>
                                        </FormItem>
                                      );
                                    }}
                                  />
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            className="bg-green-500 hover:bg-green-600"
                          >
                            Create Route
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search routes by name or schedule days..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Routes</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <ExportDropdown
                    data={{
                      headers: [
                        "Route Name",
                        "Driver",
                        "Start Location",
                        "End Location",
                        "Distance (km)",
                        "Duration",
                        "Schedule Days",
                        "Status",
                        "Traffic Factor",
                      ],
                      data: filteredAndSearchedRoutes.map((route) => ({
                        route_name: route.name || "",
                        driver: filteredDrivers?.find(
                          (d) => d.id === route.driver
                        )
                          ? `${
                              filteredDrivers.find((d) => d.id === route.driver)
                                ?.user_details.first_name || ""
                            } ${
                              filteredDrivers.find((d) => d.id === route.driver)
                                ?.user_details.last_name || ""
                            }`
                          : "Not Assigned",
                        start_location: `${route.start_lat}, ${route.start_lng}`,
                        end_location: `${route.end_lat}, ${route.end_lng}`,
                        distance: route.total_distance?.toString() || "",
                        duration: route.estimated_duration || "",
                        schedule_days: route.schedule_days?.join(", ") || "",
                        status: route.is_active ? "Active" : "Inactive",
                        traffic_factor: route.traffic_factor?.toString() || "",
                      })),
                      fileName: "routes_export",
                      title: "Routes Directory",
                    }}
                    className="border-gray-200 hover:bg-gray-50 px-3 py-2"
                  />
                </div>
              </div>

              {/* Results Summary */}
              {/* REMOVED: <div className="text-sm text-gray-600 mt-4">...</div> */}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Route Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Distance
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Schedule
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Route Stops
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                          <span className="text-gray-600 font-medium">
                            Loading routes...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          </div>
                          <span className="text-red-600 font-medium">
                            {error}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : routes?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <Map className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">
                              {loading
                                ? "Loading routes..."
                                : "No routes found"}
                            </p>
                            <p className="text-gray-500 text-sm">
                              {loading
                                ? "Please wait while we fetch your routes"
                                : "Create your first route to get started"}
                            </p>
                            {!loading && (
                              <Button
                                onClick={handleRefresh}
                                variant="outline"
                                size="sm"
                                className="mt-2"
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh Data
                              </Button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedRoutes.map((route, index) => {
                      // Skip rendering if route is null or undefined
                      if (!route) return null;

                      return (
                        <tr
                          key={route.id}
                          className={`hover:bg-gray-50 transition-colors duration-200 ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {route.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ID: {route.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-xs font-medium text-blue-600">
                                  {filteredDrivers
                                    ?.find((d) => d.id === route.driver)
                                    ?.user_details.first_name?.charAt(0) || "?"}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {filteredDrivers?.find(
                                    (d) => d.id === route.driver
                                  )?.user_details.first_name ||
                                    "Not Assigned"}{" "}
                                  {filteredDrivers?.find(
                                    (d) => d.id === route.driver
                                  )?.user_details.last_name || ""}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {filteredDrivers?.find(
                                    (d) => d.id === route.driver
                                  )?.license_number || "No license"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-xs font-medium text-purple-600">
                                  {route.total_distance?.toString().charAt(0) ||
                                    "0"}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {route.total_distance} km
                                </div>
                                <div className="text-xs text-gray-500">
                                  {route.estimated_duration}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {route.schedule_days?.slice(0, 3).map((day) => (
                                <Badge
                                  key={day}
                                  variant="outline"
                                  className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200"
                                >
                                  {day.slice(0, 3)}
                                </Badge>
                              ))}
                              {route.schedule_days?.length > 3 && (
                                <Badge
                                  variant="outline"
                                  className="text-xs px-2 py-1 bg-gray-50 text-gray-600 border-gray-200"
                                >
                                  +{route.schedule_days.length - 3}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewRouteStops(route)}
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            >
                              <MapPin className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                View Stops
                              </span>
                            </Button>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant={
                                route.is_active ? "default" : "secondary"
                              }
                              className={`${
                                route.is_active
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : "bg-gray-100 text-gray-800 border-gray-200"
                              } font-medium`}
                            >
                              <div className="flex items-center space-x-1">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    route.is_active
                                      ? "bg-green-500"
                                      : "bg-gray-400"
                                  }`}
                                ></div>
                                <span>
                                  {route.is_active ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                                >
                                  <MoreHorizontal className="h-4 w-4 text-gray-600" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={() => handleView(route)}
                                  className="cursor-pointer"
                                >
                                  <ViewIcon className="h-4 w-4 mr-2 text-blue-600" />
                                  <span>View Details</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEdit(route)}
                                  className="cursor-pointer"
                                >
                                  <Edit className="h-4 w-4 mr-2 text-green-600" />
                                  <span>Edit Route</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleAddRouteStop(route)}
                                  className="cursor-pointer"
                                >
                                  <MapPin className="h-4 w-4 mr-2 text-purple-600" />
                                  <span>Add Route Stop</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(route)}
                                  className="cursor-pointer text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  <span>Delete Route</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls - always show at the bottom */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1}-
                {Math.min(endIndex, filteredAndSearchedRoutes.length)} of{" "}
                {filteredAndSearchedRoutes.length} routes
                {searchTerm && ` matching "${searchTerm}"`}
                {statusFilter !== "all" && ` (${statusFilter})`}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </main>
      </div>

      {/* View Route Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Route Details</DialogTitle>
          </DialogHeader>
          {selectedRoute && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Route Name</Label>
                  <p>{selectedRoute.name}</p>
                </div>
                <div>
                  <Label className="font-semibold">Status</Label>
                  <Badge
                    variant={selectedRoute.is_active ? "default" : "secondary"}
                  >
                    {selectedRoute.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <Label className="font-semibold">Driver</Label>
                  <p>
                    {
                      filteredDrivers?.find(
                        (d) => d.id === selectedRoute.driver
                      )?.user_details.first_name
                    }{" "}
                    {
                      filteredDrivers?.find(
                        (d) => d.id === selectedRoute.driver
                      )?.user_details.last_name
                    }
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">Total Distance</Label>
                  <p>{selectedRoute.total_distance} km</p>
                </div>
                <div>
                  <Label className="font-semibold">Estimated Duration</Label>
                  <p>{selectedRoute.estimated_duration}</p>
                </div>
                <div>
                  <Label className="font-semibold">Traffic Factor</Label>
                  <p>{selectedRoute.traffic_factor}x</p>
                </div>
                <div>
                  <Label className="font-semibold">Schedule Days</Label>
                  <div className="flex gap-1 mt-1">
                    {selectedRoute.schedule_days.map((day) => (
                      <Badge key={day} variant="outline" className="capitalize">
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <Label className="font-semibold">Coordinates</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label className="text-sm text-gray-600">Start Point</Label>
                    <p className="text-sm">
                      Lat: {selectedRoute.start_lat}, Lng:{" "}
                      {selectedRoute.start_lng}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">End Point</Label>
                    <p className="text-sm">
                      Lat: {selectedRoute.end_lat}, Lng: {selectedRoute.end_lng}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Route Modal */}
      <Dialog
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) {
            setSelectedRoute(null);
            form.reset();
            setStartPlace("");
            setEndPlace("");
            setCalculatedDistance(null);
            setCalculatedDuration(null);
            setIsCalculatingRoute(false);
            setDriverSearchTerm("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Route</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleUpdateRoute)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Route Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter route name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="driver"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Driver</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        value={field.value.toString()}
                        disabled={searchedDrivers.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                searchedDrivers.length === 0
                                  ? "No drivers available"
                                  : "Choose a driver"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Driver Search Input */}
                          <div className="flex items-center px-3 pb-2">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <input
                              placeholder="Search drivers by name or phone..."
                              value={driverSearchTerm}
                              onChange={(e) =>
                                setDriverSearchTerm(e.target.value)
                              }
                              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </div>
                          <div className="max-h-[200px] overflow-y-auto">
                            {searchedDrivers.length === 0 ? (
                              <div className="px-3 py-2 text-sm text-muted-foreground">
                                {driverSearchTerm
                                  ? "No drivers found matching your search"
                                  : "No drivers available for this school"}
                              </div>
                            ) : (
                              searchedDrivers.map((driver) => (
                                <SelectItem
                                  key={driver.id}
                                  value={driver.id?.toString() || ""}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {driver.user_details.first_name}{" "}
                                      {driver.user_details.last_name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {driver.phone_number || "No phone"} -{" "}
                                      {driver.license_number}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </div>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      {filteredDrivers.length === 0 && (
                        <p className="text-sm text-amber-600 mt-1">
                          No drivers are available for this school. Please add
                          drivers first.
                        </p>
                      )}
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormItem>
                  <FormLabel>Start Location</FormLabel>
                  <FormControl>
                    <Input
                      ref={startInputRef}
                      placeholder="Type to search for a location"
                      value={startPlace}
                      onChange={(e) => setStartPlace(e.target.value)}
                      className="w-full"
                      autoComplete="off"
                    />
                  </FormControl>
                </FormItem>
                <FormItem>
                  <FormLabel>End Location</FormLabel>
                  <FormControl>
                    <Input
                      ref={endInputRef}
                      placeholder="Type to search for a location"
                      value={endPlace}
                      onChange={(e) => setEndPlace(e.target.value)}
                      className="w-full"
                      autoComplete="off"
                    />
                  </FormControl>
                </FormItem>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="total_distance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Distance (km)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={calculatedDistance ?? field.value}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              setCalculatedDistance(value);
                              field.onChange(value);
                            }}
                            disabled={isCalculatingRoute}
                          />
                          {isCalculatingRoute && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                              Calculating...
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="estimated_duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Duration (HH:MM:SS)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="text"
                            value={calculatedDuration ?? field.value}
                            onChange={(e) => {
                              setCalculatedDuration(e.target.value);
                              field.onChange(e.target.value);
                            }}
                            disabled={isCalculatingRoute}
                            placeholder="00:00:00"
                            pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
                          />
                          {isCalculatingRoute && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                              Calculating...
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="schedule_days"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Schedule Days</FormLabel>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        "monday",
                        "tuesday",
                        "wednesday",
                        "thursday",
                        "friday",
                        "saturday",
                        "sunday",
                      ].map((day) => (
                        <FormField
                          key={day}
                          control={form.control}
                          name="schedule_days"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={day}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(day)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, day])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== day
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal capitalize">
                                  {day}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Route Stops Section */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Route Stops</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Add intermediate stops for this route
                  </p>
                </div>

                {/* Stop Search Input */}
                <div className="space-y-2">
                  <Label>Add Stop</Label>
                  <div className="flex gap-2">
                    <Input
                      ref={stopSearchInputRef}
                      placeholder="Search for a location to add as a stop..."
                      value={stopSearchTerm}
                      onChange={(e) => setStopSearchTerm(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          e.stopPropagation();
                        }
                      }}
                      className="flex-1"
                      autoComplete="off"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        console.log(
                          "Add button clicked (edit modal), stopSearchTerm:",
                          stopSearchTerm
                        );
                        if (stopSearchTerm.trim()) {
                          // Get coordinates from the search input
                          const geocoder = new google.maps.Geocoder();
                          console.log(
                            "Geocoding address (edit modal):",
                            stopSearchTerm
                          );
                          geocoder.geocode(
                            { address: stopSearchTerm },
                            (results, status) => {
                              console.log("Geocoding results (edit modal):", {
                                results,
                                status,
                              });
                              if (status === "OK" && results?.[0]) {
                                const lat =
                                  results[0].geometry.location?.lat() || 0;
                                const lng =
                                  results[0].geometry.location?.lng() || 0;
                                console.log("Found coordinates (edit modal):", {
                                  lat,
                                  lng,
                                });
                                handleAddStop(stopSearchTerm, lat, lng);
                              } else {
                                console.log(
                                  "Geocoding failed (edit modal):",
                                  status
                                );
                                toast({
                                  title: "Error",
                                  description:
                                    "Could not find coordinates for this location",
                                  variant: "destructive",
                                });
                              }
                            }
                          );
                        } else {
                          console.log(
                            "stopSearchTerm is empty or whitespace (edit modal)"
                          );
                        }
                      }}
                      disabled={!stopSearchTerm.trim()}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {/* Stops List */}
                {routeStops.length > 0 && (
                  <div className="space-y-2">
                    <Label>Added Stops ({routeStops.length})</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                      {routeStops.map((stop, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-600">
                                {stop.sequence}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{stop.name}</p>
                              <p className="text-xs text-gray-500">
                                {stop.lat.toFixed(6)}, {stop.lng.toFixed(6)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveStop(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600"
                >
                  Update Route
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              route
              {selectedRoute && ` "${selectedRoute.name}"`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Route Stop Modal */}
      {selectedRouteForStop && (
        <RouteStopModal
          isOpen={isRouteStopModalOpen}
          onClose={() => {
            setIsRouteStopModalOpen(false);
            setSelectedRouteForStop(null);
            // Refresh the stops count for this route
            if (selectedRouteForStop.id) {
              fetchRouteStopsCount(selectedRouteForStop.id);
            }
          }}
          routeId={selectedRouteForStop.id!}
          routeName={selectedRouteForStop.name}
          currentSequenceNumber={1} // You can calculate this based on existing stops
        />
      )}

      {/* Route Stops View Modal */}
      {selectedRouteForView && (
        <RouteStopsViewModal
          isOpen={isRouteStopsViewModalOpen}
          onClose={() => {
            setIsRouteStopsViewModalOpen(false);
            setSelectedRouteForView(null);
          }}
          routeId={selectedRouteForView.id!}
          routeName={selectedRouteForView.name}
        />
      )}
    </div>
  );
}
