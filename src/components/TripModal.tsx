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
import { Loader2 } from "lucide-react";

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

    // Client-side validation
    const startTime = new Date(formData.scheduled_start_time);
    const endTime = new Date(formData.scheduled_end_time);

    if (endTime <= startTime) {
      toast({
        title: "Validation Error",
        description: "Scheduled end time must be after start time",
        variant: "destructive",
      });
      return;
    }

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

    console.log("Submitting trip data:", tripData);

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
    } catch (error: any) {
      console.log("Trip creation error:", error);
      let errorMsg = "Failed to save trip";

      // Handle backend validation errors
      if (error && typeof error === "object") {
        if (error.errors && error.errors.non_field_errors) {
          errorMsg = error.errors.non_field_errors.join(", ");
        } else if (error.message) {
          errorMsg = error.message;
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
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement> | { name: string; value: string }
  ) => {
    const { name, value } = e.target || e;

    // Auto-set end time when start time changes
    if (name === "scheduled_start_time" && value) {
      const startTime = new Date(value);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Add 1 hour
      const endTimeString = endTime.toISOString().slice(0, 16); // Format for datetime-local input

      setFormData((prev) => ({
        ...prev,
        [name]: value,
        scheduled_end_time: endTimeString,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Trip" : "Edit Trip"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new trip with route, driver, and vehicle assignments."
              : "Update trip details and assignments."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="route">Route</Label>
              <Select
                value={formData.route}
                onValueChange={(value) =>
                  handleInputChange({ name: "route", value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select route" />
                </SelectTrigger>
                <SelectContent>
                  {filteredRoutes.map((route) => (
                    <SelectItem key={route.id} value={route.id.toString()}>
                      {route.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="driver">Driver</Label>
              <Select
                value={formData.driver}
                onValueChange={(value) =>
                  handleInputChange({ name: "driver", value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select driver" />
                </SelectTrigger>
                <SelectContent>
                  {filteredDrivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id.toString()}>
                      {driver.user_details?.first_name}{" "}
                      {driver.user_details?.last_name}
                      {driver.user_details?.phone_number
                        ? ` - ${driver.user_details.phone_number}`
                        : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle</Label>
              <Select
                value={formData.vehicle}
                onValueChange={(value) =>
                  handleInputChange({ name: "vehicle", value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {filteredVehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                      {vehicle.registration_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="trip_type">Trip Type</Label>
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
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled_start_time">Start Time</Label>
              <Input
                id="scheduled_start_time"
                name="scheduled_start_time"
                type="datetime-local"
                value={formData.scheduled_start_time}
                onChange={handleInputChange}
                required
              />
              <p className="text-xs text-gray-500">
                End time will be automatically set to 1 hour later
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduled_end_time">End Time</Label>
              <Input
                id="scheduled_end_time"
                name="scheduled_end_time"
                type="datetime-local"
                value={formData.scheduled_end_time}
                onChange={handleInputChange}
                required
              />
              <p className="text-xs text-gray-500">Must be after start time</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                handleInputChange({ name: "status", value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "create" ? "Creating..." : "Updating..."}
                </>
              ) : mode === "create" ? (
                "Create Trip"
              ) : (
                "Update Trip"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
