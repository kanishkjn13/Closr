import { patientService } from './patientService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const SESSION_STORAGE_KEY = 'closr_auth_session';

/**
 * Pre-seeded authorized clinic staff for local development when real backend is offline.
 * NOTE: In production, all credentials, bcrypt password hashes, and JWT tokens
 * MUST be validated on the backend server.
 */
export const DEMO_STAFF_ACCOUNTS = [
  {
    id: 'staff-1',
    email: 'admin@sharmaclinic.in',
    name: 'Dr. Sharma',
    role: 'clinic_admin',
    portal: 'admin',
    title: 'Chief Physician & Clinic Director',
  },
  {
    id: 'staff-2',
    email: 'reception@sharmaclinic.in',
    name: 'Priya Nair',
    role: 'receptionist',
    portal: 'admin',
    title: 'Head Receptionist & Triage Desk',
  },
  {
    id: 'staff-3',
    email: 'doctor.patel@sharmaclinic.in',
    name: 'Dr. Patel',
    role: 'doctor',
    portal: 'admin',
    title: 'Consulting Pediatrician',
  },
];

/**
 * Pre-seeded demo patient login accounts mapped to existing clinic patient IDs.
 */
export const DEMO_PATIENT_ACCOUNTS = [
  {
    id: 'pat-3',
    email: 'rohit.verma@example.com',
    name: 'Rohit V.',
    phone: '+91 98450 12789',
    role: 'patient',
    portal: 'patient',
  },
  {
    id: 'pat-1',
    email: 'anita.m@example.com',
    name: 'Anita M.',
    phone: '+91 98201 44521',
    role: 'patient',
    portal: 'patient',
  },
  {
    id: 'pat-2',
    email: 'imran.s@example.com',
    name: 'Imran S.',
    phone: '+91 97112 89340',
    role: 'patient',
    portal: 'patient',
  },
  {
    id: 'pat-4',
    email: 'pooja.d@example.com',
    name: 'Pooja D.',
    phone: '+91 99203 55671',
    role: 'patient',
    portal: 'patient',
  },
];

// In-memory registered patient credentials for demo session
let registeredPatients = [...DEMO_PATIENT_ACCOUNTS];

export const authService = {
  /**
   * Check if a real backend API is configured.
   */
  hasBackend() {
    return Boolean(API_BASE_URL && API_BASE_URL.trim() !== '');
  },

  /**
   * Retrieves the current authenticated session from storage or backend.
   */
  async getCurrentUser() {
    if (this.hasBackend()) {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          return data.user || null;
        }
      } catch (err) {
        console.warn('Backend /auth/me unavailable, checking local fallback', err);
      }
    }

    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY) || sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  /**
   * Patient Sign In
   */
  async patientLogin({ email, password, rememberMe = true }) {
    const cleanEmail = email.toLowerCase().trim();

    if (this.hasBackend()) {
      const response = await fetch(`${API_BASE_URL}/auth/patient/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Invalid email or password.');
      }

      const data = await response.json();
      this._saveLocalSession(data.user, rememberMe);
      return data.user;
    }

    // Local Mock / Demo verification
    await new Promise((r) => setTimeout(r, 450));

    // Reject if patient attempts to use an admin email
    if (DEMO_STAFF_ACCOUNTS.some((s) => s.email.toLowerCase() === cleanEmail)) {
      throw new Error('This account belongs to clinic staff. Please use the Admin Portal.');
    }

    const matched = registeredPatients.find((p) => p.email.toLowerCase() === cleanEmail);
    if (!matched) {
      throw new Error('Invalid email or password. Please check your credentials or create an account.');
    }

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const userSession = {
      ...matched,
      portal: 'patient',
      role: 'patient',
      lastLogin: new Date().toISOString(),
    };

    this._saveLocalSession(userSession, rememberMe);
    return userSession;
  },

  /**
   * Patient Registration
   */
  async patientSignup({ name, email, phone, password }) {
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (this.hasBackend()) {
      const response = await fetch(`${API_BASE_URL}/auth/patient/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: cleanName, email: cleanEmail, phone: cleanPhone, password }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Registration failed. Please verify your details.');
      }

      const data = await response.json();
      return data.user;
    }

    // Local Mock verification
    await new Promise((r) => setTimeout(r, 550));

    if (registeredPatients.some((p) => p.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists.');
    }

    // Register with patientService to ensure clinical synchronization
    const newPatientRecord = await patientService.createPatient({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      status: 'new',
      conditionSummary: 'Self-registered patient account',
    });

    const newAuthUser = {
      id: newPatientRecord.id,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      role: 'patient',
      portal: 'patient',
    };

    registeredPatients.push(newAuthUser);
    return newAuthUser;
  },

  /**
   * Admin / Staff Sign In
   */
  async adminLogin({ email, password, rememberMe = true }) {
    const cleanEmail = email.toLowerCase().trim();

    if (this.hasBackend()) {
      const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Invalid administrator credentials.');
      }

      const data = await response.json();
      this._saveLocalSession(data.user, rememberMe);
      return data.user;
    }

    // Local Mock verification
    await new Promise((r) => setTimeout(r, 450));

    // Reject patients attempting to log into Admin portal
    if (registeredPatients.some((p) => p.email.toLowerCase() === cleanEmail)) {
      throw new Error('Access denied. Patient accounts cannot access the administrative staff portal.');
    }

    const matchedStaff = DEMO_STAFF_ACCOUNTS.find((s) => s.email.toLowerCase() === cleanEmail);
    if (!matchedStaff) {
      throw new Error('Unauthorized. No clinic staff account found with this email.');
    }

    if (!password || password.length < 6) {
      throw new Error('Invalid password provided.');
    }

    const staffSession = {
      ...matchedStaff,
      lastLogin: new Date().toISOString(),
    };

    this._saveLocalSession(staffSession, rememberMe);
    return staffSession;
  },

  /**
   * Password Reset Request
   */
  async requestPasswordReset(email, portal = 'patient') {
    const cleanEmail = email.toLowerCase().trim();

    if (this.hasBackend()) {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, portal }),
      });
      return response.ok;
    }

    await new Promise((r) => setTimeout(r, 450));
    // Always return neutral confirmation to prevent account enumeration
    return true;
  },

  /**
   * Password Reset Execution
   */
  async resetPassword({ token, newPassword, portal = 'patient' }) {
    if (this.hasBackend()) {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, portal }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Invalid or expired password reset token.');
      }
      return true;
    }

    await new Promise((r) => setTimeout(r, 500));
    if (!token || token.length < 6) {
      throw new Error('Invalid or expired reset token. Please request a new recovery link.');
    }
    return true;
  },

  /**
   * Logout
   */
  async logout() {
    if (this.hasBackend()) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          credentials: 'include',
        });
      } catch (err) {
        console.warn('Backend logout call failed', err);
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem('closr_patient_session_id'); // legacy clean-up
    }
  },

  _saveLocalSession(user, rememberMe) {
    if (typeof window === 'undefined') return;
    const str = JSON.stringify(user);
    if (rememberMe) {
      localStorage.setItem(SESSION_STORAGE_KEY, str);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
      sessionStorage.setItem(SESSION_STORAGE_KEY, str);
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
    // Also sync patient session ID if patient
    if (user.role === 'patient') {
      localStorage.setItem('closr_patient_session_id', user.id);
    }
  },
};
