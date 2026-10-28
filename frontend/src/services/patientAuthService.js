import { patientService } from './patientService';
import { mockPatients } from '../data/mockPatients';

const PATIENT_SESSION_KEY = 'closr_patient_session_id';

/**
 * Service to manage simulated patient authentication and active session.
 * NOTE: This is a frontend demo authentication service with client-side storage.
 * It is not intended for real production security or identity verification.
 */
export const patientAuthService = {
  /**
   * Retrieves the currently active demo patient from localStorage.
   */
  async getActivePatient() {
    if (typeof window === 'undefined') return null;
    const storedId = localStorage.getItem(PATIENT_SESSION_KEY);
    if (!storedId) return null;

    try {
      const patient = await patientService.getPatientById(storedId);
      if (patient) return patient;
      // Fallback to static mock patients list if not in store
      const fallback = mockPatients.find((p) => p.id === storedId);
      return fallback || null;
    } catch (e) {
      console.warn('Error retrieving active patient session', e);
      return null;
    }
  },

  /**
   * Signs in a patient using an explicit demo patient ID.
   */
  async loginWithPatientId(patientId) {
    const patient = (await patientService.getPatientById(patientId)) || mockPatients.find((p) => p.id === patientId);
    if (!patient) {
      throw new Error(`Demo patient with ID "${patientId}" not found.`);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(PATIENT_SESSION_KEY, patient.id);
    }
    return patient;
  },

  /**
   * Signs in a patient by matching their phone number.
   */
  async loginWithPhone(phoneInput) {
    const cleanInput = phoneInput.replace(/[\s\-\(\)\+]/g, '').trim();
    if (!cleanInput) {
      throw new Error('Please enter a valid phone number.');
    }

    const allPatients = await patientService.getPatients();
    const matched = allPatients.find((p) => {
      const cleanPatientPhone = p.phone.replace(/[\s\-\(\)\+]/g, '').trim();
      return cleanPatientPhone.endsWith(cleanInput) || cleanInput.endsWith(cleanPatientPhone);
    });

    if (!matched) {
      throw new Error('No patient account found with this phone number. Please choose a demo patient or enter a registered number.');
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(PATIENT_SESSION_KEY, matched.id);
    }
    return matched;
  },

  /**
   * Clears the active demo session.
   */
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PATIENT_SESSION_KEY);
    }
  },

  /**
   * Returns all demo patients available for quick sign-in.
   */
  async getDemoPatients() {
    return patientService.getPatients();
  },
};
