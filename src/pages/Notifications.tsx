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
  message: z.string().min(10, "Message must be at least 10 characters"),
  notification_type: z.enum([
    "ACTION_REQUIRED",
    "SYSTEM",
    "INFO",
    "WARNING",
    "EMERGENCY",
  ]),
  // Target selection - support parents and drivers
  target_type: z.enum(["parents", "drivers", "all"]),
  selected_targets: z.array(z.number()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const NOTIFICATION_TYPES = [
  {
    value: "ACTION_REQUIRED",
    label: "Action Required",
    icon: AlertTriangle,
    color: "bg-orange-100 text-orange-800",
  },
  {
    value: "SYSTEM",
    label: "System",
    icon: Info,
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "EMERGENCY",
    label: "Emergency",
    icon: AlertTriangle,
    color: "bg-red-100 text-red-800",
  },
  {
    value: "WARNING",
    label: "Warning",
    icon: AlertTriangle,
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "INFO",
    label: "Information",
    icon: Info,
    color: "bg-blue-100 text-blue-800",
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
      notification_type: "INFO",
      target_type: "all",
      selected_targets: [],
    },
  });

  // Clear selected targets when target type changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "target_type") {
        form.setValue("selected_targets", []);
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

  const filteredTrips =
    trips?.filter((trip) => trip.school === parseInt(schoolId || "0")) || [];

  // Filter and search logic - handle trips data structure

  const filteredAndSearchedNotifications =
    notifications?.filter((notification: any) => {
      // Filter based on actual notification properties
      const matchesSearch =
        notification.message
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        notification.notification_type
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        notification.school_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Filter by notification type
      const matchesType =
        typeFilter === "all" ||
        notification.notification_type?.toLowerCase() ===
          typeFilter.toLowerCase();

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

  // Debug logging
  console.log("🔍 Notifications debugging:");
  console.log("Raw notifications:", notifications);
  console.log("Search term:", searchTerm);
  console.log("Type filter:", typeFilter);
  console.log("Filtered notifications:", filteredAndSearchedNotifications);
  console.log("Paginated notifications:", paginatedNotifications);

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="flex-1 px-2 sm:px-1 py-0 w-full max-w-[98vw] mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
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

      console.log("🔍 Debug - Form values:", values);

      // Structure the payload based on target type
      const notificationData: any = {
        school: parseInt(schoolId || "0"),
        message: values.message,
        notification_type: values.notification_type,
        is_read: false,
        parents: [],
        drivers: [],
      };

      if (values.target_type === "all") {
        // For "all users", don't specify any specific parents
        console.log("📤 Sending to all users - no specific parent");
      } else if (values.target_type === "parents") {
        // For parents, use the selected parent IDs
        if (values.selected_targets && values.selected_targets.length > 0) {
          notificationData.parents = values.selected_targets;
          console.log(
            "📤 Sending to specific parents:",
            values.selected_targets
          );
        } else {
          console.log("📤 No specific parents selected");
        }
      } else if (values.target_type === "drivers") {
        // For drivers, use the selected driver IDs
        if (values.selected_targets && values.selected_targets.length > 0) {
          notificationData.drivers = values.selected_targets;
          console.log(
            "📤 Sending to specific drivers:",
            values.selected_targets
          );
        } else {
          console.log("📤 No specific drivers selected");
        }
      } else {
        // For non-parent categories, we might need a different API endpoint
        // For now, let's send without parent field
        console.log("📤 Sending to non-parent category:", values.target_type);
      }

      console.log("📤 Final notification payload:", notificationData);

      const result = await dispatch(
        createNotification(notificationData)
      ).unwrap();
      console.log("✅ Notification created successfully:", result);

      toast({
        title: "Success",
        description: "Notification created successfully",
      });

      // Reset form
      form.reset();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("❌ Error creating notification:", error);
      toast({
        title: "Error",
        description: "Failed to create notification",
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
                          name="notification_type"
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

                        <div className="space-y-4">
                          <div>
                            <FormLabel>Target Category</FormLabel>
                            <div className="text-sm text-gray-500 mb-2">
                              Select the category of users to target with this
                              notification. You can only target one category at
                              a time.
                            </div>
                          </div>

                          <FormField
                            control={form.control}
                            name="target_type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Who to send to?</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select target category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="all">
                                      All Users
                                    </SelectItem>
                                    <SelectItem value="parents">
                                      Parents
                                    </SelectItem>
                                    <SelectItem value="drivers">
                                      Drivers
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {form.watch("target_type") !== "all" && (
                            <FormField
                              control={form.control}
                              name="selected_targets"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    {form.watch("target_type") === "parents"
                                      ? "Select Parents"
                                      : form.watch("target_type") === "drivers"
                                      ? "Select Drivers"
                                      : "Select Targets"}
                                  </FormLabel>
                                  <div className="space-y-2">
                                    <Select
                                      onValueChange={(value) => {
                                        const selectedIds = field.value || [];
                                        const newId = parseInt(value);
                                        const newSelectedIds =
                                          selectedIds.includes(newId)
                                            ? selectedIds.filter(
                                                (id) => id !== newId
                                              )
                                            : [...selectedIds, newId];
                                        field.onChange(newSelectedIds);
                                      }}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select targets" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {form.watch("target_type") === "parents"
                                          ? filteredParents.map((parent) => (
                                              <SelectItem
                                                key={parent.id}
                                                value={parent.id.toString()}
                                              >
                                                {parent.user_full_name ||
                                                  `${parent.user_data?.first_name} ${parent.user_data?.last_name}`}
                                              </SelectItem>
                                            ))
                                          : null}
                                        {form.watch("target_type") === "drivers"
                                          ? drivers
                                              ?.filter(
                                                (d) =>
                                                  d.school ===
                                                  parseInt(schoolId || "0")
                                              )
                                              ?.map((driver) => (
                                                <SelectItem
                                                  key={driver.id}
                                                  value={driver.id.toString()}
                                                >
                                                  {
                                                    driver.user_details
                                                      .first_name
                                                  }{" "}
                                                  {
                                                    driver.user_details
                                                      .last_name
                                                  }
                                                </SelectItem>
                                              ))
                                          : null}
                                      </SelectContent>
                                    </Select>

                                    {/* Display selected targets */}
                                    {field.value && field.value.length > 0 && (
                                      <div className="mt-2">
                                        <div className="text-sm text-gray-600 mb-1">
                                          Selected Targets:
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                          {field.value.map((targetId) => {
                                            let targetName = `ID: ${targetId}`;

                                            if (
                                              form.watch("target_type") ===
                                              "parents"
                                            ) {
                                              const parent =
                                                filteredParents.find(
                                                  (p) => p.id === targetId
                                                );
                                              targetName =
                                                parent?.user_full_name ||
                                                `${parent?.user_data?.first_name} ${parent?.user_data?.last_name}` ||
                                                `Parent ${targetId}`;
                                            } else if (
                                              form.watch("target_type") ===
                                              "drivers"
                                            ) {
                                              const driver = drivers?.find(
                                                (d) => d.id === targetId
                                              );
                                              targetName = driver
                                                ? `${driver.user_details.first_name} ${driver.user_details.last_name}`
                                                : `Driver ${targetId}`;
                                            }

                                            return (
                                              <Badge
                                                key={targetId}
                                                variant="secondary"
                                                className="text-xs"
                                              >
                                                {targetName}
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    field.onChange(
                                                      field.value.filter(
                                                        (id) => id !== targetId
                                                      )
                                                    );
                                                  }}
                                                  className="ml-1 text-red-500 hover:text-red-700"
                                                >
                                                  ×
                                                </button>
                                              </Badge>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>

                        <FormField
                          control={form.control}
                          name="message"
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
                      Details
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
                  ) : filteredAndSearchedNotifications.length === 0 ? (
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
                      // Use actual notification type
                      const typeInfo = getNotificationTypeInfo(
                        notification.notification_type || "info"
                      );
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
                                  {notification.message || "Notification"}
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
                              {notification.notification_type || "INFO"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs truncate">
                              <div className="text-sm text-gray-900">
                                School: {notification.school_name || "Unknown"}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                <span className="mr-2">
                                  Type:{" "}
                                  {notification.notification_type || "Unknown"}
                                </span>
                              </div>
                              {/* Show targeted parents/drivers */}
                              {notification.parents &&
                                notification.parents.length > 0 && (
                                  <div className="text-xs text-blue-600 mt-1">
                                    Parents:{" "}
                                    {notification.parents
                                      .map((parentId) => {
                                        const parent = filteredParents.find(
                                          (p) => p.id === parentId
                                        );
                                        return parent
                                          ? parent.user_full_name
                                          : `Parent ${parentId}`;
                                      })
                                      .join(", ")}
                                  </div>
                                )}
                              {notification.drivers &&
                                notification.drivers.length > 0 && (
                                  <div className="text-xs text-green-600 mt-1">
                                    Drivers:{" "}
                                    {notification.drivers
                                      .map((driverId) => {
                                        const driver = drivers?.find(
                                          (d) => d.id === driverId
                                        );
                                        return driver
                                          ? `${driver.user_details.first_name} ${driver.user_details.last_name}`
                                          : `Driver ${driverId}`;
                                      })
                                      .join(", ")}
                                  </div>
                                )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 text-gray-400 mr-2" />
                              <div>
                                <div className="text-sm text-gray-900">
                                  {notification.created_at
                                    ? formatDate(notification.created_at)
                                    : "N/A"}
                                </div>
                                {notification.is_read && (
                                  <div className="text-xs text-green-500">
                                    ✓ Read
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
              <Bell className="w-5 h-5 text-green-500" />
              Notification Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedNotification && (
            <div className="space-y-4">
              {/* Notification Type Badge */}
              <div className="flex items-center gap-2">
                {(() => {
                  const typeInfo = getNotificationTypeInfo(selectedNotification.notification_type || "info");
                  const TypeIcon = typeInfo.icon;
                  return (
                    <Badge className={typeInfo.color}>
                      <TypeIcon className="w-3 h-3 mr-1" />
                      {selectedNotification.notification_type || "INFO"}
                    </Badge>
                  );
                })()}
                <span className="text-sm text-gray-500">
                  ID: {selectedNotification.id}
                </span>
              </div>

              {/* Message */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Message</h3>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900">{selectedNotification.message}</p>
                </div>
              </div>

              {/* School Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">School</h3>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900">{selectedNotification.school_name || "Unknown School"}</p>
                </div>
              </div>

              {/* Targeted Recipients */}
              {(selectedNotification.parents?.length > 0 || selectedNotification.drivers?.length > 0) && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Targeted Recipients</h3>
                  <div className="space-y-2">
                    {selectedNotification.parents && selectedNotification.parents.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-blue-600 mb-1">Parents:</h4>
                        <div className="pl-3">
                          {selectedNotification.parents.map((parentId) => {
                            const parent = filteredParents.find((p) => p.id === parentId);
                            return (
                              <div key={parentId} className="text-sm text-gray-700">
                                • {parent ? parent.user_full_name : `Parent ${parentId}`}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {selectedNotification.drivers && selectedNotification.drivers.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-green-600 mb-1">Drivers:</h4>
                        <div className="pl-3">
                          {selectedNotification.drivers.map((driverId) => {
                            const driver = drivers?.find((d) => d.id === driverId);
                            return (
                              <div key={driverId} className="text-sm text-gray-700">
                                • {driver ? `${driver.user_details.first_name} ${driver.user_details.last_name}` : `Driver ${driverId}`}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Created</h3>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">
                      {selectedNotification.created_at ? formatDate(selectedNotification.created_at) : "N/A"}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {selectedNotification.is_read ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-green-600">Read</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-orange-500" />
                          <span className="text-orange-600">Unread</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Additional Details</h3>
                <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">School ID:</span>
                    <span className="text-sm text-gray-900">{selectedNotification.school || "N/A"}</span>
                  </div>
                  {selectedNotification.read_at && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Read At:</span>
                      <span className="text-sm text-gray-900">{formatDate(selectedNotification.read_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
