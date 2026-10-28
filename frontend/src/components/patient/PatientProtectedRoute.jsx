import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePatientAuth } from '../../context/PatientAuthContext';

export const PatientProtectedRoute = () => {
  const { isAuthenticated: mainAuth, user, isLoading: mainLoading } = useAuth();
  const { isAuthenticated: patientAuth, isLoading: patientLoading } = usePatientAuth();

  const isLoading = mainLoading && patientLoading;
  const isAuth = (mainAuth && user?.role === 'patient') || patientAuth;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-closr-bg flex flex-col items-center justify-center p-4">
        <div className="w-9 h-9 border-3 border-closr-forest/20 border-t-closr-forest rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium text-closr-text-muted">Loading your patient portal...</p>
      </div>
    );
  }

  if (!isAuth) {
    return <Navigate to="/patient/login" replace />;
  }

  return <Outlet />;
};
