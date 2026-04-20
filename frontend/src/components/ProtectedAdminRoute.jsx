import AdminDashboard from '../pages/AdminDashboard';

/**
 * ProtectedAdminRoute
 * 
 * This component should be used to protect the admin dashboard.
 * In production, implement proper authentication checks here.
 * 
 * Example usage:
 * <ProtectedAdminRoute>
 *   <AdminDashboard />
 * </ProtectedAdminRoute>
 */
export default function ProtectedAdminRoute() {
  // TODO: Add authentication check
  // const { user } = useAuth();
  // const isAdmin = user?.role === 'admin';
  
  // if (!isAdmin) {
  //   return <Navigate to="/login" replace />;
  // }

  return <AdminDashboard />;
}
