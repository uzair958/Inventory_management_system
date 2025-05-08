import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Component to protect routes that should only be accessible by admins
const AdminRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Check if user is authenticated and has admin role
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If user is not an admin, redirect to dashboard
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  // User is authenticated and is an admin
  return <Outlet />;
};

export default AdminRoute;
