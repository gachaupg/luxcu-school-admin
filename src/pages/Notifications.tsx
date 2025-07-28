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
  description: z.string().min(5, "Description must be at least 5 characters"),
  payload: z.object({
    parent: z.number().optional(),
    student: z.number().optional(),
    trip: z.number().optional(),
    type: z.enum(["emergency", "info", "warning", "success"]),
    message: z.string().min(10, "Message must be at least 10 characters"),
    expires_at: z.string().optional(),
  }),
});

type FormValues = z.infer<typeof formSchema>;

const NOTIFICATION_TYPES = [
  {
    value: "emergency",
    label: "Emergency",
    icon: AlertTriangle,
    color: "bg-red-100 text-red-800",
  },
  {
    value: "warning",
    label: "Warning",
    icon: AlertTriangle,
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "info",
    label: "Information",
    icon: Info,
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "success",
    label: "Success",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800",
  },
];

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const { notifications, loading, error } = useAppSelector(
    (state) => state.notifications
  );
  const { parents } = useAppSelector((state) => state.parents);
  const { students } = useAppSelector((state) => state.students);
  const { trips } = useAppSelector((state) => state.trips);
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      payload: {
        parent: undefined,
        student: undefined,
        trip: undefined,
        type: "info",
        message: "",
        expires_at: "",
      },
    },
  });

  // Filter parents, students, and trips for the current school
  const filteredParents =
    parents?.filter((parent) => parent.school === parseInt(schoolId || "0")) ||
    [];

  const filteredStudents =
    students?.filter(
      (student) => student.school === parseInt(schoolId || "0")
    ) || [];

  const filteredTrips =
    trips?.filter((trip) => trip.school === parseInt(schoolId || "0")) || [];

  // Filter and search logic - handle trips data structure

  const filteredAndSearchedNotifications =
    notifications?.filter((notification: any) => {
      // Since we're using trips data temporarily, adapt the filtering
      const matchesSearch =
        notification.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        notification.route_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        notification.driver_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        notification.vehicle_registration
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      // For trips data, treat all as "info" type temporarily
      const matchesType = typeFilter === "all" || typeFilter === "info";

      return matchesSearch && matchesType;
    }) || [];

  // Pagination logic
  const totalPages = Math.ceil(
    filteredAndSearchedNotifications.length / itemsPerPage
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNotifications = filteredAndSearchedNotifications.slice(
    startIndex,
    endIndex
  );

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
    }
  }, [dispatch, schoolId]);

  const handleCreateNotification = async (values: FormValues) => {
    try {
      console.log("🔍 Creating notification with parent ID:", parentId);
      console.log("👤 User data:", user);
      console.log("📋 Selected parent from form:", values.payload.parent);
      console.log(
        "📋 Available parents:",
        filteredParents.map((p) => ({
          id: p.id,
          user: p.user,
          name: p.user_full_name,
        }))
      );

      const notificationData = {
        description: values.description,
        payload: {
          ...values.payload,
          parent: values.payload.parent || parentId, // Use parentId as fallback
          student: values.payload.student || undefined,
          trip: values.payload.trip || undefined,
          type: values.payload.type, // Ensure type is always provided
          message: values.payload.message,
          expires_at: values.payload.expires_at || undefined,
        },
        school: parseInt(schoolId || "0"),
      };

      console.log("📤 Notification payload:", notificationData);
      console.log(
        "🎯 Final parent ID being sent:",
        notificationData.payload.parent
      );

      await dispatch(createNotification(notificationData)).unwrap();
      toast({
        title: "Success",
        description: "Notification created successfully",
      });

      // Close modal and reset form
      setIsCreateModalOpen(false);
      form.reset();
    } catch (err) {
      console.error("Create notification error:", err);
      let errorMessage = "Failed to create notification";

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

  const handleView = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsViewModalOpen(true);
  };

  const getNotificationTypeInfo = (type: string) => {
    return (
      NOTIFICATION_TYPES.find((t) => t.value === type) || NOTIFICATION_TYPES[2]
    ); // Default to info
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 px-2 sm:px-1 py-0 w-full max-w-[98vw] mx-auto">
          {error && error.includes("not available") && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-blue-500" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">
                    Demo Mode - Notifications API Coming Soon
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    The notifications API is not yet available on the server.
                    You can explore the interface with demo data, and create
                    notifications that will be saved when the backend is
                    implemented.
                  </p>
                </div>
              </div>
            </div>
          )}
          <Card className="bg-white shadow-lg border-0 rounded-xl">
            <CardHeader className="border-b border-gray-100 flex flex-row w-full items-center justify-between py-4">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Bell className="w-6 h-6 text-green-500" />
                Notifications
              </CardTitle>
              <div className="flex gap-3">
                <Dialog
                  open={isCreateModalOpen}
                  onOpenChange={(open) => {
                    setIsCreateModalOpen(open);
                    if (!open) {
                      form.reset();
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg shadow disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter notification description"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="payload.type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notification Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select notification type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {NOTIFICATION_TYPES.map((type) => (
                                    <SelectItem
                                      key={type.value}
                                      value={type.value}
                                    >
                                      <div className="flex items-center gap-2">
                                        <type.icon className="h-4 w-4" />
                                        {type.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="payload.message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter notification message"
                                  rows={4}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="payload.parent"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Parent (Optional)</FormLabel>
                                <Select
                                  onValueChange={(value) =>
                                    field.onChange(
                                      value ? parseInt(value) : undefined
                                    )
                                  }
                                  value={field.value?.toString() || ""}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select parent" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {filteredParents.length === 0 ? (
                                      <div className="px-3 py-2 text-sm text-muted-foreground">
                                        No parents available
                                      </div>
                                    ) : (
                                      filteredParents.map((parent) => (
                                        <SelectItem
                                          key={parent.id}
                                          value={
                                            parent.user?.toString() ||
                                            parent.id?.toString() ||
                                            "0"
                                          }
                                        >
                                          {parent.user_full_name}
                                        </SelectItem>
                                      ))
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="payload.student"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Student (Optional)</FormLabel>
                                <Select
                                  onValueChange={(value) =>
                                    field.onChange(
                                      value ? parseInt(value) : undefined
                                    )
                                  }
                                  value={field.value?.toString() || ""}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select student" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {filteredStudents.length === 0 ? (
                                      <div className="px-3 py-2 text-sm text-muted-foreground">
                                        No students available
                                      </div>
                                    ) : (
                                      filteredStudents.map((student) => (
                                        <SelectItem
                                          key={student.id}
                                          value={student.id?.toString() || "0"}
                                        >
                                          {student.first_name}{" "}
                                          {student.last_name}
                                        </SelectItem>
                                      ))
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="payload.trip"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Trip (Optional)</FormLabel>
                                <Select
                                  onValueChange={(value) =>
                                    field.onChange(
                                      value ? parseInt(value) : undefined
                                    )
                                  }
                                  value={field.value?.toString() || ""}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select trip" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {filteredTrips.length === 0 ? (
                                      <div className="px-3 py-2 text-sm text-muted-foreground">
                                        No trips available
                                      </div>
                                    ) : (
                                      filteredTrips.map((trip) => (
                                        <SelectItem
                                          key={trip.id}
                                          value={trip.id?.toString() || "0"}
                                        >
                                          Trip {trip.id}
                                        </SelectItem>
                                      ))
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="payload.expires_at"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expires At (Optional)</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            className="bg-green-500 hover:bg-green-600"
                          >
                            Create Notification
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search notifications by description or message..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {NOTIFICATION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
                    className="border-gray-200 hover:bg-gray-50 px-3 py-2"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                          <span className="text-gray-600 font-medium">
                            Loading notifications...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center">
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-blue-600 font-medium">
                              Demo Mode Active
                            </p>
                            <p className="text-blue-500 text-sm">
                              Showing demo notifications. The API will be
                              available soon.
                            </p>
                            <p className="text-gray-500 text-xs mt-2">
                              {error}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : notifications?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <Bell className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">
                              No notifications found
                            </p>
                            <p className="text-gray-500 text-sm">
                              Create your first notification to get started
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    paginatedNotifications.map((notification: any, index) => {
                      // Since we're using trips data, treat all as "info" type
                      const typeInfo = getNotificationTypeInfo("info");
                      const TypeIcon = typeInfo.icon;

                      return (
                        <tr
                          key={notification.id}
                          className={`hover:bg-gray-50 transition-colors duration-200 ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {notification.description ||
                                    notification.route_name ||
                                    "Trip"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ID: {notification.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={typeInfo.color}>
                              <TypeIcon className="w-3 h-3 mr-1" />
                              Trip
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs truncate">
                              <div className="text-sm text-gray-900">
                                Route: {notification.route_name || "Unknown"} -
                                Driver: {notification.driver_name || "Unknown"}{" "}
                                - Vehicle:{" "}
                                {notification.vehicle_number || "Unknown"}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                <span className="mr-2">
                                  Status: {notification.status || "Unknown"}
                                </span>
                                <span className="mr-2">
                                  Type: {notification.trip_type || "Unknown"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 text-gray-400 mr-2" />
                              <div>
                                <div className="text-sm text-gray-900">
                                  {notification.scheduled_start_time
                                    ? formatDate(
                                        notification.scheduled_start_time
                                      )
                                    : "N/A"}
                                </div>
                                {notification.scheduled_end_time && (
                                  <div className="text-xs text-gray-500">
                                    Ends:{" "}
                                    {formatDate(
                                      notification.scheduled_end_time
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                                >
                                  <MoreVertical className="h-4 w-4 text-gray-600" />
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
              <div className="flex items-center justify-between p-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1}-
                  {Math.min(endIndex, filteredAndSearchedNotifications.length)}{" "}
                  of {filteredAndSearchedNotifications.length} notifications
                  {searchTerm && ` matching "${searchTerm}"`}
                  {typeFilter !== "all" && ` (${typeFilter})`}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      )
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </main>
      </div>

      {/* View Notification Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Description</Label>
                  <p className="text-sm text-gray-700">
                    {selectedNotification.description}
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">Type</Label>
                  <div className="mt-1">
                    {(() => {
                      const typeInfo = getNotificationTypeInfo(
                        selectedNotification.payload.type
                      );
                      const TypeIcon = typeInfo.icon;
                      return (
                        <Badge className={typeInfo.color}>
                          <TypeIcon className="w-3 h-3 mr-1" />
                          {typeInfo.label}
                        </Badge>
                      );
                    })()}
                  </div>
                </div>
              </div>
              <div>
                <Label className="font-semibold">Message</Label>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                  {selectedNotification.payload.message}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Parent</Label>
                  <p className="text-sm text-gray-700">
                    {selectedNotification.payload.parent
                      ? getParentName(selectedNotification.payload.parent)
                      : "All Parents"}
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">Student</Label>
                  <p className="text-sm text-gray-700">
                    {selectedNotification.payload.student
                      ? getStudentName(selectedNotification.payload.student)
                      : "All Students"}
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">Trip</Label>
                  <p className="text-sm text-gray-700">
                    {selectedNotification.payload.trip
                      ? getTripName(selectedNotification.payload.trip)
                      : "All Trips"}
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">Expires At</Label>
                  <p className="text-sm text-gray-700">
                    {selectedNotification.payload.expires_at
                      ? formatDate(selectedNotification.payload.expires_at)
                      : "No expiration"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Created At</Label>
                  <p className="text-sm text-gray-700">
                    {selectedNotification.created_at
                      ? formatDate(selectedNotification.created_at)
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">Updated At</Label>
                  <p className="text-sm text-gray-700">
                    {selectedNotification.updated_at
                      ? formatDate(selectedNotification.updated_at)
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
