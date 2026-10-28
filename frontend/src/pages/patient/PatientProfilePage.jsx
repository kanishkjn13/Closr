import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Heart, 
  ShieldCheck, 
  LogOut, 
  Edit3, 
  Check, 
  X,
  Clock,
  Sparkles
} from 'lucide-react';
import { usePatientAuth } from '../../context/PatientAuthContext';
import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/patientService';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';

export const PatientProfilePage = () => {
  const { currentPatient, refreshPatient, logout: patientLogout } = usePatientAuth();
  const { user: authUser, logout: mainLogout } = useAuth();
  const activePatient = currentPatient || (authUser?.role === 'patient' ? authUser : null);
  const navigate = useNavigate();
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: activePatient?.name || '',
    phone: activePatient?.phone || '',
    email: activePatient?.email || '',
    address: activePatient?.address || 'Indirapuram, Ghaziabad, UP',
    emergencyContact: activePatient?.emergencyContact || '+91 98110 33219 (Family)',
    preferredCommunication: activePatient?.preferredCommunication || 'sms',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (activePatient) {
      setFormData({
        name: activePatient.name || '',
        phone: activePatient.phone || '',
        email: activePatient.email || '',
        address: activePatient.address || 'Indirapuram, Ghaziabad, UP',
        emergencyContact: activePatient.emergencyContact || '+91 98110 33219 (Family)',
        preferredCommunication: activePatient.preferredCommunication || 'sms',
      });
    }
  }, [activePatient?.id, activePatient?.name, activePatient?.phone, activePatient?.email]);

  const validate = async () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Full name is required.';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else {
      const cleanPhone = formData.phone.replace(/[\s\-\(\)\+]/g, '');
      if (cleanPhone.length < 10) {
        errs.phone = 'Please enter a valid 10-digit phone number.';
      } else {
        const exists = await patientService.checkPhoneExists(formData.phone, currentPatient.id);
        if (exists) {
          errs.phone = 'This phone number is already registered to another patient.';
        }
      }
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const isValid = await validate();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      if (activePatient?.id) {
        await patientService.updatePatient(activePatient.id, {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          address: formData.address.trim(),
          emergencyContact: formData.emergencyContact.trim(),
          preferredCommunication: formData.preferredCommunication,
        });
      }

      if (refreshPatient) await refreshPatient();
      setIsEditing(false);
      toast.success('Profile Updated', 'Your personal details have been saved.');
    } catch (err) {
      toast.error('Update Failed', err.message || 'Could not save profile changes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: activePatient?.name || '',
      phone: activePatient?.phone || '',
      email: activePatient?.email || '',
      address: activePatient?.address || 'Indirapuram, Ghaziabad, UP',
      emergencyContact: activePatient?.emergencyContact || '+91 98110 33219 (Family)',
      preferredCommunication: activePatient?.preferredCommunication || 'sms',
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    if (mainLogout) await mainLogout();
    if (patientLogout) patientLogout();
    navigate('/patient/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-closr-text tracking-tight">
            My Profile
          </h1>
          <p className="text-xs sm:text-sm text-closr-text-muted mt-1">
            Manage your personal contact information and communication preferences.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit3 className="w-4 h-4" />}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<X className="w-4 h-4" />}
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}

          <Button
            variant="danger"
            size="sm"
            leftIcon={<LogOut className="w-4 h-4" />}
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* 2. Main Profile Card */}
      <div className="bg-closr-card rounded-3xl p-6 sm:p-8 border border-closr-border shadow-soft space-y-6">
        
        {/* Profile Avatar & ID Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-closr-border">
          <div className="flex items-center gap-4">
            <Avatar
              name={activePatient?.name || 'Patient'}
              size="lg"
              className="bg-closr-forest text-white ring-4 ring-closr-sage/40"
            />
            <div>
              <h2 className="font-serif font-bold text-lg sm:text-xl text-closr-text">
                {activePatient?.name}
              </h2>
              <p className="text-xs text-closr-text-muted mt-0.5">
                Patient ID: <span className="font-mono font-semibold text-closr-forest">{activePatient?.id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="confirmed" size="sm">
              Active Patient
            </Badge>
            <span className="text-[11px] text-closr-text-muted bg-closr-sage/30 px-2.5 py-1 rounded-full border border-closr-border">
              Dr. Sharma's Clinic
            </span>
          </div>
        </div>

        {/* Profile Details Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-closr-text flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-closr-forest" />
                Full Name
              </label>
              {isEditing ? (
                <div>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="bg-white"
                  />
                  {errors.name && <p className="text-xs text-closr-danger mt-1">{errors.name}</p>}
                </div>
              ) : (
                <p className="text-sm font-semibold text-closr-text py-2 px-3 rounded-xl bg-closr-bg/50 border border-closr-border">
                  {activePatient?.name}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-closr-text flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-closr-forest" />
                Phone Number
              </label>
              {isEditing ? (
                <div>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    className="bg-white"
                  />
                  {errors.phone && <p className="text-xs text-closr-danger mt-1">{errors.phone}</p>}
                </div>
              ) : (
                <p className="text-sm font-semibold text-closr-text py-2 px-3 rounded-xl bg-closr-bg/50 border border-closr-border font-mono">
                  {activePatient?.phone}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-closr-text flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-closr-forest" />
                Email Address
              </label>
              {isEditing ? (
                <div>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="bg-white"
                  />
                  {errors.email && <p className="text-xs text-closr-danger mt-1">{errors.email}</p>}
                </div>
              ) : (
                <p className="text-sm font-semibold text-closr-text py-2 px-3 rounded-xl bg-closr-bg/50 border border-closr-border">
                  {activePatient?.email || 'Not provided'}
                </p>
              )}
            </div>

            {/* Residential Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-closr-text flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-closr-forest" />
                Address / City
              </label>
              {isEditing ? (
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  className="bg-white"
                />
              ) : (
                <p className="text-sm font-semibold text-closr-text py-2 px-3 rounded-xl bg-closr-bg/50 border border-closr-border">
                  {formData.address}
                </p>
              )}
            </div>

            {/* Emergency Contact */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-closr-text flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-closr-danger" />
                Emergency Contact
              </label>
              {isEditing ? (
                <Input
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData((prev) => ({ ...prev, emergencyContact: e.target.value }))}
                  className="bg-white"
                />
              ) : (
                <p className="text-sm font-semibold text-closr-text py-2 px-3 rounded-xl bg-closr-bg/50 border border-closr-border font-mono">
                  {formData.emergencyContact}
                </p>
              )}
            </div>

            {/* Communication Preferences */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-closr-text flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-closr-forest" />
                Appointment Reminders Channel
              </label>
              {isEditing ? (
                <select
                  value={formData.preferredCommunication}
                  onChange={(e) => setFormData((prev) => ({ ...prev, preferredCommunication: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-closr-border bg-white text-xs font-semibold text-closr-text closr-focus shadow-2xs"
                >
                  <option value="sms">SMS Text Message</option>
                  <option value="whatsapp">WhatsApp Alert</option>
                  <option value="call">Phone Call Confirmation</option>
                </select>
              ) : (
                <p className="text-sm font-semibold text-closr-text py-2 px-3 rounded-xl bg-closr-bg/50 border border-closr-border capitalize">
                  {formData.preferredCommunication === 'sms'
                    ? 'SMS Text Message'
                    : formData.preferredCommunication === 'whatsapp'
                    ? 'WhatsApp Alert'
                    : 'Phone Call Confirmation'}
                </p>
              )}
            </div>
          </div>

          {/* Clinical Context Snapshot (Read-only) */}
          {currentPatient?.conditionSummary && (
            <div className="p-4 rounded-2xl bg-[#E2E9DF]/70 border border-[#D0DEC9] text-xs space-y-1 text-left">
              <span className="font-semibold text-closr-forest block">
                Doctor Triage & Medical Notes:
              </span>
              <p className="text-closr-text leading-relaxed">
                {currentPatient.conditionSummary}
              </p>
            </div>
          )}

          {/* Action Button when in edit mode */}
          {isEditing && (
            <div className="flex justify-end gap-2 pt-4 border-t border-closr-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                leftIcon={<Check className="w-4 h-4" />}
                isLoading={isSubmitting}
              >
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
