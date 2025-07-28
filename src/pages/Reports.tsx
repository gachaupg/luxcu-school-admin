import { SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/AppSidebar";
import { HeaderBar } from "../components/HeaderBar";
import { FileText, Search, Calendar, ChevronDown, Play } from "lucide-react";
import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Trips from "./reports_trip";

const mockTrips = [
  {
    id: "PCK001",
    route: "Thika Road",
    total: 34,
    picked: 33,
    type: "Pickup",
    alerts: 0,
    status: "Completed",
  },
  {
    id: "PCK008",
    route: "Thika Road",
    total: 34,
    picked: 33,
    type: "Pickup",
    alerts: 2,
    status: "Completed",
  },
  {
    id: "PCK010",
    route: "Thika Road",
    total: 34,
    picked: 33,
    type: "Pickup",
    alerts: 0,
    status: "Completed",
  },
];

const tripTrendsData = [
  { time: "6:00 am - 7:30 am", Abandoned: 15, Completed: 60 },
  { time: "7:30 am - 9:00 am", Abandoned: 25, Completed: 80 },
  { time: "3:30 pm - 5:00 pm", Abandoned: 10, Completed: 70 },
  { time: "5:00 pm - 7:30 pm", Abandoned: 20, Completed: 90 },
];

const recentTrips = [
  {
    id: "PCK001",
    route: "Thika Road",
    date: "12.09.2019 - 12.53 PM",
    driver: "Paul Kuria",
    alerts: 1,
    status: "Ongoing",
  },
  {
    id: "PCK001",
    route: "Thika Road",
    date: "12.09.2019 - 12.53 PM",
    driver: "Paul Kuria",
    alerts: 1,
    status: "Completed",
  },
  {
    id: "PCK001",
    route: "Thika Road",
    date: "12.09.2019 - 12.53 PM",
    driver: "Paul Kuria",
    alerts: 1,
    status: "Abandoned",
  },
  {
    id: "PCK001",
    route: "Thika Road",
    date: "12.09.2019 - 12.53 PM",
    driver: "Paul Kuria",
    alerts: 1,
    status: "Completed",
  },
  {
    id: "PCK001",
    route: "Thika Road",
    date: "12.09.2019 - 12.53 PM",
    driver: "Paul Kuria",
    alerts: 1,
    status: "Completed",
  },
  {
    id: "PCK001",
    route: "Thika Road",
    date: "12.09.2019 - 12.53 PM",
    driver: "Paul Kuria",
    alerts: 1,
    status: "Completed",
  },
];

function StatusPill({ status }: { status: string }) {
  let color = "";
  if (status === "Ongoing") color = "bg-yellow-200 text-yellow-800";
  else if (status === "Completed") color = "bg-green-100 text-green-700";
  else if (status === "Abandoned") color = "bg-red-100 text-red-600";
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
      {status}
    </span>
  );
}

