import React, { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchOverviewData } from "@/redux/slices/overviewSlice";
import { fetchUserPreferences } from "@/redux/slices/preferencesSlice";
import { fetchNotifications } from "@/redux/slices/notificationsSlice";
import { fetchParents } from "@/redux/slices/parentsSlice";
import { fetchDrivers } from "@/redux/slices/driversSlice";
import { StatOverviewCards } from "@/components/StatOverviewCards";
import { RecentTripsTable } from "@/components/RecentTripsTable";
import { TripsOverview } from "@/components/TripsOverview";
import { QueryAnalytics } from "@/components/QueryAnalytics";
import { ThemeDemo } from "@/components/ThemeDemo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  AlertCircle,
  Loader2,
  Bell,
  Clock,
  CheckCircle,
} from "lucide-react";

const Overview = () => {
  const dispatch = useAppDispatch();
  const { stats, loading, error, lastUpdated } = useAppSelector(
    (state) => state.overview
  );
  const { user } = useAppSelector((state) => state.auth);
  const {
    schools,
    loading: schoolsLoading,
    error: schoolsError,
  } = useAppSelector((state) => state.schools);
  const {
    preferences = {
      showAnalytics: true,
      showRecentActivity: true,
      showNotificationsPanel: true,
      allowDataExport: true,
      autoBackup: true,
      theme: "light",
      language: "en",
    },
  } = useAppSelector((state) => state.preferences);

  // Get notifications, parents, and drivers data
  const { notifications } = useAppSelector((state) => state.notifications);
  const { parents } = useAppSelector((state) => state.parents);
  const { drivers } = useAppSelector((state) => state.drivers);

  // Get school ID from localStorage or find it from schools
  const getSchoolId = () => {
    const storedSchoolId = localStorage.getItem("schoolId");
    if (storedSchoolId) {
      return parseInt(storedSchoolId);
    }

    // Fallback: find school by admin user
    const school = schools.find((school) => school.admin === user?.id);
    return school?.id;
  };

  const schoolId = getSchoolId();

  useEffect(() => {
    if (schoolId) {
      dispatch(fetchOverviewData({ schoolId }));
      dispatch(fetchNotifications({ schoolId }));
      dispatch(fetchParents({ schoolId }));
      dispatch(fetchDrivers());
    }
    dispatch(fetchUserPreferences());
  }, [dispatch, schoolId]);

  const handleRefresh = () => {
    if (schoolId) {
      dispatch(fetchOverviewData({ schoolId }));
      dispatch(fetchNotifications({ schoolId }));
      dispatch(fetchParents({ schoolId }));
      dispatch(fetchDrivers());
    }
  };

  // Helper functions for notifications
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} hour${
        Math.floor(diffInMinutes / 60) > 1 ? "s" : ""
      } ago`;
    return `${Math.floor(diffInMinutes / 1440)} day${
      Math.floor(diffInMinutes / 1440) > 1 ? "s" : ""
    } ago`;
  };

  const getNotificationTypeInfo = (type: string) => {
    const types = {
      ACTION_REQUIRED: {
        color: "bg-orange-100 text-orange-800",
        icon: AlertCircle,
      },
      SYSTEM: { color: "bg-blue-100 text-blue-800", icon: Bell },
      INFO: { color: "bg-blue-100 text-blue-800", icon: Bell },
      WARNING: { color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
      EMERGENCY: { color: "bg-red-100 text-red-800", icon: AlertCircle },
    };
    return types[type as keyof typeof types] || types.INFO;
  };

  const getParentName = (parentId: number) => {
    const parent = parents?.find((p) => p.id === parentId);
    return parent ? parent.user_full_name : `Parent ${parentId}`;
  };

  const getDriverName = (driverId: number) => {
    const driver = drivers?.find((d) => d.id === driverId);
    return driver
      ? `${driver.user_details.first_name} ${driver.user_details.last_name}`
      : `Driver ${driverId}`;
  };

  // Show loading state while schools are being fetched
  if (schoolsLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-muted-foreground">
                Loading school information...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if schools failed to load
  if (schoolsError) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Alert
            variant="destructive"
            className="border-red-200 bg-red-50 dark:bg-red-950/20"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load school information: {schoolsError}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Show message if no school is associated with the user
  if (!schoolId) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No school ID found. Please ensure you are associated with a
              school.
              {schools.length === 0 && " No schools available."}
              {schools.length > 0 &&
                user &&
                ` Available schools: ${schools.length}, User ID: ${user.id}`}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-2">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Dashboard Overview
              </h1>
              {lastUpdated && (
                <p className="text-sm text-muted-foreground mt-1">
                  Last updated: {new Date(lastUpdated).toLocaleString()}
                </p>
              )}
            </div>
            <Button
              onClick={handleRefresh}
              disabled={loading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 hover:bg-accent/50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>

          {error && (
            <Alert
              className="mb-6 border-red-200 bg-red-50 dark:bg-red-950/20"
              variant="destructive"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Main Content Grid */}
          <div className="grid gap-6">
            {/* Statistics Cards - Show only if analytics are enabled */}
            {preferences.showAnalytics && (
              <div className="mb-4">
                <StatOverviewCards />
              </div>
            )}

            {/* Trips and Analytics Section */}
            <div className="grid lg:grid-cols-2 gap-6">
              <TripsOverview />
              <QueryAnalytics />
            </div>

            {/* Recent Trips - Show only if recent activity is enabled */}
            {preferences.showRecentActivity && (
              <div className="mb-4">
                <RecentTripsTable />
              </div>
            )}

            {/* Notifications Panel - Show only if notifications panel is enabled */}
            {preferences.showNotificationsPanel && (
              <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    Recent Notifications
                    {notifications && notifications.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {notifications.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {!notifications || notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        No notifications yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.slice(0, 5).map((notification: any) => {
                        const typeInfo = getNotificationTypeInfo(
                          notification.notification_type || "INFO"
                        );
                        const TypeIcon = typeInfo.icon;

                        return (
                          <div
                            key={notification.id}
                            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 rounded-xl border shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  notification.notification_type ===
                                  "ACTION_REQUIRED"
                                    ? "bg-orange-500"
                                    : notification.notification_type ===
                                      "EMERGENCY"
                                    ? "bg-red-500"
                                    : notification.notification_type ===
                                      "WARNING"
                                    ? "bg-yellow-500"
                                    : "bg-blue-500"
                                }`}
                              ></div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge
                                    className={`text-xs ${typeInfo.color}`}
                                  >
                                    <TypeIcon className="w-3 h-3 mr-1" />
                                    {notification.notification_type || "INFO"}
                                  </Badge>
                                  {notification.is_read && (
                                    <CheckCircle className="w-3 h-3 text-green-500" />
                                  )}
                                </div>
                                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  School:{" "}
                                  {notification.school_name || "Unknown"}
                                </p>
                                {/* Show targeted recipients if any */}
                                {(notification.parents?.length > 0 ||
                                  notification.drivers?.length > 0) && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {notification.parents?.length > 0 && (
                                      <span className="text-xs text-blue-600">
                                        Parents:{" "}
                                        {notification.parents
                                          .map(getParentName)
                                          .join(", ")}
                                      </span>
                                    )}
                                    {notification.drivers?.length > 0 && (
                                      <span className="text-xs text-green-600">
                                        Drivers:{" "}
                                        {notification.drivers
                                          .map(getDriverName)
                                          .join(", ")}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 ml-3">
                              <span className="text-xs text-gray-500 font-medium">
                                {notification.created_at
                                  ? formatDate(notification.created_at)
                                  : "N/A"}
                              </span>
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Show message if all sections are disabled */}
            {!preferences.showAnalytics &&
              !preferences.showRecentActivity &&
              !preferences.showNotificationsPanel && (
                <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20">
                  <CardContent className="p-12 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center shadow-inner">
                        <svg
                          className="w-10 h-10 text-muted-foreground"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-foreground">
                          Dashboard is Empty
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                          All dashboard sections are currently disabled. You can
                          enable them in the Settings page under
                          Personalization.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Theme Demo - Always show to showcase theme functionality
            <div className="mt-4">
              <ThemeDemo />
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
