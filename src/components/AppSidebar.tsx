import {
  Users,
  Map,
  Settings,
  FileText,
  Car,
  Home,
  CreditCard,
  Bell,
  Building2,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menu = [
  { label: "Overview", icon: Home, href: "/" },
  { label: "Parents", icon: Users, href: "/parents" },
  { label: "Students", icon: Users, href: "/students" },
  { label: "Drivers", icon: Users, href: "/drivers" },
  { label: "Vehicles", icon: Car, href: "/vehicles" },
  { label: "Routes", icon: Map, href: "/routes" },
  { label: "Trips", icon: Car, href: "/trips" },
  { label: "Staff", icon: Users, href: "/staff" },
  { label: "Reports", icon: FileText, href: "/reports" },
  { label: "Notifications", icon: Bell, href: "/notifications" },
  { label: "Subscription", icon: CreditCard, href: "/subscription" },
  {
    label: "School Subscriptions",
    icon: Building2,
    href: "/admin/school-subscription",
  },
];

export function AppSidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <Link to="/home">
        <div className="p-6 flex items-center gap-2">
          <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-2">
            <svg width="28" height="28" fill="none">
              <circle cx="14" cy="14" r="13" stroke="#22c55e" strokeWidth="2" />
              <path
                d="M14 9v7"
                stroke="#22c55e"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="14" cy="17.5" r="1.5" fill="#22c55e" />
            </svg>
          </div>
          <span className="font-extrabold text-lg">
            <span className="text-black dark:text-white">Lux</span>
            <span className="text-green-500">Cab</span>
          </span>
        </div>
      </Link>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4">
        <nav className="space-y-1">
          {menu.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  active
                    ? "bg-green-500/90 text-white"
                    : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <item.icon
                  size={20}
                  className={
                    active ? "text-white" : "text-gray-700 dark:text-gray-300"
                  }
                />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Settings at the bottom */}
      <div className="p-4">
        <Link
          to="/settings"
          className={`flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300 w-full ${
            isActive("/settings") ? "bg-green-500/90 text-white" : ""
          }`}
        >
          <Settings
            size={20}
            className={
              isActive("/settings")
                ? "text-white"
                : "text-gray-700 dark:text-gray-300"
            }
          />
          <span className="font-medium">Settings</span>
        </Link>
      </div>
    </div>
  );
}
