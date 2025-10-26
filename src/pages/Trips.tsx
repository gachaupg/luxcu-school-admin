import * as React from "react";
import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchTrips, deleteTrip } from "@/redux/slices/tripsSlice";
import { createNotification } from "@/redux/slices/notificationsSlice";
import { fetchRoutes } from "@/redux/slices/routesSlice";
import { fetchDrivers } from "@/redux/slices/driversSlice";
import { fetchVehicles } from "@/redux/slices/vehiclesSlice";
import { fetchStudents } from "@/redux/slices/studentsSlice";
import { fetchParents } from "@/redux/slices/parentsSlice";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2, Edit, Bell, AlertTriangle, XCircle } from "lucide-react";
import { ExportDropdown } from "@/components/ExportDropdown";

export default function Trips() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { trips, loading, error } = useAppSelector((state) => state.trips);
  const { user } = useAppSelector((state) => state.auth);
  const { schools } = useAppSelector((state) => state.schools);
  const { students } = useAppSelector((state) => state.students);
  const { parents } = useAppSelector((state) => state.parents);

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notificationType, setNotificationType] = useState<'delay' | 'cancellation' | 'emergency'>('delay');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [sendingNotification, setSendingNotification] = useState(false);

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

  useEffect(() => {
    const loadData = async () => {
      try {
        if (schoolId) {
          await dispatch(fetchTrips({ schoolId })).unwrap();
          await dispatch(fetchStudents({ schoolId })).unwrap();
          await dispatch(fetchParents({ schoolId })).unwrap();
        }
        await dispatch(fetchRoutes());
        await dispatch(fetchDrivers());
        await dispatch(fetchVehicles());
      } catch (err) {
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

  const handleSendNotification = (trip: Trip, type: 'delay' | 'cancellation' | 'emergency') => {
    setSelectedTrip(trip);
    setNotificationType(type);
    setNotificationMessage('');
    setIsNotificationModalOpen(true);
  };

  const confirmSendNotification = async () => {
    if (!selectedTrip || !notificationMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a notification message",
        variant: "destructive",
      });
      return;
    }

    setSendingNotification(true);

    try {
      const schoolId = localStorage.getItem("schoolId");
      if (!schoolId) {
        toast({
          title: "Error",
          description: "School ID not found",
          variant: "destructive",
        });
        setSendingNotification(false);
        return;
      }
      
      // Determine alert type and severity based on notification type
      let alertType = "parent_notification";
      let severity: "low" | "medium" | "high" = "low";
      let title = "";

      switch (notificationType) {
        case 'emergency':
          alertType = "SOS";
          severity = "high";
          title = `🚨 Emergency Alert - ${selectedTrip.route_name || `Route ${selectedTrip.route}`}`;
          break;
        case 'cancellation':
          alertType = "traffic_delay";
          severity = "high";
          title = `Trip Cancelled - ${selectedTrip.route_name || `Route ${selectedTrip.route}`}`;
          break;
        case 'delay':
          alertType = "traffic_delay";
          severity = "medium";
          title = `Trip Delayed - ${selectedTrip.route_name || `Route ${selectedTrip.route}`}`;
          break;
      }

      // Create notification using the same API as Notifications.tsx
      const notificationData = {
        alert_type: alertType,
        severity: severity,
        title: title,
        message: notificationMessage,
        description: `Driver: ${selectedTrip.driver_name || `Driver ${selectedTrip.driver}`} | Vehicle: ${selectedTrip.vehicle_registration || `Vehicle ${selectedTrip.vehicle}`}`,
        trip_id: selectedTrip.id,
        recipients: [], // Empty recipients = broadcast to all school users
        requires_immediate_action: notificationType === 'emergency',
        metadata: {
          trip_type: selectedTrip.trip_type,
          route_name: selectedTrip.route_name,
          driver_name: selectedTrip.driver_name,
          vehicle_registration: selectedTrip.vehicle_registration,
          scheduled_start_time: selectedTrip.scheduled_start_time,
          notification_type: notificationType,
        },
      };

      // Get parent IDs for students on this trip
      const tripStudentIds = selectedTrip.students || [];
      
      // Filter students that are on this trip
      const tripStudents = students?.filter((student) => 
        tripStudentIds.includes(student.id)
      ) || [];
      
      // Get unique parent IDs from those students
      const parentIds = [...new Set(
        tripStudents
          .map((student) => student.parent)
          .filter((parentId): parentId is number => parentId !== undefined && parentId !== null)
      )];
      
      // Update recipients with parent IDs
      notificationData.recipients = parentIds;

      const result = await dispatch(createNotification(notificationData)).unwrap();

      toast({
        title: "Success",
        description: parentIds.length > 0 
          ? `${notificationType.charAt(0).toUpperCase() + notificationType.slice(1)} notification sent to ${parentIds.length} parent(s)`
          : "Notification created (no parents found for this route)",
      });
      
      setIsNotificationModalOpen(false);
      setSelectedTrip(null);
      setNotificationMessage('');
    } catch (err) {
      
      
      let errorMessage = "Failed to send notification";
      
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
    } finally {
      setSendingNotification(false);
    }
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
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#f7c624]"></div>
              <span>Loading trips...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>Failed to load trips: {error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Trips</h1>
            <p className="text-muted-foreground">Manage and monitor school bus trips</p>
          </div>
          <Button
            onClick={handleCreateTrip}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Trip
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <stat.icon className="h-8 w-8 text-[#f7c624]" />
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
                  className="px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground"
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
                  className="px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground"
                >
                  <option value="all">All Types</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
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
                      distance: (trip as any).distance?.toString() || "",
                      duration: (trip as any).duration?.toString() || "",
                    })),
                    fileName: "trips_export",
                    title: "Trips Report",
                  }}
                  className="border-border hover:bg-muted/30 px-3 py-2"
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
                          <Car className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No trips found</p>
                          <p className="text-sm text-muted-foreground">
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
                                onClick={() => handleSendNotification(trip, 'delay')}
                                className="text-orange-600"
                              >
                                <Bell className="h-4 w-4 mr-2" />
                                Send Delay Notice
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleSendNotification(trip, 'cancellation')}
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Send Cancellation
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleSendNotification(trip, 'emergency')}
                                className="text-red-700"
                              >
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Emergency Alert
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
              <p className="text-sm text-muted-foreground">
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

      {/* Notification Modal */}
      <Dialog open={isNotificationModalOpen} onOpenChange={setIsNotificationModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {notificationType === 'emergency' ? (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              ) : notificationType === 'cancellation' ? (
                <XCircle className="h-5 w-5 text-red-500" />
              ) : (
                <Bell className="h-5 w-5 text-orange-500" />
              )}
              Send {notificationType === 'delay' ? 'Delay Notice' : 
                    notificationType === 'cancellation' ? 'Cancellation Notice' : 
                    'Emergency Alert'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Trip Information Card */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Trip Information</Label>
              <div className="p-4 bg-muted/50 rounded-lg border space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <span className="text-xs text-muted-foreground">Route</span>
                    <p className="text-sm font-medium text-foreground">
                      {selectedTrip?.route_name || `Route ${selectedTrip?.route}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <span className="text-xs text-muted-foreground">Driver</span>
                    <p className="text-sm font-medium text-foreground">
                      {selectedTrip?.driver_name || `Driver ${selectedTrip?.driver}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Car className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <span className="text-xs text-muted-foreground">Vehicle</span>
                    <p className="text-sm font-medium text-foreground">
                      {selectedTrip?.vehicle_registration || `Vehicle ${selectedTrip?.vehicle}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <span className="text-xs text-muted-foreground">Trip Type</span>
                    <Badge className={getTripTypeColor(selectedTrip?.trip_type || '')}>
                      {selectedTrip?.trip_type}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Type Badge */}
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Notification Type:</Label>
              <Badge 
                className={
                  notificationType === 'emergency' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' 
                    : notificationType === 'cancellation'
                    ? 'bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-300'
                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                }
              >
                {notificationType === 'emergency' && '🚨 '}
                {notificationType.toUpperCase()}
              </Badge>
            </div>

            {/* Message Input */}
            <div>
              <Label htmlFor="notification-message" className="text-sm font-medium">
                Notification Message *
              </Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                This message will be sent to all parents with students on this trip
              </p>
              <Input
                id="notification-message"
                placeholder={
                  notificationType === 'delay' 
                    ? 'e.g., Traffic delay expected, arrival will be 15 minutes late' 
                    : notificationType === 'cancellation'
                    ? 'e.g., Trip cancelled due to weather conditions'
                    : 'e.g., Emergency situation, all students are safe'
                }
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                className="mt-1"
                disabled={sendingNotification}
              />
              {notificationMessage.trim().length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {notificationMessage.length} characters
                </p>
              )}
            </div>

            {/* Warning for emergency */}
            {notificationType === 'emergency' && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-400">
                      Emergency Alert
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                      This will send a high-priority notification to all parents. Use only for urgent situations.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsNotificationModalOpen(false);
                setNotificationMessage('');
              }}
              disabled={sendingNotification}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmSendNotification}
              disabled={sendingNotification || !notificationMessage.trim()}
              className={
                notificationType === 'emergency' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : notificationType === 'cancellation'
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-orange-500 hover:bg-orange-600'
              }
            >
              {sendingNotification ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
              Send {notificationType === 'delay' ? 'Delay Notice' : 
                    notificationType === 'cancellation' ? 'Cancellation' : 
                    'Emergency Alert'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
