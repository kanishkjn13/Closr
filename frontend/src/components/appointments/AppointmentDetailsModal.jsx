import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Calendar, User, BookmarkCheck, Phone, Check, CalendarClock, Ban } from 'lucide-react';
import { mockPatients } from '../../data/mockPatients';
export const AppointmentDetailsModal = ({ appointment, isOpen, onClose, onConfirm, onReschedule, onCancel, }) => {
    if (!appointment)
        return null;
    const matchedPatient = mockPatients.find((p) => p.id === appointment.patientId ||
        p.name.toLowerCase().includes(appointment.patientName.toLowerCase().split(' ')[0]));
    const isPending = appointment.status === 'pending' || appointment.status === 'waitlist-offer';
    const isCancelled = appointment.status === 'cancelled';
    return (<Modal isOpen={isOpen} onClose={onClose} title="Appointment Details" description={`Booking reference: ${appointment.bookingCode || '—'}`} footer={<div className="flex flex-wrap items-center justify-between w-full gap-2">
          <div>
            {!isCancelled && (<Button variant="danger" size="sm" leftIcon={<Ban className="w-3.5 h-3.5"/>} onClick={() => {
                    onClose();
                    onCancel(appointment);
                }}>
                Cancel Visit
              </Button>)}
          </div>

          <div className="flex items-center gap-2">
            {!isCancelled && (<Button variant="outline" size="sm" leftIcon={<CalendarClock className="w-3.5 h-3.5"/>} onClick={() => {
                    onClose();
                    onReschedule(appointment);
                }}>
                Reschedule
              </Button>)}

            {isPending && (<Button variant="primary" size="sm" leftIcon={<Check className="w-3.5 h-3.5"/>} onClick={() => {
                    onClose();
                    onConfirm(appointment);
                }}>
                Confirm Appointment
              </Button>)}

            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>}>
      <div className="space-y-4 text-left">
        {/* Patient Profile Banner */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-closr-bg/60 border border-closr-border">
          <div className="flex items-center gap-3">
            <Avatar name={appointment.patientName} size="md" className="bg-closr-sage text-closr-forest shrink-0"/>
            <div>
              <p className="text-sm font-semibold text-closr-text">
                {appointment.patientName}
              </p>
              {matchedPatient?.phone && (<p className="text-xs text-closr-text-muted flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-closr-forest"/>
                  {matchedPatient.phone}
                </p>)}
            </div>
          </div>
          <Badge variant={appointment.status}>
            {appointment.status === 'confirmed'
            ? 'Confirmed'
            : appointment.status === 'pending'
                ? 'Pending'
                : appointment.status}
          </Badge>
        </div>

        {/* Schedule & Clinical Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-closr-card border border-closr-border space-y-1">
            <span className="text-closr-text-muted flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-closr-forest"/> Date & Time
            </span>
            <p className="font-semibold text-closr-text">
              {appointment.time} · {appointment.date}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-closr-card border border-closr-border space-y-1">
            <span className="text-closr-text-muted flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-closr-forest"/> Doctor
            </span>
            <p className="font-semibold text-closr-text">
              {appointment.doctorName}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-closr-card border border-closr-border space-y-1">
            <span className="text-closr-text-muted">Clinical Service</span>
            <p className="font-semibold text-closr-text">
              {appointment.service || 'Consultation'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-closr-card border border-closr-border space-y-1">
            <span className="text-closr-text-muted flex items-center gap-1">
              <BookmarkCheck className="w-3.5 h-3.5 text-closr-forest"/> Booking ID
            </span>
            <p className="font-mono font-bold text-closr-forest">
              {appointment.bookingCode || '—'}
            </p>
          </div>
        </div>

        {/* Context Note / Notes */}
        {appointment.notes && (<div className="p-3 rounded-xl bg-closr-bg/40 border border-closr-border text-xs space-y-1">
            <span className="text-closr-text-muted font-medium block">Doctor Notes / Audit:</span>
            <p className="text-closr-text leading-relaxed">{appointment.notes}</p>
          </div>)}

        {appointment.contextNote && (<div className="text-xs">
            <span className="text-closr-text-muted block mb-1">Receptionist Context:</span>
            <span className="text-closr-text bg-closr-sage/40 px-2.5 py-1 rounded-md inline-block">
              {appointment.contextNote}
            </span>
          </div>)}

        <div className="text-[11px] text-closr-text-muted italic border-t border-closr-border/60 pt-2">
          Demo Record • Part of Closr local clinic operations session.
        </div>
      </div>
    </Modal>);
};
