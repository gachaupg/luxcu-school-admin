import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useAppDispatch } from "@/redux/hooks";
import { addRouteStop, type RouteStop } from "@/redux/slices/routesSlice";
import { Search, MapPin, Clock, Users, CheckCircle, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GOOGLE_MAPS_API_KEY } from "@/utils/api";

const formSchema = z.object({
  name: z.string().min(2, "Stop name must be at least 2 characters"),
  route: z.number(),
  lat: z.number(),
  lng: z.number(),
  sequence_number: z.number().min(1, "Sequence number must be at least 1"),
  estimated_arrival_time: z
    .string()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/,
      "Time must be in HH:MM:SS format"
    ),
  is_pickup: z.boolean(),
  is_dropoff: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface RouteStopModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeId: number;
  routeName: string;
  currentSequenceNumber: number;
}

interface AddedStop {
  name: string;
  sequence_number: number;
  estimated_arrival_time: string;
  is_pickup: boolean;
  is_dropoff: boolean;
  lat: number;
  lng: number;
}

export function RouteStopModal({
  isOpen,
  onClose,
  routeId,
  routeName,
  currentSequenceNumber,
}: RouteStopModalProps) {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [addedStops, setAddedStops] = useState<AddedStop[]>([]);
  const [nextSequenceNumber, setNextSequenceNumber] = useState(
    currentSequenceNumber
  );
  const searchInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      route: routeId,
      lat: 0,
      lng: 0,
      sequence_number: currentSequenceNumber,
      estimated_arrival_time: "08:00:00",
      is_pickup: true,
      is_dropoff: true,
    },
  });

  // Reset form and state when modal opens
  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: "",
        route: routeId,
        lat: 0,
        lng: 0,
        sequence_number: currentSequenceNumber,
        estimated_arrival_time: "08:00:00",
        is_pickup: true,
        is_dropoff: true,
      });
      setSearchTerm("");
      setSelectedLocation(null);
      setAddedStops([]);
      setNextSequenceNumber(currentSequenceNumber);
    }
  }, [isOpen, routeId, currentSequenceNumber, form]);
const googleMapsApiKey =GOOGLE_MAPS_API_KEY;
  useEffect(() => {
    if (isOpen && !isMapLoaded) {
      // Load Google Maps script
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsMapLoaded(true);
        if (searchInputRef.current) {
          const autocomplete = new google.maps.places.Autocomplete(
            searchInputRef.current,
            {
              fields: ["geometry", "formatted_address", "name"],
              componentRestrictions: { country: "ke" },
            }
          );

          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (place.geometry) {
              const lat = place.geometry.location?.lat() || 0;
              const lng = place.geometry.location?.lng() || 0;
              const name = place.name || place.formatted_address || "";

              setSearchTerm(name);
              setSelectedLocation({ name, lat, lng });
              form.setValue("name", name);
              form.setValue("lat", lat);
              form.setValue("lng", lng);
            }
          });

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
        }
      };
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [isOpen, isMapLoaded, form]);

  const handleSubmit = async (values: FormValues) => {
    if (!selectedLocation) {
      toast({
        title: "Error",
        description: "Please search and select a location first",
        variant: "destructive",
      });
      return;
    }

    try {
      const stopData = {
        name: values.name,
        route: values.route,
        location: {
          type: "Point" as const,
          coordinates: [selectedLocation.lng, selectedLocation.lat] as [number, number]
        },
        sequence_number: values.sequence_number,
        estimated_arrival_time: values.estimated_arrival_time,
        is_pickup: values.is_pickup,
        is_dropoff: values.is_dropoff,
      };

      await dispatch(addRouteStop(stopData)).unwrap();

      // Add to local list of added stops
      const newStop: AddedStop = {
        name: values.name,
        sequence_number: values.sequence_number,
        estimated_arrival_time: values.estimated_arrival_time,
        is_pickup: values.is_pickup,
        is_dropoff: values.is_dropoff,
        lat: values.lat,
        lng: values.lng,
      };

      setAddedStops((prev) => [...prev, newStop]);
      setNextSequenceNumber((prev) => prev + 1);

      toast({
        title: "Success",
        description: `Route stop "${values.name}" added successfully`,
      });

      // Reset form for next stop
      form.reset({
        name: "",
        route: routeId,
        lat: 0,
        lng: 0,
        sequence_number: nextSequenceNumber + 1,
        estimated_arrival_time: "08:00:00",
        is_pickup: true,
        is_dropoff: true,
      });
      setSearchTerm("");
      setSelectedLocation(null);
    } catch (err) {
      // Add route stop error
      let errorMessage = "Failed to add route stop";

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

  const handleClose = () => {
    if (addedStops.length > 0) {
      toast({
        title: "Stops Added",
        description: `Successfully added ${addedStops.length} route stop(s)`,
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            Add Route Stops
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Add multiple stops to route:{" "}
            <span className="font-semibold">{routeName}</span>
          </p>
        </DialogHeader>

        {/* Added Stops List */}
        {addedStops.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Added Stops ({addedStops.length})
              </Label>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Success
              </Badge>
            </div>
            <div className="max-h-40 overflow-y-auto border rounded-lg p-3 bg-green-50">
              {addedStops.map((stop, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-white rounded border mb-2 last:mb-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-green-600">
                        {stop.sequence_number}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{stop.name}</p>
                      <p className="text-xs text-gray-500">
                        Arrival: {stop.estimated_arrival_time} |
                        {stop.is_pickup && (
                          <Badge variant="outline" className="ml-1 text-xs">
                            Pickup
                          </Badge>
                        )}
                        {stop.is_dropoff && (
                          <Badge variant="outline" className="ml-1 text-xs">
                            Dropoff
                          </Badge>
                        )}
                      </p>
                    </div>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              ))}
            </div>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Search Location</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search for a location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  autoComplete="off"
                  onKeyDown={(e) => {
                    // Allow normal navigation in autocomplete dropdown
                    if (
                      e.key === "ArrowDown" ||
                      e.key === "ArrowUp" ||
                      e.key === "Enter"
                    ) {
                      // Don't prevent default for these keys
                      return;
                    }
                  }}
                />
              </div>
              <p className="text-xs text-gray-500">
                Start typing to search for locations using Google Maps
              </p>
            </div>

            {selectedLocation && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">
                    Location Selected
                  </span>
                </div>
                <p className="text-sm text-green-700 mb-1">
                  {selectedLocation.name}
                </p>
                <p className="text-xs text-green-600">
                  Coordinates: {selectedLocation.lat.toFixed(6)},{" "}
                  {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sequence_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sequence Number</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="1"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 1)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimated_arrival_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Arrival Time</FormLabel>
                    <FormControl>
                      <Input type="time" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="is_pickup"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Pickup Stop
                      </FormLabel>
                      <p className="text-sm text-gray-500">
                        Students can be picked up at this stop
                      </p>
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
                name="is_dropoff"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Dropoff Stop
                      </FormLabel>
                      <p className="text-sm text-gray-500">
                        Students can be dropped off at this stop
                      </p>
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
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                {addedStops.length > 0 ? "Done" : "Cancel"}
              </Button>
              <Button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600"
                disabled={!selectedLocation}
              >
                Add Stop
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
