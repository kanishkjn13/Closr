import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  FileText, 
  Plus, 
  AlertCircle, 
  ChevronRight, 
  Stethoscope,
  CalendarClock,
  Ban,
  ExternalLink,
  ShieldAlert,
  Info
} from 'lucide-react';
import { usePatientAuth } from '../../context/PatientAuthContext';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { conversationService } from '../../services/conversationService';
import { notificationService } from '../../services/notificationService';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { PatientBookAppointmentModal } from '../../components/patient/PatientBookAppointmentModal';
import { RescheduleAppointmentModal } from '../../components/appointments/RescheduleAppointmentModal';
import { CancelAppointmentModal } from '../../components/appointments/CancelAppointmentModal';
import { AppointmentDetailsModal } from '../../components/appointments/AppointmentDetailsModal';

export const PatientDashboardPage = () => {
  const { currentPatient } = usePatientAuth();
  const { user: authUser } = useAuth();
  const activePatient = currentPatient || (authUser?.role === 'patient' ? authUser : null);
  const navigate = useNavigate();
  const toast = useToast();

  const [appointments, setAppointments] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [detailsAppointment, setDetailsAppointment] = useState(null);
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
  const [cancelAppointment, setCancelAppointment] = useState(null);

  // Load data for active patient
  const loadPatientData = useCallback(async () => {
    const patientId = activePatient?.id;
    if (!patientId) return;
    setIsLoading(true);
    try {
      const [allApts, allConvs, allNotifs] = await Promise.all([
        appointmentService.getAppointmentsByPatientId(patientId),
        conversationService.getConversations(),
        notificationService.getNotifications(),
      ]);

      setAppointments(allApts);

      const patientConvs = allConvs.filter((c) => c.patientId === patientId);
      setConversations(patientConvs);

      const patientNotifs = allNotifs.filter((n) => n.relatedPatientId === patientId);
      setNotifications(patientNotifs);
    } catch (err) {
      console.warn('Error loading patient dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  }, [activePatient?.id]);

  useEffect(() => {
    loadPatientData();
  }, [loadPatientData]);

  // Derived metrics from shared data
  const upcomingAppointments = useMemo(() => {
    return appointments.filter(
      (a) => a.status !== 'cancelled' && a.status !== 'completed'
    );
  }, [appointments]);

  const nearestUpcoming = useMemo(() => {
    return upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;
  }, [upcomingAppointments]);

  const completedVisitsCount = useMemo(() => {
    return appointments.filter((a) => a.status === 'completed').length;
  }, [appointments]);

  const pendingRequestsCount = useMemo(() => {
    return appointments.filter((a) => a.status === 'pending' || a.status === 'waitlist-offer').length;
  }, [appointments]);

  const unreadMessagesCount = useMemo(() => {
    return conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  }, [conversations]);

  const patientFirstName = activePatient?.name?.split(' ')[0] || 'Patient';

  // Handle appointment actions
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
      {/* 1. Welcoming Hero Banner */}
      <div className="bg-closr-card rounded-3xl p-6 sm:p-8 border border-closr-border shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-closr-forest bg-closr-sage/50 px-2.5 py-0.5 rounded-full border border-closr-border">
              Indirapuram Clinic Member
            </span>
            <span className="text-xs text-closr-text-muted">
              Thursday, Oct 29, 2026
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-closr-text tracking-tight">
            Welcome back, {patientFirstName}
          </h1>
          <p className="text-sm text-closr-text-muted max-w-xl leading-relaxed">
            Here is your personal health and appointment overview. You can manage scheduled visits, review messages with clinic staff, and book new consultations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsBookModalOpen(true)}
            className="shadow-soft"
          >
            Book Appointment
          </Button>

          <Button
            variant="outline"
            size="md"
            leftIcon={<MessageSquare className="w-4 h-4" />}
            onClick={() => navigate('/patient/messages')}
          >
            View Messages
          </Button>
        </div>
      </div>

      {/* 2. 4 Metrics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Upcoming Appointments */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigate('/patient/appointments')}
          className="p-4 sm:p-5 rounded-2xl bg-closr-card border border-closr-border shadow-xs hover:border-closr-forest/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-closr-text-muted">
              Upcoming Visits
            </span>
            <div className="w-8 h-8 rounded-xl bg-closr-pale text-closr-forest flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-closr-text group-hover:text-closr-forest transition-colors">
            {upcomingAppointments.length}
          </p>
          <p className="text-[11px] text-closr-text-muted mt-1 flex items-center gap-1">
            <span>View calendar</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </div>

        {/* Card 2: Completed Visits */}
        <div className="p-4 sm:p-5 rounded-2xl bg-closr-card border border-closr-border shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-closr-text-muted">
              Completed Visits
            </span>
            <div className="w-8 h-8 rounded-xl bg-closr-success-badge text-closr-success flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-closr-text">
            {completedVisitsCount}
          </p>
          <p className="text-[11px] text-closr-text-muted mt-1">
            In clinic records
          </p>
        </div>

        {/* Card 3: Pending Requests */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigate('/patient/appointments')}
          className="p-4 sm:p-5 rounded-2xl bg-closr-card border border-closr-border shadow-xs hover:border-closr-amber/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-closr-text-muted">
              Pending Requests
            </span>
            <div className="w-8 h-8 rounded-xl bg-closr-amber-badge text-closr-amber flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-closr-text group-hover:text-closr-amber transition-colors">
            {pendingRequestsCount}
          </p>
          <p className="text-[11px] text-closr-text-muted mt-1 flex items-center gap-1">
            <span>Awaiting clinic confirmation</span>
          </p>
        </div>

        {/* Card 4: Unread Messages */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigate('/patient/messages')}
          className="p-4 sm:p-5 rounded-2xl bg-closr-card border border-closr-border shadow-xs hover:border-closr-forest/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-closr-text-muted">
              Active Messages
            </span>
            <div className="w-8 h-8 rounded-xl bg-closr-sage/60 text-closr-forest flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-closr-text group-hover:text-closr-forest transition-colors">
            {unreadMessagesCount > 0 ? unreadMessagesCount : conversations.length}
          </p>
          <p className="text-[11px] text-closr-text-muted mt-1 flex items-center gap-1">
            <span>{unreadMessagesCount > 0 ? `${unreadMessagesCount} unread message(s)` : 'Clinic triage channel'}</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </div>
      </div>

      {/* 3. Main Grid: Next Upcoming Appointment (Left) & Notifications / Quick Access (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Upcoming Appointment Showcase */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-closr-card rounded-3xl p-6 sm:p-7 border border-closr-border shadow-soft space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-closr-border">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-closr-forest" />
                <h3 className="font-serif font-bold text-base sm:text-lg text-closr-text">
                  Next Scheduled Appointment
                </h3>
              </div>
              <Link
                to="/patient/appointments"
                className="text-xs font-semibold text-closr-forest hover:underline flex items-center gap-1"
              >
                View all ({appointments.length})
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {nearestUpcoming ? (
              <div className="space-y-4">
                {/* Appointment Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#E2E9DF] border border-[#D0DEC9] space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white text-closr-forest flex items-center justify-center font-serif font-bold text-sm shadow-xs">
                        Dr. S
                      </div>
                      <div>
                        <h4 className="font-bold text-sm sm:text-base text-closr-text">
                          {nearestUpcoming.doctorName}
                        </h4>
                        <p className="text-xs text-closr-text-muted">
                          Family Clinic · {nearestUpcoming.service || 'Consultation'}
                        </p>
                      </div>
                    </div>

                    <Badge variant={nearestUpcoming.status}>
                      {nearestUpcoming.status === 'confirmed'
                        ? 'Confirmed'
                        : nearestUpcoming.status === 'pending'
                        ? 'Pending Confirmation'
                        : nearestUpcoming.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-closr-text-muted block">Date & Time</span>
                      <span className="font-semibold text-closr-text">
                        {nearestUpcoming.date} · {nearestUpcoming.time}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-closr-text-muted block">Booking ID</span>
                      <span className="font-mono font-bold text-closr-forest">
                        {nearestUpcoming.bookingCode}
                      </span>
                    </div>

                    <div className="space-y-0.5 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-closr-text-muted block">Clinic Location</span>
                      <span className="font-semibold text-closr-text">
                        Indirapuram Plaza, Shop 4
                      </span>
                    </div>
                  </div>

                  {nearestUpcoming.notes && (
                    <div className="p-2.5 rounded-xl bg-white/70 border border-closr-border/60 text-[11px] text-closr-text-muted">
                      <span className="font-semibold text-closr-text">Visit Note: </span>
                      {nearestUpcoming.notes}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-closr-border/60">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDetailsAppointment(nearestUpcoming)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<CalendarClock className="w-3.5 h-3.5" />}
                      onClick={() => setRescheduleAppointment(nearestUpcoming)}
                    >
                      Reschedule
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<Ban className="w-3.5 h-3.5" />}
                      onClick={() => setCancelAppointment(nearestUpcoming)}
                    >
                      Cancel Visit
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 px-4 text-center space-y-3 bg-closr-bg/50 rounded-2xl border border-dashed border-closr-border">
                <div className="w-12 h-12 rounded-full bg-closr-sage/60 text-closr-forest flex items-center justify-center mx-auto">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-sm text-closr-text">
                    No upcoming appointments
                  </p>
                  <p className="text-xs text-closr-text-muted max-w-sm mx-auto">
                    You have no scheduled visits with Dr. Sharma right now. You can book an appointment at any time.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setIsBookModalOpen(true)}
                >
                  Book an Appointment
                </Button>
              </div>
            )}
          </div>

          {/* Health Records Section (Explicit Honest Empty State per spec) */}
          <div className="bg-closr-card rounded-3xl p-6 sm:p-7 border border-closr-border shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-closr-border">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-closr-forest" />
                <h3 className="font-serif font-bold text-base sm:text-lg text-closr-text">
                  Health Records & Prescriptions
                </h3>
              </div>
              <span className="text-[11px] text-closr-text-muted bg-closr-sage/40 px-2 py-0.5 rounded-full border border-closr-border">
                Demo Status
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-closr-bg/60 border border-closr-border text-center space-y-2">
              <FileText className="w-8 h-8 text-closr-text-muted/60 mx-auto" />
              <p className="text-sm font-semibold text-closr-text">
                No health records are available in this demo yet.
              </p>
              <p className="text-xs text-closr-text-muted max-w-md mx-auto leading-relaxed">
                Digital prescriptions, lab investigation results, and signed medical summaries will be securely published to your personal portal following completion of your clinic consultation.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Recent Notifications & Clinic Emergency Info */}
        <div className="space-y-6">
          
          {/* Notifications Card */}
          <div className="bg-closr-card rounded-3xl p-6 border border-closr-border shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-closr-border">
              <h3 className="font-serif font-bold text-sm sm:text-base text-closr-text">
                Recent Updates
              </h3>
              <span className="text-xs text-closr-text-muted">
                {notifications.length} alerts
              </span>
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-closr-text-muted py-4 text-center">
                No new activity for your account.
              </p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3 rounded-xl bg-closr-bg/70 border border-closr-border/80 text-xs space-y-1 text-left"
                  >
                    <p className="font-semibold text-closr-text truncate">
                      {notif.title}
                    </p>
                    <p className="text-[11px] text-closr-text-muted line-clamp-2">
                      {notif.description}
                    </p>
                    <span className="text-[10px] text-closr-text-muted block mt-1">
                      {notif.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Emergency Safety Notice Card */}
          <div className="bg-white rounded-3xl p-6 border border-closr-amber/30 shadow-soft space-y-3 text-left">
            <div className="flex items-center gap-2 text-closr-amber font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              Emergency Notice
            </div>
            <p className="text-xs text-closr-text leading-relaxed">
              This patient portal is for appointment scheduling and routine communication only.
            </p>
            <p className="text-[11px] text-closr-text-muted leading-relaxed">
              If you are experiencing acute chest pain, shortness of breath, severe bleeding, or any medical emergency, please call <strong>108 / 911</strong> or visit your nearest hospital emergency department immediately.
            </p>
          </div>

          {/* Clinic Contact Information Card */}
          <div className="bg-closr-card rounded-3xl p-6 border border-closr-border shadow-soft space-y-3 text-xs text-left">
            <h4 className="font-serif font-bold text-closr-text text-sm">
              Dr. Sharma's Clinic
            </h4>
            <div className="space-y-1.5 text-closr-text-muted text-[11px]">
              <p>📍 Shop 4, Greenfield Plaza, Indirapuram, Ghaziabad</p>
              <p>📞 Reception: +91 98201 44521</p>
              <p>⏰ Mon - Sat: 9:00 AM - 1:00 PM &amp; 5:00 PM - 8:30 PM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Book Appointment Modal */}
      <PatientBookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        currentPatient={activePatient}
        onBookingComplete={() => {
          loadPatientData();
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
          loadPatientData();
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
