import { mockAppointments } from '../data/mockAppointments';
import { notificationService } from './notificationService';
// In-memory data store for Phase 4 frontend operations
let appointmentsStore = [...mockAppointments];
export const appointmentService = {
    /**
     * Retrieves all appointments.
     * TODO: Connect to backend GET /api/v1/appointments
     */
    async getAppointments() {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...appointmentsStore]), 50);
        });
    },
    /**
     * Retrieves an appointment by its ID.
     * TODO: Connect to backend GET /api/v1/appointments/:id
     */
    async getAppointmentById(id) {
        return new Promise((resolve) => {
            const match = appointmentsStore.find((a) => a.id === id);
            setTimeout(() => resolve(match ? { ...match } : undefined), 50);
        });
    },
    /**
     * Retrieves appointments for a specific date (YYYY-MM-DD).
     * TODO: Connect to backend GET /api/v1/appointments?date=...
     */
    async getAppointmentsByDate(date) {
        return new Promise((resolve) => {
            const matches = appointmentsStore.filter((a) => a.date === date);
            setTimeout(() => resolve([...matches]), 50);
        });
    },
    /**
     * Retrieves appointments for a specific patient by patientId.
     * TODO: Connect to backend GET /api/v1/patients/:id/appointments
     */
    async getAppointmentsByPatientId(patientId) {
        return new Promise((resolve) => {
            const matches = appointmentsStore.filter((a) => a.patientId === patientId);
            setTimeout(() => resolve([...matches]), 40);
        });
    },
    /**
     * Checks if an appointment slot conflicts for the same doctor and time.
     */
    async checkSlotConflict(doctorName, date, time, excludeId) {
        return new Promise((resolve) => {
            const conflict = appointmentsStore.some((a) => a.id !== excludeId &&
                a.status !== 'cancelled' &&
                a.doctorName.toLowerCase() === doctorName.toLowerCase() &&
                a.date === date &&
                a.time.trim().toLowerCase() === time.trim().toLowerCase());
            setTimeout(() => resolve(conflict), 50);
        });
    },
    /**
     * Updates an appointment status (e.g. confirming or cancelling).
     * TODO: Connect to backend PATCH /api/v1/appointments/:id/status
     */
    async updateAppointmentStatus(id, status) {
        return new Promise((resolve, reject) => {
            const index = appointmentsStore.findIndex((a) => a.id === id);
            if (index === -1) {
                reject(new Error(`Appointment with id ${id} not found`));
                return;
            }
            const updated = {
                ...appointmentsStore[index],
                status,
                reminderStatus: status === 'confirmed' ? 'scheduled' : appointmentsStore[index].reminderStatus,
            };
            appointmentsStore[index] = updated;
            setTimeout(() => resolve({ ...updated }), 50);
        });
    },
    /**
     * Partially updates an existing appointment.
     * TODO: Connect to backend PATCH /api/v1/appointments/:id
     */
    async updateAppointment(id, updates) {
        return new Promise((resolve, reject) => {
            const index = appointmentsStore.findIndex((a) => a.id === id);
            if (index === -1) {
                reject(new Error(`Appointment with id ${id} not found`));
                return;
            }
            const updated = {
                ...appointmentsStore[index],
                ...updates,
            };
            appointmentsStore[index] = updated;
            setTimeout(() => resolve({ ...updated }), 50);
        });
    },
    /**
     * Reschedules an appointment to a new date and time.
     * TODO: Connect to backend POST /api/v1/appointments/:id/reschedule
     */
    async rescheduleAppointment(id, newDate, newTime) {
        return new Promise((resolve, reject) => {
            const index = appointmentsStore.findIndex((a) => a.id === id);
            if (index === -1) {
                reject(new Error(`Appointment with id ${id} not found`));
                return;
            }
            const updated = {
                ...appointmentsStore[index],
                date: newDate,
                time: newTime,
                status: 'confirmed',
                reminderStatus: 'scheduled',
            };
            appointmentsStore[index] = updated;
            // Auto-dispatch local notification
            try {
                notificationService.addNotification({
                    category: 'appointments',
                    priority: 'normal',
                    title: `Appointment Rescheduled (${updated.bookingCode || 'Visit'})`,
                    description: `${updated.patientName}'s appointment with ${updated.doctorName} rescheduled to ${newDate} at ${newTime}.`,
                    relatedBookingId: updated.bookingCode,
                    relatedPatientId: updated.patientId,
                    relatedPatientName: updated.patientName,
                    destinationRoute: `/appointments?booking=${updated.bookingCode}`,
                    destinationLabel: 'View Appointment',
                    actionRequired: false,
                });
            }
            catch (e) {
                console.warn('Could not dispatch notification', e);
            }
            setTimeout(() => resolve({ ...updated }), 50);
        });
    },
    /**
     * Cancels an appointment.
     * TODO: Connect to backend POST /api/v1/appointments/:id/cancel
     */
    async cancelAppointment(id, notes) {
        return new Promise((resolve, reject) => {
            const index = appointmentsStore.findIndex((a) => a.id === id);
            if (index === -1) {
                reject(new Error(`Appointment with id ${id} not found`));
                return;
            }
            const updated = {
                ...appointmentsStore[index],
                status: 'cancelled',
                notes: notes || appointmentsStore[index].notes,
            };
            appointmentsStore[index] = updated;
            // Auto-dispatch local notification
            try {
                notificationService.addNotification({
                    category: 'appointments',
                    priority: 'normal',
                    title: `Appointment Cancelled (${updated.bookingCode || 'Visit'})`,
                    description: `${updated.patientName}'s appointment on ${updated.date} was cancelled. Slot released to waitlist.`,
                    relatedBookingId: updated.bookingCode,
                    relatedPatientId: updated.patientId,
                    relatedPatientName: updated.patientName,
                    destinationRoute: '/appointments',
                    destinationLabel: 'Calendar',
                    actionRequired: false,
                });
            }
            catch (e) {
                console.warn('Could not dispatch notification', e);
            }
            setTimeout(() => resolve({ ...updated }), 50);
        });
    },
    /**
     * Creates a new appointment booking.
     * TODO: Connect to backend POST /api/v1/appointments
     */
    async createAppointment(appointment) {
        return new Promise((resolve) => {
            const newAppointment = {
                ...appointment,
                id: `apt-${Date.now()}`,
                bookingCode: appointment.bookingCode || `SAT-${Math.floor(2000 + Math.random() * 8000)}`,
            };
            appointmentsStore = [newAppointment, ...appointmentsStore];
            // Auto-dispatch local notification
            try {
                notificationService.addNotification({
                    category: 'appointments',
                    priority: 'normal',
                    title: `New Booking Confirmed (${newAppointment.bookingCode})`,
                    description: `Appointment booked for ${newAppointment.patientName} with ${newAppointment.doctorName} on ${newAppointment.date} at ${newAppointment.time}.`,
                    relatedBookingId: newAppointment.bookingCode,
                    relatedPatientId: newAppointment.patientId,
                    relatedPatientName: newAppointment.patientName,
                    destinationRoute: `/appointments?booking=${newAppointment.bookingCode}`,
                    destinationLabel: 'View Booking',
                    actionRequired: false,
                });
            }
            catch (e) {
                console.warn('Could not dispatch notification', e);
            }
            setTimeout(() => resolve({ ...newAppointment }), 50);
        });
    },
};
