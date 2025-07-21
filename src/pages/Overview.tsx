import React, { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchOverviewData } from "@/redux/slices/overviewSlice";
import { fetchUserPreferences } from "@/redux/slices/preferencesSlice";
import { StatOverviewCards } from "@/components/StatOverviewCards";
import { RecentTripsTable } from "@/components/RecentTripsTable";
import { TripsOverview } from "@/components/TripsOverview";
import { QueryAnalytics } from "@/components/QueryAnalytics";
import { ThemeDemo } from "@/components/ThemeDemo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, Loader2 } from "lucide-react";

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
  const { preferences = {
    showAnalytics: true,
    showRecentActivity: true,
    showNotificationsPanel: true,
    allowDataExport: true,
    autoBackup: true,
    theme: 'light',
    language: 'en',
  } } = useAppSelector((state) => state.preferences);

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
    }
    dispatch(fetchUserPreferences());
  }, [dispatch, schoolId]);

  const handleRefresh = () => {
    if (schoolId) {
      dispatch(fetchOverviewData({ schoolId }));
    }
  };

    // Show loading state while schools are being fetched
  if (schoolsLoading) {
    return (
      <div className="h-full w-full bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading school information...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

    // Show error if schools failed to load
  if (schoolsError) {
    return (
      <div className="h-full w-full bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
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
      <div className="h-full w-full bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <Alert>
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
    <div className="h-full w-full bg-background">
      <div className="h-full w-full pl-5 pt-4">
        <div className=" w-full flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Overview</h2>
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
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

                <div className="space-y-6 w-full">
          {/* Statistics Cards - Show only if analytics are enabled */}
          {preferences.showAnalytics && <StatOverviewCards />}

          {/* Trips Overview - Always show trips and queries */}
          <TripsOverview />

          {/* Query Analytics - Always show comprehensive analytics */}
          <QueryAnalytics />

          {/* Recent Trips - Show only if recent activity is enabled */}
          {preferences.showRecentActivity && <RecentTripsTable />}

          {/* Notifications Panel - Show only if notifications panel is enabled */}
          {preferences.showNotificationsPanel && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Notifications Panel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        New Driver Registration
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Driver John Doe has completed registration
                      </p>
                    </div>
                    <span className="text-xs text-blue-600 dark:text-blue-400">2 min ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">
                        Trip Completed
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Route A morning trip has been completed successfully
                      </p>
                    </div>
                    <span className="text-xs text-green-600 dark:text-green-400">15 min ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <div>
                      <p className="font-medium text-yellow-900 dark:text-yellow-100">
                        Maintenance Due
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Vehicle KCA 123A is due for maintenance
                      </p>
                    </div>
                    <span className="text-xs text-yellow-600 dark:text-yellow-400">1 hour ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Show message if all sections are disabled */}
          {!preferences.showAnalytics &&
            !preferences.showRecentActivity &&
            !preferences.showNotificationsPanel && (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-lg font-medium text-foreground">
                        Dashboard is empty
                      </h4>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        All dashboard sections are currently disabled. You can
                        enable them in the Settings page under Personalization.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Theme Demo - Always show to showcase theme functionality */}
          <ThemeDemo />
        </div>
      </div>
    </div>
  );
};

export default Overview;
