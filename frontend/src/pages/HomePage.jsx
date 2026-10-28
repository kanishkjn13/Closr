import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { MetricsGrid } from '../components/dashboard/MetricsGrid';
import { AppointmentsCard } from '../components/dashboard/AppointmentsCard';
import { ActivityTimeline } from '../components/dashboard/ActivityTimeline';
import { QuickActionsCard } from '../components/dashboard/QuickActionsCard';
import { UpcomingRemindersCard } from '../components/dashboard/UpcomingRemindersCard';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { Phone, Clock, Calendar, User, ShieldAlert, Check, Zap, ArrowRight } from 'lucide-react';
import { mockAppointments } from '../data/mockAppointments';
import { mockActivity, mockEscalations } from '../data/mockActivity';
import { mockPatients } from '../data/mockPatients';
import { appointmentService } from '../services/appointmentService';
import { notificationService } from '../services/notificationService';
export const HomePage = () => {
    const { onOpenMobileMenu } = useOutletContext();
    const navigate = useNavigate();
    const toast = useToast();
    // State for interactive modals
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [appointments, setAppointments] = useState(mockAppointments);
    const [activityEvents, setActivityEvents] = useState([]);
    const [isEscalationModalOpen, setIsEscalationModalOpen] = useState(false);
    const [isCallModalOpen, setIsCallModalOpen] = useState(false);
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [selectedPatientForCall, setSelectedPatientForCall] = useState(mockPatients[2]); // Rohit V.
    useEffect(() => {
        let isMounted = true;
        appointmentService.getAppointments().then((data) => {
            if (isMounted)
                setAppointments(data);
        });
        const loadEvents = async () => {
            const evts = await notificationService.getActivityEvents();
            if (isMounted)
                setActivityEvents(evts);
        };
        loadEvents();
        const unsub = notificationService.subscribe(loadEvents);
        return () => {
            isMounted = false;
            unsub();
        };
    }, []);
    const activeEscalation = mockEscalations[0]; // ESC-310 (Ramesh K.)
    const handleSimulateCall = () => {
        setIsCallModalOpen(false);
        toast.success(`Call Connected (Demo)`, `Simulated call to ${selectedPatientForCall.name} (${selectedPatientForCall.phone}). VoIP channel active.`);
    };
    const handleAcknowledgeEscalation = () => {
        setIsEscalationModalOpen(false);
        toast.success('Escalation Triage Acknowledged', 'Dr. Sharma notified. Emergency protocol recorded in clinic activity log.');
    };
    return (<div className="w-full max-w-[1360px] mx-auto text-closr-text animate-in fade-in duration-200">
      {/* 1. Header with Date, Doctor Avatar, and Greeting */}
      <DashboardHeader onOpenMobileMenu={onOpenMobileMenu} date="Thu, Oct 29, 2026" doctorName="Dr. Sharma"/>

      {/* 2. BREAK IT MODE Entry Banner */}
      <div className="my-5 p-4 sm:p-5 rounded-2xl bg-closr-card border border-closr-border shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-closr-amber-bg text-closr-amber flex items-center justify-center shrink-0 border border-closr-amber/30">
            <Zap className="w-5 h-5 fill-closr-amber/20" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-serif font-bold text-sm sm:text-base text-closr-text">
                BREAK IT MODE — AI Failure & Recovery Lab
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-closr-amber bg-closr-amber-bg px-2 py-0.5 rounded border border-closr-amber/30 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-closr-amber animate-pulse" />
                Demo Mode Active
              </span>
              <span className="text-[10px] text-closr-text-muted bg-closr-bg px-2 py-0.5 rounded border border-closr-border">
                Simulated Demo Tests
              </span>
            </div>
            <p className="text-xs text-closr-text-muted mt-1 leading-relaxed">
              Stress-test the AI receptionist and observe how it handles failures.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          rightIcon={<ArrowRight className="w-4 h-4" />}
          onClick={() => navigate('/break-it')}
          className="shrink-0 self-start sm:self-auto shadow-soft"
        >
          Launch Failure Lab
        </Button>
      </div>

      {/* 3. Three Summary Metric Cards */}
      <MetricsGrid appointments={appointments} escalationsCount={1} onOpenEscalationModal={() => setIsEscalationModalOpen(true)}/>

      {/* 3. Full-width Appointments Table */}
      <AppointmentsCard appointments={appointments} onSelectAppointment={(apt) => setSelectedAppointment(apt)} doctorName="Dr. Sharma"/>

      {/* 4. Lower Two-Column Section (60% / 40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-7 items-start">
        {/* Left Column: Activity Timeline (3/5 = 60%) */}
        <div className="lg:col-span-3">
          <ActivityTimeline events={activityEvents.length > 0 ? activityEvents : mockActivity} onSelectEscalation={() => setIsEscalationModalOpen(true)}/>
        </div>

        {/* Right Column: Quick Actions & Upcoming Reminders (2/5 = 40%) */}
        <div className="lg:col-span-2 space-y-5 sm:space-y-6">
          <QuickActionsCard onCallPatient={() => setIsCallModalOpen(true)} onOpenChat={() => navigate('/receptionist')}/>
          <UpcomingRemindersCard onOpenReminderModal={() => setIsReminderModalOpen(true)}/>
        </div>
      </div>

      {/* 5. Interactive Modals */}

      {/* Appointment Details Modal */}
      {selectedAppointment && (<Modal isOpen={Boolean(selectedAppointment)} onClose={() => setSelectedAppointment(null)} title="Appointment Details" description={`Booking reference: ${selectedAppointment.bookingCode || 'Walk-in / Waitlist'}`} footer={<>
              <Button variant="outline" size="sm" onClick={() => setSelectedAppointment(null)}>
                Close
              </Button>
              <Button variant="primary" size="sm" onClick={() => {
                    const patient = mockPatients.find((p) => p.name.includes(selectedAppointment.patientName.split(' ')[0]));
                    if (patient)
                        setSelectedPatientForCall(patient);
                    setSelectedAppointment(null);
                    setIsCallModalOpen(true);
                }}>
                Call Patient
              </Button>
            </>}>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-closr-border/60">
              <div>
                <p className="text-xs text-closr-text-muted">Patient / Slot</p>
                <p className="text-base font-semibold text-closr-text">
                  {selectedAppointment.patientName}
                </p>
              </div>
              <Badge variant={selectedAppointment.status}>
                {selectedAppointment.status === 'confirmed'
                ? 'Confirmed'
                : selectedAppointment.status === 'waitlist-offer'
                    ? 'Offer Sent'
                    : selectedAppointment.status === 'pending'
                        ? 'Reminder Pending'
                        : selectedAppointment.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-closr-bg/60 border border-closr-border">
                <span className="text-closr-text-muted block mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-closr-forest"/> Schedule
                </span>
                <span className="font-semibold text-closr-text">
                  {selectedAppointment.time} · {selectedAppointment.date}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-closr-bg/60 border border-closr-border">
                <span className="text-closr-text-muted block mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-closr-forest"/> Consulting Doctor
                </span>
                <span className="font-semibold text-closr-text">
                  {selectedAppointment.doctorName}
                </span>
              </div>
            </div>

            {selectedAppointment.service && (<div className="text-xs">
                <span className="text-closr-text-muted block mb-1">Reason / Service:</span>
                <span className="font-medium text-closr-text">
                  {selectedAppointment.service}
                </span>
              </div>)}

            {selectedAppointment.contextNote && (<div className="text-xs">
                <span className="text-closr-text-muted block mb-1">Clinic Status Note:</span>
                <span className="text-closr-text bg-closr-sage/30 px-2 py-1 rounded-md inline-block">
                  {selectedAppointment.contextNote}
                </span>
              </div>)}

            <div className="p-3 rounded-xl bg-closr-pale/70 border border-closr-border text-xs text-closr-text-muted">
              Note: This is a front-end demo record. Changes reflect in your local session.
            </div>
          </div>
        </Modal>)}

      {/* Escalation Modal (Human Assistance Needed) */}
      <Modal isOpen={isEscalationModalOpen} onClose={() => setIsEscalationModalOpen(false)} title="Escalation Requiring Doctor Triage" description="Active patient alert captured by Saathi AI receptionist" footer={<>
            <Button variant="outline" size="sm" onClick={() => setIsEscalationModalOpen(false)}>
              Dismiss
            </Button>
            <Button variant="danger" size="sm" leftIcon={<Check className="w-4 h-4"/>} onClick={handleAcknowledgeEscalation}>
              Acknowledge & Triage
            </Button>
          </>}>
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-closr-danger-bg border border-closr-danger/30 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-closr-danger shrink-0 mt-0.5"/>
            <div className="text-xs">
              <span className="font-semibold text-closr-danger block mb-0.5">
                Critical Safety Alert: ESC-310
              </span>
              <span className="text-closr-text">
                Patient {activeEscalation.patientName} reported chest pain and shortness of breath at 5:41 PM. Saathi withheld regular slot booking and routed patient to emergency care.
              </span>
            </div>
          </div>

          <div className="text-xs space-y-2">
            <div className="flex justify-between py-1.5 border-b border-closr-border/60">
              <span className="text-closr-text-muted">Patient:</span>
              <span className="font-semibold text-closr-text">{activeEscalation.patientName}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-closr-border/60">
              <span className="text-closr-text-muted">Priority:</span>
              <Badge variant="danger" size="sm">Critical</Badge>
            </div>
            <div className="flex justify-between py-1.5 border-b border-closr-border/60">
              <span className="text-closr-text-muted">Reported at:</span>
              <span className="text-closr-text">{activeEscalation.createdAt}</span>
            </div>
          </div>

          <div className="text-xs text-closr-text-muted italic bg-closr-bg/60 p-3 rounded-xl border border-closr-border">
            "Saathi withheld regular appointment booking, provided immediate emergency guidance, and routed the patient to urgent triage."
          </div>
        </div>
      </Modal>

      {/* Patient Call Modal */}
      <Modal isOpen={isCallModalOpen} onClose={() => setIsCallModalOpen(false)} title="Direct Patient Call (Demo)" description="Initiate outbound clinic call to patient" footer={<>
            <Button variant="outline" size="sm" onClick={() => setIsCallModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" leftIcon={<Phone className="w-4 h-4"/>} onClick={handleSimulateCall}>
              Simulate Call
            </Button>
          </>}>
        <div className="space-y-4">
          <div className="space-y-2 text-xs">
            <label className="text-closr-text-muted block font-medium">
              Select Patient to Call:
            </label>
            <select value={selectedPatientForCall.id} onChange={(e) => {
            const found = mockPatients.find((p) => p.id === e.target.value);
            if (found)
                setSelectedPatientForCall(found);
        }} className="w-full bg-closr-card text-closr-text text-sm rounded-xl border border-closr-border py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-closr-forest/20">
              {mockPatients.map((p) => (<option key={p.id} value={p.id}>
                  {p.name} ({p.phone})
                </option>))}
            </select>
          </div>

          <div className="p-3 rounded-xl bg-closr-bg/70 border border-closr-border text-xs space-y-1">
            <p className="font-semibold text-closr-text">
              Calling {selectedPatientForCall.name}
            </p>
            <p className="text-closr-text-muted">
              Phone: {selectedPatientForCall.phone}
            </p>
            <p className="text-[11px] text-closr-text-subtle pt-1">
              Note: This is a front-end simulation for Phase 2. No actual telephony call is placed.
            </p>
          </div>
        </div>
      </Modal>

      {/* Reminder Details Modal */}
      <Modal isOpen={isReminderModalOpen} onClose={() => setIsReminderModalOpen(false)} title="Scheduled Reminder" description="Automated AI patient follow-up alert" footer={<>
            <Button variant="outline" size="sm" onClick={() => setIsReminderModalOpen(false)}>
              Close
            </Button>
            <Button variant="secondary" size="sm" onClick={() => {
                setIsReminderModalOpen(false);
                toast.success('Reminder Dispatched Early', 'SMS and WhatsApp reminder sent to Rohit V. (SAT-2041).');
            }}>
              Send Early
            </Button>
          </>}>
        <div className="space-y-3.5 text-xs">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-closr-sage/30 border border-closr-border">
            <Clock className="w-5 h-5 text-closr-forest shrink-0"/>
            <div>
              <p className="font-semibold text-closr-text">Scheduled for 3:30 PM Today</p>
              <p className="text-closr-text-muted">Reminder — Dr. Sharma Clinic</p>
            </div>
          </div>

          <div className="space-y-1.5 p-3 rounded-xl bg-closr-card border border-closr-border">
            <p className="text-closr-text-muted">Target Booking:</p>
            <p className="font-semibold text-closr-text">SAT-2041 · Rohit V. (5:30 PM)</p>
            <p className="text-closr-text-muted text-[11px] pt-1">
              Message: "We will send an appointment reminder tomorrow at 3:30 PM. For prescriptions or diagnosis, Dr. Sharma will advise during consultation."
            </p>
          </div>
        </div>
      </Modal>
    </div>);
};
