import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  CalendarClock, 
  Ban, 
  CheckCircle2, 
  RotateCcw,
  Search,
  Filter
} from 'lucide-react';
import { usePatientAuth } from '../../context/PatientAuthContext';
import { appointmentService } from '../../services/appointmentService';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { PatientBookAppointmentModal } from '../../components/patient/PatientBookAppointmentModal';
import { AppointmentDetailsModal } from '../../components/appointments/AppointmentDetailsModal';
import { RescheduleAppointmentModal } from '../../components/appointments/RescheduleAppointmentModal';
import { CancelAppointmentModal } from '../../components/appointments/CancelAppointmentModal';
import { cn } from '../../lib/utils';

import { useAuth } from '../../context/AuthContext';

export const PatientAppointmentsPage = () => {
  const { currentPatient } = usePatientAuth();
  const { user: authUser } = useAuth();
  const activePatient = currentPatient || (authUser?.role === 'patient' ? authUser : null);
  const toast = useToast();

  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [detailsAppointment, setDetailsAppointment] = useState(null);
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
  const [cancelAppointment, setCancelAppointment] = useState(null);

  const loadAppointments = useCallback(async () => {
    const patientId = activePatient?.id;
    if (!patientId) return;
    setIsLoading(true);
    try {
      const apts = await appointmentService.getAppointmentsByPatientId(patientId);
      setAppointments(apts);
    } catch (err) {
      console.warn('Could not load patient appointments', err);
    } finally {
      setIsLoading(false);
    }
  }, [activePatient?.id]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Tab filtering
  const filteredAppointments = useMemo(() => {
    let list = [...appointments];

    if (activeTab === 'upcoming') {
      list = list.filter((a) => a.status === 'confirmed');
    } else if (activeTab === 'pending') {
      list = list.filter((a) => a.status === 'pending' || a.status === 'waitlist-offer');
    } else if (activeTab === 'completed') {
      list = list.filter((a) => a.status === 'completed');
    } else if (activeTab === 'cancelled') {
      list = list.filter((a) => a.status === 'cancelled');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.doctorName?.toLowerCase().includes(q) ||
          a.service?.toLowerCase().includes(q) ||
          a.bookingCode?.toLowerCase().includes(q) ||
          a.date?.includes(q)
      );
    }

    return list;
  }, [appointments, activeTab, searchQuery]);

  const tabs = [
    { id: 'all', label: 'All Appointments', count: appointments.length },
    {
      id: 'upcoming',
      label: 'Upcoming',
      count: appointments.filter((a) => a.status === 'confirmed').length,
    },
    {
      id: 'pending',
      label: 'Pending',
      count: appointments.filter((a) => a.status === 'pending' || a.status === 'waitlist-offer').length,
    },
    {
      id: 'completed',
      label: 'Completed',
      count: appointments.filter((a) => a.status === 'completed').length,
    },
    {
      id: 'cancelled',
      label: 'Cancelled',
      count: appointments.filter((a) => a.status === 'cancelled').length,
    },
  ];

  const handleAppointmentRescheduled = (updated) => {
    setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setRescheduleAppointment(null);
    toast.success('Rescheduled', `Appointment moved to ${updated.date} at ${updated.time}.`);
  };

  const handleAppointmentCancelled = (cancelled) => {
    setAppointments((prev) => prev.map((a) => (a.id === cancelled.id ? cancelled : a)));
    setCancelAppointment(null);
    toast.info('Cancelled', `Appointment ${cancelled.bookingCode} was cancelled.`);
  };

  return (
    <div className="space-y-6 text-left">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-closr-text tracking-tight">
            My Appointments
          </h1>
          <p className="text-xs sm:text-sm text-closr-text-muted mt-1">
            Review past consultations, track upcoming visits, and schedule new appointments with Dr. Sharma.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsBookModalOpen(true)}
          className="shadow-soft shrink-0 self-start sm:self-auto"
        >
          Book Appointment
        </Button>
      </div>

      {/* 2. Tabs & Search Toolbar */}
      <div className="bg-closr-card rounded-2xl p-3 border border-closr-border shadow-soft space-y-3">
        {/* Horizontal Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150',
                  isActive
                    ? 'bg-closr-forest text-white shadow-xs'
                    : 'text-closr-text-muted hover:text-closr-text hover:bg-closr-sage/30'
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'px-1.5 py-0.2 rounded-md text-[10px] font-bold',
                    isActive ? 'bg-white/20 text-white' : 'bg-closr-sage/50 text-closr-text'
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-closr-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by doctor, service, or booking reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-closr-border bg-white text-xs text-closr-text closr-focus shadow-2xs"
          />
        </div>
      </div>

      {/* 3. Appointments List */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="py-16 px-4 text-center bg-closr-card rounded-3xl border border-closr-border shadow-soft space-y-3">
            <div className="w-12 h-12 rounded-full bg-closr-sage/50 text-closr-forest flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-base text-closr-text">
                No appointments found
              </h3>
              <p className="text-xs text-closr-text-muted max-w-sm mx-auto">
                {searchQuery
                  ? 'No records match your search query. Try clearing the filter.'
                  : `You have no ${activeTab === 'all' ? '' : activeTab} appointments in this category.`}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsBookModalOpen(true)}
            >
              Book an Appointment
            </Button>
          </div>
        ) : (
          filteredAppointments.map((apt) => {
            const isCancelled = apt.status === 'cancelled';
            const isCompleted = apt.status === 'completed';
            const isPending = apt.status === 'pending' || apt.status === 'waitlist-offer';

            return (
              <div
                key={apt.id}
                className={cn(
                  'bg-closr-card rounded-2xl p-5 border shadow-soft transition-all space-y-4',
                  isCancelled ? 'border-closr-border/60 opacity-80' : 'border-closr-border'
                )}
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-closr-border/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-closr-sage/60 text-closr-forest flex items-center justify-center font-bold text-sm">
                      {apt.doctorName ? apt.doctorName.split(' ')[1]?.[0] || 'D' : 'D'}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-closr-text">
                        {apt.doctorName || 'Dr. Sharma'}
                      </h3>
                      <p className="text-xs text-closr-text-muted">
                        {apt.service || 'Clinical Consultation'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={apt.status}>
                      {apt.status === 'confirmed'
                        ? 'Confirmed'
                        : apt.status === 'pending'
                        ? 'Pending'
                        : apt.status === 'cancelled'
                        ? 'Cancelled'
                        : apt.status === 'completed'
                        ? 'Completed'
                        : apt.status}
                    </Badge>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-closr-text-muted block">Date</span>
                    <span className="font-semibold text-closr-text flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-closr-forest" />
                      {apt.date}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-closr-text-muted block">Time Slot</span>
                    <span className="font-semibold text-closr-text flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-closr-forest" />
                      {apt.time}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-closr-text-muted block">Booking ID</span>
                    <span className="font-mono font-bold text-closr-forest">
                      {apt.bookingCode || '—'}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-closr-text-muted block">Location</span>
                    <span className="font-semibold text-closr-text truncate block">
                      Indirapuram Clinic
                    </span>
                  </div>
                </div>

                {apt.notes && (
                  <div className="p-2.5 rounded-xl bg-closr-bg/60 border border-closr-border text-[11px] text-closr-text-muted">
                    <span className="font-semibold text-closr-text">Clinical note: </span>
                    {apt.notes}
                  </div>
                )}

                {/* Card Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-closr-border/50">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDetailsAppointment(apt)}
                  >
                    View Details
                  </Button>

                  {!isCancelled && !isCompleted && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<CalendarClock className="w-3.5 h-3.5" />}
                        onClick={() => setRescheduleAppointment(apt)}
                      >
                        Reschedule
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        leftIcon={<Ban className="w-3.5 h-3.5" />}
                        onClick={() => setCancelAppointment(apt)}
                      >
                        Cancel Visit
                      </Button>
                    </>
                  )}

                  {(isCancelled || isCompleted) && (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                      onClick={() => setIsBookModalOpen(true)}
                    >
                      Book Again
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Book Appointment Modal */}
      <PatientBookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        currentPatient={activePatient}
        onBookingComplete={() => {
          loadAppointments();
          setIsBookModalOpen(false);
        }}
      />

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal
        isOpen={Boolean(detailsAppointment)}
        appointment={detailsAppointment}
        onClose={() => setDetailsAppointment(null)}
        onReschedule={(apt) => {
          setDetailsAppointment(null);
          setRescheduleAppointment(apt);
        }}
        onCancel={(apt) => {
          setDetailsAppointment(null);
          setCancelAppointment(apt);
        }}
        onConfirm={async (apt) => {
          await appointmentService.updateAppointmentStatus(apt.id, 'confirmed');
          loadAppointments();
          setDetailsAppointment(null);
        }}
      />

      {/* Reschedule Modal */}
      <RescheduleAppointmentModal
        isOpen={Boolean(rescheduleAppointment)}
        appointment={rescheduleAppointment}
        onClose={() => setRescheduleAppointment(null)}
        onAppointmentRescheduled={handleAppointmentRescheduled}
      />

      {/* Cancel Modal */}
      <CancelAppointmentModal
        isOpen={Boolean(cancelAppointment)}
        appointment={cancelAppointment}
        onClose={() => setCancelAppointment(null)}
        onAppointmentCancelled={handleAppointmentCancelled}
      />
    </div>
  );
};
