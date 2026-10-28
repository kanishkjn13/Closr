import React, { useState } from 'react';
import { Calendar, Clock, User, Stethoscope, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToast } from '../ui/Toast';
import { appointmentService } from '../../services/appointmentService';
import { cn } from '../../lib/utils';

const AVAILABLE_SLOTS = [
  '4:30 PM',
  '5:00 PM',
  '5:30 PM',
  '6:00 PM',
  '6:15 PM',
  '6:45 PM',
  '7:15 PM',
  '7:45 PM',
];

const CLINIC_SERVICES = [
  { id: 'General Consultation', name: 'General Consultation', duration: '15 mins', fee: '₹600' },
  { id: 'Fever Consultation', name: 'Fever Consultation', duration: '15 mins', fee: '₹500' },
  { id: 'Follow-up', name: 'Follow-up Visit', duration: '10 mins', fee: 'Complimentary (7d)' },
  { id: 'Routine Health Checkup', name: 'Routine Health Checkup', duration: '20 mins', fee: '₹800' },
  { id: 'Pediatric Care', name: 'Pediatric Consultation', duration: '15 mins', fee: '₹600' },
];

export const PatientBookAppointmentModal = ({ isOpen, onClose, currentPatient, onBookingComplete }) => {
  const toast = useToast();

  const [doctorName] = useState('Dr. Sharma');
  const [selectedService, setSelectedService] = useState('General Consultation');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState('5:30 PM');
  const [patientNotes, setPatientNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1 = form, 2 = confirmed card
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const handleBook = async () => {
    if (!selectedSlot || !selectedDate || !selectedService) {
      toast.error('Missing details', 'Please select a date, service, and time slot.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Slot conflict validation
      const hasConflict = await appointmentService.checkSlotConflict(
        doctorName,
        selectedDate,
        selectedSlot
      );

      if (hasConflict) {
        toast.error(
          'Slot Unavailable',
          `The ${selectedSlot} slot on ${selectedDate} is already booked. Please choose another time.`
        );
        setIsSubmitting(false);
        return;
      }

      // Create new appointment in shared appointmentService
      const newApt = await appointmentService.createAppointment({
        patientId: currentPatient.id,
        patientName: currentPatient.name,
        doctorName,
        date: selectedDate,
        time: selectedSlot,
        service: selectedService,
        status: 'confirmed',
        reminderStatus: 'scheduled',
        notes: patientNotes ? `Patient note: ${patientNotes}` : 'Booked via Patient Portal',
        contextNote: 'Booked directly by patient through personal portal',
      });

      setConfirmedBooking(newApt);
      setStep(2);
      toast.success('Appointment Confirmed', `Your visit is scheduled for ${selectedDate} at ${selectedSlot}.`);
      if (onBookingComplete) {
        onBookingComplete(newApt);
      }
    } catch (err) {
      toast.error('Booking Failed', err.message || 'Could not schedule appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setStep(1);
    setConfirmedBooking(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title={step === 1 ? 'Book a Consultation' : 'Booking Confirmed!'}
      description={
        step === 1
          ? "Select your preferred date, time slot, and clinical service with Dr. Sharma."
          : `Your reference code is ${confirmedBooking?.bookingCode || 'SAT-2041'}`
      }
      footer={
        step === 1 ? (
          <>
            <Button variant="outline" size="sm" onClick={handleResetAndClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleBook}
              isLoading={isSubmitting}
            >
              Confirm Appointment
            </Button>
          </>
        ) : (
          <Button variant="primary" size="sm" onClick={handleResetAndClose} className="w-full sm:w-auto">
            Done & View Appointments
          </Button>
        )
      }
    >
      {step === 1 ? (
        <div className="space-y-4 text-left">
          {/* Doctor Info Card */}
          <div className="p-3.5 rounded-2xl bg-closr-bg border border-closr-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-closr-sage text-closr-forest flex items-center justify-center font-bold text-sm">
                DS
              </div>
              <div>
                <p className="text-xs font-bold text-closr-text">{doctorName}</p>
                <p className="text-[11px] text-closr-text-muted">Family Physician & Preventive Care</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-closr-forest bg-white px-2.5 py-1 rounded-lg border border-closr-border">
              Indirapuram Clinic
            </span>
          </div>

          {/* Service Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-closr-text flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-closr-forest" />
              Service / Visit Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CLINIC_SERVICES.map((srv) => {
                const isSelected = selectedService === srv.id;
                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => setSelectedService(srv.id)}
                    className={cn(
                      'p-2.5 rounded-xl border text-left transition-all',
                      isSelected
                        ? 'border-closr-forest bg-closr-forest text-white shadow-xs'
                        : 'border-closr-border bg-white text-closr-text hover:bg-closr-sage/30'
                    )}
                  >
                    <p className="text-xs font-semibold leading-tight">{srv.name}</p>
                    <p className={cn('text-[10px] mt-0.5', isSelected ? 'text-white/80' : 'text-closr-text-muted')}>
                      {srv.duration} · {srv.fee}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-closr-text flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-closr-forest" />
              Appointment Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-closr-border bg-white text-xs font-semibold text-closr-text closr-focus shadow-2xs"
            />
          </div>

          {/* Time Slot Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-closr-text flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-closr-forest" />
              Available Time Slots
            </label>
            <div className="grid grid-cols-4 gap-2">
              {AVAILABLE_SLOTS.map((slot) => {
                const isChosen = selectedSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      'py-2 px-1 text-center rounded-xl border text-xs font-semibold transition-all',
                      isChosen
                        ? 'bg-closr-forest text-white border-closr-forest shadow-xs'
                        : 'bg-white border-closr-border text-closr-text hover:bg-closr-sage/30'
                    )}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Patient Symptoms or Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-closr-text">
              Symptoms or Reason for Visit (Optional)
            </label>
            <Input
              placeholder="e.g. Mild headache, seasonal cold, routine medication renewal..."
              value={patientNotes}
              onChange={(e) => setPatientNotes(e.target.value)}
              className="bg-white text-xs"
            />
          </div>

          {/* Disclaimer */}
          <div className="p-3 rounded-xl bg-closr-bg border border-closr-border/80 text-[11px] text-closr-text-muted flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-closr-forest shrink-0 mt-0.5" />
            <span>
              This is a simulated demo appointment. Changes update your local clinic schedule and admin panel in real time.
            </span>
          </div>
        </div>
      ) : (
        /* Confirmed Step 2 */
        <div className="space-y-4 py-2 text-center">
          <div className="w-12 h-12 rounded-full bg-closr-success-badge text-closr-success flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h4 className="font-serif text-lg font-bold text-closr-text">
              Appointment Successfully Booked
            </h4>
            <p className="text-xs text-closr-text-muted">
              We look forward to seeing you at Dr. Sharma's Clinic.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#E2E9DF] border border-[#D0DEC9] text-left space-y-3">
            <div className="flex justify-between items-center text-xs pb-2 border-b border-closr-border/60">
              <span className="text-closr-text-muted">Doctor:</span>
              <span className="font-semibold text-closr-text">{doctorName}</span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-closr-border/60">
              <span className="text-closr-text-muted">Date & Time:</span>
              <span className="font-semibold text-closr-text">{confirmedBooking?.date} at {confirmedBooking?.time}</span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-closr-border/60">
              <span className="text-closr-text-muted">Service:</span>
              <span className="font-semibold text-closr-text">{confirmedBooking?.service}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-closr-text-muted">Booking Reference:</span>
              <span className="font-mono font-bold text-closr-forest">{confirmedBooking?.bookingCode}</span>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
