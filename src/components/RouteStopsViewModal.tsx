import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { useAppDispatch } from "@/redux/hooks";
import { fetchRouteStops, deleteRouteStop, type RouteStop } from "@/redux/slices/routesSlice";
import { MapPin, Clock, Users, Loader2, Edit, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RouteStopEditModal } from "./RouteStopEditModal";
import { RouteStopModal } from "./RouteStopModal";
import { GOOGLE_MAPS_API_KEY } from "@/utils/api";
import { loadGoogleMaps } from "@/utils/googleMapsLoader";

interface RouteStopsViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeId: number;
  routeName: string;
}

export function RouteStopsViewModal({
  isOpen,
  onClose,
  routeId,
  routeName,
}: RouteStopsViewModalProps) {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStop, setSelectedStop] = useState<RouteStop | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [placeNames, setPlaceNames] = useState<Record<number, string>>({});
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    if (isOpen && routeId) {
      fetchStops();
    }
  }, [isOpen, routeId]);

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

  const fetchStops = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dispatch(fetchRouteStops(routeId)).unwrap();
      setRouteStops(response);
      
      // Load Google Maps and reverse geocode coordinates
      if (response.length > 0) {
        setIsGeocoding(true);
        try {
          await loadGoogleMaps(GOOGLE_MAPS_API_KEY);
          
          const placeNamesMap: Record<number, string> = {};
          for (const stop of response) {
            let lat = 0;
            let lng = 0;
            
            if (stop.lat !== undefined && stop.lng !== undefined) {
              lat = stop.lat;
              lng = stop.lng;
            } else if (stop.location && stop.location.coordinates) {
              lng = stop.location.coordinates[0];
              lat = stop.location.coordinates[1];
            }
            
            if (lat !== 0 && lng !== 0) {
              const placeName = await reverseGeocode(lat, lng);
              placeNamesMap[stop.id!] = placeName;
            }
          }
          setPlaceNames(placeNamesMap);
        } catch (error) {
          console.error("Error loading Google Maps or geocoding:", error);
        } finally {
          setIsGeocoding(false);
        }
      }
    } catch (err) {
      // Error fetching route stops
      setError(
        err instanceof Error ? err.message : "Failed to fetch route stops"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditStop = (stop: RouteStop) => {
    setSelectedStop(stop);
    setIsEditModalOpen(true);
  };

  const handleDeleteStop = (stop: RouteStop) => {
    setSelectedStop(stop);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedStop?.id) return;

    setDeleting(true);
    try {
      await dispatch(deleteRouteStop({
        routeId,
        stopId: selectedStop.id
      })).unwrap();

      toast({
        title: "Success",
        description: "Route stop deleted successfully",
      });

      // Refresh the stops list
      await fetchStops();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete route stop",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedStop(null);
    }
  };

  const handleEditSuccess = () => {
    fetchStops(); // Refresh the stops list
  };

  const handleAddSuccess = () => {
    fetchStops(); // Refresh the stops list
  };

  const sortedStops = routeStops.sort(
    (a, b) => a.sequence_number - b.sequence_number
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                Route Stops
              </DialogTitle>
              <p className="text-sm text-gray-600">
                Stops for route: <span className="font-semibold">{routeName}</span>
              </p>
            </div>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Stop
            </Button>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              <span className="text-gray-600">Loading route stops...</span>
            </div>
          </div>
        ) : error ? (
          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <p className="text-red-700">{error}</p>
            <Button
              onClick={fetchStops}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        ) : routeStops.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Route Stops
            </h3>
            <p className="text-gray-500">
              This route doesn't have any stops configured yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Total Stops: {routeStops.length}
              </span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {sortedStops.length} stops
              </Badge>
            </div>

            <div className="space-y-3">
              {sortedStops.map((stop) => (
                <div
                  key={stop.id}
                  className="p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {stop.sequence_number || 0}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {stop.name || "Unnamed Stop"}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              Arrival: {stop.estimated_arrival_time || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>
                              {isGeocoding ? (
                                <div className="flex items-center gap-1">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Loading location...
                                </div>
                              ) : (
                                placeNames[stop.id!] || "Location not available"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {stop.is_pickup && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-green-50 text-green-700 border-green-200"
                          >
                            <Users className="w-3 h-3 mr-1" />
                            Pickup
                          </Badge>
                        )}
                        {stop.is_dropoff && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                          >
                            <Users className="w-3 h-3 mr-1" />
                            Dropoff
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStop(stop)}
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStop(stop)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>

      {/* Add Modal */}
      <RouteStopModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          handleAddSuccess();
        }}
        routeId={routeId}
        routeName={routeName}
        currentSequenceNumber={sortedStops.length > 0 ? sortedStops[sortedStops.length - 1].sequence_number + 1 : 1}
      />

      {/* Edit Modal */}
      <RouteStopEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStop(null);
        }}
        routeId={routeId}
        routeStop={selectedStop}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Route Stop</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedStop?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
