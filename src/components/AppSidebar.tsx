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
          <img className="w-40 h-30 ml-6" src="https://res.cloudinary.com/pitz/image/upload/v1755753463/shuletrack_landscape_logo_wfussl.png" alt="shuletrack" />
      </Link>

      {/* Navigation */}
      <div className="flex-1 mt-5 overflow-y-auto px-4">
        <nav className="space-y-1">
          {menu.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  active
                    ? "bg-[#f7c624] text-white"
                    : "text-[#10213f] dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
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
            isActive("/settings") ? "text-white" : ""
          }`}
          style={{
            backgroundColor: isActive("/settings") ? '#f7c624' : undefined,
          }}
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
