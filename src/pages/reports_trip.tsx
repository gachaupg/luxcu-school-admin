import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchTrips, deleteTrip } from "@/redux/slices/tripsSlice";
import { fetchRoutes } from "@/redux/slices/routesSlice";
import { fetchDrivers } from "@/redux/slices/driversSlice";
import { fetchVehicles } from "@/redux/slices/vehiclesSlice";
import { TripModal } from "@/components/TripModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MoreVertical,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  User,
  Car,
} from "lucide-react";
import { Trip } from "@/redux/slices/tripsSlice";
import { useToast } from "@/components/ui/use-toast";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2, Edit } from "lucide-react";
import { ExportDropdown } from "@/components/ExportDropdown";

export default function Trips() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { trips, loading, error } = useAppSelector((state) => state.trips);
  const { user } = useAppSelector((state) => state.auth);
  const { schools } = useAppSelector((state) => state.schools);

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tripTypeFilter, setTripTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Get school ID for the current admin
  const schoolId = schools.find((school) => school.admin === user?.id)?.id;

  // Use all trips since backend should filter by school
  const filteredTrips = trips;

  // Debug logging
  useEffect(() => {
    console.log("Trips data:", trips);
    console.log("Filtered trips:", filteredTrips);
    console.log("School ID:", schoolId);
  }, [trips, filteredTrips, schoolId]);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (schoolId) {
          await dispatch(fetchTrips({ schoolId })).unwrap();
        }
        await dispatch(fetchRoutes());
        await dispatch(fetchDrivers());
        await dispatch(fetchVehicles());
      } catch (err) {
        console.error("Failed to load data:", err);
      }
    };
    loadData();
  }, [dispatch, schoolId]);

  // Filter and search logic
  const filteredAndSearchedTrips = filteredTrips.filter((trip) => {
    const matchesSearch =
      trip.route_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.vehicle_registration
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      trip.trip_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || trip.status === statusFilter;

    const matchesTripType =
      tripTypeFilter === "all" || trip.trip_type === tripTypeFilter;

    return matchesSearch && matchesStatus && matchesTripType;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSearchedTrips.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTrips = filteredAndSearchedTrips.slice(startIndex, endIndex);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, tripTypeFilter]);

  const handleCreateTrip = () => {
    setSelectedTrip(null);
    setIsCreateModalOpen(true);
  };

  const handleEditTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsEditModalOpen(true);
  };

  const handleDeleteTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTrip = async () => {
    try {
      if (!selectedTrip) {
        toast({
          title: "Error",
          description: "No trip selected for deletion",
          variant: "destructive",
        });
        return;
      }

      await dispatch(deleteTrip(selectedTrip.id!)).unwrap();
      toast({
        title: "Success",
        description: "Trip deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedTrip(null);
    } catch (err) {
      console.error("Delete trip error:", err);
      let errorMessage = "Failed to delete trip";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-yellow-100 text-yellow-800";
      case "ongoing":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "delayed":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTripTypeColor = (tripType: string) => {
    switch (tripType.toLowerCase()) {
      case "morning":
        return "bg-orange-100 text-orange-800";
      case "afternoon":
        return "bg-purple-100 text-purple-800";
      case "evening":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateTimeString;
    }
  };

  // Calculate stats
  const stats = [
    {
      label: "Total Trips",
      value: filteredTrips.length,
      icon: Calendar,
    },
    {
      label: "Scheduled",
      value: filteredTrips.filter((t) => t.status === "scheduled").length,
      icon: Clock,
    },
    {
      label: "Ongoing",
      value: filteredTrips.filter((t) => t.status === "ongoing").length,
      icon: MapPin,
    },
    {
      label: "Completed",
      value: filteredTrips.filter((t) => t.status === "completed").length,
      icon: User,
    },
  ];

  if (loading) {
    return (
      <div className="h-full w-full bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
              <span>Loading trips...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>Failed to load trips: {error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto space-y-2">
      

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <stat.icon className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search trips..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="preparing">Preparing</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="delayed">Delayed</option>
                </select>
                <select
                  value={tripTypeFilter}
                  onChange={(e) => setTripTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                </select>
                <ExportDropdown
                  data={{
                    headers: [
                      "Route",
                      "Driver",
                      "Vehicle",
                      "Trip Type",
                      "Start Time",
                      "End Time",
                      "Status",
                      "Students Count",
                      "Distance",
                      "Duration",
                    ],
                    data: filteredAndSearchedTrips.map((trip) => ({
                      route: trip.route_name || `Route ${trip.route}`,
                      driver: trip.driver_name || `Driver ${trip.driver}`,
                      vehicle:
                        trip.vehicle_registration || `Vehicle ${trip.vehicle}`,
                      trip_type: trip.trip_type,
                      start_time: formatDateTime(trip.scheduled_start_time),
                      end_time: trip.scheduled_end_time
                        ? formatDateTime(trip.scheduled_end_time)
                        : "",
                      status: trip.status.replace("_", " "),
                      students_count: trip.students?.length?.toString() || "0",
                      distance: trip.distance?.toString() || "",
                      duration: trip.duration?.toString() || "",
                    })),
                    fileName: "trips_export",
                    title: "Trips Report",
                  }}
                  className="border-gray-200 hover:bg-gray-50 px-3 py-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trips Table */}
        <Card>
        
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Trip Type</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTrips.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <Car className="h-8 w-8 text-gray-400" />
                          <p className="text-gray-500">No trips found</p>
                          <p className="text-sm text-gray-400">
                            Create your first trip to get started
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedTrips.map((trip) => (
                      <TableRow key={trip.id}>
                        <TableCell className="font-medium">
                          {trip.route_name || `Route ${trip.route}`}
                        </TableCell>
                        <TableCell>
                          {trip.driver_name || `Driver ${trip.driver}`}
                        </TableCell>
                        <TableCell>
                          {trip.vehicle_registration ||
                            `Vehicle ${trip.vehicle}`}
                        </TableCell>
                        <TableCell>
                          <Badge className={getTripTypeColor(trip.trip_type)}>
                            {trip.trip_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDateTime(trip.scheduled_start_time)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(trip.status)}>
                            {trip.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditTrip(trip)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteTrip(trip)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls - always show at the bottom */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {startIndex + 1}-
                {Math.min(endIndex, filteredAndSearchedTrips.length)} of{" "}
                {filteredAndSearchedTrips.length} trips
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Trip Modal */}
      <TripModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
      />

      {/* Edit Trip Modal */}
      <TripModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        trip={selectedTrip}
        mode="edit"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              trip
              {selectedTrip &&
                ` for route "${
                  selectedTrip.route_name || `Route ${selectedTrip.route}`
                }"`}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTrip}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
