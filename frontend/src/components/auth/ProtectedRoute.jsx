import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Route guard for protecting portal routes based on portal type ('patient' | 'admin').
 */
export const ProtectedRoute = ({ portal = 'admin' }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-closr-bg flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-3 border-closr-forest/20 border-t-closr-forest rounded-full animate-spin mb-3" />
        <p className="text-xs font-medium text-closr-text-muted">Authenticating session...</p>
      </div>
    );
  }

  // Not authenticated at all
  if (!isAuthenticated || !user) {
    const redirectPath = portal === 'patient' ? '/patient/login' : '/admin/login';
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // If attempting to access patient portal with an admin/staff account
  if (portal === 'patient' && user.role !== 'patient') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If attempting to access admin portal with a patient account
  if (portal === 'admin' && user.role === 'patient') {
    return <Navigate to="/patient/dashboard" replace />;
  }

  return <Outlet />;
};
