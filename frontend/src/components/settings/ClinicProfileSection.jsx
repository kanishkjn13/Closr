import React, { useState, useRef } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { settingsService } from '../../services/settingsService';
import { Building2, Upload, RotateCcw, Save, AlertCircle } from 'lucide-react';
export const ClinicProfileSection = ({ initialProfile, onSaved, }) => {
    const toast = useToast();
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({ ...initialProfile });
    const [logoPreview, setLogoPreview] = useState(initialProfile.clinicLogo);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const validate = () => {
        const errs = {};
        if (!formData.clinicName.trim()) {
            errs.clinicName = 'Clinic name is required';
        }
        if (formData.clinicEmail.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.clinicEmail.trim())) {
                errs.clinicEmail = 'Invalid email address format';
            }
        }
        if (formData.clinicPhone.trim()) {
            const phoneDigits = formData.clinicPhone.replace(/\D/g, '');
            if (phoneDigits.length < 10) {
                errs.clinicPhone = 'Please enter a valid 10-digit phone number';
            }
        }
        if (formData.postalCode.trim()) {
            const pinDigits = formData.postalCode.replace(/\D/g, '');
            if (pinDigits.length < 6) {
                errs.postalCode = 'Postal PIN code must be at least 6 digits';
            }
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };
    const handleLogoUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file (PNG, JPG, SVG)');
                return;
            }
            const reader = new FileReader();
            reader.onload = (uploadEvent) => {
                const result = uploadEvent.target?.result;
                setLogoPreview(result);
                setFormData((prev) => ({ ...prev, clinicLogo: result }));
            };
            reader.readAsDataURL(file);
        }
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix validation errors before saving');
            return;
        }
        setIsSubmitting(true);
        try {
            const saved = settingsService.updateProfile({
                ...formData,
                clinicLogo: logoPreview,
            });
            onSaved(saved);
            toast.success('Clinic profile settings saved (demo)');
        }
        catch {
            toast.error('Failed to save profile settings');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleReset = () => {
        setFormData({ ...initialProfile });
        setLogoPreview(initialProfile.clinicLogo);
        setErrors({});
        toast.info('Restored last saved clinic profile');
    };
    return (<div className="p-6 rounded-2xl bg-closr-card border border-closr-border shadow-soft text-left space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-serif font-bold text-lg text-closr-text flex items-center gap-2">
          <Building2 className="w-5 h-5 text-closr-forest"/>
          Clinic Profile
        </h3>
        <p className="text-xs text-closr-text-muted mt-1">
          Manage the public clinic identity and contact information displayed to patients.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo Upload & Preview */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-white border border-closr-border/80 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-closr-sage/30 border border-closr-border flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
            {logoPreview ? (<img src={logoPreview} alt="Clinic Logo" className="w-full h-full object-cover"/>) : (<Building2 className="w-8 h-8 text-closr-forest"/>)}
          </div>

          <div className="space-y-1 min-w-0">
            <h4 className="text-xs font-semibold text-closr-text">Clinic Logo or Emblem</h4>
            <p className="text-[11px] text-closr-text-muted">
              SVG, PNG, or JPG previewed locally in your browser session.
            </p>
            <div className="pt-1 flex items-center gap-2">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden"/>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="py-1 px-2.5 rounded-lg bg-closr-forest text-white text-xs font-semibold hover:bg-closr-forest-hover transition-colors flex items-center gap-1.5 shadow-2xs">
                <Upload className="w-3 h-3"/>
                <span>Upload Logo</span>
              </button>
              {logoPreview && (<button type="button" onClick={() => {
                setLogoPreview(undefined);
                setFormData((prev) => ({ ...prev, clinicLogo: undefined }));
            }} className="py-1 px-2 rounded-lg text-xs font-medium text-closr-text-muted hover:text-closr-danger">
                  Remove
                </button>)}
            </div>
          </div>
        </div>

        {/* Basic Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-closr-text">Clinic Name *</label>
            <Input value={formData.clinicName} onChange={(e) => {
            setFormData((prev) => ({ ...prev, clinicName: e.target.value }));
            if (errors.clinicName)
                setErrors((prev) => ({ ...prev, clinicName: '' }));
        }} placeholder="e.g. Dr. Sharma's Family Clinic"/>
            {errors.clinicName && (<p className="text-[11px] text-closr-danger flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 shrink-0"/>
                <span>{errors.clinicName}</span>
              </p>)}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-closr-text">Default Consultation Time</label>
            <select value={formData.defaultConsultationDuration} onChange={(e) => setFormData((prev) => ({
            ...prev,
            defaultConsultationDuration: Number(e.target.value),
        }))} className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-closr-border text-closr-text focus:outline-hidden focus:ring-2 focus:ring-closr-forest/20">
              <option value={10}>10 Minutes</option>
              <option value={15}>15 Minutes (Standard OPD)</option>
              <option value={20}>20 Minutes</option>
              <option value={30}>30 Minutes (Comprehensive)</option>
              <option value={45}>45 Minutes (Specialist)</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-closr-text">Clinic Description</label>
          <textarea rows={2} value={formData.clinicDescription} onChange={(e) => setFormData((prev) => ({ ...prev, clinicDescription: e.target.value }))} placeholder="Brief overview of clinical specialties..." className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-closr-border text-closr-text placeholder:text-closr-text-muted focus:outline-hidden focus:ring-2 focus:ring-closr-forest/20 resize-none"/>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-closr-text">Phone Number</label>
            <Input value={formData.clinicPhone} onChange={(e) => {
            setFormData((prev) => ({ ...prev, clinicPhone: e.target.value }));
            if (errors.clinicPhone)
                setErrors((prev) => ({ ...prev, clinicPhone: '' }));
        }} placeholder="+91 98201 44521"/>
            {errors.clinicPhone && (<p className="text-[11px] text-closr-danger flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 shrink-0"/>
                <span>{errors.clinicPhone}</span>
              </p>)}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-closr-text">Reception Email</label>
            <Input type="email" value={formData.clinicEmail} onChange={(e) => {
            setFormData((prev) => ({ ...prev, clinicEmail: e.target.value }));
            if (errors.clinicEmail)
                setErrors((prev) => ({ ...prev, clinicEmail: '' }));
        }} placeholder="reception@sharmaclinic.in"/>
            {errors.clinicEmail && (<p className="text-[11px] text-closr-danger flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 shrink-0"/>
                <span>{errors.clinicEmail}</span>
              </p>)}
          </div>
        </div>

        {/* Address */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-closr-text">Clinic Street Address</label>
            <Input value={formData.address} onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))} placeholder="Shop 4, Greenfield Plaza..."/>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-closr-text">City / District</label>
              <Input value={formData.city} onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))} placeholder="Indirapuram, Ghaziabad"/>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-closr-text">State</label>
              <Input value={formData.state} onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))} placeholder="Uttar Pradesh"/>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-closr-text">Postal PIN Code</label>
              <Input value={formData.postalCode} onChange={(e) => {
            setFormData((prev) => ({ ...prev, postalCode: e.target.value }));
            if (errors.postalCode)
                setErrors((prev) => ({ ...prev, postalCode: '' }));
        }} placeholder="201014"/>
              {errors.postalCode && (<p className="text-[11px] text-closr-danger flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0"/>
                  <span>{errors.postalCode}</span>
                </p>)}
            </div>
          </div>
        </div>

        {/* Timezone */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-closr-text">Operating Timezone</label>
          <select value={formData.timezone} onChange={(e) => setFormData((prev) => ({ ...prev, timezone: e.target.value }))} className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-closr-border text-closr-text focus:outline-hidden focus:ring-2 focus:ring-closr-forest/20">
            <option value="Asia/Kolkata (IST +5:30)">Asia/Kolkata (IST +5:30) · Standard Clinic Time</option>
            <option value="Asia/Dubai (GST +4:00)">Asia/Dubai (GST +4:00)</option>
            <option value="Europe/London (GMT +0:00)">Europe/London (GMT +0:00)</option>
            <option value="America/New_York (EST -5:00)">America/New_York (EST -5:00)</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-closr-border flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="w-3.5 h-3.5 mr-1"/>
            Reset to Saved
          </Button>

          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            <Save className="w-3.5 h-3.5 mr-1"/>
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>);
};
