import { notificationService } from './notificationService';
const STORAGE_KEY = 'closr_clinic_settings';
export const DEFAULT_SETTINGS = {
    profile: {
        clinicName: "Dr. Sharma's Family Clinic & Healthcare Center",
        clinicDescription: 'Specialized family healthcare, pediatric care, seasonal viral consultations, and preventive chronic checkups.',
        clinicPhone: '+91 98201 44521',
        clinicEmail: 'reception@sharmaclinic.in',
        address: 'Shop 4, Greenfield Plaza, Near Indirapuram Metro',
        city: 'Indirapuram, Ghaziabad',
        state: 'Uttar Pradesh',
        postalCode: '201014',
        timezone: 'Asia/Kolkata (IST +5:30)',
        defaultConsultationDuration: 15,
    },
    receptionist: {
        displayName: 'Saathi (Closr Assistant)',
        greetingMessage: "Hello! Welcome to Dr. Sharma's Clinic. I'm Saathi, your AI receptionist. How may I help you today?",
        language: 'english',
        tone: 'friendly',
        enabled: true,
        allowBooking: true,
        allowRescheduling: true,
        allowCancellation: true,
        allowVoiceNotes: true,
        showBookingPreview: true,
    },
    appointmentRules: {
        defaultDurationMinutes: 15,
        availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        openingTime: '09:00',
        closingTime: '20:30',
        breakStartTime: '13:00',
        breakEndTime: '17:00',
        minAdvanceBookingHours: 1,
        maxAdvanceBookingDays: 14,
        reminderLeadTimeHours: 2,
        allowSameDayBooking: true,
        allowOffHoursRequests: true,
    },
    notifications: {
        confirmations: true,
        upcomingReminders: true,
        cancellations: true,
        rescheduling: true,
        escalationAlerts: true,
        dailySummary: true,
        leadTimeHours: 2,
        channels: {
            inApp: true,
            whatsapp: true,
            sms: true,
            email: false,
        },
    },
    escalationSafety: {
        enabled: true,
        defaultPriority: 'high',
        reasons: {
            urgentSymptoms: true,
            appointmentIssues: true,
            humanStaffRequested: true,
            generalSupport: true,
        },
        assignedStaffRole: 'Dr. Sharma / Clinic Triage Desk',
        showSafetyNotice: true,
    },
    appearance: {
        theme: 'light',
        density: 'comfortable',
        showQuickActions: true,
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12h',
    },
    dataPrivacy: {
        demoMode: true,
        localStorageEnabled: true,
        analyticsConsent: true,
    },
};
// In-memory cache
let inMemorySettings = loadFromStorage();
function loadFromStorage() {
    if (typeof window === 'undefined')
        return { ...DEFAULT_SETTINGS };
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return { ...DEFAULT_SETTINGS };
        const parsed = JSON.parse(raw);
        return {
            profile: { ...DEFAULT_SETTINGS.profile, ...(parsed.profile || {}) },
            receptionist: { ...DEFAULT_SETTINGS.receptionist, ...(parsed.receptionist || {}) },
            appointmentRules: { ...DEFAULT_SETTINGS.appointmentRules, ...(parsed.appointmentRules || {}) },
            notifications: {
                ...DEFAULT_SETTINGS.notifications,
                ...(parsed.notifications || {}),
                channels: { ...DEFAULT_SETTINGS.notifications.channels, ...(parsed.notifications?.channels || {}) },
            },
            escalationSafety: {
                ...DEFAULT_SETTINGS.escalationSafety,
                ...(parsed.escalationSafety || {}),
                reasons: { ...DEFAULT_SETTINGS.escalationSafety.reasons, ...(parsed.escalationSafety?.reasons || {}) },
            },
            appearance: { ...DEFAULT_SETTINGS.appearance, ...(parsed.appearance || {}) },
            dataPrivacy: { ...DEFAULT_SETTINGS.dataPrivacy, ...(parsed.dataPrivacy || {}) },
        };
    }
    catch (err) {
        console.warn('Could not read settings from localStorage, using defaults', err);
        return { ...DEFAULT_SETTINGS };
    }
}
function saveToStorage(settings) {
    inMemorySettings = settings;
    if (typeof window === 'undefined')
        return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
    catch (err) {
        console.warn('Could not persist settings to localStorage', err);
    }
}
export const settingsService = {
    /**
     * Retrieves current clinic settings.
     */
    getSettings() {
        return { ...inMemorySettings };
    },
    /**
     * Updates clinic profile fields.
     */
    updateProfile(updates) {
        const updated = {
            ...inMemorySettings,
            profile: { ...inMemorySettings.profile, ...updates },
        };
        saveToStorage(updated);
        return { ...updated.profile };
    },
    /**
     * Updates AI receptionist preferences.
     */
    updateReceptionist(updates) {
        const updated = {
            ...inMemorySettings,
            receptionist: { ...inMemorySettings.receptionist, ...updates },
        };
        saveToStorage(updated);
        return { ...updated.receptionist };
    },
    /**
     * Updates clinic schedule and appointment rules.
     */
    updateAppointmentRules(updates) {
        const updated = {
            ...inMemorySettings,
            appointmentRules: { ...inMemorySettings.appointmentRules, ...updates },
        };
        saveToStorage(updated);
        return { ...updated.appointmentRules };
    },
    /**
     * Updates reminder and notification preferences.
     */
    updateNotifications(updates) {
        const updated = {
            ...inMemorySettings,
            notifications: {
                ...inMemorySettings.notifications,
                ...updates,
                channels: updates.channels
                    ? { ...inMemorySettings.notifications.channels, ...updates.channels }
                    : inMemorySettings.notifications.channels,
            },
        };
        saveToStorage(updated);
        return { ...updated.notifications };
    },
    /**
     * Updates escalation priority and safety rules.
     */
    updateEscalationSafety(updates) {
        const updated = {
            ...inMemorySettings,
            escalationSafety: {
                ...inMemorySettings.escalationSafety,
                ...updates,
                reasons: updates.reasons
                    ? { ...inMemorySettings.escalationSafety.reasons, ...updates.reasons }
                    : inMemorySettings.escalationSafety.reasons,
            },
        };
        saveToStorage(updated);
        return { ...updated.escalationSafety };
    },
    /**
     * Updates appearance and display formatting.
     */
    updateAppearance(updates) {
        const updated = {
            ...inMemorySettings,
            appearance: { ...inMemorySettings.appearance, ...updates },
        };
        saveToStorage(updated);
        return { ...updated.appearance };
    },
    /**
     * Resets all clinic settings to their initial demo defaults.
     */
    resetToDefaults() {
        const reset = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
        saveToStorage(reset);
        // Auto-dispatch system notification
        try {
            notificationService.addNotification({
                category: 'system',
                priority: 'normal',
                title: 'Clinic Settings Reverted',
                description: 'Clinic configuration, schedule hours, and receptionist preferences were restored to defaults.',
                destinationRoute: '/settings',
                destinationLabel: 'View Settings',
                actionRequired: false,
            });
        }
        catch (e) {
            console.warn('Could not dispatch notification', e);
        }
        return reset;
    },
};
