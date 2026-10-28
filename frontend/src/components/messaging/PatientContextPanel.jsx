import React from 'react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { X, Phone, Mail, Calendar, Clock, ExternalLink, ShieldAlert, CheckCircle2, History, User, } from 'lucide-react';
import { cn } from '../../lib/utils';
export const PatientContextPanel = ({ patient, activeAppointment, appointments, escalation, onViewPatient, onViewAppointment, onRescheduleAppointment, onOpenEscalation, onUpdateEscalationStatus, onClose, className, }) => {
    if (!patient) {
        return (<div className={cn('w-[290px] xl:w-[320px] bg-closr-card border-l border-closr-border p-6 flex flex-col items-center justify-center text-center text-closr-text-muted select-none h-full', className)}>
        <div className="w-12 h-12 rounded-full bg-closr-sage/30 flex items-center justify-center text-closr-forest mb-3">
          <User className="w-6 h-6"/>
        </div>
        <h4 className="text-sm font-semibold text-closr-text">No Patient Selected</h4>
        <p className="text-xs mt-1">Select a conversation to inspect patient details and history.</p>
      </div>);
    }
    // Filter history to other appointments (excluding active one)
    const historyAppointments = appointments.filter((a) => a.id !== activeAppointment?.id);
    return (<div className={cn('w-[290px] xl:w-[320px] bg-closr-card border-l border-closr-border flex flex-col h-full overflow-y-auto select-none shrink-0', className)}>
      {/* Panel Header */}
      <div className="p-4 border-b border-closr-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-closr-text">Patient Context</h3>
          <span className="font-mono text-[10px] text-closr-forest font-bold bg-closr-sage/50 px-1.5 py-0.5 rounded border border-closr-border">
            {patient.id}
          </span>
        </div>
        {onClose && (<button type="button" onClick={onClose} aria-label="Close context panel" className="p-1 rounded-lg text-closr-text-muted hover:text-closr-text hover:bg-closr-sage/30 transition-colors closr-focus">
            <X className="w-4 h-4"/>
          </button>)}
      </div>

      <div className="p-4 space-y-5 text-left text-xs">
        {/* Patient Profile Card */}
        <div className="p-3.5 rounded-2xl bg-white border border-closr-border shadow-soft space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <Avatar name={patient.name} size="md" className="bg-closr-sage text-closr-forest font-bold ring-1 ring-closr-border/60"/>
              <div>
                <h4 className="font-semibold text-closr-text text-sm leading-tight">
                  {patient.name}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge variant={patient.status === 'active' ? 'confirmed' : 'pending'} size="sm">
                    {patient.status === 'active' ? 'Pakka Patient' : 'Naya Patient'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-1 text-closr-text-muted text-[11px] border-t border-closr-border/50">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-closr-forest shrink-0"/>
              <span className="font-mono text-closr-text font-medium">{patient.phone}</span>
            </div>
            {patient.email && (<div className="flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 text-closr-forest shrink-0"/>
                <span className="text-closr-text truncate">{patient.email}</span>
              </div>)}
            {patient.conditionSummary && (<div className="text-[11px] text-closr-text-muted pt-0.5">
                Summary: <span className="text-closr-text font-medium">{patient.conditionSummary}</span>
              </div>)}
          </div>

          <button type="button" onClick={() => onViewPatient(patient.id)} className="w-full py-1.5 px-2.5 rounded-xl bg-closr-sage/30 hover:bg-closr-sage/60 border border-closr-border text-closr-forest font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs">
            <span>View full profile</span>
            <ExternalLink className="w-3 h-3"/>
          </button>
        </div>

        {/* Escalation Card (if present) */}
        {escalation && (<div className={cn('p-3.5 rounded-2xl border shadow-soft space-y-2.5', escalation.priority === 'critical' || escalation.priority === 'high'
                ? 'bg-closr-danger-bg/90 border-closr-danger/40'
                : 'bg-closr-amber-bg/70 border-closr-amber/30')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-closr-danger font-bold text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0"/>
                <span>{escalation.id}</span>
              </div>
              <Badge variant={escalation.status === 'resolved'
                ? 'completed'
                : escalation.priority === 'critical'
                    ? 'danger'
                    : 'warning'} size="sm">
                {escalation.status === 'resolved' ? 'Resolved' : `${escalation.priority} Priority`}
              </Badge>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-closr-text-muted uppercase font-semibold tracking-wider">
                Reason / Symptoms
              </span>
              <p className="text-xs text-closr-text font-medium leading-relaxed">
                {escalation.reason}
              </p>
            </div>

            <div className="flex items-center justify-between pt-1 text-[10px] text-closr-text-muted border-t border-black/5">
              <span>Logged: {escalation.createdAt}</span>
              <span className="font-semibold text-closr-forest">Staff Handoff</span>
            </div>

            {/* Quick action: Status toggles */}
            <div className="pt-1 flex items-center gap-1.5">
              {escalation.status !== 'resolved' ? (<button type="button" onClick={() => onUpdateEscalationStatus(escalation.id, 'resolved')} className="flex-1 py-1 px-2 rounded-xl bg-white border border-closr-success text-closr-success font-semibold text-[11px] hover:bg-closr-success-bg transition-colors flex items-center justify-center gap-1 shadow-2xs">
                  <CheckCircle2 className="w-3 h-3"/>
                  <span>Mark Resolved</span>
                </button>) : (<button type="button" onClick={() => onUpdateEscalationStatus(escalation.id, 'open')} className="flex-1 py-1 px-2 rounded-xl bg-white border border-closr-border text-closr-text-muted font-semibold text-[11px] hover:bg-closr-sage/30 transition-colors flex items-center justify-center gap-1">
                  <span>Reopen Case</span>
                </button>)}
              <button type="button" onClick={onOpenEscalation} className="py-1 px-2 rounded-xl bg-white border border-closr-border text-closr-text font-semibold text-[11px] hover:bg-closr-sage/30 transition-colors shadow-2xs">
                Edit
              </button>
            </div>
          </div>)}

        {/* Next / Active Appointment */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-closr-text-muted uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3 text-closr-forest"/> Related Appointment
            </span>
            {activeAppointment?.bookingCode && (<span className="font-mono text-[10px] font-bold text-closr-forest">
                {activeAppointment.bookingCode}
              </span>)}
          </div>

          {activeAppointment ? (<div className="p-3 rounded-2xl bg-white border border-closr-border shadow-soft space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-closr-text text-xs">
                  {activeAppointment.doctorName}
                </span>
                <Badge variant={activeAppointment.status} size="sm">
                  {activeAppointment.status === 'confirmed' ? 'Confirmed' : activeAppointment.status}
                </Badge>
              </div>

              <div className="space-y-1 text-[11px] text-closr-text-muted">
                <div className="flex items-center gap-1.5 text-closr-text font-medium">
                  <Clock className="w-3 h-3 text-closr-forest shrink-0"/>
                  <span>
                    {activeAppointment.date} · {activeAppointment.time}
                  </span>
                </div>
                {activeAppointment.service && (<p className="text-[11px] text-closr-text-muted">
                    Service:{' '}
                    <span className="text-closr-text font-medium">{activeAppointment.service}</span>
                  </p>)}
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-closr-border/60">
                <button type="button" onClick={() => onViewAppointment(activeAppointment)} className="flex-1 py-1 px-2 rounded-xl bg-closr-sage/30 hover:bg-closr-sage/60 border border-closr-border text-closr-text font-semibold text-[11px] transition-colors">
                  View Details
                </button>
                {activeAppointment.status !== 'cancelled' && (<button type="button" onClick={() => onRescheduleAppointment(activeAppointment)} className="flex-1 py-1 px-2 rounded-xl bg-closr-forest text-white hover:bg-closr-forest-hover font-semibold text-[11px] transition-colors shadow-2xs">
                    Reschedule
                  </button>)}
              </div>
            </div>) : (<div className="p-3 rounded-2xl bg-white/70 border border-dashed border-closr-border text-center text-closr-text-muted text-[11px]">
              No active appointment booked for this thread.
            </div>)}
        </div>

        {/* Appointment History */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-closr-text-muted uppercase tracking-wider flex items-center gap-1">
            <History className="w-3 h-3 text-closr-forest"/> Past Visits ({historyAppointments.length})
          </span>

          {historyAppointments.length > 0 ? (<div className="space-y-1.5">
              {historyAppointments.slice(0, 3).map((apt) => (<div key={apt.id} onClick={() => onViewAppointment(apt)} className="p-2.5 rounded-xl bg-white border border-closr-border/80 hover:border-closr-forest hover:bg-closr-sage/20 transition-all cursor-pointer flex items-center justify-between shadow-2xs">
                  <div className="text-left">
                    <p className="font-semibold text-closr-text text-[11px]">
                      {apt.date} · {apt.time}
                    </p>
                    <p className="text-[10px] text-closr-text-muted">
                      {apt.doctorName} {apt.service ? `· ${apt.service}` : ''}
                    </p>
                  </div>
                  <Badge variant={apt.status} size="sm">
                    {apt.status}
                  </Badge>
                </div>))}
            </div>) : (<div className="p-3 rounded-2xl bg-white/70 border border-dashed border-closr-border text-center text-closr-text-muted text-[11px]">
              No previous visit records found.
            </div>)}
        </div>
      </div>
    </div>);
};
