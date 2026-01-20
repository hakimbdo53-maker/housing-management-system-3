import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthProvider";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/Dashboard";
import Dates from "./pages/Dates";
import Instructions from "./pages/Instructions";
import Inquiry from "./pages/Inquiry";
import MyApplications from "./pages/MyApplications";
import NewApplication from "./pages/NewApplication";
import ApplicationForm from "./pages/ApplicationForm";
import NewStudentApplicationForm from "./pages/NewStudentApplicationForm";
import OldStudentApplicationForm from "./pages/OldStudentApplicationForm";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Fees from "./pages/Fees";
import Complaints from "./pages/Complaints";
import Notifications from "./pages/Notifications";
import { useAuth } from "./_core/hooks/useAuth";
import LoadingSpinner from "./components/LoadingSpinner";

function ProtectedRoute({ component: Component }: { component: React.ComponentType<any> }) {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen message="جاري التحميل..." />;
  }

  if (!user) {
    navigate('/login');
    // Return loading spinner instead of null to prevent blank screen
    return <LoadingSpinner fullScreen message="جاري إعادة التوجيه..." />;
  }

  return <Component />;
}

function Router() {
  const { user, loading } = useAuth();
  const [location, navigate] = useLocation();

  // Show loading spinner while checking auth
  if (loading) {
    return <LoadingSpinner fullScreen message="جاري التحميل..." />;
  }

  // Redirect logged-in users away from auth pages
  if (user && (location === '/login' || location === '/signup')) {
    navigate('/');
    // Return loading spinner to prevent blank screen during redirect
    return <LoadingSpinner fullScreen message="جاري إعادة التوجيه..." />;
  }

  return (
    <Switch>
      {/* Public Routes */}
      <Route path={"/login"} component={Login} />
      <Route path={"/signup"} component={Signup} />

      {/* Protected Routes */}
      <Route path={"/"} component={() => <ProtectedRoute component={Home} />} />
      <Route path={"/dashboard"} component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path={"/dates"} component={() => <ProtectedRoute component={Dates} />} />
      <Route path={"/instructions"} component={() => <ProtectedRoute component={Instructions} />} />
      <Route path={"/inquiry"} component={() => <ProtectedRoute component={Inquiry} />} />
      <Route path={"/my-applications"} component={() => <ProtectedRoute component={MyApplications} />} />
      <Route path={"/new-application"} component={() => <ProtectedRoute component={NewApplication} />} />
      <Route path={"/new-student-form"} component={() => <ProtectedRoute component={NewStudentApplicationForm} />} />
      <Route path={"/old-student-form"} component={() => <ProtectedRoute component={OldStudentApplicationForm} />} />
      <Route path={"/application-form/:type"} component={() => <ProtectedRoute component={ApplicationForm} />} />
      <Route path={"/profile"} component={() => <ProtectedRoute component={Profile} />} />
      <Route path={"/edit-profile"} component={() => <ProtectedRoute component={EditProfile} />} />
      <Route path={"/fees"} component={() => <ProtectedRoute component={Fees} />} />
      <Route path={"/complaints"} component={() => <ProtectedRoute component={Complaints} />} />
      <Route path={"/notifications"} component={() => <ProtectedRoute component={Notifications} />} />

      {/* 404 */}
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider
          defaultTheme="light"
        >
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
