import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { appointmentService } from '../../services/appointmentService';
import { AlertCircle, Ban } from 'lucide-react';
export const CancelAppointmentModal = ({ appointment, isOpen, onClose, onAppointmentCancelled, }) => {
    const [cancelReason, setCancelReason] = useState('Patient requested cancellation');
    const [isSubmitting, setIsSubmitting] = useState(false);
    if (!appointment)
        return null;
    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            const updated = await appointmentService.cancelAppointment(appointment.id, cancelReason);
            onAppointmentCancelled(updated);
            onClose();
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (<Modal isOpen={isOpen} onClose={onClose} title="Cancel Appointment?" description={`Confirm cancellation for ${appointment.patientName} (${appointment.bookingCode || '—'})`} footer={<>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Keep appointment
          </Button>
          <Button variant="danger" size="sm" leftIcon={<Ban className="w-3.5 h-3.5"/>} isLoading={isSubmitting} onClick={handleConfirm}>
            Cancel appointment
          </Button>
        </>}>
      <div className="space-y-3.5 text-left text-xs">
        <div className="p-3.5 rounded-xl bg-closr-danger-bg border border-closr-danger/30 flex items-start gap-2.5 text-closr-danger">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5"/>
          <div className="space-y-0.5">
            <span className="font-semibold block">Local Demo Action</span>
            <span className="text-closr-text">
              Cancelling this booking will update its status to Cancelled and free this slot for other clinic patients.
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-closr-bg/50 border border-closr-border space-y-1">
          <p className="font-semibold text-closr-text">
            {appointment.patientName} · {appointment.service}
          </p>
          <p className="text-closr-text-muted">
            {appointment.time} on {appointment.date} with {appointment.doctorName}
          </p>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-closr-text uppercase tracking-wider block text-[11px]">
            Cancellation Reason
          </label>
          <input type="text" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="w-full text-xs py-2 px-3 rounded-xl bg-closr-card border border-closr-border text-closr-text focus:outline-none focus:ring-1 focus:ring-closr-forest"/>
        </div>
      </div>
    </Modal>);
};
