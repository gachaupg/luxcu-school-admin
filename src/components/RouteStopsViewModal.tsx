import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch } from "@/redux/hooks";
import { fetchRouteStops, type RouteStop } from "@/redux/slices/routesSlice";
import { MapPin, Clock, Users, Loader2 } from "lucide-react";

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
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && routeId) {
      fetchStops();
    }
  }, [isOpen, routeId]);

  const fetchStops = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dispatch(fetchRouteStops(routeId)).unwrap();
      setRouteStops(response);
    } catch (err) {
      // Error fetching route stops
      setError(
        err instanceof Error ? err.message : "Failed to fetch route stops"
      );
    } finally {
      setLoading(false);
    }
  };

  const sortedStops = routeStops.sort(
    (a, b) => a.sequence_number - b.sequence_number
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            Route Stops
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Stops for route: <span className="font-semibold">{routeName}</span>
          </p>
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
                              {stop.lat !== undefined && stop.lng !== undefined
                                ? `${stop.lat.toFixed(4)}, ${stop.lng.toFixed(
                                    4
                                  )}`
                                : "Coordinates not available"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
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
    </Dialog>
  );
}
