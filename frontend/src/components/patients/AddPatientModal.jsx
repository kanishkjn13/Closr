import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { patientService } from '../../services/patientService';
import { UserPlus, AlertCircle } from 'lucide-react';
export const AddPatientModal = ({ isOpen, onClose, onPatientCreated, }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('new');
    const [conditionSummary, setConditionSummary] = useState('');
    const [errors, setErrors] = useState({});
    const [phoneWarning, setPhoneWarning] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!name.trim()) {
            newErrors.name = 'Full name is required';
        }
        if (!phone.trim()) {
            newErrors.phone = 'Phone number is required';
        }
        else {
            const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
            if (cleanPhone.length < 10) {
                newErrors.phone = 'Please enter a valid phone number (at least 10 digits)';
            }
        }
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
            // Duplicate phone check
            const exists = await patientService.checkPhoneExists(phone);
            if (exists) {
                setPhoneWarning('A patient with this phone number already exists in the system.');
            }
            const created = await patientService.createPatient({
                name: name.trim(),
                phone: phone.trim().startsWith('+91') ? phone.trim() : `+91 ${phone.trim()}`,
                email: email.trim() || undefined,
                status,
                conditionSummary: conditionSummary.trim() || undefined,
            });
            onPatientCreated(created);
            onClose();
            // Reset form
            setName('');
            setPhone('');
            setEmail('');
            setStatus('new');
            setConditionSummary('');
            setPhoneWarning('');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (<Modal isOpen={isOpen} onClose={onClose} title="Add New Patient" description="Create a new clinic patient directory profile" footer={<>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" leftIcon={<UserPlus className="w-4 h-4"/>} isLoading={isSubmitting} onClick={handleSubmit}>
            Register Patient
          </Button>
        </>}>
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {phoneWarning && (<div className="p-3 rounded-xl bg-closr-amber-badge border border-closr-amber/30 text-xs text-closr-amber flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5"/>
            <span>{phoneWarning}</span>
          </div>)}

        <Input label="Full Name" placeholder="e.g. Meera Sharma" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} required/>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Phone Number" placeholder="e.g. 98450 12345" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} required/>

          <Input label="Email Address (Optional)" type="email" placeholder="patient@example.com" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email}/>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-closr-text uppercase tracking-wider block">
            Initial Patient Status
          </label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full text-xs sm:text-sm py-2.5 px-3 rounded-xl bg-closr-card border border-closr-border text-closr-text focus:outline-none focus:ring-1 focus:ring-closr-forest">
            <option value="new">New Patient</option>
            <option value="active">Active Patient</option>
            <option value="follow-up">Follow-up Needed</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-closr-text uppercase tracking-wider block">
            Care Summary / Administrative Notes
          </label>
          <textarea rows={2} placeholder="e.g. First visit for chronic acidity & seasonal allergies" value={conditionSummary} onChange={(e) => setConditionSummary(e.target.value)} className="w-full text-xs sm:text-sm p-3 rounded-xl bg-closr-card border border-closr-border text-closr-text focus:outline-none focus:ring-1 focus:ring-closr-forest resize-none"/>
        </div>
      </form>
    </Modal>);
};
