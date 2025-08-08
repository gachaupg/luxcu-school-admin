import {
  Users,
  Building2,
  CreditCard,
  Settings,
  Home,
  BarChart3,
  Shield,
  Activity,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  DollarSign,
  MessageSquare,
  FileText,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const superAdminMenu = [
  { label: "Dashboard", icon: Home, href: "/super-admin" },
  { label: "Users", icon: Users, href: "/super-admin/users" },
  { label: "Schools", icon: Building2, href: "/super-admin/schools" },
  {
    label: "Subscriptions",
    icon: CreditCard,
    href: "/super-admin/subscriptions",
  },
  {
    label: "School Subscriptions",
    icon: CreditCard,
    href: "/super-admin/school-subscriptions",
  },
  {
    label: "Invoices",
    icon: FileText,
    href: "/super-admin/invoices",
  },
  {
    label: "Customer Support",
    icon: MessageSquare,
    href: "/super-admin/support",
  },
  { label: "Analytics", icon: BarChart3, href: "/super-admin/analytics" },
  { label: "Settings", icon: Settings, href: "/super-admin/settings" },
];

export function SuperAdminSidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/super-admin") {
      return location.pathname === "/super-admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <Link to="/super-admin">
        <div className="p-6 flex items-center gap-2">
          <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-2">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
          <span className="font-extrabold text-lg">
            <span className="text-black dark:text-white">Super</span>
            <span className="text-green-500">Admin</span>
          </span>
        </div>
      </Link>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4">
        <nav className="space-y-1">
          {superAdminMenu.map((item) => {
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

      {/* Quick Stats */}

      {/* Settings at the bottom */}
      <div className="p-4">
        <Link
          to="/super-admin/settings"
          className={`flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300 w-full ${
            isActive("/super-admin/settings")
              ? "bg-green-500/90 text-white"
              : ""
          }`}
        >
          <Settings
            size={20}
            className={
              isActive("/super-admin/settings")
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
