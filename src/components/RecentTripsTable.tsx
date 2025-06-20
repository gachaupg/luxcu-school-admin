import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { useEffect } from "react";
import { fetchTrips } from "@/redux/slices/tripsSlice";

export const RecentTripsTable = () => {
  const dispatch = useAppDispatch();
  const { trips, loading } = useAppSelector((state) => state.trips);

  // Get school ID from localStorage
  const getSchoolId = () => {
    const storedSchoolId = localStorage.getItem("schoolId");
    return storedSchoolId ? parseInt(storedSchoolId) : undefined;
  };

  const schoolId = getSchoolId();

  useEffect(() => {
    if (schoolId) {
      dispatch(fetchTrips({ schoolId }));
    }
  }, [dispatch, schoolId]);

  // Get recent trips (last 5)
  const recentTrips = trips.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return timeString;
    }
  };

  const formatStatus = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="rounded-md border w-full">
        <div className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (recentTrips.length === 0) {
    return (
      <div className="rounded-md border w-full">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Recent Trips</h3>
        </div>
        <div className="p-8 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-medium text-gray-900">
                No trips found
              </h4>
              <p className="text-sm text-gray-500 max-w-sm">
                There are no recent trips to display. Trips will appear here
                once they are scheduled or completed.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border w-full">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Recent Trips</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[20%]">Route</TableHead>
            <TableHead className="w-[20%]">Driver</TableHead>
            <TableHead className="w-[20%]">Vehicle</TableHead>
            <TableHead className="w-[15%]">Status</TableHead>
            <TableHead className="w-[15%]">Start Time</TableHead>
            <TableHead className="w-[10%]">Students</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentTrips.map((trip) => (
            <TableRow key={trip.id}>
              <TableCell className="font-medium">
                {trip.route_name || `Route ${trip.route}`}
              </TableCell>
              <TableCell>
                {trip.driver_name || `Driver ${trip.driver}`}
              </TableCell>
              <TableCell>
                {trip.vehicle_registration || `Vehicle ${trip.vehicle}`}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(trip.status)}>
                  {formatStatus(trip.status)}
                </Badge>
              </TableCell>
              <TableCell>{formatTime(trip.start_time)}</TableCell>
              <TableCell>{trip.students_count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
