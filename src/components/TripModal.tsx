import React, { useState, useEffect } from "react";
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
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { createTrip, updateTrip, Trip } from "@/redux/slices/tripsSlice";
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
  Info
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
  const { schools } = useAppSelector((state) => state.schools);
  const { user } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    route: "",
    driver: "",
    vehicle: "",
    trip_type: "morning" as "morning" | "afternoon" | "evening",
    status: "scheduled" as
      | "scheduled"
      | "preparing"
      | "ongoing"
      | "completed"
      | "cancelled"
      | "delayed",
    scheduled_start_time: "",
    scheduled_end_time: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

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

  // Validation functions
  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };
    
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
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const fields = ["route", "driver", "vehicle", "scheduled_start_time", "scheduled_end_time"];
    let isValid = true;
    
    fields.forEach(field => {
      if (!validateField(field, formData[field as keyof typeof formData])) {
        isValid = false;
      }
    });
    
    return isValid;
  };

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

  useEffect(() => {
    if (trip && mode === "edit") {
      setFormData({
        route: trip.route.toString(),
        driver: trip.driver.toString(),
        vehicle: trip.vehicle.toString(),
        trip_type: trip.trip_type,
        status: trip.status,
        scheduled_start_time: trip.scheduled_start_time,
        scheduled_end_time: trip.scheduled_end_time,
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
      });
    }
    // Clear errors when modal opens/closes
    setErrors({});
    setShowConfirmation(false);
  }, [trip, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!schoolId) {
      toast({
        title: "Error",
        description: "No school found for current user",
        variant: "destructive",
      });
      return;
    }

    // Validate form
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix all errors before submitting",
        variant: "destructive",
      });
      return;
    }

    // Check for conflicts
    const conflicts = checkConflicts();
    if (conflicts.length > 0) {
      toast({
        title: "Conflict Detected",
        description: conflicts.join(", "),
        variant: "destructive",
      });
      return;
    }

    // Show confirmation for create mode
    if (mode === "create" && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setIsSubmitting(true);

    const tripData = {
      route: parseInt(formData.route),
      driver: parseInt(formData.driver),
      vehicle: parseInt(formData.vehicle),
      trip_type: formData.trip_type,
      status: formData.status,
      scheduled_start_time: formData.scheduled_start_time,
      scheduled_end_time: formData.scheduled_end_time,
      school: schoolId,
    };

    try {
      if (mode === "create") {
        await dispatch(createTrip(tripData)).unwrap();
        toast({
          title: "Success",
          description: "Trip created successfully",
        });
      } else if (trip?.id) {
        await dispatch(updateTrip({ id: trip.id, tripData })).unwrap();
        toast({
          title: "Success",
          description: "Trip updated successfully",
        });
      }
      onClose();
    } catch (error: unknown) {
      let errorMsg = "Failed to save trip";

      // Handle backend validation errors
      if (error && typeof error === "object") {
        const errorObj = error as any;
        if (errorObj.errors && errorObj.errors.non_field_errors) {
          errorMsg = errorObj.errors.non_field_errors.join(", ");
        } else if (errorObj.message) {
          errorMsg = errorObj.message;
        }
      } else if (typeof error === "string") {
        errorMsg = error;
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }

      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement> | { name: string; value: string }
  ) => {
    const { name, value } = "target" in e ? e.target : e;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Real-time validation
    validateField(name, value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[95vh] overflow-y-auto p-0">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Route className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  {mode === "create" ? "Create New Trip" : "Edit Trip"}
                </DialogTitle>
                <DialogDescription className="text-blue-100 mt-1">
                  {mode === "create"
                    ? "Set up a new trip with route, driver, and vehicle assignments"
                    : "Update trip details and assignments"}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {showConfirmation && mode === "create" && (
            <Alert className="mb-6 border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Are you sure you want to create this trip? This action will assign the selected driver and vehicle to the specified route.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Route and Driver Selection */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 rounded-md">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  Assignment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="route" className="flex items-center gap-2 text-sm font-medium">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      Route *
                    </Label>
                    <Select
                      value={formData.route}
                      onValueChange={(value) =>
                        handleInputChange({ name: "route", value })
                      }
                    >
                      <SelectTrigger className={`h-11 ${errors.route ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}>
                        <SelectValue placeholder="Choose a route" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredRoutes.map((route) => (
                          <SelectItem key={route.id} value={route.id.toString()}>
                            <div className="flex items-center gap-3 py-1">
                              <div className="p-1.5 bg-blue-100 rounded-md">
                                <MapPin className="h-3 w-3 text-blue-600" />
                              </div>
                              <span className="font-medium">{route.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.route && (
                      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
                        <AlertCircle className="h-4 w-4" />
                        {errors.route}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="driver" className="flex items-center gap-2 text-sm font-medium">
                      <User className="h-4 w-4 text-green-600" />
                      Driver *
                    </Label>
                    <Select
                      value={formData.driver}
                      onValueChange={(value) =>
                        handleInputChange({ name: "driver", value })
                      }
                    >
                      <SelectTrigger className={`h-11 ${errors.driver ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-green-500"}`}>
                        <SelectValue placeholder="Choose a driver" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredDrivers.map((driver) => (
                          <SelectItem
                            key={driver.id}
                            value={driver.user_details?.id.toString()}
                          >
                            <div className="flex items-center gap-3 py-1">
                              <div className="p-1.5 bg-green-100 rounded-md">
                                <User className="h-3 w-3 text-green-600" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  {driver.user_details?.first_name}{" "}
                                  {driver.user_details?.last_name}
                                </div>
                                {driver.user_details?.phone_number && (
                                  <div className="text-sm text-gray-500">
                                    {driver.user_details.phone_number}
                                  </div>
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.driver && (
                      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
                        <AlertCircle className="h-4 w-4" />
                        {errors.driver}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle and Trip Type Selection */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-1.5 bg-purple-100 rounded-md">
                    <Car className="h-4 w-4 text-purple-600" />
                  </div>
                  Vehicle & Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="vehicle" className="flex items-center gap-2 text-sm font-medium">
                      <Car className="h-4 w-4 text-purple-600" />
                      Vehicle *
                    </Label>
                    <Select
                      value={formData.vehicle}
                      onValueChange={(value) =>
                        handleInputChange({ name: "vehicle", value })
                      }
                    >
                      <SelectTrigger className={`h-11 ${errors.vehicle ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-purple-500"}`}>
                        <SelectValue placeholder="Choose a vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredVehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                            <div className="flex items-center gap-3 py-1">
                              <div className="p-1.5 bg-purple-100 rounded-md">
                                <Car className="h-3 w-3 text-purple-600" />
                              </div>
                              <span className="font-medium">{vehicle.registration_number}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.vehicle && (
                      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
                        <AlertCircle className="h-4 w-4" />
                        {errors.vehicle}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="trip_type" className="flex items-center gap-2 text-sm font-medium">
                      <Clock className="h-4 w-4 text-orange-600" />
                      Trip Type
                    </Label>
                    <Select
                      value={formData.trip_type}
                      onValueChange={(value) =>
                        handleInputChange({ name: "trip_type", value })
                      }
                    >
                      <SelectTrigger className="h-11 border-gray-200 focus:border-orange-500">
                        <SelectValue placeholder="Select trip type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">
                          <div className="flex items-center gap-3 py-1">
                            <div className="p-1.5 bg-yellow-100 rounded-md">
                              <Clock className="h-3 w-3 text-yellow-600" />
                            </div>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-0">
                              Morning
                            </Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="afternoon">
                          <div className="flex items-center gap-3 py-1">
                            <div className="p-1.5 bg-orange-100 rounded-md">
                              <Clock className="h-3 w-3 text-orange-600" />
                            </div>
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-0">
                              Afternoon
                            </Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="evening">
                          <div className="flex items-center gap-3 py-1">
                            <div className="p-1.5 bg-purple-100 rounded-md">
                              <Clock className="h-3 w-3 text-purple-600" />
                            </div>
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-0">
                              Evening
                            </Badge>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time Selection */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-1.5 bg-green-100 rounded-md">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  Schedule Timing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="scheduled_start_time" className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-4 w-4 text-green-600" />
                      Start Time *
                    </Label>
                    <Input
                      id="scheduled_start_time"
                      name="scheduled_start_time"
                      type="datetime-local"
                      value={formData.scheduled_start_time}
                      onChange={handleInputChange}
                      className={`h-11 ${errors.scheduled_start_time ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-green-500"}`}
                      required
                    />
                    {errors.scheduled_start_time ? (
                      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
                        <AlertCircle className="h-4 w-4" />
                        {errors.scheduled_start_time}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-md">
                        <Info className="h-3 w-3" />
                        Select when the trip should begin
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="scheduled_end_time" className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-4 w-4 text-green-600" />
                      End Time *
                    </Label>
                    <Input
                      id="scheduled_end_time"
                      name="scheduled_end_time"
                      type="datetime-local"
                      value={formData.scheduled_end_time}
                      onChange={handleInputChange}
                      className={`h-11 ${errors.scheduled_end_time ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-green-500"}`}
                      required
                    />
                    {errors.scheduled_end_time ? (
                      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
                        <AlertCircle className="h-4 w-4" />
                        {errors.scheduled_end_time}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-md">
                        <Info className="h-3 w-3" />
                        Must be after start time
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Selection */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 rounded-md">
                    <Users className="h-4 w-4 text-indigo-600" />
                  </div>
                  Trip Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Label htmlFor="status" className="flex items-center gap-2 text-sm font-medium">
                    <Users className="h-4 w-4 text-indigo-600" />
                    Current Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleInputChange({ name: "status", value })
                    }
                  >
                    <SelectTrigger className="h-11 border-gray-200 focus:border-indigo-500">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">
                        <div className="flex items-center gap-3 py-1">
                          <div className="p-1.5 bg-blue-100 rounded-md">
                            <Clock className="h-3 w-3 text-blue-600" />
                          </div>
                          <Badge variant="outline" className="border-blue-200 text-blue-800">
                            Scheduled
                          </Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="preparing">
                        <div className="flex items-center gap-3 py-1">
                          <div className="p-1.5 bg-yellow-100 rounded-md">
                            <Clock className="h-3 w-3 text-yellow-600" />
                          </div>
                          <Badge variant="outline" className="border-yellow-200 text-yellow-800">
                            Preparing
                          </Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="ongoing">
                        <div className="flex items-center gap-3 py-1">
                          <div className="p-1.5 bg-green-100 rounded-md">
                            <Clock className="h-3 w-3 text-green-600" />
                          </div>
                          <Badge variant="outline" className="border-green-200 text-green-800">
                            Ongoing
                          </Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="completed">
                        <div className="flex items-center gap-3 py-1">
                          <div className="p-1.5 bg-gray-100 rounded-md">
                            <CheckCircle2 className="h-3 w-3 text-gray-600" />
                          </div>
                          <Badge variant="outline" className="border-gray-200 text-gray-800">
                            Completed
                          </Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="cancelled">
                        <div className="flex items-center gap-3 py-1">
                          <div className="p-1.5 bg-red-100 rounded-md">
                            <X className="h-3 w-3 text-red-600" />
                          </div>
                          <Badge variant="outline" className="border-red-200 text-red-800">
                            Cancelled
                          </Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="delayed">
                        <div className="flex items-center gap-3 py-1">
                          <div className="p-1.5 bg-orange-100 rounded-md">
                            <Clock className="h-3 w-3 text-orange-600" />
                          </div>
                          <Badge variant="outline" className="border-orange-200 text-orange-800">
                            Delayed
                          </Badge>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Form Summary */}
            {formData.route && formData.driver && formData.vehicle && (
              <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-purple-50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-md">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    </div>
                    Trip Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <div className="p-2 bg-blue-100 rounded-md">
                          <MapPin className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Route</p>
                          <p className="font-medium">
                            {filteredRoutes.find(r => r.id.toString() === formData.route)?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <div className="p-2 bg-green-100 rounded-md">
                          <User className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Driver</p>
                          <p className="font-medium">
                            {filteredDrivers.find(d => d.user_details?.id.toString() === formData.driver)?.user_details?.first_name} {filteredDrivers.find(d => d.user_details?.id.toString() === formData.driver)?.user_details?.last_name}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <div className="p-2 bg-purple-100 rounded-md">
                          <Car className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Vehicle</p>
                          <p className="font-medium">
                            {filteredVehicles.find(v => v.id.toString() === formData.vehicle)?.registration_number}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <div className="p-2 bg-orange-100 rounded-md">
                          <Clock className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Type</p>
                          <p className="font-medium capitalize">{formData.trip_type}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator className="my-6" />
            
            <DialogFooter className="flex gap-3 px-0">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1 h-11"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              {showConfirmation && mode === "create" ? (
                <>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1 h-11"
                  >
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || loading}
                    className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isSubmitting || loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Confirm Create
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button 
                  type="submit" 
                  disabled={isSubmitting || loading}
                  className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSubmitting || loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {mode === "create" ? "Creating..." : "Updating..."}
                    </>
                  ) : mode === "create" ? (
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
                </Button>
              )}
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
