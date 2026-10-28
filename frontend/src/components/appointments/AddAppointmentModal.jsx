import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { mockPatients } from '../../data/mockPatients';
import { appointmentService } from '../../services/appointmentService';
import { AlertCircle, Plus } from 'lucide-react';
export const AddAppointmentModal = ({ isOpen, onClose, onAppointmentCreated, defaultDate = '2026-10-29', }) => {
    const [patientMode, setPatientMode] = useState('existing');
    const [selectedPatientId, setSelectedPatientId] = useState(mockPatients[0].id);
    const [newPatientName, setNewPatientName] = useState('');
    const [newPatientPhone, setNewPatientPhone] = useState('');
    const [doctorName, setDoctorName] = useState('Dr. Sharma');
    const [date, setDate] = useState(defaultDate);
    const [time, setTime] = useState('5:00 PM');
    const [service, setService] = useState('Follow-up');
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState('pending');
    const [conflictError, setConflictError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const timeSlots = [
        '4:30 PM',
        '5:00 PM',
        '5:30 PM',
        '6:00 PM',
        '6:15 PM',
        '6:30 PM',
        '7:00 PM',
        '7:15 PM',
        '7:45 PM',
        '8:15 PM',
    ];
    const handleSubmit = async (e) => {
        e.preventDefault();
        setConflictError('');
        const errors = {};
        let patientName = '';
        let patientId = '';
        if (patientMode === 'existing') {
            const p = mockPatients.find((item) => item.id === selectedPatientId);
            if (!p) {
                errors.patient = 'Please select a patient';
            }
            else {
                patientName = p.name;
                patientId = p.id;
            }
        }
        else {
            if (!newPatientName.trim()) {
                errors.newPatientName = 'Patient name is required';
            }
            patientName = newPatientName.trim();
            patientId = `pat-${Date.now()}`;
        }
        if (!doctorName)
            errors.doctor = 'Doctor is required';
        if (!date)
            errors.date = 'Date is required';
        if (!time)
            errors.time = 'Time is required';
        if (!service)
            errors.service = 'Service is required';
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }
        setValidationErrors({});
        setIsSubmitting(true);
        try {
            // Conflict check
            const hasConflict = await appointmentService.checkSlotConflict(doctorName, date, time);
            if (hasConflict) {
                setConflictError(`${doctorName} already has an active appointment at ${time} on ${date}. Please choose another time.`);
                setIsSubmitting(false);
                return;
            }
            const newApt = await appointmentService.createAppointment({
                patientId,
                patientName,
                doctorName,
                date,
                time,
                service,
                status,
                reminderStatus: 'pending',
                notes: notes || undefined,
            });
            onAppointmentCreated(newApt);
            onClose();
        }
        catch {
            setConflictError('Failed to save appointment. Please try again.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (<Modal isOpen={isOpen} onClose={onClose} title="Add New Appointment" description="Schedule a clinic consultation for Dr. Sharma Clinic" footer={<>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4"/>} isLoading={isSubmitting} onClick={handleSubmit}>
            Create Appointment
          </Button>
        </>}>
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {conflictError && (<div className="p-3 rounded-xl bg-closr-danger-bg border border-closr-danger/30 flex items-start gap-2.5 text-xs text-closr-danger">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5"/>
            <span>{conflictError}</span>
          </div>)}

        {/* Patient Selection Tabs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-closr-text uppercase tracking-wider">
              Patient
            </label>
            <div className="flex rounded-lg border border-closr-border p-0.5 bg-closr-bg text-xs">
              <button type="button" onClick={() => setPatientMode('existing')} className={`px-2 py-0.5 rounded-md transition-colors ${patientMode === 'existing'
            ? 'bg-closr-forest text-white font-medium'
            : 'text-closr-text-muted hover:text-closr-text'}`}>
                Existing
              </button>
              <button type="button" onClick={() => setPatientMode('new')} className={`px-2 py-0.5 rounded-md transition-colors ${patientMode === 'new'
            ? 'bg-closr-forest text-white font-medium'
            : 'text-closr-text-muted hover:text-closr-text'}`}>
                New
              </button>
            </div>
          </div>

          {patientMode === 'existing' ? (<select value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} className="w-full text-xs sm:text-sm py-2.5 px-3 rounded-xl bg-closr-card border border-closr-border text-closr-text focus:outline-none focus:ring-1 focus:ring-closr-forest">
              {mockPatients.map((p) => (<option key={p.id} value={p.id}>
                  {p.name} ({p.phone})
                </option>))}
            </select>) : (<div className="grid grid-cols-2 gap-2">
              <Input placeholder="Full Name" value={newPatientName} onChange={(e) => setNewPatientName(e.target.value)} error={validationErrors.newPatientName}/>
              <Input placeholder="Phone (+91)" value={newPatientPhone} onChange={(e) => setNewPatientPhone(e.target.value)}/>
            </div>)}
        </div>

        {/* Doctor & Date */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-closr-text uppercase tracking-wider block">
              Doctor
            </label>
            <select value={doctorName} onChange={(e) => setDoctorName(e.target.value)} className="w-full text-xs py-2 px-3 rounded-xl bg-closr-card border border-closr-border text-closr-text focus:outline-none focus:ring-1 focus:ring-closr-forest">
              <option value="Dr. Sharma">Dr. Sharma</option>
              <option value="Dr. Verma">Dr. Verma</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-closr-text uppercase tracking-wider block">
              Date
            </label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full text-xs py-2 px-3 rounded-xl bg-closr-card border border-closr-border text-closr-text focus:outline-none focus:ring-1 focus:ring-closr-forest"/>
          </div>
        </div>

        {/* Time Slot & Service */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-closr-text uppercase tracking-wider block">
              Time Slot
            </label>
            <select value={time} onChange={(e) => setTime(e.target.value)} className="w-full text-xs py-2 px-3 rounded-xl bg-closr-card border border-closr-border text-closr-text focus:outline-none focus:ring-1 focus:ring-closr-forest">
              {timeSlots.map((slot) => (<option key={slot} value={slot}>
                  {slot}
                </option>))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-closr-text uppercase tracking-wider block">
              Service
            </label>
            <select value={service} onChange={(e) => setService(e.target.value)} className="w-full text-xs py-2 px-3 rounded-xl bg-closr-card border border-closr-border text-closr-text focus:outline-none focus:ring-1 focus:ring-closr-forest">
              <option value="Follow-up">Follow-up</option>
              <option value="General consultation">General consultation</option>
              <option value="Fever consultation">Fever consultation</option>
              <option value="New patient consultation">New patient consultation</option>
              <option value="Routine checkup">Routine checkup</option>
            </select>
          </div>
        </div>

        {/* Initial Status & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-closr-text uppercase tracking-wider block">
              Initial Status
            </label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full text-xs py-2 px-3 rounded-xl bg-closr-card border border-closr-border text-closr-text focus:outline-none focus:ring-1 focus:ring-closr-forest">
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-closr-text uppercase tracking-wider block">
              Notes (Optional)
            </label>
            <input type="text" placeholder="e.g. Needs BP check" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full text-xs py-2 px-3 rounded-xl bg-closr-card border border-closr-border text-closr-text focus:outline-none focus:ring-1 focus:ring-closr-forest"/>
          </div>
        </div>
      </form>
    </Modal>);
};
