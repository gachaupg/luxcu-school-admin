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
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchRoutes,
  addRoute,
  deleteRoute,
  Route,
} from "../redux/slices/routesSlice";
import {
  createRouteAssignment,
  type RouteAssignment,
} from "../redux/slices/routeAssignmentsSlice";
import { fetchStudents, type Student } from "../redux/slices/studentsSlice";
import { fetchDrivers, type Driver } from "../redux/slices/driversSlice";
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

export default function RoutesPage() {
  const dispatch = useAppDispatch();
  const { routes, loading, error } = useAppSelector((state) => state.routes);
  const { students } = useAppSelector((state) => state.students);
  const { drivers } = useAppSelector((state) => state.drivers);
  const data = JSON.parse(localStorage.getItem("profile") || "{}");
  const user = data;
  const { schools } = useAppSelector((state) => state.schools);
  const { toast } = useToast();
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
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);

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

  // Filter drivers for the current school
  const filteredDrivers =
    drivers?.filter(
      (driver) => driver && driver.school === parseInt(schoolId || "0")
    ) || [];

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
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (route: Route) => {
    if (!route) return;
    setSelectedRoute(route);
    setIsDeleteDialogOpen(true);
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

  useEffect(() => {
    const schoolId = localStorage.getItem("schoolId");
    if (schoolId) {
      dispatch(fetchRoutes({ schoolId: parseInt(schoolId) }));
      dispatch(fetchStudents({ schoolId: parseInt(schoolId) }));
      dispatch(fetchDrivers());
    }
  }, [dispatch]);

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
      } satisfies Omit<Route, "id">;

      await dispatch(addRoute(routeData)).unwrap();
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

  const handleAssignRoute = async (values: AssignmentFormValues) => {
    try {
      const assignmentData = {
        student: values.student,
        route: values.route,
        pickup_stop: null, // Explicitly set to null
        dropoff_stop: null, // Explicitly set to null
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

  return (
    <div className="min-h-screen bg-gray-100 flex w-full">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 px-8 py-6 bg-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Map className="text-green-500" size={32} />
              <h2 className="text-2xl font-bold text-gray-800">All Routes</h2>
            </div>
            <div className="flex gap-3">
              <Dialog
                open={isAssignRouteModalOpen}
                onOpenChange={(open) => {
                  setIsAssignRouteModalOpen(open);
                  if (!open) {
                    assignmentForm.reset();
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Assign Route to Student
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Assign Route to Student</DialogTitle>
                  </DialogHeader>
                  <Form {...assignmentForm}>
                    <form
                      onSubmit={assignmentForm.handleSubmit(handleAssignRoute)}
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
                                {filteredStudents.map((student) => (
                                  <SelectItem
                                    key={student.id}
                                    value={student.id?.toString() || ""}
                                  >
                                    {student.first_name} {student.last_name} -{" "}
                                    {student.admission_number}
                                  </SelectItem>
                                ))}
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
                            <Select
                              onValueChange={(value) =>
                                field.onChange(parseInt(value))
                              }
                              value={field.value.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose a route" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {routes?.map((route) => (
                                  <SelectItem
                                    key={route.id}
                                    value={route.id?.toString() || ""}
                                  >
                                    {route.name} - {route.total_distance}km
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                                            checked={field.value?.includes(day)}
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
                              disabled={filteredDrivers.length === 0}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      filteredDrivers.length === 0
                                        ? "No drivers available"
                                        : "Choose a driver"
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {filteredDrivers.length === 0 ? (
                                  <SelectItem value="" disabled>
                                    No drivers available for this school
                                  </SelectItem>
                                ) : (
                                  filteredDrivers.map((driver) => (
                                    <SelectItem
                                      key={driver.id}
                                      value={driver.id?.toString() || ""}
                                    >
                                      {driver.user_details.first_name}{" "}
                                      {driver.user_details.last_name} -{" "}
                                      {driver.license_number}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                            {filteredDrivers.length === 0 && (
                              <p className="text-sm text-amber-600 mt-1">
                                No drivers are available for this school. Please
                                add drivers first.
                              </p>
                            )}
                          </FormItem>
                        )}
                      />

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
                                            checked={field.value?.includes(day)}
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
          </div>
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            {/* Search and Filter Controls */}
            <div className="p-6 border-b border-gray-200">
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
                </div>
              </div>

              {/* Results Summary */}
              <div className="text-sm text-gray-600 mt-4">
                Showing {startIndex + 1}-
                {Math.min(endIndex, filteredAndSearchedRoutes.length)} of{" "}
                {filteredAndSearchedRoutes.length} routes
                {searchTerm && ` matching "${searchTerm}"`}
                {statusFilter !== "all" && ` (${statusFilter})`}
              </div>
            </div>

            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      Loading routes...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-red-500"
                    >
                      {error}
                    </td>
                  </tr>
                ) : routes?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      No routes found
                    </td>
                  </tr>
                ) : (
                  paginatedRoutes.map((route) => {
                    // Skip rendering if route is null or undefined
                    if (!route) return null;

                    return (
                      <tr key={route.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {route.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {
                            filteredDrivers?.find((d) => d.id === route.driver)
                              ?.user_details.first_name
                          }{" "}
                          {
                            filteredDrivers?.find((d) => d.id === route.driver)
                              ?.user_details.last_name
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {route.total_distance} km
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {route.schedule_days.join(", ")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={route.is_active ? "default" : "secondary"}
                          >
                            {route.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleView(route)}
                              >
                                <ViewIcon className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEdit(route)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(route)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1}-
                  {Math.min(endIndex, filteredAndSearchedRoutes.length)} of{" "}
                  {filteredAndSearchedRoutes.length} routes
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
            )}
          </div>
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
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Route</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleAddRoute)}
              className="space-y-6"
            >
              {/* Reuse the existing form fields */}
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
              {/* Add other form fields as needed */}
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
    </div>
  );
}
