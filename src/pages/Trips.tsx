import { SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/AppSidebar";
import { HeaderBar } from "../components/HeaderBar";
import { MoreVertical } from "lucide-react";

const trips = [
  {
    id: "PCK001",
    route: "Thika Road",
    total: 34,
    picked: 33,
    type: "Pickup",
    alerts: 0,
    status: "Ongoing",
  },
  {
    id: "PCK002",
    route: "Thika Road",
    total: 34,
    picked: 33,
    type: "Pickup",
    alerts: 1,
    status: "Completed",
  },
  {
    id: "PCK003",
    route: "Thika Road",
    total: 34,
    picked: 33,
    type: "Pickup",
    alerts: 3,
    status: "Completed",
  },
  {
    id: "DRP004",
    route: "Thika Road",
    total: 34,
    picked: 33,
    type: "Drop-off",
    alerts: 0,
    status: "Completed",
  },
  {
    id: "DRP005",
    route: "Thika Road",
    total: 34,
    picked: 33,
    type: "Drop-off",
    alerts: 2,
    status: "Completed",
  },
  {
    id: "DRP006",
    route: "Thika Road",
    total: 34,
    picked: 33,
    type: "Drop-off",
    alerts: 0,
    status: "Completed",
  },
  {
    id: "PCK007",
    route: "Thika Road",
    total: 34,
    picked: 33,
    type: "Pickup",
    alerts: 0,
    status: "Abandoned",
  },
  {
    id: "PCK008",
    route: "Thika Road",
    total: 34,
    picked: 33,
    type: "Pickup",
    alerts: 0,
    status: "Completed",
  },
  {
    id: "DRP009",
    route: "Thika Road",
    total: 34,
    picked: 33,
    type: "Pickup",
    alerts: 0,
    status: "Completed",
  },
  {
    id: "DRP010",
    route: "Thika Road",
    total: 34,
    picked: 33,
    type: "Pickup",
    alerts: 0,
    status: "Completed",
  },
];

const stats = [
  { label: "Total Trips", value: 302 },
  { label: "Pickups", value: 152 },
  { label: "Drop-offs", value: 150 },
];

function StatusBadge({ status }) {
  const color =
    status === "Ongoing"
      ? "bg-yellow-400 text-white"
      : status === "Completed"
      ? "bg-teal-500 text-white"
      : "bg-red-400 text-white";
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
      {status}
    </span>
  );
}

export default function Trips() {
  return (
      <div className="min-h-screen bg-gray-100 flex w-full">
        {/* Sidebar */}
       
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="flex-1 px-8 py-6 bg-gray-100">
            {/* All Trips Title and Stats Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
              <h3 className="text-lg font-semibold">All Trips</h3>
              <div className="flex gap-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-green-500">
                      {stat.value}
                    </span>
                    <span className="text-gray-500 text-sm">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* All Trips Table */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 rounded-t-lg">
                      <th className="px-4 py-2 text-left font-semibold">
                        Trip ID
                      </th>
                      <th className="px-4 py-2 text-left font-semibold">
                        Route
                      </th>
                      <th className="px-4 py-2 text-left font-semibold">
                        Total Students
                      </th>
                      <th className="px-4 py-2 text-left font-semibold">
                        Picked/ Dropped
                      </th>
                      <th className="px-4 py-2 text-left font-semibold">
                        Trip Type
                      </th>
                      <th className="px-4 py-2 text-left font-semibold">
                        Alerts
                      </th>
                      <th className="px-4 py-2 text-left font-semibold">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {trips.map((trip) => (
                      <tr key={trip.id} className="border-b last:border-b-0">
                        <td className="px-4 py-3">{trip.id}</td>
                        <td className="px-4 py-3">{trip.route}</td>
                        <td className="px-4 py-3">{trip.total}</td>
                        <td className="px-4 py-3">{trip.picked}</td>
                        <td className="px-4 py-3">{trip.type}</td>
                        <td className="px-4 py-3">{trip.alerts}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={trip.status} />
                        </td>
                        <td className="px-4 py-3">
                          <button>
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="flex justify-between items-center mt-4 text-gray-600 text-sm">
                <span>Showing 1-10 of 1,253</span>
                <div className="flex gap-2">
                  <button className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100">
                    &lt;
                  </button>
                  <button className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100">
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
  );
}
