import { Navigate } from "react-router-dom";
import AdminDashboard from "../pages/AdminDashboard";

export default function ProtectedAdminRoute() {
  // Get auth session from localStorage
  const authSession = localStorage.getItem("convocation.auth");

  if (!authSession) {
    // No token - redirect to login
    return <Navigate to="/login" replace />;
  }

  let isAdmin = false;
  try {
    const auth = JSON.parse(authSession);
    const userRole = auth?.role?.toUpperCase();
    isAdmin = userRole === "ADMIN";
  } catch (error) {
    console.error("Error parsing auth session:", error);
    isAdmin = false;
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <AdminDashboard />;
}
