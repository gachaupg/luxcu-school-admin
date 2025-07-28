import { RouteStop } from "@/redux/slices/routesSlice";

/**
 * Generate a GeoJSON LineString path from route stops
 * @param stops Array of route stops sorted by sequence
 * @returns GeoJSON LineString string
 */
export function generatePathFromStops(stops: RouteStop[]): string {
  if (stops.length === 0) {
    return JSON.stringify({
      type: "LineString",
      coordinates: []
    });
  }

  // Sort stops by sequence
  const sortedStops = [...stops].sort((a, b) => a.sequence - b.sequence);
  
  // Extract coordinates
  const coordinates = sortedStops.map(stop => [stop.lng, stop.lat]);

  return JSON.stringify({
    type: "LineString",
    coordinates: coordinates
  });
}

/**
 * Calculate total distance from route stops
 * @param stops Array of route stops
 * @returns Total distance in kilometers
 */
export function calculateTotalDistance(stops: RouteStop[]): number {
  if (stops.length < 2) return 0;

  const sortedStops = [...stops].sort((a, b) => a.sequence - b.sequence);
  let totalDistance = 0;

  for (let i = 0; i < sortedStops.length - 1; i++) {
    const current = sortedStops[i];
    const next = sortedStops[i + 1];
    
    const distance = calculateDistance(
      current.lat, current.lng,
      next.lat, next.lng
    );
    
    totalDistance += distance;
  }

  return Math.round(totalDistance * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate distance between two points using Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in kilometers
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Calculate estimated duration from route stops
 * @param stops Array of route stops
 * @returns Estimated duration in HH:MM:SS format
 */
export function calculateEstimatedDuration(stops: RouteStop[]): string {
  if (stops.length === 0) return "00:00:00";

  // Calculate total time from estimated_time fields
  let totalSeconds = 0;
  
  stops.forEach(stop => {
    const timeParts = stop.estimated_time.split(':');
    if (timeParts.length === 3) {
      const hours = parseInt(timeParts[0]) || 0;
      const minutes = parseInt(timeParts[1]) || 0;
      const seconds = parseInt(timeParts[2]) || 0;
      totalSeconds += hours * 3600 + minutes * 60 + seconds;
    }
  });

  // Add travel time between stops (assuming 30 km/h average speed)
  if (stops.length > 1) {
    const totalDistance = calculateTotalDistance(stops);
    const travelTimeSeconds = (totalDistance / 30) * 3600; // 30 km/h
    totalSeconds += travelTimeSeconds;
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
} 