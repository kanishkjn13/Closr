import { mockPatients } from '../data/mockPatients';
import { appointmentService } from './appointmentService';
import { conversationService } from './conversationService';
import { notificationService } from './notificationService';
// In-memory data store for Phase 5 frontend operations
let patientsStore = [...mockPatients];
export const patientService = {
    /**
     * Retrieves all registered patients.
     * TODO: Connect to backend GET /api/v1/patients
     */
    async getPatients() {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...patientsStore]), 50);
        });
    },
    /**
     * Retrieves a single patient by ID.
     * TODO: Connect to backend GET /api/v1/patients/:id
     */
    async getPatientById(id) {
        return new Promise((resolve) => {
            const match = patientsStore.find((p) => p.id === id);
            setTimeout(() => resolve(match ? { ...match } : undefined), 50);
        });
    },
    /**
     * Searches patients by query string (name, phone, patient ID, or email).
     * TODO: Connect to backend GET /api/v1/patients/search?q=...
     */
    async searchPatients(query) {
        const q = query.toLowerCase().trim();
        return new Promise((resolve) => {
            if (!q) {
                resolve([...patientsStore]);
                return;
            }
            const results = patientsStore.filter((p) => p.name.toLowerCase().includes(q) ||
                p.phone.includes(q) ||
                p.id.toLowerCase().includes(q) ||
                (p.email && p.email.toLowerCase().includes(q)));
            setTimeout(() => resolve(results), 50);
        });
    },
    /**
     * Checks if a phone number already exists for another patient.
     */
    async checkPhoneExists(phone, excludeId) {
        return new Promise((resolve) => {
            const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
            const exists = patientsStore.some((p) => p.id !== excludeId &&
                p.phone.replace(/[\s\-\(\)]/g, '') === cleanPhone);
            setTimeout(() => resolve(exists), 50);
        });
    },
    /**
     * Creates or registers a new patient record.
     * TODO: Connect to backend POST /api/v1/patients
     */
    async createPatient(patient) {
        return new Promise((resolve) => {
            const newPatient = {
                ...patient,
                id: `pat-${Date.now().toString().slice(-4)}`,
                createdAt: new Date().toISOString().split('T')[0],
            };
            patientsStore = [newPatient, ...patientsStore];
            // Auto-dispatch clinic activity notification
            try {
                notificationService.addNotification({
                    category: 'activity',
                    priority: 'normal',
                    title: `New Patient Registered (${newPatient.name})`,
                    description: `${newPatient.name} added to clinic directory. Phone: ${newPatient.phone}.`,
                    relatedPatientId: newPatient.id,
                    relatedPatientName: newPatient.name,
                    destinationRoute: `/patients?id=${newPatient.id}`,
                    destinationLabel: 'View Directory',
                    actionRequired: false,
                });
            }
            catch (e) {
                console.warn('Could not dispatch patient creation notification', e);
            }
            setTimeout(() => resolve({ ...newPatient }), 50);
        });
    },
    /**
     * Updates an existing patient record.
     * TODO: Connect to backend PATCH /api/v1/patients/:id
     */
    async updatePatient(id, updates) {
        return new Promise((resolve, reject) => {
            const index = patientsStore.findIndex((p) => p.id === id);
            if (index === -1) {
                reject(new Error(`Patient with id ${id} not found`));
                return;
            }
            const updated = {
                ...patientsStore[index],
                ...updates,
            };
            patientsStore[index] = updated;
            setTimeout(() => resolve({ ...updated }), 50);
        });
    },
    /**
     * Updates patient status.
     * TODO: Connect to backend PATCH /api/v1/patients/:id/status
     */
    async updatePatientStatus(id, status) {
        return this.updatePatient(id, { status });
    },
    /**
     * Retrieves all appointments for a specific patient.
     */
    async getPatientAppointments(patientId, patientName) {
        const all = await appointmentService.getAppointments();
        return all.filter((a) => a.patientId === patientId ||
            (patientName && a.patientName.toLowerCase().includes(patientName.toLowerCase().split(' ')[0])));
    },
    /**
     * Retrieves conversations associated with a specific patient.
     */
    async getPatientConversations(patientId) {
        const all = await conversationService.getConversations();
        return all.filter((c) => c.patientId === patientId);
    },
};
