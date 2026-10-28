import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { patientService } from '../../services/patientService';
import { Save } from 'lucide-react';
export const EditPatientModal = ({ patient, isOpen, onClose, onPatientUpdated, }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('active');
    const [conditionSummary, setConditionSummary] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    useEffect(() => {
        if (patient) {
            setName(patient.name);
            setPhone(patient.phone);
            setEmail(patient.email || '');
            setStatus(patient.status);
            setConditionSummary(patient.conditionSummary || '');
            setErrors({});
        }
    }, [patient]);
    if (!patient)
        return null;
    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!name.trim())
            newErrors.name = 'Full name is required';
        if (!phone.trim())
            newErrors.phone = 'Phone number is required';
        if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});
        setIsSubmitting(true);
        try {
            const updated = await patientService.updatePatient(patient.id, {
                name: name.trim(),
                phone: phone.trim(),
                email: email.trim() || undefined,
                status,
                conditionSummary: conditionSummary.trim() || undefined,
            });
            onPatientUpdated(updated);
            onClose();
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (<Modal isOpen={isOpen} onClose={onClose} title="Edit Patient Details" description={`Updating profile for ${patient.name} (${patient.id})`} footer={<>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Save className="w-4 h-4"/>} isLoading={isSubmitting} onClick={handleSubmit}>
            Save Changes
          </Button>
        </>}>
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} required/>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} required/>

          <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email}/>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-closr-text uppercase tracking-wider block">
            Patient Status
          </label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full text-xs sm:text-sm py-2.5 px-3 rounded-xl bg-closr-card border border-closr-border text-closr-text focus:outline-none focus:ring-1 focus:ring-closr-forest">
            <option value="active">Active Patient</option>
            <option value="new">New Patient</option>
            <option value="follow-up">Follow-up Needed</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-closr-text uppercase tracking-wider block">
            Care Summary / Administrative Notes
          </label>
          <textarea rows={2} value={conditionSummary} onChange={(e) => setConditionSummary(e.target.value)} className="w-full text-xs sm:text-sm p-3 rounded-xl bg-closr-card border border-closr-border text-closr-text focus:outline-none focus:ring-1 focus:ring-closr-forest resize-none"/>
        </div>
      </form>
    </Modal>);
};
