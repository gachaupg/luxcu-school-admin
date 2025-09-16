import { Menu, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/slices/authSlice";
import { useTheme } from "@/contexts/ThemeContext";

interface AppNavbarProps {
  onMenuClick: () => void;
  isScrolled?: boolean;
}

const AppNavbar = ({ onMenuClick, isScrolled = false }: AppNavbarProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { notifications } = useSelector(
    (state: RootState) => state.notifications
  );
  const { isDark } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Determine if we should use black text (when background is white)
  const shouldUseBlackText = !isDark || isScrolled;

  return (
    <nav
      className={`bg-background border-b px-4 md:px-8 py-3 transition-colors duration-200 ${
        isScrolled ? "bg-white shadow-md" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md hover:bg-accent md:hidden"
          >
            <Menu
              className={`h-6 w-6 ${
                shouldUseBlackText ? "text-black" : "text-foreground"
              }`}
            />
          </button>
          <h1
            className={`text-xl font-semibold ${
              shouldUseBlackText ? "text-black" : "text-foreground"
            }`}
          >
            Hello, {user?.first_name} {user?.last_name}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate("/notifications")}
          >
            <Bell
              className={`h-5 w-5 ${shouldUseBlackText ? "text-black" : ""}`}
            />
            {notifications && notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {user?.first_name?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p
                    className={`text-sm font-medium ${
                      shouldUseBlackText ? "text-black" : ""
                    }`}
                  >
                    {user?.first_name || "User"}
                  </p>
                  <p
                    className={`text-xs ${
                      shouldUseBlackText
                        ? "text-gray-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {user?.user_type || "Admin"}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/terms-and-policies")}>
                Terms and Policies
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default AppNavbar;
