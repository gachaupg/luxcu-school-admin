import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ReduxProvider } from "./redux/provider";
import Login from "./pages/Login";
import { useAppSelector, useAppDispatch } from "./redux/hooks";
import { checkTokenExpiration } from "./redux/slices/authSlice";
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
  const { token } = useAppSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);
  const {
    schools = [],
    loading,
    error,
  } = useAppSelector((state) => state.schools);

  const { user } = useSelector((state: RootState) => state.auth);
  const schoolId = schools.find((school) => school.admin === user?.id)?.id;
  console.log("schools on main app", schoolId);

  useEffect(() => {
    localStorage.setItem("schoolId", schoolId?.toString() || "");
  }, [schoolId]);

  // Check log token expiration every minute
  React.useEffect(() => {
    if (token) {
      const interval = setInterval(() => {
        dispatch(checkTokenExpiration());
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [token, dispatch]);

  // Fetch schools when component mounts
  React.useEffect(() => {
    if (token) {
      dispatch(fetchSchools());
    }
  }, [token, dispatch]);

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

// function ErrorFallback({ error }: { error: Error }) {
//   return (
//     // <div role="alert" className="p-4">
//     //   <p>Something went wrong:</p>
//     //   <pre className="text-red-500">{error.message}</pre>
//     // </div>
//   );
// }

function App() {
  return (
    // <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ReduxProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AppContent />
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </QueryClientProvider>
      </ReduxProvider>
    // </ErrorBoundary>
  );
}

export default App;
