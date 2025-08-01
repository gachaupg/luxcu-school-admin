import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ReduxProvider } from "./redux/provider";
import { ThemeProvider } from "./contexts/ThemeContext";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import SchoolRegistration from "./pages/SchoolRegistration";
import SubscriptionSelection from "./pages/SubscriptionSelection";
import Verification from "./pages/Verification";
import { useAppSelector, useAppDispatch } from "./redux/hooks";
import { checkTokenExpiration, initializeAuth } from "./redux/slices/authSlice";
import { fetchSchools, clearSchoolsError } from "./redux/slices/schoolsSlice";
import Index from "./pages/Index";
import Overview from "./pages/Overview";
import Trips from "./pages/Trips";
import RoutesPage from "./pages/Routes";
import Students from "./pages/Students";
import Staff from "./pages/Staff";
import Parents from "./pages/Parents";
import Drivers from "./pages/Drivers";
import Vehicles from "./pages/Vehicles";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Subscription from "./pages/Subscription";
import AdminSubscription from "./pages/admin/subscription.tsx";
import SchoolSubscriptionPage from "./pages/admin/schoolsubscription.tsx";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
// Super Admin imports
import SuperAdminLayout from "./pages/super-damin/SuperAdminLayout";
import SuperAdminDashboard from "./pages/super-damin/Dashboard";
import SuperAdminUsers from "./pages/super-damin/Users";
import SuperAdminSchools from "./pages/super-damin/Schools";
import SuperAdminSchoolDetails from "./pages/super-damin/SchoolDetails";
import SuperAdminSubscriptions from "./pages/super-damin/Subscriptions";
import SuperAdminSchoolSubscriptions from "./pages/super-damin/SchoolSubscriptions";
import SuperAdminInvoices from "./pages/super-damin/Invoices";
import SuperAdminCustomerSupport from "./pages/super-damin/CustomerSupport";
import SuperAdminAnalytics from "./pages/super-damin/Analytics";
import SuperAdminSettings from "./pages/super-damin/Settings";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "react-error-boundary";
import React, { useEffect } from "react";
import Dashboard from "./pages/super-damin/Dashboard.tsx";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, isInitialized } = useAppSelector((state) => state.auth);

  // Don't redirect until auth is initialized
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const dispatch = useAppDispatch();
  const { token, isInitialized, user } = useAppSelector((state) => state.auth);
  const {
    schools = [],
    loading,
    error,
  } = useAppSelector((state) => state.schools);

  const schoolId = schools.find((school) => school.admin === user?.id)?.id;

  // Debug logging
  console.log("App state:", {
    token: token ? "exists" : "null",
    isInitialized,
    user: user
      ? { id: user.id, name: `${user.first_name} ${user.last_name}` }
      : "null",
    schoolsCount: schools.length,
    schoolId,
    schoolsLoading: loading,
    schoolsError: error,
  });

  // Debug localStorage
  console.log("localStorage debug:", {
    persistAuth: localStorage.getItem("persist:auth"),
    directToken: localStorage.getItem("token"),
  });

  // Additional debugging
  useEffect(() => {
    console.log("=== AUTH DEBUG ===");
    console.log("localStorage keys:", Object.keys(localStorage));
    console.log("persist:auth raw:", localStorage.getItem("persist:auth"));
    console.log("token raw:", localStorage.getItem("token"));

    try {
      const persistAuth = localStorage.getItem("persist:auth");
      if (persistAuth) {
        const parsed = JSON.parse(persistAuth);
        console.log("parsed persist:auth:", parsed);
        if (parsed.token) {
          const tokenData = JSON.parse(parsed.token);
          console.log("parsed token:", tokenData);
        }
      }
    } catch (error) {
      console.error("Error parsing persist:auth:", error);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem("schoolId", schoolId?.toString() || "");
  }, [schoolId]);

  // Check token expiration every minute
  React.useEffect(() => {
    if (token && isInitialized) {
      const interval = setInterval(() => {
        dispatch(checkTokenExpiration());
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [token, isInitialized, dispatch]);

  // Fetch schools when component mounts and token is available
  React.useEffect(() => {
    if (token && isInitialized) {
      console.log(
        "Fetching schools with token:",
        token.substring(0, 20) + "..."
      );
      dispatch(fetchSchools()).catch((error) => {
        console.error("Failed to fetch schools:", error);
        // The API interceptor should handle token expiration automatically
      });
    }
  }, [token, isInitialized, dispatch]);

  // Log schools data
  React.useEffect(() => {
    if (schools && schools.length > 0) {
      console.log("Schools data:", schools);
    }
  }, [schools]);

  // Clear schools error when token becomes null (logout)
  React.useEffect(() => {
    if (!token && error) {
      dispatch(clearSchoolsError());
    }
  }, [token, error, dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Landing />} />
      <Route
        path="/subscription-selection"
        element={<SubscriptionSelection />}
      />
      <Route path="/register" element={<SchoolRegistration />} />
      <Route path="/verification" element={<Verification />} />
      <Route
        path="/"
        element={token ? <Index /> : <Navigate to="/home" replace />}
      >
        <Route index element={<Overview />} />
        <Route path="trips" element={<Trips />} />
        <Route path="routes" element={<RoutesPage />} />
        <Route path="students" element={<Students />} />
        <Route path="staff" element={<Staff />} />
        <Route path="parents" element={<Parents />} />
        <Route path="drivers" element={<Drivers />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="reports" element={<Reports />} />
        <Route path="subscription" element={<Subscription />} />
        <Route path="admin/subscription" element={<AdminSubscription />} />
        <Route
          path="admin/school-subscription"
          element={<SchoolSubscriptionPage />}
        />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Super Admin Routes */}
      <Route
        path="/super-admin"
        element={
          token ? <SuperAdminLayout /> : <Navigate to="/login" replace />
        }
      >
        <Route index element={<SuperAdminDashboard />} />
        <Route path="users" element={<SuperAdminUsers />} />
        <Route path="schools" element={<SuperAdminSchools />} />
        <Route path="schools/:id" element={<SuperAdminSchoolDetails />} />
        <Route path="subscriptions" element={<SuperAdminSubscriptions />} />
        <Route
          path="school-subscriptions"
          element={<SuperAdminSchoolSubscriptions />}
        />
        <Route path="invoices" element={<SuperAdminInvoices />} />
        <Route path="support" element={<SuperAdminCustomerSupport />} />
        <Route path="analytics" element={<SuperAdminAnalytics />} />
        <Route path="settings" element={<SuperAdminSettings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const AppContent = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={() => {
        // window.location.reload();
        return null;
      }}
    >
      <ReduxProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <AppContent />
              <Toaster />
            </TooltipProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </ReduxProvider>
    </ErrorBoundary>
  );
}

export default App;
