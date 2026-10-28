import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './context/AuthContext';
import { PatientAuthProvider } from './context/PatientAuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Public Landing & Legal Pages
import { LandingPage } from './pages/LandingPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';

// Public Kiosk
import { ReceptionistPage } from './pages/ReceptionistPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin / Staff Authentication Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminForgotPasswordPage } from './pages/admin/AdminForgotPasswordPage';

// Admin Operations Dashboard & Modules
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { PatientsPage } from './pages/PatientsPage';
import { MessagesPage } from './pages/MessagesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { BreakItPage } from './pages/BreakItPage';

// Patient Portal Pages & Layout
import { PatientLoginPage } from './pages/patient/PatientLoginPage';
import { PatientSignupPage } from './pages/patient/PatientSignupPage';
import { PatientForgotPasswordPage } from './pages/patient/PatientForgotPasswordPage';
import { PatientResetPasswordPage } from './pages/patient/PatientResetPasswordPage';
import { PatientLayout } from './components/patient/PatientLayout';
import { PatientDashboardPage } from './pages/patient/PatientDashboardPage';
import { PatientAppointmentsPage } from './pages/patient/PatientAppointmentsPage';
import { PatientMessagesPage } from './pages/patient/PatientMessagesPage';
import { PatientProfilePage } from './pages/patient/PatientProfilePage';

export const App = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <PatientAuthProvider>
          <BrowserRouter>
            <Routes>
              {/* 1. Public Closr Landing Page (Default Root URL) */}
              <Route path="/" element={<LandingPage />} />

              {/* 2. Public Informational & Kiosk Routes */}
              <Route path="/receptionist" element={<ReceptionistPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />

              {/* 3. Patient Authentication Public Routes */}
              <Route path="/patient/login" element={<PatientLoginPage />} />
              <Route path="/patient/signup" element={<PatientSignupPage />} />
              <Route path="/patient/forgot-password" element={<PatientForgotPasswordPage />} />
              <Route path="/patient/reset-password" element={<PatientResetPasswordPage />} />

              {/* 4. Patient Portal Protected Routes */}
              <Route path="/patient" element={<ProtectedRoute portal="patient" />}>
                <Route element={<PatientLayout />}>
                  <Route index element={<Navigate to="/patient/dashboard" replace />} />
                  <Route path="dashboard" element={<PatientDashboardPage />} />
                  <Route path="appointments" element={<PatientAppointmentsPage />} />
                  <Route path="messages" element={<PatientMessagesPage />} />
                  <Route path="profile" element={<PatientProfilePage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Route>

              {/* 5. Admin Authentication Public Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/forgot-password" element={<AdminForgotPasswordPage />} />
              <Route path="/admin/reset-password" element={<Navigate to="/admin/login" replace />} />

              {/* 6. Admin / Staff Operations Protected Dashboard Shell */}
              <Route element={<ProtectedRoute portal="admin" />}>
                <Route path="/admin" element={<AppLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<HomePage />} />
                  <Route path="break-it" element={<BreakItPage />} />
                  <Route path="appointments" element={<AppointmentsPage />} />
                  <Route path="patients" element={<PatientsPage />} />
                  <Route path="messages" element={<MessagesPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>

                {/* Legacy Direct Aliases to support all internal links */}
                <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/break-it" element={<Navigate to="/admin/break-it" replace />} />
                <Route path="/appointments" element={<Navigate to="/admin/appointments" replace />} />
                <Route path="/patients" element={<Navigate to="/admin/patients" replace />} />
                <Route path="/messages" element={<Navigate to="/admin/messages" replace />} />
                <Route path="/analytics" element={<Navigate to="/admin/analytics" replace />} />
                <Route path="/settings" element={<Navigate to="/admin/settings" replace />} />
                <Route path="/notifications" element={<Navigate to="/admin/notifications" replace />} />
              </Route>

              {/* Fallback 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </PatientAuthProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
