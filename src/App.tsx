import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ReduxProvider } from "./redux/provider";
import Login from "./pages/Login";
import { useAppSelector, useAppDispatch } from "./redux/hooks";
import { checkTokenExpiration, initializeAuth } from "./redux/slices/authSlice";
import { fetchSchools } from "./redux/slices/schoolsSlice";
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
import NotFound from "./pages/NotFound";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ErrorBoundary } from "react-error-boundary";
import React, { useEffect } from "react";
import { RootState } from "./redux/store";
import { useSelector } from "react-redux";

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
      dispatch(fetchSchools());
    }
  }, [token, isInitialized, dispatch]);

  // Log schools data
  React.useEffect(() => {
    if (schools && schools.length > 0) {
      console.log("Schools data:", schools);
    }
  }, [schools]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        }
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
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
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

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div
      role="alert"
      className="flex items-center justify-center min-h-screen p-4"
    >
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-xl font-bold text-red-600 mb-4">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-4">
          An unexpected error occurred. Please try refreshing the page.
        </p>
        <pre className="text-sm text-red-500 bg-red-50 p-3 rounded overflow-auto">
          {error.message}
        </pre>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ReduxProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AppContent />
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </QueryClientProvider>
      </ReduxProvider>
    </ErrorBoundary>
  );
}

export default App;
