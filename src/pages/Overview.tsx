import React, { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchOverviewData } from "@/redux/slices/overviewSlice";
import { StatOverviewCards } from "@/components/StatOverviewCards";
import { RecentTripsTable } from "@/components/RecentTripsTable";
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
  }, [dispatch, schoolId]);

  const handleRefresh = () => {
    if (schoolId) {
      dispatch(fetchOverviewData({ schoolId }));
    }
  };

  // Show loading state while schools are being fetched
  if (schoolsLoading) {
    return (
      <div className="h-full w-full bg-gray-100 p-8">
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
      <div className="h-full w-full bg-gray-100 p-8">
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
      <div className="h-full w-full bg-gray-100 p-8">
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
    <div className="h-full w-full bg-gray-100">
      <div className="h-full w-full p-8">
        <div className="mb-6 w-full flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Overview</h2>
            {lastUpdated && (
              <p className="text-sm text-gray-600 mt-1">
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
          {/* Statistics Cards */}
          <StatOverviewCards />

          {/* Recent Trips */}
          <RecentTripsTable />
        </div>
      </div>
    </div>
  );
};

export default Overview;
