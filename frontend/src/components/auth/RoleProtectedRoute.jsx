import React from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

/**
 * Route guard enforcing role permissions for clinic staff.
 */
export const RoleProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-4">
        <div className="w-8 h-8 border-3 border-closr-forest/20 border-t-closr-forest rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  const hasPermission = allowedRoles.length === 0 || allowedRoles.includes(user.role);

  if (!hasPermission) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-closr-card rounded-3xl border border-closr-border shadow-soft text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-closr-danger-bg text-closr-danger flex items-center justify-center mx-auto">
          <ShieldX className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="font-serif font-bold text-xl text-closr-text">
            Access Restricted
          </h2>
          <p className="text-xs text-closr-text-muted leading-relaxed max-w-sm mx-auto">
            Your current staff role (<span className="font-semibold text-closr-text capitalize">{user.role}</span>) does not have authorization to view this clinical administration section.
          </p>
        </div>
        <div className="pt-2">
          <Link to="/">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Return to Operations Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
