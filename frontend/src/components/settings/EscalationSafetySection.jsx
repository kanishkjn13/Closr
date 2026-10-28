import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Switch } from '../ui/Switch';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';
import { settingsService } from '../../services/settingsService';
import { ShieldAlert, AlertTriangle, Shield, Save, RotateCcw } from 'lucide-react';
export const EscalationSafetySection = ({ initialSafety, onSaved, }) => {
    const toast = useToast();
    const [formData, setFormData] = useState({ ...initialSafety });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const saved = settingsService.updateEscalationSafety(formData);
            onSaved(saved);
            toast.success('Escalation & safety preferences saved (demo)');
        }
        catch {
            toast.error('Failed to save escalation preferences');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleReset = () => {
        setFormData({ ...initialSafety });
        toast.info('Restored saved escalation rules');
    };
    return (<div className="p-6 rounded-2xl bg-closr-card border border-closr-border shadow-soft text-left space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-serif font-bold text-lg text-closr-text flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-closr-forest"/>
          Escalation & Clinical Safety Protocols
        </h3>
        <p className="text-xs text-closr-text-muted mt-1">
          Configure clinical triage thresholds, human handover triggers, and emergency red-flag safeguards.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* MANDATORY Clinical Safety Alert Banner */}
        <div className="p-4 rounded-2xl bg-closr-danger-bg/90 border border-closr-danger/30 text-closr-danger space-y-1.5 shadow-soft">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 shrink-0 text-closr-danger"/>
            <span>Mandatory Clinical Red-Flag Protocol (Non-Suppressed)</span>
          </div>
          <p className="text-xs text-closr-text leading-relaxed">
            Per healthcare triage standards, when a patient chat describes potential cardiac distress
            (e.g., acute chest pressure) or respiratory compromise, Saathi is hardcoded to immediately
            advise contacting 108 emergency ambulance and routes the case directly to the clinic triage
            desk. This protocol cannot be disabled.
          </p>
        </div>

        {/* Escalation Preview Card */}
        <div className="p-4 rounded-2xl bg-white border border-closr-border shadow-soft space-y-2.5">
          <span className="text-[10px] uppercase font-semibold text-closr-text-muted flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-closr-forest"/>
            Escalation Handover Preview (As displayed on Clinic Dashboard)
          </span>

          <div className="p-3.5 rounded-xl bg-closr-card border border-closr-border/80 flex items-start justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-closr-danger">ESC-310</span>
                <span className="font-semibold text-closr-text">Ramesh K.</span>
                <span className="text-[10px] text-closr-text-muted">· Today 5:41 PM</span>
              </div>
              <p className="text-closr-text-muted text-[11px]">
                Reason: "Urgent symptoms reported during booking attempt"
              </p>
              <div className="flex items-center gap-2 pt-1 text-[10px] text-closr-text-muted">
                <span>Assigned: <strong>{formData.assignedStaffRole}</strong></span>
              </div>
            </div>

            <Badge variant={formData.defaultPriority === 'critical' ? 'danger' : 'warning'} size="sm">
              {formData.defaultPriority.toUpperCase()} Priority
            </Badge>
          </div>
        </div>

        {/* General Triage Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-closr-text">Default Triage Priority</label>
            <select value={formData.defaultPriority} onChange={(e) => setFormData((prev) => ({
            ...prev,
            defaultPriority: e.target.value,
        }))} className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-closr-border text-closr-text focus:outline-hidden focus:ring-2 focus:ring-closr-forest/20 capitalize">
              <option value="low">Low Priority (Routine inquiry)</option>
              <option value="medium">Medium Priority (Administrative)</option>
              <option value="high">High Priority (Urgent scheduling/care)</option>
              <option value="critical">Critical Priority (Clinical escalation)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-closr-text">Assigned Staff Role / Desk</label>
            <Input value={formData.assignedStaffRole} onChange={(e) => setFormData((prev) => ({ ...prev, assignedStaffRole: e.target.value }))} placeholder="e.g. Dr. Sharma / Clinic Triage Desk"/>
          </div>
        </div>

        {/* Escalation Reasons Configuration */}
        <div className="space-y-2 pt-2 border-t border-closr-border">
          <h4 className="text-xs font-semibold text-closr-text uppercase tracking-wider text-closr-text-muted">
            Auto-Escalation Triggers
          </h4>

          <div className="p-4 rounded-xl bg-white border border-closr-border/80 shadow-2xs space-y-4">
            <Switch checked={formData.reasons.urgentSymptoms} onChange={(val) => setFormData((prev) => ({
            ...prev,
            reasons: { ...prev.reasons, urgentSymptoms: val },
        }))} label="Urgent Clinical Symptoms & Severe Distress" description="High fever above 103°F, breathlessness, or severe pain automatically tags conversation with Attention badge."/>

            <div className="pt-3 border-t border-closr-border/50">
              <Switch checked={formData.reasons.humanStaffRequested} onChange={(val) => setFormData((prev) => ({
            ...prev,
            reasons: { ...prev.reasons, humanStaffRequested: val },
        }))} label="Direct Request for Doctor / Human Receptionist" description="Phrases such as 'I need to speak to the doctor' or 'request human staff' flag the thread for staff callback."/>
            </div>

            <div className="pt-3 border-t border-closr-border/50">
              <Switch checked={formData.reasons.appointmentIssues} onChange={(val) => setFormData((prev) => ({
            ...prev,
            reasons: { ...prev.reasons, appointmentIssues: val },
        }))} label="Scheduling Disputes & Waitlist Overlaps" description="Double-booking conflicts or slot availability disputes transfer to clinic desk review."/>
            </div>

            <div className="pt-3 border-t border-closr-border/50">
              <Switch checked={formData.reasons.generalSupport} onChange={(val) => setFormData((prev) => ({
            ...prev,
            reasons: { ...prev.reasons, generalSupport: val },
        }))} label="Billing, Insurance & Medical Records Clarification" description="Complex insurance claims or requests for signed certificates flag the conversation for administration."/>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-closr-border flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="w-3.5 h-3.5 mr-1"/>
            Reset to Saved
          </Button>

          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            <Save className="w-3.5 h-3.5 mr-1"/>
            Save Safety Protocols
          </Button>
        </div>
      </form>
    </div>);
};
