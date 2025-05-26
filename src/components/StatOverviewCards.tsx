
import { Car, Users, Route } from "lucide-react";

const overviewStats = [
  {
    title: "Trips Today",
    value: 12,
    subtitle: "45 expected trips today",
    color: "bg-indigo-100 text-indigo-600",
    accent: "text-green-500",
    icon: Car,
  },
  {
    title: "Students Picked",
    value: 267,
    subtitle: "353 expected today",
    color: "bg-yellow-100 text-yellow-600",
    accent: "text-green-500",
    icon: Users,
  },
  {
    title: "Total Vehicles",
    value: 18,
    subtitle: "",
    color: "bg-green-100 text-green-600",
    accent: "",
    icon: Car,
  },
  {
    title: "Active Routes",
    value: 19,
    subtitle: "",
    color: "bg-red-100 text-red-400",
    accent: "",
    icon: Route,
  },
];

export function StatOverviewCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full mt-4">
      {overviewStats.map((stat, idx) => (
        <div
          key={stat.title}
          className="rounded-2xl bg-white shadow p-6 flex gap-4 items-center min-w-0 animate-fade-in"
        >
          <div className={`rounded-xl w-12 h-12 flex items-center justify-center ${stat.color}`}>
            <stat.icon size={28} />
          </div>
          <div>
            <div className="font-bold text-2xl">{stat.value}</div>
            <div className="font-medium text-gray-600">{stat.title}</div>
            {stat.subtitle && (
              <div className={`text-sm mt-1 ${stat.accent}`}>{stat.subtitle}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

