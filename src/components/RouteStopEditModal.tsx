import React, { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppDispatch } from "@/redux/hooks";
import { updateRouteStop, type RouteStop } from "@/redux/slices/routesSlice";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Clock, Loader2, Search } from "lucide-react";
import { GOOGLE_MAPS_API_KEY } from "@/utils/api";
import { loadGoogleMaps } from "@/utils/googleMapsLoader";

interface RouteStopEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeId: number;
  routeStop: RouteStop | null;
  onSuccess?: () => void;
}

export function RouteStopEditModal({
  isOpen,
  onClose,
  routeId,
  routeStop,
  onSuccess,
}: RouteStopEditModalProps) {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [placeName, setPlaceName] = useState<string>("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [locationSearchTerm, setLocationSearchTerm] = useState<string>("");
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    lat: "",
    lng: "",
    sequence_number: 0,
    estimated_arrival_time: "",
    is_pickup: false,
    is_dropoff: false,
  });

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    return new Promise((resolve) => {
      if (!window.google || !window.google.maps) {
        resolve("Location not available");
        return;
      }

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        { location: { lat, lng } },
        (results, status) => {
          if (status === "OK" && results?.[0]) {
            resolve(results[0].formatted_address);
          } else {
            resolve("Location not available");
          }
        }
      );
    });
  };

  const initializeAutocomplete = () => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.warn('Google Maps Places API not ready');
      return;
    }

    if (searchInputRef.current) {
      // Clean up existing autocomplete
      if (autocomplete) {
        google.maps.event.clearInstanceListeners(autocomplete);
      }
      const newAutocomplete = new google.maps.places.Autocomplete(
        searchInputRef.current,
        {
          fields: ["geometry", "formatted_address", "name", "place_id"],
          componentRestrictions: { country: "ke" },
        }
      );

      newAutocomplete.addListener("place_changed", () => {
        const place = newAutocomplete.getPlace();
        
        if (place?.geometry) {
          const lat = place.geometry.location?.lat() || 0;
          const lng = place.geometry.location?.lng() || 0;
          const name = place.formatted_address || place.name || "";
          
          // Update form data with new coordinates
          setFormData(prev => ({
            ...prev,
            lat: lat.toString(),
            lng: lng.toString(),
            name: name
          }));
          
          // Update place name display
          setPlaceName(name);
          setLocationSearchTerm(name);
          
          toast({
            title: "Location Selected",
            description: `Updated to: ${name}`,
          });
        }
      });

      setAutocomplete(newAutocomplete);
    }
  };

  const handleLocationSearch = async () => {
    if (!locationSearchTerm.trim()) return;
    
    setIsSearchingLocation(true);
    try {
      if (!window.google || !window.google.maps) {
        await loadGoogleMaps(GOOGLE_MAPS_API_KEY);
      }

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        { address: locationSearchTerm },
        (results, status) => {
          setIsSearchingLocation(false);
          if (status === "OK" && results?.[0]) {
            const place = results[0];
            const lat = place.geometry.location?.lat() || 0;
            const lng = place.geometry.location?.lng() || 0;
            const name = place.formatted_address || locationSearchTerm;
            
            // Update form data with new coordinates
            setFormData(prev => ({
              ...prev,
              lat: lat.toString(),
              lng: lng.toString(),
              name: name
            }));
            
            // Update place name display
            setPlaceName(name);
            
            toast({
              title: "Location Updated",
              description: `Updated to: ${name}`,
            });
          } else {
            toast({
              title: "Location Not Found",
              description: "Could not find the specified location",
              variant: "destructive",
            });
          }
        }
      );
    } catch (error) {
      setIsSearchingLocation(false);
      toast({
        title: "Error",
        description: "Failed to search for location",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (routeStop && isOpen) {
      // Handle both old and new data structures for coordinates
      let lat = "";
      let lng = "";
      let latNum = 0;
      let lngNum = 0;
      
      if (routeStop.lat !== undefined && routeStop.lng !== undefined) {
        // Old structure: direct lat/lng properties
        lat = routeStop.lat.toString();
        lng = routeStop.lng.toString();
        latNum = routeStop.lat;
        lngNum = routeStop.lng;
      } else if (routeStop.location && routeStop.location.coordinates) {
        // New structure: location object with coordinates array
        lng = routeStop.location.coordinates[0]?.toString() || "";
        lat = routeStop.location.coordinates[1]?.toString() || "";
        lngNum = routeStop.location.coordinates[0];
        latNum = routeStop.location.coordinates[1];
      }

      setFormData({
        name: routeStop.name || "",
        lat: lat,
        lng: lng,
        sequence_number: routeStop.sequence_number || 0,
        estimated_arrival_time: routeStop.estimated_arrival_time || "",
        is_pickup: routeStop.is_pickup || false,
        is_dropoff: routeStop.is_dropoff || false,
      });

      // Reverse geocode to get place name
      if (latNum !== 0 && lngNum !== 0) {
        setIsGeocoding(true);
        loadGoogleMaps(GOOGLE_MAPS_API_KEY)
          .then(() => reverseGeocode(latNum, lngNum))
          .then((name) => {
            setPlaceName(name);
            setLocationSearchTerm(name);
          })
          .catch(() => {
            setPlaceName("Location not available");
            setLocationSearchTerm("");
          })
          .finally(() => setIsGeocoding(false));
      }
    }
  }, [routeStop, isOpen]);

  // Initialize autocomplete when modal opens
  useEffect(() => {
    if (isOpen) {
      loadGoogleMaps(GOOGLE_MAPS_API_KEY)
        .then(() => {
          setTimeout(() => {
            initializeAutocomplete();
            // Add custom styling for autocomplete dropdown
            const style = document.createElement("style");
            style.textContent = `
              .pac-container {
                border-radius: 0.5rem;
                margin-top: 0.5rem;
                box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
                border: 1px solid #e5e7eb;
                background-color: white;
                z-index: 9999;
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
          }, 200);
        })
        .catch((error) => {
          console.error("Failed to load Google Maps:", error);
        });
    }
  }, [isOpen]);

  // Re-initialize autocomplete when input ref changes
  useEffect(() => {
    if (isOpen && searchInputRef.current && window.google?.maps?.places) {
      initializeAutocomplete();
    }
  }, [isOpen, searchInputRef.current]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!routeStop?.id) {
      toast({
        title: "Error",
        description: "Invalid route stop data",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const stopData = {
        name: formData.name,
        location: {
          type: "Point" as const,
          coordinates: [parseFloat(formData.lng), parseFloat(formData.lat)] as [number, number]
        },
        sequence_number: formData.sequence_number,
        estimated_arrival_time: formData.estimated_arrival_time,
        is_pickup: formData.is_pickup,
        is_dropoff: formData.is_dropoff,
      };

      await dispatch(updateRouteStop({
        routeId,
        stopId: routeStop.id,
        stopData
      })).unwrap();

      toast({
        title: "Success",
        description: "Route stop updated successfully",
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update route stop",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      // Clean up autocomplete
      if (autocomplete) {
        google.maps.event.clearInstanceListeners(autocomplete);
        setAutocomplete(null);
      }
      // Reset search state
      setLocationSearchTerm("");
      setIsSearchingLocation(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            Edit Route Stop
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Stop Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter stop name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sequence_number">Sequence Number</Label>
              <Input
                id="sequence_number"
                type="number"
                value={formData.sequence_number}
                onChange={(e) => handleInputChange("sequence_number", parseInt(e.target.value) || 0)}
                placeholder="Enter sequence number"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                ref={searchInputRef}
                placeholder="Search for a location..."
                value={locationSearchTerm}
                onChange={(e) => setLocationSearchTerm(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleLocationSearch();
                  }
                }}
              />
              {isSearchingLocation && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Type to search for a location or select from suggestions. Coordinates: {formData.lat}, {formData.lng}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated_arrival_time">Estimated Arrival Time</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="estimated_arrival_time"
                type="time"
                value={formData.estimated_arrival_time}
                onChange={(e) => handleInputChange("estimated_arrival_time", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Stop Type</Label>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_pickup"
                  checked={formData.is_pickup}
                  onCheckedChange={(checked) => handleInputChange("is_pickup", checked as boolean)}
                />
                <Label htmlFor="is_pickup">Pickup Stop</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_dropoff"
                  checked={formData.is_dropoff}
                  onCheckedChange={(checked) => handleInputChange("is_dropoff", checked as boolean)}
                />
                <Label htmlFor="is_dropoff">Dropoff Stop</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Stop
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
