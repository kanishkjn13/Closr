import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { patientAuthService } from '../services/patientAuthService';
import { patientService } from '../services/patientService';

const PatientAuthContext = createContext(null);

export const PatientAuthProvider = ({ children }) => {
  const [currentPatient, setCurrentPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    let isMounted = true;
    const initSession = async () => {
      try {
        const patient = await patientAuthService.getActivePatient();
        if (isMounted) {
          setCurrentPatient(patient);
        }
      } catch (err) {
        console.warn('Failed to restore patient session', err);
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

  const loginWithId = useCallback(async (patientId) => {
    setIsLoading(true);
    try {
      const patient = await patientAuthService.loginWithPatientId(patientId);
      setCurrentPatient(patient);
      return patient;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithPhone = useCallback(async (phone) => {
    setIsLoading(true);
    try {
      const patient = await patientAuthService.loginWithPhone(phone);
      setCurrentPatient(patient);
      return patient;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    patientAuthService.logout();
    setCurrentPatient(null);
  }, []);

  const refreshPatient = useCallback(async () => {
    if (!currentPatient?.id) return null;
    const updated = await patientService.getPatientById(currentPatient.id);
    if (updated) {
      setCurrentPatient(updated);
    }
    return updated;
  }, [currentPatient?.id]);

  const value = {
    currentPatient,
    isLoading,
    loginWithId,
    loginWithPhone,
    logout,
    refreshPatient,
    isAuthenticated: Boolean(currentPatient),
  };

  return <PatientAuthContext.Provider value={value}>{children}</PatientAuthContext.Provider>;
};

export const usePatientAuth = () => {
  const context = useContext(PatientAuthContext);
  if (!context) {
    throw new Error('usePatientAuth must be used within a PatientAuthProvider');
  }
  return context;
};
