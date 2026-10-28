import React, { useEffect } from 'react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { X, Phone, Mail, Clock, MessageSquare, Edit2, CalendarClock, ArrowRight, } from 'lucide-react';
import { mockMessages } from '../../data/mockMessages';
export const PatientProfileDrawer = ({ patient, isOpen, onClose, onEditPatient, onViewAppointments, onOpenConversation, appointments, }) => {
    // Escape key handler
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);
    if (!isOpen || !patient)
        return null;
    // Filter patient's appointments from shared store
    const patientAppointments = appointments.filter((a) => a.patientId === patient.id ||
        a.patientName.toLowerCase().includes(patient.name.toLowerCase().split(' ')[0]));
    const nextAppointment = patientAppointments.find((a) => a.status !== 'cancelled');
    // Filter relevant messages
    const relevantMessages = mockMessages.filter((m) => m.conversationId === 'conv-1' && patient.id === 'pat-3' // Rohit V.
    );
    return (<div role="dialog" aria-modal="true" aria-labelledby="patient-drawer-title" className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-closr-forest/20 backdrop-blur-[2px] transition-opacity" onClick={onClose} aria-hidden="true"/>

      {/* Slide-over Drawer (Desktop right-panel, mobile full-screen) */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-closr-card border-l border-closr-border shadow-modal flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 text-left">
          {/* A. Profile Header */}
          <div className="p-6 border-b border-closr-border/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-closr-forest bg-closr-sage/50 px-2.5 py-1 rounded-md border border-closr-border">
                {patient.id}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" leftIcon={<Edit2 className="w-3.5 h-3.5"/>} onClick={() => onEditPatient(patient)}>
                  Edit
                </Button>
                <button type="button" onClick={onClose} aria-label="Close patient profile" className="p-1 rounded-lg hover:bg-closr-sage/50 text-closr-text-muted hover:text-closr-text transition-colors closr-focus">
                  <X className="w-5 h-5"/>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Avatar name={patient.name} size="lg" className="bg-closr-sage text-closr-forest text-lg font-bold shrink-0 ring-2 ring-closr-border"/>
              <div className="space-y-1 min-w-0">
                <h2 id="patient-drawer-title" className="font-serif text-xl sm:text-2xl font-bold text-closr-forest truncate">
                  {patient.name}
                </h2>
                <Badge variant={patient.status}>
                  {patient.status === 'active'
            ? 'Active'
            : patient.status === 'new'
                ? 'New Patient'
                : patient.status === 'follow-up'
                    ? 'Follow-up Needed'
                    : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Drawer Body Content */}
          <div className="p-6 space-y-6 flex-1 text-xs sm:text-[13px]">
            {/* B. Contact Information */}
            <div className="space-y-2.5">
              <h3 className="font-semibold text-closr-text uppercase tracking-wider text-[11px] text-closr-text-muted">
                Contact Information
              </h3>
              <div className="p-3.5 rounded-xl bg-closr-bg/60 border border-closr-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-closr-text-muted flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-closr-forest"/> Phone
                  </span>
                  <span className="font-semibold text-closr-text font-mono">
                    {patient.phone}
                  </span>
                </div>
                {patient.email && (<div className="flex items-center justify-between pt-1 border-t border-closr-border/50">
                    <span className="text-closr-text-muted flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-closr-forest"/> Email
                    </span>
                    <span className="text-closr-text">{patient.email}</span>
                  </div>)}
                <div className="flex items-center justify-between pt-1 border-t border-closr-border/50">
                  <span className="text-closr-text-muted">Preferred Channel</span>
                  <span className="text-closr-forest font-medium">WhatsApp & SMS</span>
                </div>
              </div>
            </div>

            {/* C. Next Upcoming Appointment */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-closr-text uppercase tracking-wider text-[11px] text-closr-text-muted">
                  Next Appointment
                </h3>
                <button type="button" onClick={() => onViewAppointments(patient)} className="text-xs text-closr-forest hover:underline font-semibold flex items-center gap-1">
                  View all appointments <ArrowRight className="w-3 h-3"/>
                </button>
              </div>

              {nextAppointment ? (<div className="p-4 rounded-xl bg-closr-pale/70 border border-closr-border space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-closr-forest text-sm">
                      <Clock className="w-4 h-4 text-closr-forest"/>
                      <span>{nextAppointment.time} · {nextAppointment.date}</span>
                    </div>
                    <Badge variant={nextAppointment.status}>
                      {nextAppointment.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-closr-text pt-1">
                    <span>Doctor: {nextAppointment.doctorName}</span>
                    <span className="font-mono text-closr-forest font-semibold">
                      {nextAppointment.bookingCode || '—'}
                    </span>
                  </div>
                  {nextAppointment.service && (<p className="text-[11px] text-closr-text-muted pt-0.5">
                      Service: {nextAppointment.service}
                    </p>)}
                </div>) : (<div className="p-3.5 rounded-xl bg-closr-bg/40 border border-dashed border-closr-border text-center text-closr-text-muted">
                  No upcoming visit scheduled for this patient.
                </div>)}
            </div>

            {/* D. Appointment History */}
            <div className="space-y-2.5">
              <h3 className="font-semibold text-closr-text uppercase tracking-wider text-[11px] text-closr-text-muted">
                Appointment History ({patientAppointments.length})
              </h3>
              {patientAppointments.length > 0 ? (<div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {patientAppointments.map((apt) => (<div key={apt.id} className="p-3 rounded-xl bg-closr-card border border-closr-border flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-closr-text">
                            {apt.date} · {apt.time}
                          </span>
                          <span className="font-mono text-[10px] text-closr-forest">
                            {apt.bookingCode}
                          </span>
                        </div>
                        <p className="text-[11px] text-closr-text-muted">
                          {apt.doctorName} · {apt.service}
                        </p>
                      </div>
                      <Badge variant={apt.status} size="sm">
                        {apt.status}
                      </Badge>
                    </div>))}
                </div>) : (<div className="p-3 rounded-xl bg-closr-bg/40 border border-closr-border text-center text-closr-text-muted">
                  No previous appointment history on record.
                </div>)}
            </div>

            {/* E. Receptionist Conversation Snippet */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-closr-text uppercase tracking-wider text-[11px] text-closr-text-muted">
                  Receptionist Conversation
                </h3>
                <button type="button" onClick={() => onOpenConversation(patient)} className="text-xs text-closr-forest hover:underline font-semibold flex items-center gap-1">
                  Open chat <ArrowRight className="w-3 h-3"/>
                </button>
              </div>

              {relevantMessages.length > 0 ? (<div className="p-3.5 rounded-xl bg-closr-bg/50 border border-closr-border space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-closr-text-muted">
                    <span>Last message via Saathi AI</span>
                    <span>5:13 PM Today</span>
                  </div>
                  <p className="text-xs italic text-closr-text bg-white/70 p-2.5 rounded-lg border border-closr-border/60">
                    "{relevantMessages[0].content}"
                  </p>
                </div>) : (<div className="p-3 rounded-xl bg-closr-bg/40 border border-closr-border text-center text-closr-text-muted">
                  No active receptionist chat transcripts for this patient.
                </div>)}
            </div>

            {/* F. Clinical Condition Summary / Notes */}
            {patient.conditionSummary && (<div className="space-y-1.5 p-3.5 rounded-xl bg-closr-sage/30 border border-closr-border">
                <span className="font-semibold text-closr-forest uppercase tracking-wider text-[10px] block">
                  Care Summary / Triage Notes
                </span>
                <p className="text-xs text-closr-text leading-relaxed">
                  {patient.conditionSummary}
                </p>
              </div>)}
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-closr-border/80 bg-closr-bg/40 flex items-center justify-between gap-3">
            <Button variant="outline" size="sm" leftIcon={<MessageSquare className="w-4 h-4 text-closr-forest"/>} onClick={() => onOpenConversation(patient)}>
              Open Receptionist Chat
            </Button>
            <Button variant="primary" size="sm" leftIcon={<CalendarClock className="w-4 h-4"/>} onClick={() => onViewAppointments(patient)}>
              Book / Manage Visits
            </Button>
          </div>
        </div>
      </div>
    </div>);
};
