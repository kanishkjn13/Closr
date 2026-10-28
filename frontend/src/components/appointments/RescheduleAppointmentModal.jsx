import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { appointmentService } from '../../services/appointmentService';
import { Clock, AlertCircle, CalendarClock } from 'lucide-react';
export const RescheduleAppointmentModal = ({ appointment, isOpen, onClose, onAppointmentRescheduled, }) => {
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('5:30 PM');
    const [conflictError, setConflictError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const availableSlots = [
        '4:30 PM',
        '5:00 PM',
        '5:30 PM',
        '6:00 PM',
        '6:15 PM',
        '6:45 PM',
        '7:15 PM',
        '7:45 PM',
        '8:15 PM',
    ];
    useEffect(() => {
        if (appointment) {
            setNewDate(appointment.date);
            setNewTime(appointment.time);
            setConflictError('');
        }
    }, [appointment]);
    if (!appointment)
        return null;
    const handleConfirm = async () => {
        setConflictError('');
        setIsSubmitting(true);
        try {
            // Conflict check
            const hasConflict = await appointmentService.checkSlotConflict(appointment.doctorName, newDate, newTime, appointment.id);
            if (hasConflict) {
                setConflictError(`${appointment.doctorName} already has an active appointment at ${newTime} on ${newDate}. Please choose another slot.`);
                setIsSubmitting(false);
                return;
            }
            const updated = await appointmentService.rescheduleAppointment(appointment.id, newDate, newTime);
            onAppointmentRescheduled(updated);
            onClose();
        }
        catch {
            setConflictError('Failed to reschedule appointment. Please try again.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (<Modal isOpen={isOpen} onClose={onClose} title="Reschedule Appointment" description={`Move appointment for ${appointment.patientName} (${appointment.bookingCode || '—'})`} footer={<>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" leftIcon={<CalendarClock className="w-4 h-4"/>} isLoading={isSubmitting} onClick={handleConfirm}>
            Confirm Reschedule
          </Button>
        </>}>
      <div className="space-y-4 text-left">
        {conflictError && (<div className="p-3 rounded-xl bg-closr-danger-bg border border-closr-danger/30 flex items-start gap-2.5 text-xs text-closr-danger">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5"/>
            <span>{conflictError}</span>
          </div>)}

        {/* Current Booking Info */}
        <div className="p-3.5 rounded-xl bg-closr-bg/60 border border-closr-border text-xs space-y-1">
          <p className="font-semibold text-closr-text">
            Current: {appointment.patientName} with {appointment.doctorName}
          </p>
          <p className="text-closr-text-muted">
            Scheduled: {appointment.time} on {appointment.date} ({appointment.service})
          </p>
        </div>

        {/* New Date Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-closr-text uppercase tracking-wider block">
            Select New Date
          </label>
          <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl bg-closr-card border border-closr-border text-closr-text focus:outline-none focus:ring-1 focus:ring-closr-forest"/>
        </div>

        {/* New Time Slot Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-closr-text uppercase tracking-wider block">
            Select New Time Slot
          </label>
          <div className="grid grid-cols-3 gap-2">
            {availableSlots.map((slot) => {
            const isSelected = newTime === slot;
            return (<button key={slot} type="button" onClick={() => setNewTime(slot)} className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${isSelected
                    ? 'bg-closr-forest text-white border-closr-forest shadow-xs'
                    : 'bg-closr-card border border-closr-border text-closr-text hover:bg-closr-sage/30'}`}>
                  <Clock className="w-3 h-3"/>
                  <span>{slot}</span>
                </button>);
        })}
          </div>
        </div>
      </div>
    </Modal>);
};
