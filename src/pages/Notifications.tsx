import { useState } from "react";
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Filter,
  Search,
  MoreVertical,
  Clock,
  User,
  Car,
  Map,
  FileText,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  category: "system" | "driver" | "route" | "student" | "vehicle" | "general";
  timestamp: string;
  read: boolean;
  priority: "low" | "medium" | "high";
  icon?: React.ComponentType<{ className?: string }>;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "New Driver Registration",
    message:
      "John Doe has completed driver registration and is pending approval.",
    type: "info",
    category: "driver",
    timestamp: "2 minutes ago",
    read: false,
    priority: "medium",
    icon: User,
  },
  {
    id: "2",
    title: "Route Optimization Complete",
    message:
      "Route optimization for morning pickup has been completed. Estimated time savings: 15 minutes.",
    type: "success",
    category: "route",
    timestamp: "15 minutes ago",
    read: false,
    priority: "high",
    icon: Map,
  },
  {
    id: "3",
    title: "Vehicle Maintenance Due",
    message:
      "Vehicle KCA 123A requires maintenance. Last service was 3 months ago.",
    type: "warning",
    category: "vehicle",
    timestamp: "1 hour ago",
    read: true,
    priority: "medium",
    icon: Car,
  },
  {
    id: "4",
    title: "System Update Available",
    message:
      "A new system update is available. New features include improved route optimization.",
    type: "info",
    category: "system",
    timestamp: "2 hours ago",
    read: true,
    priority: "low",
    icon: Settings,
  },
  {
    id: "5",
    title: "Student Pickup Delayed",
    message:
      "Student pickup at Central Station is delayed by 10 minutes due to traffic.",
    type: "warning",
    category: "student",
    timestamp: "3 hours ago",
    read: false,
    priority: "high",
    icon: User,
  },
  {
    id: "6",
    title: "Monthly Report Generated",
    message:
      "Monthly transportation report for March 2024 has been generated and is ready for review.",
    type: "success",
    category: "general",
    timestamp: "1 day ago",
    read: true,
    priority: "low",
    icon: FileText,
  },
  {
    id: "7",
    title: "Driver Performance Alert",
    message:
      "Driver Sarah Johnson has received 3 complaints this week. Review recommended.",
    type: "error",
    category: "driver",
    timestamp: "1 day ago",
    read: false,
    priority: "high",
    icon: User,
  },
  {
    id: "8",
    title: "New Route Created",
    message:
      "New route 'Downtown Express' has been created and assigned to 5 students.",
    type: "success",
    category: "route",
    timestamp: "2 days ago",
    read: true,
    priority: "medium",
    icon: Map,
  },
];

export default function Notifications() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const { toast } = useToast();

  const getNotificationIcon = (notification: Notification) => {
    if (notification.icon) {
      return <notification.icon className="h-5 w-5" />;
    }

    switch (notification.type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "driver":
        return "bg-blue-100 text-blue-800";
      case "route":
        return "bg-purple-100 text-purple-800";
      case "student":
        return "bg-green-100 text-green-800";
      case "vehicle":
        return "bg-orange-100 text-orange-800";
      case "system":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || notification.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "unread" && !notification.read) ||
      (statusFilter === "read" && notification.read);
    const matchesPriority =
      priorityFilter === "all" || notification.priority === priorityFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    toast({
      title: "Notification marked as read",
      description: "The notification has been marked as read.",
    });
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
    toast({
      title: "All notifications marked as read",
      description: "All notifications have been marked as read.",
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
    toast({
      title: "Notification deleted",
      description: "The notification has been deleted.",
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast({
      title: "All notifications cleared",
      description: "All notifications have been cleared.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Notifications
              </h1>
              <p className="text-gray-600">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </Button>
            <Button
              variant="outline"
              onClick={clearAllNotifications}
              disabled={notifications.length === 0}
            >
              Clear all
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Category
                </label>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    <SelectItem value="driver">Driver</SelectItem>
                    <SelectItem value="route">Route</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="vehicle">Vehicle</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Priority
                </label>
                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No notifications
                </h3>
                <p className="text-gray-600 text-center">
                  {searchTerm ||
                  categoryFilter !== "all" ||
                  statusFilter !== "all" ||
                  priorityFilter !== "all"
                    ? "No notifications match your current filters."
                    : "You're all caught up! No new notifications."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all duration-200 hover:shadow-md ${
                  !notification.read
                    ? "border-l-4 border-l-blue-500 bg-blue-50/50"
                    : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3
                              className={`font-semibold ${
                                !notification.read
                                  ? "text-blue-900"
                                  : "text-gray-900"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>

                          <p className="text-gray-600 mb-3">
                            {notification.message}
                          </p>

                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="h-4 w-4" />
                              {notification.timestamp}
                            </div>

                            <Badge
                              variant="outline"
                              className={getCategoryColor(
                                notification.category
                              )}
                            >
                              {notification.category}
                            </Badge>

                            <Badge
                              variant="outline"
                              className={getPriorityColor(
                                notification.priority
                              )}
                            >
                              {notification.priority}
                            </Badge>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!notification.read && (
                              <DropdownMenuItem
                                onClick={() => markAsRead(notification.id)}
                              >
                                Mark as read
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() =>
                                deleteNotification(notification.id)
                              }
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
