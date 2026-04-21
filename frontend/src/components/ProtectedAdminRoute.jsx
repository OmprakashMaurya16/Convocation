import { Navigate } from "react-router-dom";
import AdminDashboard from "../pages/AdminDashboard";

export default function ProtectedAdminRoute() {
  // Get auth session from localStorage
  const authSession = localStorage.getItem("convocation.auth");

  if (!authSession) {
    // No token - redirect to login
    return <Navigate to="/login" replace />;
  }

  try {
    const auth = JSON.parse(authSession);
    const userRole = auth?.role?.toUpperCase();

    // Check if user is admin
    if (userRole !== "ADMIN") {
      // Not an admin - redirect to login
      return <Navigate to="/login" replace />;
    }

    // User is authenticated and is admin - allow access
    return <AdminDashboard />;
  } catch (error) {
    console.error("Error parsing auth session:", error);
    // Invalid session - redirect to login
    return <Navigate to="/login" replace />;
  }
}
