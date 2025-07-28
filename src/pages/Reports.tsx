import {
  FileText,
  Search,
  Calendar,
  ChevronDown,
  Play,
  AlertTriangle,
  Users,
  Clock,
  TrendingUp,
  Shield,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import {
  fetchReports,
  setFilters,
  clearFilters,
  ReportsFilters,
} from "../redux/slices/reportsSlice";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function StatusPill({ status }: { status: string | null | undefined }) {
  // Handle null or undefined status
  if (!status) {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
        Unknown
      </span>
    );
  }

  let color = "";
  if (status === "ongoing") color = "bg-yellow-200 text-yellow-800";
  else if (status === "completed") color = "bg-green-100 text-green-700";
  else if (status === "cancelled") color = "bg-red-100 text-red-600";
  else if (status === "delayed") color = "bg-orange-100 text-orange-700";
  else color = "bg-gray-100 text-gray-600"; // Default for unknown status

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string; size?: number | string }>;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  const dispatch = useDispatch<AppDispatch>();
  const { reports, metrics, pagination, loading, error } = useSelector(
    (state: RootState) => state.reports
  );

  const [query, setQuery] = useState("");
  const [filters, setLocalFilters] = useState<ReportsFilters>({
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    // Fetch reports on component mount
    dispatch(fetchReports(filters));
  }, [dispatch]);

  const handleFilterChange = (
    key: keyof ReportsFilters,
    value: string | number
  ) => {
    const newFilters = { ...filters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleRunQuery = () => {
    dispatch(fetchReports(filters));
  };

  const handleClearFilters = () => {
    setLocalFilters({
      start_date: "",
      end_date: "",
    });
    dispatch(clearFilters());
    dispatch(fetchReports({}));
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const date = new Date(timeString);
    return date.toLocaleString();
  };

  const formatDuration = (minutes: number | null | undefined) => {
    if (minutes === null || minutes === undefined) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatSpeed = (speed: number | null | undefined) => {
    if (speed === null || speed === undefined) return "N/A";
    return `${speed.toFixed(1)} km/h`;
  };

  const formatDistance = (meters: number | null | undefined) => {
    if (meters === null || meters === undefined) return "N/A";
    return `${(meters / 1000).toFixed(2)} km`;
  };

  const parseDurationToMinutes = (durationStr: string): number | null => {
    if (!durationStr) return null;

    // Parse format like "1:00:00" or "0:00:07.871421"
    const parts = durationStr.split(":");
    if (parts.length < 2) return null;

    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseFloat(parts[2]) || 0;

    return hours * 60 + minutes + seconds / 60;
  };

  return (
    <div className="p-8">
      <div className="mb-4 flex items-center gap-3">
        <FileText className="text-green-500" size={32} />
        <h2 className="text-2xl font-bold text-gray-800">Reports</h2>
      </div>

      {/* Search/Filter Bar */}
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <div className="flex items-center bg-white rounded-full px-4 py-2 shadow w-80 border border-gray-200">
          <Search className="text-gray-400 mr-2" size={18} />
          <input
            className="outline-none bg-transparent flex-1 text-sm placeholder-gray-400"
            placeholder="Search reports, trips, students..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow border border-gray-200">
          <span className="text-xs text-gray-500 mr-1">From:</span>
          <Calendar className="text-gray-400 mr-1" size={16} />
          <input
            type="date"
            className="text-xs bg-transparent outline-none w-28"
            value={filters.start_date}
            onChange={(e) => handleFilterChange("start_date", e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow border border-gray-200">
          <span className="text-xs text-gray-500 mr-1">To:</span>
          <Calendar className="text-gray-400 mr-1" size={16} />
          <input
            type="date"
            className="text-xs bg-transparent outline-none w-28"
            value={filters.end_date}
            onChange={(e) => handleFilterChange("end_date", e.target.value)}
          />
        </div>
        <button
          className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-6 py-2 flex items-center gap-2 text-sm font-semibold shadow"
          onClick={handleRunQuery}
          disabled={loading}
        >
          {loading ? "Loading..." : "Run Query"} <Play size={16} />
        </button>
        <button
          className="bg-gray-500 hover:bg-gray-600 text-white rounded-lg px-4 py-2 text-sm font-semibold shadow"
          onClick={handleClearFilters}
        >
          Clear Filters
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Reports"
            value={metrics.summary.total_reports}
            icon={FileText}
            color="bg-blue-500"
          />
          <MetricCard
            title="Completion Rate"
            value={`${metrics.summary.completion_rate}%`}
            icon={TrendingUp}
            color="bg-green-500"
          />
          <MetricCard
            title="Students Picked Up"
            value={metrics.students.total_picked_up}
            icon={Users}
            color="bg-purple-500"
          />
          <MetricCard
            title="Emergencies"
            value={metrics.safety.total_emergencies}
            icon={AlertTriangle}
            color="bg-red-500"
          />
        </div>
      )}

      {/* Performance Metrics */}
      {metrics && (
        <div className="bg-white rounded-xl shadow p-6 mb-8 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Performance Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Avg Efficiency Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.performance.avg_efficiency_score.toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">On-time Pickup Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.performance.on_time_pickup_rate.toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">On-time Dropoff Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.performance.on_time_dropoff_rate.toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Duration Efficiency</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.performance.duration_efficiency.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Trip Reports</h3>
          {pagination && (
            <p className="text-sm text-gray-600 mt-1">
              Showing {reports.length} of {pagination.total_reports} reports
            </p>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="text-gray-400 mx-auto mb-2" size={48} />
            <p className="text-gray-600">No reports found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600">
                  <th className="px-6 py-3 text-left">Trip ID</th>
                  <th className="px-6 py-3 text-left">Route</th>
                  <th className="px-6 py-3 text-left">School</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Students</th>
                  <th className="px-6 py-3 text-left">Efficiency</th>
                  <th className="px-6 py-3 text-left">Duration</th>
                  <th className="px-6 py-3 text-left">Max Speed</th>
                  <th className="px-6 py-3 text-left">Generated</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium">{report.trip}</td>
                    <td className="px-6 py-4">{report.trip_route || "N/A"}</td>
                    <td className="px-6 py-4">{report.school_name || "N/A"}</td>
                    <td className="px-6 py-4">
                      <StatusPill
                        status={report.is_complete ? "completed" : "ongoing"}
                      />
                    </td>
                    <td className="px-6 py-4">
                      {report.students_picked_up}/{report.total_students}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-semibold ${
                          report.efficiency_score >= 80
                            ? "text-green-600"
                            : report.efficiency_score >= 60
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {report.efficiency_score}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {formatDuration(
                        report.actual_duration_str
                          ? parseDurationToMinutes(report.actual_duration_str)
                          : null
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {formatSpeed(report.max_speed)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatTime(report.generated_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="text-sm text-gray-600">
            Page {pagination.current_page} of {pagination.total_pages}
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
              disabled={!pagination.has_previous}
              onClick={() =>
                dispatch(
                  fetchReports({
                    ...filters,
                    page: pagination.previous_page,
                  })
                )
              }
            >
              Previous
            </button>
            <button
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
              disabled={!pagination.has_next}
              onClick={() =>
                dispatch(
                  fetchReports({ ...filters, page: pagination.next_page })
                )
              }
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
