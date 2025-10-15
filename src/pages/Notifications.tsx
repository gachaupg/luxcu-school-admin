import { useState, useEffect } from "react";
import { SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/AppSidebar";
import { HeaderBar } from "../components/HeaderBar";
import {
  Bell,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye as ViewIcon,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchNotifications,
  createNotification,
  type Notification,
  type NotificationPayload,
} from "../redux/slices/notificationsSlice";
import { fetchParents } from "../redux/slices/parentsSlice";
import { fetchStudents } from "../redux/slices/studentsSlice";
import { fetchTrips } from "../redux/slices/tripsSlice";
import { fetchDrivers } from "../redux/slices/driversSlice";
import { fetchStaff } from "../redux/slices/staffSlice";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportDropdown } from "@/components/ExportDropdown";

const formSchema = z.object({
  alert_type: z.string().min(1, "Alert type is required"),
  severity: z.enum(["low", "medium", "high"]),
  title: z.string().min(3, "Title must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  description: z.string().optional(),
  scenario: z.enum(["student_specific", "school_wide", "trip_specific"]),
  student_id: z.number().optional(),
  trip_id: z.number().optional(),
  recipients: z.array(z.number()).optional(),
  requires_immediate_action: z.boolean().optional(),
  address: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const ALERT_TYPES = [
  { value: "SOS", label: "SOS Emergency" },
  { value: "medical_emergency", label: "Medical Emergency" },
  { value: "bus_breakdown", label: "Bus Breakdown" },
  { value: "route_deviation", label: "Route Deviation" },
  { value: "student_missing", label: "Student Missing" },
  { value: "late_pickup", label: "Late Pickup" },
  { value: "traffic_delay", label: "Traffic Delay" },
  { value: "weather_alert", label: "Weather Alert" },
  { value: "security_threat", label: "Security Threat" },
  { value: "accident", label: "Accident" },
  { value: "driver_issue", label: "Driver Issue" },
  { value: "maintenance_required", label: "Maintenance Required" },
  { value: "geofence_violation", label: "Geofence Violation" },
  { value: "speed_violation", label: "Speed Violation" },
  { value: "fuel_low", label: "Low Fuel" },
  { value: "battery_low", label: "Battery Low" },
  { value: "device_offline", label: "Device Offline" },
  { value: "system_error", label: "System Error" },
  { value: "parent_notification", label: "Parent Notification" },
  { value: "attendance_alert", label: "Attendance Alert" },
];

const SEVERITY_LEVELS = [
  {
    value: "low",
    label: "Low",
    icon: Info,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  },
  {
    value: "medium",
    label: "Medium",
    icon: AlertTriangle,
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  },
  {
    value: "high",
    label: "High",
    icon: AlertTriangle,
    color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  },
];

const SCENARIOS = [
  { value: "student_specific", label: "Student Specific" },
  { value: "school_wide", label: "School Wide Alert" },
  { value: "trip_specific", label: "Trip Specific" },
];

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const { notifications, loading, error } = useAppSelector(
    (state) => state.notifications
  );
  const { parents } = useAppSelector((state) => state.parents);
  const { students } = useAppSelector((state) => state.students);
  const { trips } = useAppSelector((state) => state.trips);
  const { drivers } = useAppSelector((state) => state.drivers);
  const { staff } = useAppSelector((state) => state.staff);
  const { toast } = useToast();
  const data = JSON.parse(localStorage.getItem("profile") || "{}");
  const user = data;
  const schoolId = localStorage.getItem("schoolId");

  // Get the parent ID from the user data (not the user ID)
  const parentId = user.user || user.id; // Use user field (40) if available, fallback to id (20)

  // Table state management
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [recipientSearchTerm, setRecipientSearchTerm] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      alert_type: "parent_notification",
      severity: "low",
      title: "",
      message: "",
      description: "",
      scenario: "school_wide",
      student_id: undefined,
      trip_id: undefined,
      recipients: [],
      requires_immediate_action: false,
      address: "",
      metadata: {},
    },
  });

  // Clear selected fields when scenario or trip changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "scenario") {
        form.setValue("recipients", []);
        form.setValue("student_id", undefined);
        form.setValue("trip_id", undefined);
        setRecipientSearchTerm(""); // Clear search term when scenario changes
      }
      if (name === "trip_id") {
        // Clear recipients when trip changes since available recipients will change
        form.setValue("recipients", []);
        setRecipientSearchTerm(""); // Clear search term when trip changes
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Filter parents, students, and trips for the current school
  const filteredParents =
    parents?.filter((parent) => parent.school === parseInt(schoolId || "0")) ||
    [];

  const filteredStudents =
    students?.filter(
      (student) => student.school === parseInt(schoolId || "0")
    ) || [];

  const filteredTrips = (() => {
    const filtered = trips?.filter((trip: any) => {
      // Check both direct school property and nested route_details.school.id
      const tripSchoolId = trip.school || trip.route_details?.school?.id;
      return tripSchoolId === parseInt(schoolId || "0");
    }) || [];
    
    // Debug: Log trips data to help troubleshoot
    if (trips && trips.length > 0) {
      console.log("🔍 Debug Trips - Total trips:", trips.length);
      console.log("🔍 Debug Trips - School ID:", schoolId);
      console.log("🔍 Debug Trips - Sample trip school ID:", (trips[0] as any).school || (trips[0] as any).route_details?.school?.id);
      console.log("🔍 Debug Trips - Filtered trips:", filtered.length);
    }
    return filtered;
  })();

  // Filter and search logic - handle trips data structure

  const filteredAndSearchedNotifications =
    notifications?.filter((notification: any) => {
      // Filter based on alert properties
      const matchesSearch =
        notification.message
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        notification.title
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        notification.alert_type
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        notification.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Filter by severity
      const matchesType =
        typeFilter === "all" ||
        notification.severity?.toLowerCase() === typeFilter.toLowerCase();

      return matchesSearch && matchesType;
    }) || [];

  // Pagination logic
  const totalPages = Math.ceil(
    filteredAndSearchedNotifications.length / itemsPerPage
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNotifications =
    filteredAndSearchedNotifications?.slice(startIndex, endIndex) || [];


  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter]);

  useEffect(() => {
    if (schoolId) {
      dispatch(fetchNotifications({ schoolId: parseInt(schoolId) }));
      dispatch(fetchParents({ schoolId: parseInt(schoolId) }));
      dispatch(fetchStudents({ schoolId: parseInt(schoolId) }));
      dispatch(fetchTrips({ schoolId: parseInt(schoolId) }));
      dispatch(fetchDrivers());
      dispatch(fetchStaff({ schoolId: parseInt(schoolId) }));
    }
  }, [dispatch, schoolId]);

  // Early return if data is not ready
  if (!notifications) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="flex-1 px-2 sm:px-1 py-0 w-full max-w-[98vw] mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f7c624]"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const handleCreateNotification = async (values: FormValues) => {
    try {
      const schoolId = localStorage.getItem("schoolId");
      if (!schoolId) {
        toast({
          title: "Error",
          description: "School ID not found",
          variant: "destructive",
        });
        return;
      }

      // Structure the alert payload based on scenario
      const alertData: any = {
        alert_type: values.alert_type,
        severity: values.severity,
        title: values.title,
        message: values.message,
        description: values.description || "",
        requires_immediate_action: values.requires_immediate_action || false,
        metadata: values.metadata || {},
      };

      // Handle different scenarios
      if (values.scenario === "student_specific") {
        // Scenario 1a: Tied to a student, specific recipients
        if (!values.student_id) {
          toast({
            title: "Error",
            description: "Student is required for student-specific alerts",
            variant: "destructive",
          });
          return;
        }
        alertData.student_id = values.student_id;
        alertData.recipients = values.recipients || [];
        
        if (alertData.recipients.length === 0) {
          toast({
            title: "Error",
            description: "At least one recipient is required for student-specific alerts",
            variant: "destructive",
          });
          return;
        }
      } else if (values.scenario === "school_wide") {
        // Scenario 1b: School-wide alert, empty recipients (broadcasts to all)
        alertData.recipients = [];
        if (values.address) {
          alertData.address = values.address;
        }
      } else if (values.scenario === "trip_specific") {
        // Scenario 1c: Tied to a trip, specific staff/admins
        if (!values.trip_id) {
          toast({
            title: "Error",
            description: "Trip is required for trip-specific alerts",
            variant: "destructive",
          });
          return;
        }
        alertData.trip_id = values.trip_id;
        alertData.recipients = values.recipients || [];
        if (values.address) {
          alertData.address = values.address;
        }
      }

      const result = await dispatch(
        createNotification(alertData)
      ).unwrap();

      toast({
        title: "Success",
        description: "Alert created successfully",
      });

      // Reset form
      form.reset();
      setRecipientSearchTerm("");
      setIsCreateModalOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create alert",
        variant: "destructive",
      });
    }
  };

  const handleView = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsViewModalOpen(true);
  };

  const getSeverityInfo = (severity: string) => {
    return (
      SEVERITY_LEVELS.find((s) => s.value === severity) || SEVERITY_LEVELS[0]
    ); // Default to low
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getParentName = (parentId: number) => {
    // Try to find parent by user field first, then by id field
    const parent = filteredParents.find(
      (p) => p.user === parentId || p.id === parentId
    );
    return parent ? parent.user_full_name : "Unknown Parent";
  };

  const getStudentName = (studentId: number) => {
    const student = filteredStudents.find((s) => s.id === studentId);
    return student
      ? `${student.first_name} ${student.last_name}`
      : "Unknown Student";
  };

  const getTripName = (tripId: number) => {
    const trip = filteredTrips.find((t) => t.id === tripId);
    return trip ? `Trip ${trip.id}` : "Unknown Trip";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 px-2 sm:px-1 py-0 w-full max-w-[98vw] mx-auto">
          {error && error.includes("not available") && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400">
                    Demo Mode - Notifications API Coming Soon
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    The notifications API is not yet available on the server.
                    You can explore the interface with demo data, and create
                    notifications that will be saved when the backend is
                    implemented.
                  </p>
                </div>
              </div>
            </div>
          )}
          <Card className="bg-card shadow-lg border-0 rounded-xl">
            <CardHeader className="border-b border-border flex flex-row w-full items-center justify-between py-4">
              <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                <Bell className="w-6 h-6 text-[#f7c624]" />
                Notifications
              </CardTitle>
              <div className="flex gap-3">
                <Dialog
                  open={isCreateModalOpen}
                  onOpenChange={(open) => {
                    setIsCreateModalOpen(open);
                    if (!open) {
                      form.reset();
                      setRecipientSearchTerm(""); // Clear search term when modal closes
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      className="bg-[#f7c624] hover:bg-[#f7c624]/90 text-white font-semibold px-6 py-2 rounded-lg shadow disabled:bg-gray-400 disabled:cursor-not-allowed"
                      disabled={error && error.includes("not available")}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Notification
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Notification</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(handleCreateNotification)}
                        className="space-y-4"
                      >
                        {/* Scenario Selection */}
                        <FormField
                          control={form.control}
                          name="scenario"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Alert Scenario</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select scenario" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {SCENARIOS.map((scenario) => (
                                    <SelectItem
                                      key={scenario.value}
                                      value={scenario.value}
                                    >
                                      {scenario.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Alert Type */}
                        <FormField
                          control={form.control}
                          name="alert_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Alert Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select alert type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {ALERT_TYPES.map((type) => (
                                    <SelectItem
                                      key={type.value}
                                      value={type.value}
                                    >
                                        {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Severity Level */}
                          <FormField
                            control={form.control}
                          name="severity"
                            render={({ field }) => (
                              <FormItem>
                              <FormLabel>Severity</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                    <SelectValue placeholder="Select severity" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                  {SEVERITY_LEVELS.map((level) => (
                                    <SelectItem
                                      key={level.value}
                                      value={level.value}
                                    >
                                      <div className="flex items-center gap-2">
                                        <level.icon className="h-4 w-4" />
                                        {level.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                        {/* Title */}
                            <FormField
                              control={form.control}
                          name="title"
                              render={({ field }) => (
                                <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter alert title"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Message */}
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter alert message"
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Description */}
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description (Optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter additional details"
                                  rows={2}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Student Selection for Scenario 1a */}
                        {form.watch("scenario") === "student_specific" && (
                          <FormField
                            control={form.control}
                            name="student_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Select Student *</FormLabel>
                                    <Select
                                  onValueChange={(value) => field.onChange(parseInt(value))}
                                  value={field.value?.toString()}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                      <SelectValue placeholder="Select student" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                    {filteredStudents.map((student) => (
                                              <SelectItem
                                        key={student.id}
                                        value={student.id.toString()}
                                              >
                                        {student.first_name} {student.last_name}
                                              </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {/* Trip Selection for Scenario 1c */}
                        {form.watch("scenario") === "trip_specific" && (
                          <FormField
                            control={form.control}
                            name="trip_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Select Trip *</FormLabel>
                                {filteredTrips.length === 0 ? (
                                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                    <p className="text-sm text-yellow-800 dark:text-yellow-400">
                                      No trips available. Please create a trip first or check that trips exist for this school.
                                    </p>
                                  </div>
                                ) : (
                                  <Select
                                    onValueChange={(value) => field.onChange(parseInt(value))}
                                    value={field.value?.toString()}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select trip" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {filteredTrips.map((trip) => (
                                                <SelectItem
                                          key={trip.id}
                                          value={trip.id.toString()}
                                        >
                                          Trip #{trip.id} - {trip.route_name || "N/A"} ({trip.trip_type})
                                                </SelectItem>
                                      ))}
                                      </SelectContent>
                                    </Select>
                                )}
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {/* Recipients Selection (for scenarios 1a and 1c) */}
                        {(form.watch("scenario") === "student_specific" || 
                          form.watch("scenario") === "trip_specific") && (
                            <FormField
                              control={form.control}
                              name="recipients"
                              render={({ field }) => {
                                // Get the selected trip if in trip_specific scenario
                                const selectedTripId = form.watch("trip_id");
                                const selectedTrip = selectedTripId 
                                  ? filteredTrips.find((t: any) => t.id === selectedTripId)
                                  : null;

                                // Compile all available recipients with their names
                                let allRecipients: Array<{id: number, name: string, type: string}> = [];

                                if (form.watch("scenario") === "trip_specific" && selectedTrip) {
                                  // Filter by trip: only show students, their parents, and the trip's driver
                                  const tripStudentIds = (selectedTrip as any).students || [];
                                  
                                  // Get students assigned to this trip
                                  const tripStudents = filteredStudents.filter((s) => 
                                    tripStudentIds.includes(s.id)
                                  );
                                  
                                  // Get parents of students in this trip
                                  const tripParentIds = new Set(tripStudents.map((s) => s.parent).filter(Boolean));
                                  const tripParents = filteredParents.filter((p) => tripParentIds.has(p.id));
                                  
                                  // Get the driver assigned to this trip
                                  const tripDriver = drivers?.find((d) => d.id === (selectedTrip as any).driver);
                                  
                                  allRecipients = [
                                    ...tripParents.map((parent) => ({
                                      id: parent.id,
                                      name: parent.user_full_name || `${parent.user_data?.first_name} ${parent.user_data?.last_name}`,
                                      type: "Parent",
                                    })),
                                    ...(tripDriver ? [{
                                      id: tripDriver.id,
                                      name: `${tripDriver.user_details.first_name} ${tripDriver.user_details.last_name}`,
                                      type: "Driver",
                                    }] : []),
                                    ...(staff?.filter((s: any) => s.school === parseInt(schoolId || "0"))?.map((staffMember: any) => ({
                                      id: staffMember.user?.id,
                                      name: `${staffMember.user?.first_name} ${staffMember.user?.last_name}`,
                                      type: "Staff",
                                    })).filter((s) => s.id) || []),
                                  ];
                                } else {
                                  // For student_specific or when no trip selected, show all
                                  allRecipients = [
                                    ...filteredParents.map((parent) => ({
                                      id: parent.id,
                                      name: parent.user_full_name || `${parent.user_data?.first_name} ${parent.user_data?.last_name}`,
                                      type: "Parent",
                                    })),
                                    ...(drivers?.filter((d) => d.school === parseInt(schoolId || "0"))?.map((driver) => ({
                                      id: driver.id,
                                      name: `${driver.user_details.first_name} ${driver.user_details.last_name}`,
                                      type: "Driver",
                                    })) || []),
                                    ...(staff?.filter((s: any) => s.school === parseInt(schoolId || "0"))?.map((staffMember: any) => ({
                                      id: staffMember.user?.id,
                                      name: `${staffMember.user?.first_name} ${staffMember.user?.last_name}`,
                                      type: "Staff",
                                    })).filter((s) => s.id) || []),
                                  ];
                                }

                                // Filter recipients based on search term
                                const filteredRecipients = allRecipients.filter((recipient) =>
                                  recipient.name.toLowerCase().includes(recipientSearchTerm.toLowerCase()) ||
                                  recipient.type.toLowerCase().includes(recipientSearchTerm.toLowerCase())
                                );

                                const handleSelectAll = () => {
                                  const allIds = filteredRecipients.map((r) => r.id);
                                  field.onChange(allIds);
                                };

                                const handleDeselectAll = () => {
                                  field.onChange([]);
                                };

                                            return (
                                  <FormItem>
                                    <FormLabel>
                                      Select Recipients {form.watch("scenario") === "student_specific" && "*"}
                                    </FormLabel>
                                    <div className="text-sm text-gray-500 mb-2">
                                      {form.watch("scenario") === "trip_specific" && selectedTrip ? (
                                        <>
                                          Showing recipients for Trip #{selectedTripId} - {(selectedTrip as any).route_name}
                                          <div className="text-xs mt-1">
                                            (Parents of trip students, trip driver, and staff)
                                          </div>
                                        </>
                                      ) : (
                                        "Select parents, drivers, or staff members to notify"
                                      )}
                                    </div>
                                    <div className="space-y-2">
                                      {/* Show message if trip not selected yet */}
                                      {form.watch("scenario") === "trip_specific" && !selectedTrip && (
                                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                          <p className="text-sm text-yellow-800 dark:text-yellow-400">
                                            Please select a trip first to see available recipients
                                          </p>
                                        </div>
                                      )}

                                      {/* Search Input */}
                                      <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                          placeholder="Search recipients..."
                                          value={recipientSearchTerm}
                                          onChange={(e) => setRecipientSearchTerm(e.target.value)}
                                          className="pl-10"
                                          disabled={form.watch("scenario") === "trip_specific" && !selectedTrip}
                                        />
                                      </div>

                                      {/* Select/Deselect All Buttons */}
                                      <div className="flex gap-2">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={handleSelectAll}
                                          className="flex-1"
                                          disabled={form.watch("scenario") === "trip_specific" && !selectedTrip}
                                        >
                                          Select All ({filteredRecipients.length})
                                        </Button>
                                        <Button
                                                  type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={handleDeselectAll}
                                          className="flex-1"
                                          disabled={form.watch("scenario") === "trip_specific" && !selectedTrip}
                                        >
                                          Clear Selection
                                        </Button>
                                      </div>

                                      {/* Recipients List with Checkboxes */}
                                      <div className="border rounded-lg max-h-64 overflow-y-auto">
                                        {filteredRecipients.length === 0 ? (
                                          <div className="p-4 text-center text-sm text-gray-500">
                                            No recipients found
                                          </div>
                                        ) : (
                                          <div className="divide-y">
                                            {filteredRecipients.map((recipient) => {
                                              const isSelected = field.value?.includes(recipient.id) || false;
                                              return (
                                                <label
                                                  key={recipient.id}
                                                  className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                                                >
                                                  <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => {
                                                      const selectedIds = field.value || [];
                                                      const newSelectedIds = isSelected
                                                        ? selectedIds.filter((id) => id !== recipient.id)
                                                        : [...selectedIds, recipient.id];
                                                      field.onChange(newSelectedIds);
                                                    }}
                                                    className="h-4 w-4 rounded border-gray-300"
                                                  />
                                                  <div className="flex-1">
                                                    <div className="text-sm font-medium text-foreground">
                                                      {recipient.name}
                                                    </div>
                                                    <Badge variant="secondary" className="text-xs mt-1">
                                                      {recipient.type}
                                              </Badge>
                                                  </div>
                                                </label>
                                            );
                                          })}
                                        </div>
                                        )}
                                      </div>

                                      {/* Display selected count */}
                                      {field.value && field.value.length > 0 && (
                                        <div className="text-sm text-gray-600 mt-2">
                                          <span className="font-medium">{field.value.length}</span> recipient(s) selected
                                      </div>
                                    )}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                                );
                              }}
                            />
                          )}

                        {/* Address (optional, for scenarios 1b and 1c) */}
                        {(form.watch("scenario") === "school_wide" || 
                          form.watch("scenario") === "trip_specific") && (
                        <FormField
                          control={form.control}
                            name="address"
                          render={({ field }) => (
                            <FormItem>
                                <FormLabel>Address (Optional)</FormLabel>
                              <FormControl>
                                  <Input
                                    placeholder="Enter location address"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        )}

                        {/* Requires Immediate Action */}
                        <FormField
                          control={form.control}
                          name="requires_immediate_action"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Requires Immediate Action
                                </FormLabel>
                                <div className="text-sm text-muted-foreground">
                                  Mark this alert as requiring urgent attention
                                </div>
                              </div>
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="h-4 w-4"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              form.reset();
                              setRecipientSearchTerm("");
                              setIsCreateModalOpen(false);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="bg-[#f7c624] hover:bg-[#f7c624]/90"
                          >
                            Create Alert
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <div className="p-4 border-b border-border">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search notifications by description or message..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      {SEVERITY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ExportDropdown
                    data={{
                      headers: [
                        "Description",
                        "Type",
                        "Message",
                        "Parent",
                        "Student",
                        "Trip",
                        "Created At",
                        "Expires At",
                      ],

                      data: filteredAndSearchedNotifications.map(
                        (notification: any) => ({
                          description:
                            notification.description ||
                            notification.route_name ||
                            "",
                          type: "Trip", // Since we're using trips data
                          message: `Route: ${
                            notification.route_name || ""
                          } - Driver: ${
                            notification.driver_name || ""
                          } - Vehicle: ${notification.vehicle_number || ""}`,
                          parent: "N/A", // Not applicable for trips
                          student: "N/A", // Not applicable for trips
                          trip: notification.route_name || "Unknown Route",
                          created_at: notification.scheduled_start_time
                            ? formatDate(notification.scheduled_start_time)
                            : "",
                          expires_at: notification.scheduled_end_time
                            ? formatDate(notification.scheduled_end_time)
                            : "No expiration",
                        })
                      ),
                      fileName: "notifications_export",
                      title: "Notifications Directory",
                    }}
                    className="border-border hover:bg-muted/30 px-3 py-2"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground uppercase tracking-wider">
                      Alert
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#f7c624]"></div>
                          <span className="text-muted-foreground font-medium">
                            Loading notifications...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center">
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-blue-600 dark:text-blue-400 font-medium">
                              Demo Mode Active
                            </p>
                            <p className="text-blue-500 dark:text-blue-300 text-sm">
                              Showing demo notifications. The API will be
                              available soon.
                            </p>
                            <p className="text-muted-foreground text-xs mt-2">
                              {error}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAndSearchedNotifications.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                            <Bell className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-foreground font-medium">
                              No notifications found
                            </p>
                            <p className="text-muted-foreground text-sm">
                              Create your first notification to get started
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    paginatedNotifications.map((notification: any, index) => {
                      // Use severity info
                      const severityInfo = getSeverityInfo(
                        notification.severity || "low"
                      );
                      const SeverityIcon = severityInfo.icon;

                      return (
                        <tr
                          key={notification.id}
                          className={`hover:bg-muted/30 transition-colors duration-200 ${
                            index % 2 === 0 ? "bg-card" : "bg-muted/30"
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-[#f7c624] rounded-full mr-3"></div>
                              <div>
                                <div className="text-sm font-medium text-foreground">
                                  {notification.title || notification.message || "Alert"}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {notification.alert_type?.replace(/_/g, " ") || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={severityInfo.color}>
                              <SeverityIcon className="w-3 h-3 mr-1" />
                              {notification.severity?.toUpperCase() || "LOW"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              <div className="text-sm text-foreground truncate">
                                {notification.message || "No message"}
                              </div>
                              {notification.description && (
                                <div className="text-xs text-muted-foreground mt-1 truncate">
                                  {notification.description}
                              </div>
                              )}
                              {/* Show student if applicable */}
                              {notification.student_id && (
                                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                  Student: {getStudentName(notification.student_id)}
                                  </div>
                                )}
                              {/* Show trip if applicable */}
                              {notification.trip_id && (
                                <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                  Trip #{notification.trip_id}
                                  </div>
                                )}
                              {/* Show recipient count */}
                              {notification.recipients && notification.recipients.length > 0 && (
                                <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                  {notification.recipients.length} recipient(s)
                                </div>
                              )}
                              {notification.recipients && notification.recipients.length === 0 && (
                                <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                  Broadcast to all
                                </div>
                              )}
                              {notification.requires_immediate_action && (
                                <Badge variant="destructive" className="text-xs mt-1">
                                  Urgent
                                </Badge>
                                )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 text-muted-foreground mr-2" />
                              <div>
                                <div className="text-sm text-foreground">
                                  {notification.created_at
                                    ? formatDate(notification.created_at)
                                    : "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0 hover:bg-muted/30 rounded-full"
                                >
                                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={() => handleView(notification)}
                                  className="cursor-pointer"
                                >
                                  <ViewIcon className="h-4 w-4 mr-2 text-blue-600" />
                                  <span>View Details</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-
                  {Math.min(endIndex, filteredAndSearchedNotifications.length)}{" "}
                  of {filteredAndSearchedNotifications.length} notifications
                  {searchTerm && ` matching "${searchTerm}"`}
                </div>
              </div>
            )}
          </Card>
        </main>
      </div>

      {/* View Notification Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#f7c624]" />
              Notification Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedNotification && (
            <div className="space-y-4">
              {/* Alert Type and Severity */}
              <div className="flex items-center gap-2 flex-wrap">
                {(() => {
                  const severityInfo = getSeverityInfo(selectedNotification.severity || "low");
                  const SeverityIcon = severityInfo.icon;
                  return (
                    <Badge className={severityInfo.color}>
                      <SeverityIcon className="w-3 h-3 mr-1" />
                      {selectedNotification.severity?.toUpperCase() || "LOW"}
                    </Badge>
                  );
                })()}
                <Badge variant="outline">
                  {selectedNotification.alert_type?.replace(/_/g, " ") || "N/A"}
                </Badge>
                {selectedNotification.requires_immediate_action && (
                  <Badge variant="destructive">
                    Requires Immediate Action
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">
                  ID: {selectedNotification.id}
                </span>
              </div>

              {/* Title */}
              {selectedNotification.title && (
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-2">Title</h3>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-foreground font-semibold">{selectedNotification.title}</p>
                  </div>
                </div>
              )}

              {/* Message */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">Message</h3>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-foreground">{selectedNotification.message}</p>
                </div>
              </div>

              {/* Description */}
              {selectedNotification.description && (
              <div>
                  <h3 className="text-sm font-medium text-foreground mb-2">Description</h3>
                <div className="p-3 bg-muted rounded-lg">
                    <p className="text-foreground">{selectedNotification.description}</p>
                </div>
              </div>
              )}

              {/* Student Information */}
              {selectedNotification.student_id && (
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-2">Associated Student</h3>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-foreground">
                      {getStudentName(selectedNotification.student_id)} (ID: {selectedNotification.student_id})
                    </p>
                  </div>
                </div>
              )}

              {/* Trip Information */}
              {selectedNotification.trip_id && (
                      <div>
                  <h3 className="text-sm font-medium text-foreground mb-2">Associated Trip</h3>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-foreground">
                      Trip #{selectedNotification.trip_id}
                    </p>
                              </div>
                </div>
              )}

              {/* Address */}
              {selectedNotification.address && (
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-2">Location</h3>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-foreground">{selectedNotification.address}</p>
                        </div>
                      </div>
                    )}
                    
              {/* Recipients */}
              {selectedNotification.recipients && selectedNotification.recipients.length > 0 && (
                      <div>
                  <h3 className="text-sm font-medium text-foreground mb-2">
                    Recipients ({selectedNotification.recipients.length})
                  </h3>
                  <div className="p-3 bg-muted rounded-lg space-y-2 max-h-48 overflow-y-auto">
                    {selectedNotification.recipients.map((recipientId: number) => {
                      const parent = filteredParents.find((p) => p.id === recipientId);
                      const driver = drivers?.find((d) => d.id === recipientId);
                      const staffMember = staff?.find((s: any) => s.user?.id === recipientId);

                      let recipientName = `User ID: ${recipientId}`;
                      let recipientType = "User";

                      if (parent) {
                        recipientName = parent.user_full_name || `${parent.user_data?.first_name} ${parent.user_data?.last_name}`;
                        recipientType = "Parent";
                      } else if (driver) {
                        recipientName = `${driver.user_details.first_name} ${driver.user_details.last_name}`;
                        recipientType = "Driver";
                      } else if (staffMember) {
                        recipientName = `${(staffMember as any).user?.first_name} ${(staffMember as any).user?.last_name}`;
                        recipientType = "Staff";
                      }

                            return (
                        <div key={recipientId} className="text-sm text-foreground flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {recipientType}
                          </Badge>
                          <span>{recipientName}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

              {selectedNotification.recipients && selectedNotification.recipients.length === 0 && (
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-2">Broadcast Type</h3>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <p className="text-orange-800 dark:text-orange-400">
                      This alert was sent to all users in the school
                    </p>
                  </div>
                </div>
              )}

              {/* Metadata */}
              {selectedNotification.metadata && Object.keys(selectedNotification.metadata).length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-2">Additional Information</h3>
                  <div className="p-3 bg-muted rounded-lg space-y-1">
                    {Object.entries(selectedNotification.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          {key.replace(/_/g, " ")}:
                        </span>
                        <span className="text-sm text-foreground">
                          {typeof value === "object" ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-2">Created</h3>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-foreground text-sm">
                      {selectedNotification.created_at ? formatDate(selectedNotification.created_at) : "N/A"}
                    </p>
                  </div>
                </div>
                
                {selectedNotification.updated_at && (
                <div>
                    <h3 className="text-sm font-medium text-foreground mb-2">Updated</h3>
                  <div className="p-3 bg-muted rounded-lg">
                      <p className="text-foreground text-sm">
                        {formatDate(selectedNotification.updated_at)}
                      </p>
                    </div>
                    </div>
                  )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
