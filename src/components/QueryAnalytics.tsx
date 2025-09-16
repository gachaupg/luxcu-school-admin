import React, { useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Bus,
  MapPin,
  Clock,
  Calendar,
  Download,
  Filter,
  Search,
  Eye,
  BarChart,
  LineChart,
  User,
} from "lucide-react";

export const QueryAnalytics = () => {
  const { trips } = useAppSelector((state) => state.trips);
  const { schools } = useAppSelector((state) => state.schools);
  const { parents } = useAppSelector((state) => state.parents);
  const { drivers } = useAppSelector((state) => state.drivers);
  const { students } = useAppSelector((state) => state.students);
  const { vehicles } = useAppSelector((state) => state.vehicles);
  const { routes } = useAppSelector((state) => state.routes);

  const [selectedTimeframe, setSelectedTimeframe] = useState("week");

  // Calculate comprehensive analytics
  const analytics = {
    // Trip Analytics
    totalTrips: trips.length,
    completedTrips: trips.filter((t) => t.status === "completed").length,
    activeTrips: trips.filter((t) => t.status === "ongoing").length,
    delayedTrips: trips.filter((t) => t.status === "delayed").length,

    // Trip Type Distribution
    morningTrips: trips.filter((t) => t.trip_type === "morning").length,
    afternoonTrips: trips.filter((t) => t.trip_type === "afternoon").length,
    eveningTrips: trips.filter((t) => t.trip_type === "evening").length,

    // Status Distribution
    scheduledTrips: trips.filter((t) => t.status === "scheduled").length,
    cancelledTrips: trips.filter((t) => t.status === "cancelled").length,

    // Entity Counts
    totalSchools: schools.length,
    totalParents: parents.length,
    totalDrivers: drivers.length,
    totalStudents: students.length,
    totalVehicles: vehicles.length,
    totalRoutes: routes.length,

    // Performance Metrics
    completionRate:
      trips.length > 0
        ? (
            (trips.filter((t) => t.status === "completed").length /
              trips.length) *
            100
          ).toFixed(1)
        : "0",
    delayRate:
      trips.length > 0
        ? (
            (trips.filter((t) => t.status === "delayed").length /
              trips.length) *
            100
          ).toFixed(1)
        : "0",
    cancellationRate:
      trips.length > 0
        ? (
            (trips.filter((t) => t.status === "cancelled").length /
              trips.length) *
            100
          ).toFixed(1)
        : "0",
  };

  const recentTrips = [...trips]
    .sort(
      (a, b) =>
        new Date(b.created_at || "").getTime() -
        new Date(a.created_at || "").getTime()
    )
    .slice(0, 5);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "ongoing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "delayed":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics.completionRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.completedTrips} of {analytics.totalTrips} trips
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delay Rate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {analytics.delayRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.delayedTrips} delayed trips
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Operations
            </CardTitle>
            <Bus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {analytics.activeTrips}
            </div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fleet</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalVehicles}</div>
            <p className="text-xs text-muted-foreground">Available vehicles</p>
          </CardContent>
        </Card>
      </div>

      {/* Trip Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trip Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Trip Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Morning</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {analytics.morningTrips}
                  </span>
                  <Badge variant="outline">
                    {(
                      (analytics.morningTrips / analytics.totalTrips) *
                      100
                    ).toFixed(1)}
                    %
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Afternoon</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {analytics.afternoonTrips}
                  </span>
                  <Badge variant="outline">
                    {(
                      (analytics.afternoonTrips / analytics.totalTrips) *
                      100
                    ).toFixed(1)}
                    %
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Evening</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {analytics.eveningTrips}
                  </span>
                  <Badge variant="outline">
                    {(
                      (analytics.eveningTrips / analytics.totalTrips) *
                      100
                    ).toFixed(1)}
                    %
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Trip Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {analytics.completedTrips}
                  </span>
                  <Badge variant="outline">{analytics.completionRate}%</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {analytics.scheduledTrips}
                  </span>
                  <Badge variant="outline">
                    {(
                      (analytics.scheduledTrips / analytics.totalTrips) *
                      100
                    ).toFixed(1)}
                    %
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Delayed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {analytics.delayedTrips}
                  </span>
                  <Badge variant="outline">{analytics.delayRate}%</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Cancelled</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {analytics.cancelledTrips}
                  </span>
                  <Badge variant="outline">{analytics.cancellationRate}%</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Entity Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            School Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
           
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {analytics.totalStudents}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                Students
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {analytics.totalParents}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">
                Parents
              </div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {analytics.totalDrivers}
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-400">
                Drivers
              </div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {analytics.totalVehicles}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">
                Vehicles
              </div>
            </div>
            <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {analytics.totalRoutes}
              </div>
              <div className="text-sm text-indigo-600 dark:text-indigo-400">
                Routes
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Trip Activity
            </span>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTrips.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-foreground">
                  No recent trips
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Trip activity will appear here once trips are created.
                </p>
              </div>
            ) : (
              recentTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Bus className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{trip.route_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {trip.driver_name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(trip.status)}>
                      {trip.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {trip.created_at ? formatDate(trip.created_at) : "N/A"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Quick Analytics Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span>Performance Report</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="h-6 w-6" />
              <span>User Analytics</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <MapPin className="h-6 w-6" />
              <span>Route Analysis</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
