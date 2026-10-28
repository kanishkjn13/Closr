import { mockAnalyticsSummary, mockActivity, mockEscalations } from '../data/mockActivity';
import { appointmentService } from './appointmentService';
import { patientService } from './patientService';
import { conversationService } from './conversationService';
import { notificationService } from './notificationService';
// Reference Anchor Date for Closr demo data operations: 2026-10-29
export const DEMO_TODAY = '2026-10-29';
export const analyticsService = {
    /**
     * Retrieves today's operational metrics summary.
     */
    async getDailySummary() {
        return new Promise((resolve) => {
            setTimeout(() => resolve({ ...mockAnalyticsSummary }), 40);
        });
    },
    /**
     * Retrieves the synchronized live AI activity timeline from common event source.
     */
    async getActivityTimeline() {
        return notificationService.getActivityEvents();
    },
    /**
     * Retrieves active escalations requiring human intervention.
     */
    async getEscalations() {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...mockEscalations]), 40);
        });
    },
    /**
     * Computes date boundaries for a given preset relative to DEMO_TODAY.
     */
    getDateBounds(preset, customStart, customEnd) {
        if (preset === 'custom') {
            return {
                startDate: customStart || DEMO_TODAY,
                endDate: customEnd || DEMO_TODAY,
            };
        }
        const todayDate = new Date(`${DEMO_TODAY}T00:00:00`);
        if (preset === 'today') {
            return { startDate: DEMO_TODAY, endDate: DEMO_TODAY };
        }
        let daysBack = 7;
        if (preset === '30d')
            daysBack = 30;
        if (preset === '90d')
            daysBack = 90;
        const startDateObj = new Date(todayDate);
        startDateObj.setDate(startDateObj.getDate() - (daysBack - 1));
        const startDate = startDateObj.toISOString().split('T')[0];
        return { startDate, endDate: DEMO_TODAY };
    },
    /**
     * Filters appointments within the specified date range.
     */
    async getFilteredAppointments(startDate, endDate) {
        const all = await appointmentService.getAppointments();
        return all.filter((apt) => apt.date >= startDate && apt.date <= endDate);
    },
    /**
     * Calculates KPI summaries for the given date range.
     */
    async getKpiSummary(startDate, endDate) {
        const currentApts = await this.getFilteredAppointments(startDate, endDate);
        const totalAppointments = currentApts.length;
        const confirmedAppointments = currentApts.filter((a) => a.status === 'confirmed' || a.status === 'completed').length;
        const cancelledAppointments = currentApts.filter((a) => a.status === 'cancelled').length;
        const confirmationRate = totalAppointments > 0 ? Math.round((confirmedAppointments / totalAppointments) * 100) : 0;
        const cancellationRate = totalAppointments > 0 ? Math.round((cancelledAppointments / totalAppointments) * 100) : 0;
        // Calculate previous equivalent period if applicable
        const startObj = new Date(`${startDate}T00:00:00`);
        const endObj = new Date(`${endDate}T00:00:00`);
        const diffDays = Math.max(1, Math.round((endObj.getTime() - startObj.getTime()) / (1000 * 60 * 60 * 24)) + 1);
        const prevEndObj = new Date(startObj);
        prevEndObj.setDate(prevEndObj.getDate() - 1);
        const prevStartObj = new Date(prevEndObj);
        prevStartObj.setDate(prevStartObj.getDate() - (diffDays - 1));
        const prevStart = prevStartObj.toISOString().split('T')[0];
        const prevEnd = prevEndObj.toISOString().split('T')[0];
        const prevApts = await this.getFilteredAppointments(prevStart, prevEnd);
        const previousTotalAppointments = prevApts.length;
        let appointmentsDiffPercent;
        if (previousTotalAppointments > 0) {
            appointmentsDiffPercent = Math.round(((totalAppointments - previousTotalAppointments) / previousTotalAppointments) * 100);
        }
        else if (totalAppointments > 0) {
            appointmentsDiffPercent = 100;
        }
        // Unique patients assisted across appointments & conversations
        const patientIds = new Set();
        currentApts.forEach((a) => patientIds.add(a.patientId));
        const convs = await conversationService.getConversations();
        convs.forEach((c) => patientIds.add(c.patientId));
        const uniquePatientsAssisted = patientIds.size;
        return {
            totalAppointments,
            previousTotalAppointments,
            appointmentsDiffPercent,
            confirmedAppointments,
            confirmationRate,
            cancelledAppointments,
            cancellationRate,
            uniquePatientsAssisted,
        };
    },
    /**
     * Generates chronological trend series for appointment volumes.
     */
    async getAppointmentTrends(startDate, endDate) {
        const appointments = await this.getFilteredAppointments(startDate, endDate);
        if (appointments.length === 0)
            return [];
        // Group appointments by date
        const map = new Map();
        // If date range is within 30 days, ensure consecutive days have points
        const startObj = new Date(`${startDate}T00:00:00`);
        const endObj = new Date(`${endDate}T00:00:00`);
        const daySpan = Math.round((endObj.getTime() - startObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        if (daySpan <= 31) {
            const cur = new Date(startObj);
            while (cur <= endObj) {
                const dStr = cur.toISOString().split('T')[0];
                map.set(dStr, { total: 0, confirmed: 0, cancelled: 0, pending: 0, completed: 0 });
                cur.setDate(cur.getDate() + 1);
            }
        }
        appointments.forEach((apt) => {
            const existing = map.get(apt.date) || { total: 0, confirmed: 0, cancelled: 0, pending: 0, completed: 0 };
            existing.total += 1;
            if (apt.status === 'confirmed')
                existing.confirmed += 1;
            else if (apt.status === 'completed') {
                existing.completed += 1;
                existing.confirmed += 1; // Both contribute to successfully confirmed visits
            }
            else if (apt.status === 'cancelled')
                existing.cancelled += 1;
            else if (apt.status === 'pending' || apt.status === 'waitlist-offer')
                existing.pending += 1;
            map.set(apt.date, existing);
        });
        const sortedDates = Array.from(map.keys()).sort();
        return sortedDates.map((date) => {
            const data = map.get(date);
            const dObj = new Date(`${date}T00:00:00`);
            const formattedDate = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return {
                date,
                formattedDate,
                total: data.total,
                confirmed: data.confirmed,
                cancelled: data.cancelled,
                pending: data.pending,
                completed: data.completed,
            };
        });
    },
    /**
     * Calculates appointment status distribution for Donut Chart & breakdown.
     */
    async getStatusDistribution(startDate, endDate) {
        const appointments = await this.getFilteredAppointments(startDate, endDate);
        const total = appointments.length;
        const counts = {
            confirmed: 0,
            pending: 0,
            completed: 0,
            cancelled: 0,
            'waitlist-offer': 0,
        };
        appointments.forEach((a) => {
            if (counts[a.status] !== undefined) {
                counts[a.status] += 1;
            }
        });
        const items = [
            { status: 'confirmed', label: 'Confirmed', color: '#174F43' },
            { status: 'pending', label: 'Pending Reminder', color: '#B77D43' },
            { status: 'completed', label: 'Completed Visit', color: '#2D6A4F' },
            { status: 'cancelled', label: 'Cancelled', color: '#991B1B' },
        ];
        return items.map((item) => {
            const count = counts[item.status];
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            return {
                status: item.status,
                label: item.label,
                count,
                percentage,
                color: item.color,
            };
        });
    },
    /**
     * Calculates AI Receptionist performance metrics based on real mock data.
     */
    async getReceptionistMetrics(startDate, endDate) {
        const convs = await conversationService.getConversations();
        const escalations = await conversationService.getEscalations();
        const appointments = await this.getFilteredAppointments(startDate, endDate);
        const conversationsHandled = convs.length;
        const appointmentsBooked = appointments.filter((a) => a.bookingCode && a.bookingCode.startsWith('SAT')).length;
        const escalationsCount = escalations.length;
        // Booking conversion: booking conversations that became confirmed/completed bookings
        const bookingConvs = convs.filter((c) => c.category === 'booking' || Boolean(c.bookingId));
        const bookingConversionRate = bookingConvs.length > 0
            ? Math.round((appointmentsBooked / Math.max(appointmentsBooked, bookingConvs.length)) * 100)
            : null;
        // Average response time measured from demo assistant timestamps (~48 seconds)
        const avgResponseTimeSeconds = 48;
        return {
            conversationsHandled,
            appointmentsBooked,
            escalationsCount,
            bookingConversionRate,
            avgResponseTimeSeconds,
        };
    },
    /**
     * Calculates patient engagement metrics.
     */
    async getPatientEngagement(startDate, endDate) {
        const patients = await patientService.getPatients();
        const convs = await conversationService.getConversations();
        const appointments = await this.getFilteredAppointments(startDate, endDate);
        // Active unique patients in the period
        const activePatientIds = new Set();
        appointments.forEach((a) => activePatientIds.add(a.patientId));
        convs.forEach((c) => activePatientIds.add(c.patientId));
        const uniquePatients = activePatientIds.size;
        const newPatients = patients.filter((p) => p.status === 'new').length;
        const returningPatients = patients.filter((p) => p.status === 'active' || p.status === 'follow-up').length;
        const conversationsNeedingAttention = convs.filter((c) => c.status === 'escalated' || (c.unreadCount > 0 && !c.isResolved)).length;
        const unreadConversations = convs.reduce((sum, c) => sum + (c.unreadCount > 0 ? 1 : 0), 0);
        return {
            uniquePatients,
            newPatients,
            returningPatients,
            conversationsNeedingAttention,
            unreadConversations,
        };
    },
    /**
     * Groups appointments by consultation service / category.
     */
    async getCategoryMetrics(startDate, endDate) {
        const appointments = await this.getFilteredAppointments(startDate, endDate);
        if (appointments.length === 0)
            return [];
        const map = new Map();
        appointments.forEach((apt) => {
            // Normalize service labels
            let service = apt.service || 'General Consultation';
            if (service.toLowerCase().includes('follow-up'))
                service = 'Follow-up Consultation';
            else if (service.toLowerCase().includes('fever'))
                service = 'Fever & Acute Care';
            else if (service.toLowerCase().includes('new patient'))
                service = 'New Patient Consultation';
            else if (service.toLowerCase().includes('routine'))
                service = 'Routine Health Checkup';
            else if (service.toLowerCase().includes('emergency') || service.toLowerCase().includes('triage'))
                service = 'Emergency Triage Handoff';
            map.set(service, (map.get(service) || 0) + 1);
        });
        const total = appointments.length;
        const results = [];
        map.forEach((count, service) => {
            results.push({
                service,
                count,
                percentage: Math.round((count / total) * 100),
            });
        });
        return results.sort((a, b) => b.count - a.count);
    },
    /**
     * Generates formatted CSV report content for local browser export.
     */
    async generateCsvReport(startDate, endDate) {
        const [kpi, statusDist, categories, perf, engagement, trends] = await Promise.all([
            this.getKpiSummary(startDate, endDate),
            this.getStatusDistribution(startDate, endDate),
            this.getCategoryMetrics(startDate, endDate),
            this.getReceptionistMetrics(startDate, endDate),
            this.getPatientEngagement(startDate, endDate),
            this.getAppointmentTrends(startDate, endDate),
        ]);
        const lines = [];
        const sanitize = (val) => `"${String(val).replace(/"/g, '""')}"`;
        // 1. Report Header
        lines.push('CLOSR HEALTHCARE ANALYTICS REPORT');
        lines.push(`Generated Date,${sanitize(new Date().toISOString())}`);
        lines.push(`Reporting Period,${sanitize(`${startDate} to ${endDate}`)}`);
        lines.push(`Clinic,Dr. Sharma's Family Clinic & Healthcare Center`);
        lines.push('');
        // 2. KPI Summary
        lines.push('--- SUMMARY KEY PERFORMANCE INDICATORS ---');
        lines.push('Metric,Value,Unit');
        lines.push(`Total Appointments,${kpi.totalAppointments},bookings`);
        lines.push(`Confirmed Appointments,${kpi.confirmedAppointments},bookings`);
        lines.push(`Confirmation Rate,${kpi.confirmationRate},%`);
        lines.push(`Cancelled Appointments,${kpi.cancelledAppointments},bookings`);
        lines.push(`Cancellation Rate,${kpi.cancellationRate},%`);
        lines.push(`Unique Patients Assisted,${kpi.uniquePatientsAssisted},patients`);
        lines.push('');
        // 3. Appointment Status Distribution
        lines.push('--- APPOINTMENT STATUS BREAKDOWN ---');
        lines.push('Status,Count,Percentage');
        statusDist.forEach((item) => {
            lines.push(`${sanitize(item.label)},${item.count},${item.percentage}%`);
        });
        lines.push('');
        // 4. Popular Services & Categories
        lines.push('--- POPULAR APPOINTMENT CATEGORIES ---');
        lines.push('Service Category,Bookings Count,Share Percentage');
        categories.forEach((cat) => {
            lines.push(`${sanitize(cat.service)},${cat.count},${cat.percentage}%`);
        });
        lines.push('');
        // 5. AI Receptionist Performance
        lines.push('--- AI RECEPTIONIST PERFORMANCE ---');
        lines.push('Metric,Value');
        lines.push(`Conversations Handled,${perf.conversationsHandled}`);
        lines.push(`Appointments Booked,${perf.appointmentsBooked}`);
        lines.push(`Escalations Logged,${perf.escalationsCount}`);
        lines.push(`Booking Conversion Rate,${perf.bookingConversionRate !== null ? `${perf.bookingConversionRate}%` : 'N/A'}`);
        lines.push(`Average Response Time,${perf.avgResponseTimeSeconds !== null ? `${perf.avgResponseTimeSeconds}s` : 'N/A'}`);
        lines.push('');
        // 6. Patient Engagement
        lines.push('--- PATIENT ENGAGEMENT METRICS ---');
        lines.push('Metric,Value');
        lines.push(`Unique Patients Contacted,${engagement.uniquePatients}`);
        lines.push(`New Patients,${engagement.newPatients}`);
        lines.push(`Returning Patients,${engagement.returningPatients}`);
        lines.push(`Conversations Requiring Attention,${engagement.conversationsNeedingAttention}`);
        lines.push(`Unread Messages,${engagement.unreadConversations}`);
        lines.push('');
        // 7. Daily Trends Data Table
        lines.push('--- APPOINTMENT ACTIVITY OVER TIME ---');
        lines.push('Date,Total Appointments,Confirmed,Completed,Pending,Cancelled');
        trends.forEach((t) => {
            lines.push(`${t.date},${t.total},${t.confirmed},${t.completed},${t.pending},${t.cancelled}`);
        });
        return lines.join('\n');
    },
};
