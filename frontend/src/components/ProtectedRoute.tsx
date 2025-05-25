import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireKyc?: boolean;
  requireStudent?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requireAuth = true,
  requireAdmin = false,
  requireKyc = false,
  requireStudent = false,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, isAdmin, isKycVerified, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Check if the user meets the requirements
  const isAuthorized =
    (!requireAuth || isAuthenticated) &&
    (!requireAdmin || isAdmin) &&
    (!requireKyc || isKycVerified) &&
    (!requireStudent || !isAdmin);

  // Redirect if not authorized
  if (!isAuthorized) {
    return <Navigate to={redirectTo} replace />;
  }

  // Render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
