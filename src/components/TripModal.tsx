import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { createTrip, updateTrip, Trip } from "@/redux/slices/tripsSlice";
import { fetchGrades } from "@/redux/slices/gradesSlice";
import { fetchStudents } from "@/redux/slices/studentsSlice";
import { fetchRouteAssignments } from "@/redux/slices/routeAssignmentsSlice";
import { useToast } from "@/components/ui/use-toast";
import { 
  Loader2, 
  Clock, 
  MapPin, 
  User, 
  Car, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Route,
  Users,
  Plus,
  Edit3,
  X,
  ChevronDown,
  ChevronsUpDown,
  Check,
  Info,
  Search
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface TripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip?: Trip | null;
  mode: "create" | "edit";
}

export function TripModal({ isOpen, onClose, trip, mode }: TripModalProps) {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { loading } = useAppSelector((state) => state.trips);
  const { routes } = useAppSelector((state) => state.routes);
  const { drivers } = useAppSelector((state) => state.drivers);
  const { vehicles } = useAppSelector((state) => state.vehicles);
  const { grades } = useAppSelector((state) => state.grades);
  const { students } = useAppSelector((state) => state.students);
  const { schools } = useAppSelector((state) => state.schools);
  const { user } = useAppSelector((state) => state.auth);
  const { assignments } = useAppSelector((state) => state.routeAssignments);

  const [formData, setFormData] = useState({
    route: "",
    driver: "",
    vehicle: "",
    trip_type: "morning" as "morning" | "afternoon",
    status: "scheduled" as
      | "scheduled"
      | "preparing"
      | "ongoing"
      | "completed"
      | "cancelled"
      | "delayed",
    scheduled_start_time: "",
    scheduled_end_time: "",
    grade: "",
    students: [] as number[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Popover open states for searchable selects
  const [routePopoverOpen, setRoutePopoverOpen] = useState(false);
  const [driverPopoverOpen, setDriverPopoverOpen] = useState(false);
  const [vehiclePopoverOpen, setVehiclePopoverOpen] = useState(false);
  const [studentsPopoverOpen, setStudentsPopoverOpen] = useState(false);

  // Get school ID for the current admin
  const schoolId = schools.find((school) => school.admin === user?.id)?.id;

  // Filter data for the current school
  const filteredRoutes = routes.filter((route) => route.school === schoolId);
  const filteredDrivers = drivers.filter(
    (driver) => driver.school === schoolId
  );
  const filteredVehicles = vehicles.filter(
    (vehicle) => vehicle.school === schoolId
  );
  const filteredGrades = grades.filter((grade) => grade.school === schoolId);
  const filteredStudents = students.filter((student) => student.school === schoolId);

  // Filter vehicles based on selected driver
  const getVehiclesForDriver = (driverId: string) => {
    if (!driverId) return filteredVehicles;
    const driverIdNum = parseInt(driverId);
    return filteredVehicles.filter(vehicle => vehicle.driver === driverIdNum);
  };

  const availableVehicles = getVehiclesForDriver(formData.driver);
  


  // Filter students based on search term AND selected grade
  const searchedStudents = filteredStudents.filter((student) => {
    // Filter by grade if one is selected
    if (formData.grade) {
      const gradeId = parseInt(formData.grade);
      if (student.grade !== gradeId) {
        return false;
      }
    }
    
    // Filter by search term if there is one
    if (studentSearchTerm) {
      const searchLower = studentSearchTerm.toLowerCase();
      return (
        student.first_name?.toLowerCase().includes(searchLower) ||
        student.last_name?.toLowerCase().includes(searchLower) ||
        student.admission_number?.toLowerCase().includes(searchLower) ||
        `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchLower)
      );
    }
    
    // If no search term and no grade filter (or grade matches), show the student
    return true;
  });

  // Get selected route for student filtering
  const selectedRoute = filteredRoutes.find(route => route.id.toString() === formData.route);

  // Validation functions
  const validateField = (name: string, value: string | number[]) => {
    const newErrors = { ...errors };
    
    // Skip validation for array fields
    if (Array.isArray(value)) {
      return true;
    }
    
    switch (name) {
      case "route":
        if (!value) newErrors.route = "Route is required";
        else delete newErrors.route;
        break;
      case "driver":
        if (!value) newErrors.driver = "Driver is required";
        else delete newErrors.driver;
        break;
      case "vehicle":
        if (!value) newErrors.vehicle = "Vehicle is required";
        else delete newErrors.vehicle;
        break;
      case "scheduled_start_time":
        if (!value) {
          newErrors.scheduled_start_time = "Start time is required";
        } else {
          const startTime = new Date(value);
          const now = new Date();
          if (startTime < now) {
            newErrors.scheduled_start_time = "Start time cannot be in the past";
          } else {
            delete newErrors.scheduled_start_time;
          }
        }
        break;
      case "scheduled_end_time":
        if (!value) {
          newErrors.scheduled_end_time = "End time is required";
        } else {
          const startTime = new Date(formData.scheduled_start_time);
          const endTime = new Date(value);
          if (endTime <= startTime) {
            newErrors.scheduled_end_time = "End time must be after start time";
          } else {
            delete newErrors.scheduled_end_time;
          }
        }
        break;
      case "grade":
        if (!value) {
          newErrors.grade = "Grade is required";
        } else {
          delete newErrors.grade;
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const fields = ["route", "driver", "vehicle", "grade", "scheduled_start_time", "scheduled_end_time"];
    let isValid = true;
    const newErrors = { ...errors };
    
    fields.forEach(field => {
      const value = formData[field as keyof typeof formData];
      
      // Skip validation for array fields
      if (Array.isArray(value)) {
        return;
      }
      
      switch (field) {
        case "route":
          if (!value) {
            newErrors.route = "Route is required";
            isValid = false;
          } else {
            delete newErrors.route;
          }
          break;
        case "driver":
          if (!value) {
            newErrors.driver = "Driver is required";
            isValid = false;
          } else {
            delete newErrors.driver;
          }
          break;
        case "vehicle":
          if (!value) {
            newErrors.vehicle = "Vehicle is required";
            isValid = false;
          } else {
            delete newErrors.vehicle;
          }
          break;
        case "scheduled_start_time":
          if (!value) {
            newErrors.scheduled_start_time = "Start time is required";
            isValid = false;
          } else {
            const startTime = new Date(value);
            const now = new Date();
            if (startTime < now) {
              newErrors.scheduled_start_time = "Start time cannot be in the past";
              isValid = false;
            } else {
              delete newErrors.scheduled_start_time;
            }
          }
          break;
        case "scheduled_end_time":
          if (!value) {
            newErrors.scheduled_end_time = "End time is required";
            isValid = false;
          } else {
            const startTime = new Date(formData.scheduled_start_time);
            const endTime = new Date(value);
            if (endTime <= startTime) {
              newErrors.scheduled_end_time = "End time must be after start time";
              isValid = false;
            } else {
              delete newErrors.scheduled_end_time;
            }
          }
          break;
        case "grade":
          if (!value) {
            newErrors.grade = "Grade is required";
            isValid = false;
          } else {
            delete newErrors.grade;
          }
          break;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  // Memoize validation result to prevent infinite re-renders
  const isFormValid = useMemo(() => {
    const fields = ["route", "driver", "vehicle", "grade", "scheduled_start_time", "scheduled_end_time"];
    const isValid = fields.every(field => {
      const value = formData[field as keyof typeof formData];
      // Handle array values (like students) differently
      if (Array.isArray(value)) {
        return true; // Arrays are valid if they exist
      }
      return value && value.toString().trim() !== "";
    });
    console.log("Form validation check:", { formData, isValid });
    return isValid;
  }, [formData]);

  // Check for conflicts
  const checkConflicts = () => {
    const conflicts = [];
    
    // Check if driver is already assigned to another trip at the same time
    const driverConflicts = filteredDrivers.find(driver => 
      driver.user_details?.id.toString() === formData.driver &&
      // Add logic to check for time conflicts with existing trips
      false // Placeholder for actual conflict checking
    );
    
    if (driverConflicts) {
      conflicts.push("Driver is already assigned to another trip at this time");
    }
    
    // Check if vehicle is already in use
    const vehicleConflicts = filteredVehicles.find(vehicle => 
      vehicle.id.toString() === formData.vehicle &&
      // Add logic to check for time conflicts with existing trips
      false // Placeholder for actual conflict checking
    );
    
    if (vehicleConflicts) {
      conflicts.push("Vehicle is already in use for another trip at this time");
    }
    
    return conflicts;
  };

  // Function to convert ISO datetime to datetime-local format
  const formatDateTimeForInput = (isoString: string) => {
    if (!isoString) return "";
    try {
      // Parse the ISO string and remove timezone and seconds
      const date = new Date(isoString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error("Error formatting datetime:", error);
      return "";
    }
  };

  useEffect(() => {
    if (trip && mode === "edit") {
      // Convert "evening" to "afternoon" if it exists (since we removed evening option)
      const tripType = trip.trip_type === "evening" ? "afternoon" : trip.trip_type as "morning" | "afternoon";
      
      setFormData({
        route: trip.route.toString(),
        driver: trip.driver.toString(),
        vehicle: trip.vehicle.toString(),
        trip_type: tripType,
        status: trip.status,
        scheduled_start_time: formatDateTimeForInput(trip.scheduled_start_time),
        scheduled_end_time: formatDateTimeForInput(trip.scheduled_end_time),
        grade: trip.grade?.toString() || "",
        students: trip.students || [],
      });
    } else {
      setFormData({
        route: "",
        driver: "",
        vehicle: "",
        trip_type: "morning",
        status: "scheduled",
        scheduled_start_time: "",
        scheduled_end_time: "",
        grade: "",
        students: [],
      });
    }
    // Clear errors when modal opens/closes
    setErrors({});
    setSubmitError(null);
  }, [trip, mode, isOpen]);

  // Load grades, students, and route assignments when modal opens
  useEffect(() => {
    if (isOpen && schoolId) {
      dispatch(fetchGrades({ schoolId }));
      dispatch(fetchStudents({ schoolId }));
      dispatch(fetchRouteAssignments({ schoolId }));
    }
  }, [isOpen, schoolId, dispatch]);

  const submitTrip = async () => {
    console.log("submitTrip called!", { isSubmitting, isFormValid, formData });

    // Clear previous error
    setSubmitError(null);

    if (!schoolId) {
      setSubmitError("No school found for current user");
      return;
    }

    // Validate form
    const formIsValid = validateForm();
    console.log("Form validation result:", { formIsValid, errors });
    
    if (!formIsValid) {
      const errorFields = Object.keys(errors);
      console.log("Validation failed, error fields:", errorFields);
      
      if (errorFields.length > 0) {
        setSubmitError(`Please fix the following fields: ${errorFields.join(", ")}`);
      } else {
        setSubmitError("Please fill in all required fields");
      }
      return;
    }

    // Check for conflicts
    const conflicts = checkConflicts();
    if (conflicts.length > 0) {
      setSubmitError(conflicts.join(", "));
      return;
    }

    console.log("Starting submission");

    const tripData = {
      route: parseInt(formData.route),
      driver: parseInt(formData.driver),
      vehicle: parseInt(formData.vehicle),
      trip_type: formData.trip_type,
      status: formData.status,
      scheduled_start_time: formData.scheduled_start_time,
      scheduled_end_time: formData.scheduled_end_time,
      grade: parseInt(formData.grade),
      students: formData.students.length > 0 ? formData.students : undefined,
    };

    console.log("Prepared trip data:", tripData);
    console.log("School ID:", schoolId);

    try {
      if (mode === "create") {
        await dispatch(createTrip(tripData)).unwrap();
        toast({
          title: "Success",
          description: "Trip created successfully",
        });
        // ONLY close modal on success
        onClose();
      } else if (trip?.id) {
        await dispatch(updateTrip({ id: trip.id, tripData })).unwrap();
        toast({
          title: "Success",
          description: "Trip updated successfully",
        });
        // ONLY close modal on success
      onClose();
      }
    } catch (error: unknown) {
      console.log("ERROR CAUGHT:", error);
      
      let errorMsg = "Failed to save trip";

      // Handle backend validation errors
      if (error && typeof error === "object") {
        const errorObj = error as any;
        
        // Handle non_field_errors (like student-route association errors)
        if (errorObj.errors && errorObj.errors.non_field_errors) {
          const nonFieldErrors = errorObj.errors.non_field_errors;
          
          // Check if it's a student-route association error
          if (nonFieldErrors.some((err: string) => err.includes("is assigned to stops") || err.includes("but none are on route"))) {
            // Parse the error to extract student names and stops
            const errorText = nonFieldErrors.join(" ");
            
            errorMsg = `⚠️ Student-Route Mismatch\n\n${errorText}\n\nPlease:\n• Remove the student(s) from this trip, OR\n• Assign the student(s) to stops on this route first, OR\n• Select a different route`;
          } else if (nonFieldErrors.some((err: string) => err.includes("not associated with any stops"))) {
            errorMsg = "Some selected students are not assigned to any stops on the selected route.\n\nPlease:\n• Assign students to route stops first\n• Remove students who are not on this route\n• Select a different route";
          } else {
            errorMsg = nonFieldErrors.join("\n");
          }
        }
        // Handle field-specific errors
        else if (errorObj.errors) {
          const fieldErrors = Object.entries(errorObj.errors).map(([field, messages]) => {
            const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            return `${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
          });
          errorMsg = fieldErrors.join("; ");
        }
        // Handle general message
        else if (errorObj.message) {
          errorMsg = errorObj.message;
        } else if (errorObj.detail) {
          errorMsg = errorObj.detail;
        }
      } else if (typeof error === "string") {
        errorMsg = error;
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }

      // Display error in modal instead of toast
      setSubmitError(errorMsg);
      
      // DO NOT CLOSE THE MODAL - let user fix the error and try again
      console.log("ERROR: Modal should stay open, NOT closing");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // This is now just a fallback - the real logic is in submitTrip
    await submitTrip();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement> | { name: string; value: string }
  ) => {
    const { name, value } = "target" in e ? e.target : e;

    // Clear students when route changes to prevent validation errors
    if (name === "route" && value !== formData.route) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        students: [], // Clear selected students when route changes
      }));
      // Clear student-related errors
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.students;
        return newErrors;
      });
    }
    // Handle driver selection and filter vehicles
    else if (name === "driver") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        vehicle: "", // Clear vehicle selection when driver changes
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Real-time validation
    validateField(name, value);
  };

  const handleModalOpenChange = (open: boolean) => {
    // Prevent closing modal if there's an error or if submitting
    if (!open && (submitError || isSubmitting)) {
      return; // Don't close
    }
    onClose();
  };

  console.log("TripModal render - isSubmitting:", isSubmitting);

  return (
    <Dialog open={isOpen} onOpenChange={handleModalOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Route className="h-5 w-5 text-blue-600" />
                  {mode === "create" ? "Create New Trip" : "Edit Trip"}
                </DialogTitle>
          <DialogDescription>
                  {mode === "create"
                    ? "Set up a new trip with route, driver, and vehicle assignments"
                    : "Update trip details and assignments"}
                </DialogDescription>
        </DialogHeader>

        <div className="relative space-y-4">
          <div className={`space-y-4 ${isSubmitting ? 'pointer-events-none opacity-50' : ''}`}>
            {/* Route Selection with Search */}
            <div className="space-y-2">
              <Label htmlFor="route" className="text-sm font-medium">
                      Route *
                    </Label>
              <Popover open={routePopoverOpen} onOpenChange={setRoutePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={routePopoverOpen}
                    className={cn(
                      "w-full justify-between",
                      errors.route && "border-red-500"
                    )}
                  >
                    {formData.route
                      ? filteredRoutes.find((route) => route.id.toString() === formData.route)?.name
                      : "Choose a route"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[650px] p-0" align="start" side="bottom">
                  <Command>
                    <CommandInput placeholder="Search routes..." />
                    <CommandList>
                      <CommandEmpty>No route found.</CommandEmpty>
                      <CommandGroup>
                        {filteredRoutes.map((route) => (
                          <CommandItem
                            key={route.id}
                            value={route.name}
                            onSelect={() => {
                              handleInputChange({ name: "route", value: route.id.toString() });
                              setRoutePopoverOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.route === route.id.toString() ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {route.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
                    {errors.route && (
                <p className="text-sm text-red-600">{errors.route}</p>
                    )}
                  </div>

            {/* Driver Selection with Search */}
            <div className="space-y-2">
              <Label htmlFor="driver" className="text-sm font-medium">
                      Driver *
                    </Label>
              <Popover open={driverPopoverOpen} onOpenChange={setDriverPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={driverPopoverOpen}
                    className={cn(
                      "w-full justify-between",
                      errors.driver && "border-red-500"
                    )}
                  >
                    {formData.driver
                      ? (() => {
                          const driver = filteredDrivers.find((d) => d.user_details?.id.toString() === formData.driver);
                          return driver ? `${driver.user_details?.first_name} ${driver.user_details?.last_name}` : "Choose a driver";
                        })()
                      : "Choose a driver"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[650px] p-0" align="start" side="bottom">
                  <Command>
                    <CommandInput placeholder="Search drivers..." />
                    <CommandList>
                      <CommandEmpty>No driver found.</CommandEmpty>
                      <CommandGroup>
                        {filteredDrivers.map((driver) => {
                          const availableVehiclesCount = filteredVehicles.filter(v => v.driver === driver.user_details?.id).length;
                          const driverName = `${driver.user_details?.first_name} ${driver.user_details?.last_name}`;
                          return (
                            <CommandItem
                              key={driver.id}
                              value={driverName}
                              onSelect={() => {
                                handleInputChange({ name: "driver", value: driver.user_details?.id.toString() });
                                setDriverPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.driver === driver.user_details?.id.toString() ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex items-center justify-between w-full">
                                <span>{driverName}</span>
                                <span className="text-xs text-gray-500 ml-2">
                                  ({availableVehiclesCount} vehicles)
                                </span>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
                    {errors.driver && (
                <p className="text-sm text-red-600">{errors.driver}</p>
                    )}
                  </div>

            {/* Vehicle Selection with Search */}
            <div className="space-y-2">
              <Label htmlFor="vehicle" className="text-sm font-medium">
                      Vehicle *
                    </Label>
              <div className="space-y-1">
                {formData.driver && (
                  <p className="text-xs text-blue-600">
                    Showing vehicles assigned to: {filteredDrivers.find(d => d.user_details?.id.toString() === formData.driver)?.user_details?.first_name} {filteredDrivers.find(d => d.user_details?.id.toString() === formData.driver)?.user_details?.last_name}
                  </p>
                )}
                {!formData.driver && (
                  <p className="text-xs text-amber-600">
                    Please select a driver first to see available vehicles
                  </p>
                )}
              </div>
              <Popover open={vehiclePopoverOpen} onOpenChange={setVehiclePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={vehiclePopoverOpen}
                    disabled={!formData.driver}
                    className={cn(
                      "w-full justify-between",
                      errors.vehicle && "border-red-500"
                    )}
                  >
                    {formData.vehicle
                      ? (() => {
                          const vehicle = availableVehicles.find((v) => v.id.toString() === formData.vehicle);
                          return vehicle ? vehicle.registration_number : "Choose a vehicle";
                        })()
                      : formData.driver ? "Choose a vehicle" : "Select driver first"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[650px] p-0" align="start" side="bottom">
                  <Command>
                    <CommandInput placeholder="Search vehicles..." />
                    <CommandList>
                      <CommandEmpty>
                        {availableVehicles.length === 0
                          ? "No vehicles assigned to this driver"
                          : "No vehicle found."}
                      </CommandEmpty>
                      <CommandGroup>
                        {availableVehicles.map((vehicle) => (
                          <CommandItem
                            key={vehicle.id}
                            value={`${vehicle.registration_number} ${vehicle.vehicle_type}`}
                            onSelect={() => {
                              handleInputChange({ name: "vehicle", value: vehicle.id.toString() });
                              setVehiclePopoverOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.vehicle === vehicle.id.toString() ? "opacity-100" : "opacity-0"
                              )}
                            />
                              <div className="flex items-center justify-between w-full">
                                <span>{vehicle.registration_number}</span>
                                <span className="text-xs text-gray-500 ml-2">
                                  {vehicle.vehicle_type} • {vehicle.capacity} seats
                                </span>
                              </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
                    {errors.vehicle && (
                <p className="text-sm text-red-600">{errors.vehicle}</p>
                    )}
                  </div>

            {/* Trip Type */}
            <div className="space-y-2">
              <Label htmlFor="trip_type" className="text-sm font-medium">
                      Trip Type
                    </Label>
                    <Select
                      value={formData.trip_type}
                      onValueChange={(value) =>
                        handleInputChange({ name: "trip_type", value })
                      }
                    >
                <SelectTrigger>
                        <SelectValue placeholder="Select trip type" />
                      </SelectTrigger>
                      <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

            {/* Start Time */}
            <div className="space-y-2">
              <Label htmlFor="scheduled_start_time" className="text-sm font-medium">
                      Start Time *
                    </Label>
                    <Input
                      id="scheduled_start_time"
                      name="scheduled_start_time"
                      type="datetime-local"
                      value={formData.scheduled_start_time}
                      onChange={handleInputChange}
                className={errors.scheduled_start_time ? "border-red-500" : ""}
                      required
                    />
              {errors.scheduled_start_time && (
                <p className="text-sm text-red-600">{errors.scheduled_start_time}</p>
                    )}
                  </div>

            {/* End Time */}
            <div className="space-y-2">
              <Label htmlFor="scheduled_end_time" className="text-sm font-medium">
                      End Time *
                    </Label>
                    <Input
                      id="scheduled_end_time"
                      name="scheduled_end_time"
                      type="datetime-local"
                      value={formData.scheduled_end_time}
                      onChange={handleInputChange}
                className={errors.scheduled_end_time ? "border-red-500" : ""}
                      required
                    />
              {errors.scheduled_end_time && (
                <p className="text-sm text-red-600">{errors.scheduled_end_time}</p>
                    )}
                  </div>

            {/* Grade Selection */}
            <div className="space-y-2">
              <Label htmlFor="grade" className="text-sm font-medium">
                      Grade *
                    </Label>
                    <Select
                      value={formData.grade || undefined}
                      onValueChange={(value) =>
                        handleInputChange({ name: "grade", value })
                      }
                    >
                <SelectTrigger className={errors.grade ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select a grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredGrades.map((grade) => (
                          <SelectItem key={grade.id} value={grade.id.toString()}>
                            <span>{grade.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.grade && (
                <p className="text-sm text-red-600">{errors.grade}</p>
                    )}
                  </div>


            {/* Students Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Students ({formData.students.length} selected)
              </Label>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">
                  {formData.grade 
                    ? `Showing students from ${filteredGrades.find(g => g.id.toString() === formData.grade)?.name || 'selected grade'}` 
                    : 'Select a grade to filter students'}
                </p>
                {formData.route && (
                  <p className="text-xs text-blue-600">
                    Selected route: {selectedRoute?.name || 'Selected Route'}
                  </p>
                )}
                {errors.students && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {errors.students}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <Popover open={studentsPopoverOpen} onOpenChange={setStudentsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={studentsPopoverOpen}
                    className="w-full justify-between"
                  >
                    {formData.students.length > 0
                      ? `${formData.students.length} student${formData.students.length > 1 ? 's' : ''} selected`
                      : "Select students..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[650px] p-0" align="start" side="bottom">
                  <Command>
                    <CommandInput placeholder="Search students by name or admission number..." />
                    <CommandList className="max-h-[60vh]">
                      <CommandEmpty>
                        {formData.grade 
                          ? "No students found matching your search" 
                          : "Please select a grade first to see students"}
                      </CommandEmpty>
                      <CommandGroup>
                        {searchedStudents.map((student) => {
                          const assignment = formData.route ? assignments.find(a => 
                            a.student === student.id && a.route === parseInt(formData.route) && a.is_active
                          ) : null;
                          const isSelected = formData.students.includes(student.id!);
                          
                          return (
                            <CommandItem
                              key={student.id}
                              value={`${student.first_name} ${student.last_name} ${student.admission_number}`}
                              onSelect={() => {
                                const studentId = student.id!;
                                setFormData(prev => ({
                                  ...prev,
                                  students: prev.students.includes(studentId)
                                    ? prev.students.filter(id => id !== studentId)
                                    : [...prev.students, studentId]
                                }));
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  isSelected ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {student.first_name} {student.last_name}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    ({student.admission_number})
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {assignment ? "Assigned" : "Available"}
                                  </Badge>
                                </div>
                                {assignment && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    Pickup: Stop {assignment.pickup_stop} | Dropoff: Stop {assignment.dropoff_stop}
                                  </div>
                                )}
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Error Display */}
            {submitError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="whitespace-pre-line">
                  <div className="space-y-2">
                    <div>{submitError}</div>
                    <div className="text-xs opacity-80 italic">
                      Please fix the error above or click Cancel to close this dialog.
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Form Actions */}
            <DialogFooter className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  // Clear error when explicitly canceling
                  setSubmitError(null);
                  onClose();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
                  <Button 
                    type="button" 
                    disabled={isSubmitting}
                    onClick={async () => {
                      if (isSubmitting) {
                        return;
                      }
                      
                      setIsSubmitting(true);
                      
                      try {
                        await submitTrip();
                      } catch (error) {
                        console.log("Error in button click:", error);
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    className={`${
                      isSubmitting 
                        ? "bg-gray-400 cursor-not-allowed" 
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {mode === "create" ? "Creating..." : "Updating..."}
                      </>
                    ) : (
                      <>
                    {mode === "create" ? (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Trip
                    </>
                  ) : (
                    <>
                      <Edit3 className="mr-2 h-4 w-4" />
                      Update Trip
                    </>
                  )}
                    </>
              )}
                </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