export default function Reports() {
  const [query, setQuery] = useState("");
  return (
      <div className="min-h-screen bg-gray-100 flex w-full">
        {/* Sidebar */}
      
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="flex-1 px-8 py-6 bg-gray-100">
            <div className="mb-4 flex items-center gap-3">
              <FileText className="text-green-500" size={32} />
              <h2 className="text-2xl font-bold text-gray-800">Reports</h2>
            </div>
            {/* Search/Filter Bar */}
            <div className="flex flex-wrap gap-4 items-center mb-4">
              <div className="flex items-center bg-white rounded-full px-4 py-2 shadow w-80 border border-gray-200">
                <Search className="text-gray-400 mr-2" size={18} />
                <input
                  className="outline-none bg-transparent flex-1 text-sm placeholder-gray-400"
                  placeholder="Search a query, trip, student, etc..."
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
                />
              </div>
              <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow border border-gray-200">
                <span className="text-xs text-gray-500 mr-1">To:</span>
                <Calendar className="text-gray-400 mr-1" size={16} />
                <input
                  type="date"
                  className="text-xs bg-transparent outline-none w-28"
                />
              </div>
              <div className="flex items-center bg-white rounded-lg px-4 py-2 shadow border border-gray-200 cursor-pointer min-w-[110px]">
                <span className="text-xs text-gray-500 mr-1">Driver</span>
                <ChevronDown className="text-gray-400" size={16} />
              </div>
              <div className="flex items-center bg-white rounded-lg px-4 py-2 shadow border border-gray-200 cursor-pointer min-w-[110px]">
                <span className="text-xs text-gray-500 mr-1">Route</span>
                <ChevronDown className="text-gray-400" size={16} />
              </div>
              <button className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-6 py-2 flex items-center gap-2 text-sm font-semibold shadow ml-auto">
                Run Query <Play size={16} />
              </button>
            </div>
            {/* Trip Results Table */}
            <div className="bg-white rounded-xl shadow p-0 mb-8 border border-gray-200">
            <Trips/>
             
             
            
            </div>
            {/* Tab Navigation */}
            <div className="flex items-center gap-8 border-b border-gray-200 mb-8 px-2">
              <button className="text-green-600 font-semibold border-b-2 border-green-600 px-1 pb-2">
                Trip Reports
              </button>
              <button className="text-gray-500 font-medium hover:text-green-600 transition px-1 pb-2">
                Delay Reports
              </button>
              <button className="text-gray-500 font-medium hover:text-green-600 transition px-1 pb-2">
                SOS Reports
              </button>
              <button className="text-gray-500 font-medium hover:text-green-600 transition px-1 pb-2">
                Student Attendance
              </button>
              <button className="text-gray-500 font-medium hover:text-green-600 transition px-1 pb-2">
                Parent Engagement
              </button>
            </div>
            {/* Trip Trends Chart */}
            <div className="bg-white rounded-xl shadow p-6 mb-8 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  Trip Trends
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">October</span>
                  <ChevronDown className="text-gray-400" size={16} />
                </div>
              </div>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={tripTrendsData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 12, fill: "#888" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#888" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="Abandoned"
                      stackId="1"
                      stroke="#fb7185"
                      fill="#fca5a5"
                      fillOpacity={0.5}
                    />
                    <Area
                      type="monotone"
                      dataKey="Completed"
                      stackId="1"
                      stroke="#a78bfa"
                      fill="#a78bfa"
                      fillOpacity={0.4}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-6 mt-2 ml-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-pink-400 inline-block"></span>
                  <span className="text-xs text-gray-600">Abandoned</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-300 inline-block"></span>
                  <span className="text-xs text-gray-600">Completed</span>
                </div>
              </div>
            </div>
            {/* Recent Trips Table */}
            <div className="bg-white rounded-xl shadow p-6 border border-gray-200 mb-8">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  Recent Trips
                </h3>
                <div className="flex items-center gap-2 bg-gray-50 rounded px-3 py-1 border border-gray-200">
                  <span className="text-xs text-gray-500">October</span>
                  <ChevronDown className="text-gray-400" size={16} />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600">
                      <th className="px-4 py-2 text-left">Trip ID</th>
                      <th className="px-4 py-2 text-left">Route</th>
                      <th className="px-4 py-2 text-left">Date - Time</th>
                      <th className="px-4 py-2 text-left">Driver</th>
                      <th className="px-4 py-2 text-left">Alerts</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTrips.map((trip, i) => (
                      <tr
                        key={i}
                        className="border-b last:border-0 hover:bg-gray-50"
                      >
                        <td className="px-4 py-2">{trip.id}</td>
                        <td className="px-4 py-2">{trip.route}</td>
                        <td className="px-4 py-2">{trip.date}</td>
                        <td className="px-4 py-2">{trip.driver}</td>
                        <td className="px-4 py-2">{trip.alerts}</td>
                        <td className="px-4 py-2">
                          <StatusPill status={trip.status} />
                        </td>
                        <td className="px-4 py-2 text-gray-400 text-xl font-bold cursor-pointer">
                          &#8942;
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
  );
}
