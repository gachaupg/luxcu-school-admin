
const trips = [
  {
    id: "PCK001",
    route: "Thika Road",
    datetime: "12.09.2019 - 12.53 PM",
    driver: "Paul Kuria",
    alerts: 1,
    status: "Ongoing",
  },
  {
    id: "PCK001",
    route: "Thika Road",
    datetime: "12.09.2019 - 12.53 PM",
    driver: "Paul Kuria",
    alerts: 1,
    status: "Completed",
  },
  {
    id: "PCK001",
    route: "Thika Road",
    datetime: "12.09.2019 - 12.53 PM",
    driver: "Paul Kuria",
    alerts: 1,
    status: "Abandoned",
  },
  {
    id: "PCK001",
    route: "Thika Road",
    datetime: "12.09.2019 - 12.53 PM",
    driver: "Paul Kuria",
    alerts: 1,
    status: "Completed",
  },
];

const statusMap: Record<
  string,
  { label: string; color: string; text: string }
> = {
  Ongoing: {
    label: "Ongoing",
    color: "bg-yellow-400 bg-opacity-20 text-yellow-700",
    text: "Ongoing",
  },
  Completed: {
    label: "Completed",
    color: "bg-green-400 bg-opacity-20 text-green-700",
    text: "Completed",
  },
  Abandoned: {
    label: "Abandoned",
    color: "bg-red-400 bg-opacity-20 text-red-700",
    text: "Abandoned",
  },
};

export function RecentTripsTable() {
  return (
    <div className="bg-white rounded-2xl shadow mt-8 p-6 animate-fade-in w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="text-xl font-bold text-gray-800">Recent Trips</div>
        <select className="border rounded-md px-3 py-1 text-sm">
          <option>October</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-left text-gray-500 font-medium bg-gray-50">
              <th className="py-2 px-4 rounded-l-xl">Trip ID</th>
              <th className="py-2 px-4">Route</th>
              <th className="py-2 px-4">Date - Time</th>
              <th className="py-2 px-4">Driver</th>
              <th className="py-2 px-4">Alerts</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4 rounded-r-xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip, i) => (
              <tr key={i} className="border-b last:border-b-0">
                <td className="py-2 px-4">{trip.id}</td>
                <td className="py-2 px-4">{trip.route}</td>
                <td className="py-2 px-4">{trip.datetime}</td>
                <td className="py-2 px-4">{trip.driver}</td>
                <td className="py-2 px-4">{trip.alerts}</td>
                <td className="py-2 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusMap[trip.status].color}`}
                  >
                    {statusMap[trip.status].text}
                  </span>
                </td>
                <td className="py-2 px-4 text-gray-400">
                  <button className="p-2 rounded-full hover:bg-gray-100 transition">
                    {/* actions... */} <svg width="16" height="16" fill="currentColor"><circle cx="3" cy="8" r="1"/><circle cx="8" cy="8" r="1"/><circle cx="13" cy="8" r="1"/></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
