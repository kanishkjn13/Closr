import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore authenticated session on mount
  useEffect(() => {
    let isMounted = true;
    const initSession = async () => {
      try {
        const activeUser = await authService.getCurrentUser();
        if (isMounted) {
          setUser(activeUser);
        }
      } catch (err) {
        console.warn('Failed to restore authentication session', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const loginPatient = useCallback(async (credentials) => {
    setIsLoading(true);
    try {
      const loggedUser = await authService.patientLogin(credentials);
      setUser(loggedUser);
      return loggedUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signupPatient = useCallback(async (payload) => {
    setIsLoading(true);
    try {
      const newUser = await authService.patientSignup(payload);
      return newUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginAdmin = useCallback(async (credentials) => {
    setIsLoading(true);
    try {
      const staffUser = await authService.adminLogin(credentials);
      setUser(staffUser);
      return staffUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestPasswordReset = useCallback(async (email, portal = 'patient') => {
    return authService.requestPasswordReset(email, portal);
  }, []);

  const resetPassword = useCallback(async (payload) => {
    return authService.resetPassword(payload);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    userRole: user?.role || null,
    isPatient: user?.role === 'patient',
    isAdmin: user?.portal === 'admin' || ['super_admin', 'clinic_admin', 'doctor', 'receptionist', 'staff'].includes(user?.role),
    loginPatient,
    signupPatient,
    loginAdmin,
    requestPasswordReset,
    resetPassword,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
