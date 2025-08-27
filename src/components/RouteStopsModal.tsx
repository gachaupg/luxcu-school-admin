import React, { useState, useEffect, useRef } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Trash2, Edit, Map } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchRouteStops,
  addRouteStop,
  updateRouteStop,
  deleteRouteStop,
  type RouteStop,
} from "@/redux/slices/routesSlice";
import { useToast } from "@/components/ui/use-toast";

declare global {
  interface Window {
    google: typeof google;
  }
}

const stopFormSchema = z.object({
  name: z.string().min(2, "Stop name must be at least 2 characters"),
  lat: z.number(),
  lng: z.number(),
  sequence: z.number().min(1, "Sequence must be at least 1"),
  is_pickup: z.boolean(),
  is_dropoff: z.boolean(),
  estimated_time: z.string(),
});

type StopFormValues = z.infer<typeof stopFormSchema>;

interface RouteStopsModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeId: number;
  routeName: string;
}

export function RouteStopsModal({
  isOpen,
  onClose,
  routeId,
  routeName,
}: RouteStopsModalProps) {
  const dispatch = useAppDispatch();
  const { routeStops, loading } = useAppSelector((state) => state.routes);
  const { toast } = useToast();
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedStop, setSelectedStop] = useState<RouteStop | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddingStop, setIsAddingStop] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<StopFormValues>({
    resolver: zodResolver(stopFormSchema),
    defaultValues: {
      name: "",
      lat: 0,
      lng: 0,
      sequence: 1,
      is_pickup: true,
      is_dropoff: false,
      estimated_time: "00:05:00",
    },
  });

  // Load Google Maps
  useEffect(() => {
    if (!isOpen) return;

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA4HtS4auqymgQwjbXKXRr1tyBEVFAyOzs&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsMapLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [isOpen]);

  // Initialize map
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !isOpen) return;

    const mapInstance = new google.maps.Map(mapRef.current, {
      center: { lat: -1.2921, lng: 36.8219 }, // Nairobi
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    });

    setMap(mapInstance);

    // Add search autocomplete
    if (searchInputRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(
        searchInputRef.current,
        {
          types: ["geocode", "establishment"],
          fields: ["geometry", "formatted_address", "name"],
          componentRestrictions: { country: "ke" },
        }
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          const lat = place.geometry.location?.lat() || 0;
          const lng = place.geometry.location?.lng() || 0;
          form.setValue("lat", lat);
          form.setValue("lng", lng);
          form.setValue("name", place.name || place.formatted_address || "");
          
          // Center map on selected location
          mapInstance.setCenter({ lat, lng });
          mapInstance.setZoom(15);
        }
      });
    }
  }, [isMapLoaded, isOpen, form]);

  // Load route stops
  useEffect(() => {
    if (isOpen && routeId) {
      dispatch(fetchRouteStops({ routeId }));
    }
  }, [dispatch, isOpen, routeId]);

  // Update map markers and polyline when route stops change
  useEffect(() => {
    if (!map || !routeStops.length) return;

    // Clear existing markers and polyline
    markers.forEach(marker => marker.setMap(null));
    if (polyline) polyline.setMap(null);

    const newMarkers: google.maps.Marker[] = [];
    const coordinates: google.maps.LatLngLiteral[] = [];

    // Sort stops by sequence
    const sortedStops = [...routeStops].sort((a, b) => a.sequence - b.sequence);

    sortedStops.forEach((stop, index) => {
      const position = { lat: stop.lat, lng: stop.lng };
      coordinates.push(position);

      const marker = new google.maps.Marker({
        position,
        map,
        title: stop.name,
        label: {
          text: (index + 1).toString(),
          color: "white",
          fontWeight: "bold",
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: stop.is_pickup && stop.is_dropoff ? "#FF6B35" : 
                    stop.is_pickup ? "#4CAF50" : "#2196F3",
          fillOpacity: 1,
          strokeColor: "white",
          strokeWeight: 2,
        },
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; font-weight: bold;">${stop.name}</h3>
            <p style="margin: 0; font-size: 12px;">Sequence: ${stop.sequence}</p>
            <p style="margin: 0; font-size: 12px;">Type: ${stop.is_pickup ? 'Pickup' : ''}${stop.is_pickup && stop.is_dropoff ? ' & ' : ''}${stop.is_dropoff ? 'Dropoff' : ''}</p>
            <p style="margin: 0; font-size: 12px;">Time: ${stop.estimated_time}</p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });

      newMarkers.push(marker);
    });

    // Draw polyline connecting all stops
    if (coordinates.length > 1) {
      const newPolyline = new google.maps.Polyline({
        path: coordinates,
        geodesic: true,
        strokeColor: "#FF6B35",
        strokeOpacity: 1.0,
        strokeWeight: 3,
      });
      newPolyline.setMap(map);
      setPolyline(newPolyline);
    }

    setMarkers(newMarkers);

    // Fit bounds to show all markers
    if (coordinates.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      coordinates.forEach(coord => bounds.extend(coord));
      map.fitBounds(bounds);
    }
  }, [map, routeStops]);

  // Handle map click to add new stop
  useEffect(() => {
    if (!map || !isAddingStop) return;

    const clickListener = map.addListener("click", (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        form.setValue("lat", lat);
        form.setValue("lng", lng);
        form.setValue("sequence", routeStops.length + 1);
        
        // Reverse geocode to get address
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results?.[0]) {
            form.setValue("name", results[0].formatted_address);
          }
        });
      }
    });

    return () => {
      google.maps.event.removeListener(clickListener);
    };
  }, [map, isAddingStop, form, routeStops.length]);

  const handleAddStop = async (values: StopFormValues) => {
    try {
      const stopData = {
        route: routeId,
        name: values.name,
        lat: values.lat,
        lng: values.lng,
        sequence: values.sequence,
        is_pickup: values.is_pickup,
        is_dropoff: values.is_dropoff,
        estimated_time: values.estimated_time,
      };

      await dispatch(addRouteStop(stopData)).unwrap();

      toast({
        title: "Success",
        description: "Route stop added successfully",
      });

      form.reset();
      setIsAddingStop(false);
    } catch (err) {
      // Add stop error
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

  const handleUpdateStop = async (values: StopFormValues) => {
    if (!selectedStop?.id) return;

    try {
      const stopData = {
        route: routeId,
        name: values.name,
        lat: values.lat,
        lng: values.lng,
        sequence: values.sequence,
        is_pickup: values.is_pickup,
        is_dropoff: values.is_dropoff,
        estimated_time: values.estimated_time,
      };

      await dispatch(updateRouteStop({ id: selectedStop.id, stopData })).unwrap();
      toast({
        title: "Success",
        description: "Route stop updated successfully",
      });

      form.reset();
      setSelectedStop(null);
      setIsEditMode(false);
    } catch (err) {
      // Update stop error
      let errorMessage = "Failed to update route stop";

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

  const handleDeleteStop = async (stopId: number) => {
    try {
      await dispatch(deleteRouteStop(stopId)).unwrap();
      toast({
        title: "Success",
        description: "Route stop deleted successfully",
      });
    } catch (err) {
      // Delete stop error
      toast({
        title: "Error",
        description: "Failed to delete route stop",
        variant: "destructive",
      });
    }
  };

  const handleEditStop = (stop: RouteStop) => {
    setSelectedStop(stop);
    setIsEditMode(true);
    form.reset({
      name: stop.name,
      lat: stop.lat,
      lng: stop.lng,
      sequence: stop.sequence,
      is_pickup: stop.is_pickup,
      is_dropoff: stop.is_dropoff,
      estimated_time: stop.estimated_time,
    });
  };

  const sortedStops = [...routeStops].sort((a, b) => a.sequence - b.sequence);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Map className="w-5 h-5" />
            Route Stops - {routeName}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Map View</h3>
              <Button
                variant={isAddingStop ? "destructive" : "default"}
                size="sm"
                onClick={() => {
                  setIsAddingStop(!isAddingStop);
                  setIsEditMode(false);
                  setSelectedStop(null);
                  form.reset();
                }}
              >
                {isAddingStop ? "Cancel Adding" : "Add Stop"}
              </Button>
            </div>

            <div className="relative">
              <div
                ref={mapRef}
                className="w-full h-96 rounded-lg border border-gray-200"
              />
              {isAddingStop && (
                <div className="absolute top-2 left-2 bg-white p-2 rounded shadow-md text-sm">
                  Click on the map to add a stop
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="space-y-2">
              <Label>Search Location</Label>
              <Input
                ref={searchInputRef}
                placeholder="Search for a location..."
                className="w-full"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Stops List and Form */}
          <div className="space-y-4">
            {isEditMode ? (
              /* Edit Form */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Edit Stop</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditMode(false);
                      setSelectedStop(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleUpdateStop)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stop Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter stop name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="lat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Latitude</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="any"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lng"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Longitude</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="any"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="sequence"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sequence</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="estimated_time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estimated Time</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="HH:MM:SS"
                                {...field}
                              />
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
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Pickup Stop</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="is_dropoff"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Dropoff Stop</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        Update Stop
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            ) : isAddingStop ? (
              /* Add Form */
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Add New Stop</h3>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAddStop)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stop Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter stop name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="lat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Latitude</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="any"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lng"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Longitude</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="any"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="sequence"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sequence</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="estimated_time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estimated Time</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="HH:MM:SS"
                                {...field}
                              />
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
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Pickup Stop</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="is_dropoff"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Dropoff Stop</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        Add Stop
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            ) : (
              /* Stops List */
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Route Stops ({sortedStops.length})</h3>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                    <span className="ml-2 text-gray-600">Loading stops...</span>
                  </div>
                ) : sortedStops.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No stops added yet</p>
                    <p className="text-sm">Click "Add Stop" to get started</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {sortedStops.map((stop) => (
                      <div
                        key={stop.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {stop.sequence}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium">{stop.name}</h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>{stop.lat.toFixed(6)}, {stop.lng.toFixed(6)}</span>
                              <span>•</span>
                              <span>{stop.estimated_time}</span>
                            </div>
                            <div className="flex space-x-1 mt-1">
                              {stop.is_pickup && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                  Pickup
                                </Badge>
                              )}
                              {stop.is_dropoff && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                  Dropoff
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStop(stop)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => stop.id && handleDeleteStop(stop.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 