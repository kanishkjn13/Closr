import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { AppointmentSummaryCards } from '../components/appointments/AppointmentSummaryCards';
import { DateNavigator } from '../components/appointments/DateNavigator';
import { AppointmentFiltersToolbar } from '../components/appointments/AppointmentFiltersToolbar';
import { AppointmentTable } from '../components/appointments/AppointmentTable';
import { AppointmentDetailsModal } from '../components/appointments/AppointmentDetailsModal';
import { AddAppointmentModal } from '../components/appointments/AddAppointmentModal';
import { RescheduleAppointmentModal } from '../components/appointments/RescheduleAppointmentModal';
import { CancelAppointmentModal } from '../components/appointments/CancelAppointmentModal';
import { useToast } from '../components/ui/Toast';
import { appointmentService } from '../services/appointmentService';
import { Plus } from 'lucide-react';
export const AppointmentsPage = () => {
    const { onOpenMobileMenu } = useOutletContext();
    const toast = useToast();
    // All loaded appointments
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    // Active Date Filter (Defaults to 2026-10-29 matching the reference dashboard)
    const [currentDate, setCurrentDate] = useState('2026-10-29');
    // Filter Toolbar States
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [doctorFilter, setDoctorFilter] = useState('all');
    const [serviceFilter, setServiceFilter] = useState('all');
    // Modal States
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [rescheduleTarget, setRescheduleTarget] = useState(null);
    const [cancelTarget, setCancelTarget] = useState(null);
    // Load appointments
    const loadAppointments = async () => {
        try {
            setIsLoading(true);
            const data = await appointmentService.getAppointments();
            setAppointments(data);
        }
        catch {
            toast.error('Failed to load appointments');
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        loadAppointments();
    }, []);
    // Compute Summary Metrics specifically for the currently selected date
    const dateAppointments = useMemo(() => {
        return appointments.filter((a) => a.date === currentDate);
    }, [appointments, currentDate]);
    const summaryCounts = useMemo(() => {
        const total = dateAppointments.length;
        const confirmed = dateAppointments.filter((a) => a.status === 'confirmed').length;
        const pending = dateAppointments.filter((a) => a.status === 'pending' || a.status === 'waitlist-offer').length;
        const cancelled = dateAppointments.filter((a) => a.status === 'cancelled').length;
        return { total, confirmed, pending, cancelled };
    }, [dateAppointments]);
    // Filtered Appointments based on Date, Search, and Dropdowns
    const filteredAppointments = useMemo(() => {
        return appointments.filter((apt) => {
            // 1. Date match
            if (apt.date !== currentDate)
                return false;
            // 2. Status match
            if (statusFilter !== 'all') {
                if (statusFilter === 'pending') {
                    if (apt.status !== 'pending' && apt.status !== 'waitlist-offer')
                        return false;
                }
                else if (apt.status !== statusFilter) {
                    return false;
                }
            }
            // 3. Doctor match
            if (doctorFilter !== 'all' && apt.doctorName !== doctorFilter) {
                return false;
            }
            // 4. Service match
            if (serviceFilter !== 'all' && apt.service !== serviceFilter) {
                return false;
            }
            // 5. Search match
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                const matchesName = apt.patientName.toLowerCase().includes(query);
                const matchesDoctor = apt.doctorName.toLowerCase().includes(query);
                const matchesService = apt.service.toLowerCase().includes(query);
                const matchesCode = apt.bookingCode?.toLowerCase().includes(query);
                if (!matchesName && !matchesDoctor && !matchesService && !matchesCode) {
                    return false;
                }
            }
            return true;
        });
    }, [appointments, currentDate, statusFilter, doctorFilter, serviceFilter, searchQuery]);
    // Confirm pending appointment
    const handleConfirmAppointment = async (apt) => {
        try {
            const updated = await appointmentService.updateAppointmentStatus(apt.id, 'confirmed');
            setAppointments((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
            toast.success('Appointment Confirmed', `Confirmed booking for ${apt.patientName} (${apt.bookingCode || '—'}).`);
        }
        catch {
            toast.error('Failed to confirm appointment');
        }
    };
    // Reset all filters
    const handleClearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setDoctorFilter('all');
        setServiceFilter('all');
    };
    return (<div className="space-y-6 sm:space-y-7 text-closr-text animate-in fade-in duration-200">
      {/* 1. Page Header with Title, Subtitle, and Primary "Add appointment" Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title="Appointments" subtitle="Manage bookings, availability, and patient visits." onOpenMobileMenu={onOpenMobileMenu} actions={<Button variant="primary" leftIcon={<Plus className="w-4 h-4"/>} onClick={() => setIsAddModalOpen(true)}>
              Add appointment
            </Button>}/>
      </div>

      {/* 2. Four Summary Metrics Cards (Clickable to filter) */}
      <AppointmentSummaryCards total={summaryCounts.total} confirmed={summaryCounts.confirmed} pending={summaryCounts.pending} cancelled={summaryCounts.cancelled} activeStatusFilter={statusFilter} onSelectStatusFilter={(status) => setStatusFilter(status)}/>

      {/* 3. Date Navigation (Prev, Next, Today, Calendar jump) */}
      <DateNavigator currentDate={currentDate} onDateChange={(newDate) => {
            setCurrentDate(newDate);
        }}/>

      {/* 4. Search and Filter Toolbar */}
      <AppointmentFiltersToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} doctorFilter={doctorFilter} onDoctorFilterChange={setDoctorFilter} serviceFilter={serviceFilter} onServiceFilterChange={setServiceFilter} onClearFilters={handleClearFilters}/>

      {/* 5. Main Appointments Table */}
      {isLoading ? (<div className="p-12 text-center text-xs text-closr-text-muted">
          Loading appointments...
        </div>) : (<AppointmentTable appointments={filteredAppointments} onViewDetails={(apt) => setSelectedAppointment(apt)} onConfirmAppointment={handleConfirmAppointment} onRescheduleAppointment={(apt) => setRescheduleTarget(apt)} onCancelAppointment={(apt) => setCancelTarget(apt)} onClearFilters={handleClearFilters}/>)}

      {/* 6. Modals */}

      {/* View Appointment Details Modal */}
      <AppointmentDetailsModal isOpen={Boolean(selectedAppointment)} appointment={selectedAppointment} onClose={() => setSelectedAppointment(null)} onConfirm={handleConfirmAppointment} onReschedule={(apt) => setRescheduleTarget(apt)} onCancel={(apt) => setCancelTarget(apt)}/>

      {/* Add Appointment Modal */}
      <AddAppointmentModal isOpen={isAddModalOpen} defaultDate={currentDate} onClose={() => setIsAddModalOpen(false)} onAppointmentCreated={(newApt) => {
            setAppointments((prev) => [newApt, ...prev]);
            if (newApt.date !== currentDate) {
                setCurrentDate(newApt.date);
            }
            toast.success('Appointment Scheduled', `Created booking for ${newApt.patientName} (${newApt.bookingCode}) on ${newApt.time}.`);
        }}/>

      {/* Reschedule Modal */}
      <RescheduleAppointmentModal isOpen={Boolean(rescheduleTarget)} appointment={rescheduleTarget} onClose={() => setRescheduleTarget(null)} onAppointmentRescheduled={(updated) => {
            setAppointments((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
            toast.success('Appointment Rescheduled', `Moved ${updated.patientName} to ${updated.time} on ${updated.date}.`);
        }}/>

      {/* Cancel Confirmation Modal */}
      <CancelAppointmentModal isOpen={Boolean(cancelTarget)} appointment={cancelTarget} onClose={() => setCancelTarget(null)} onAppointmentCancelled={(updated) => {
            setAppointments((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
            toast.success('Appointment Cancelled', `Cancelled visit for ${updated.patientName} (${updated.bookingCode || '—'}).`);
        }}/>
    </div>);
};
