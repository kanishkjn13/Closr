import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Switch } from '../ui/Switch';
import { useToast } from '../ui/Toast';
import { settingsService } from '../../services/settingsService';
import { Bell, MessageSquare, ShieldCheck, Info, Save, RotateCcw } from 'lucide-react';
export const NotificationsSection = ({ initialNotifications, onSaved, }) => {
    const toast = useToast();
    const [formData, setFormData] = useState({ ...initialNotifications });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const saved = settingsService.updateNotifications(formData);
            onSaved(saved);
            toast.success('Notification preferences updated (demo)');
        }
        catch {
            toast.error('Failed to save notification preferences');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleReset = () => {
        setFormData({ ...initialNotifications });
        toast.info('Restored saved notification preferences');
    };
    return (<div className="p-6 rounded-2xl bg-closr-card border border-closr-border shadow-soft text-left space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-serif font-bold text-lg text-closr-text flex items-center gap-2">
          <Bell className="w-5 h-5 text-closr-forest"/>
          Notifications & Reminders
        </h3>
        <p className="text-xs text-closr-text-muted mt-1">
          Configure patient reminder schedules, cancellation alerts, and multi-channel delivery channels.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Demo Mode Notice */}
        <div className="p-3.5 rounded-xl bg-closr-sage/30 border border-closr-border flex items-start gap-2.5 text-xs text-closr-text-muted">
          <Info className="w-4 h-4 text-closr-forest shrink-0 mt-0.5"/>
          <p className="leading-relaxed">
            <strong className="text-closr-text font-semibold">Demo mode active:</strong>{' '}
            Notification preferences are stored locally in this frontend session. No actual
            WhatsApp messages, SMS messages, or emails will be dispatched to real patient phones.
          </p>
        </div>

        {/* Live Reminder Preview */}
        <div className="p-4 rounded-2xl bg-white border border-closr-border shadow-soft space-y-2">
          <span className="text-[10px] uppercase font-semibold text-closr-text-muted flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-closr-forest"/>
            Simulated Patient Reminder Preview
          </span>

          <div className="p-3 rounded-xl bg-[#EDF2E9] border border-[#D5E3CF] text-xs text-closr-text leading-relaxed">
            <p className="font-semibold text-closr-forest text-[11px]">
              Dr. Sharma's Clinic · Appointment Reminder (SAT-2041)
            </p>
            <p className="mt-1">
              "Hello Rohit! Your appointment with Dr. Sharma tomorrow at 5:30 PM is confirmed. Please
              arrive 10 minutes early. Reply here if you need to reschedule or cancel."
            </p>
            <div className="pt-1.5 flex items-center justify-between text-[10px] text-closr-text-muted">
              <span>Lead time: {formData.leadTimeHours} hours before slot</span>
              <span className="text-closr-forest font-medium">Auto-dispatch simulated</span>
            </div>
          </div>
        </div>

        {/* Delivery Channels */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-closr-text uppercase tracking-wider text-closr-text-muted">
            Enabled Communication Channels
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
            { id: 'whatsapp', label: 'WhatsApp', key: 'whatsapp' },
            { id: 'sms', label: 'SMS Gateway', key: 'sms' },
            { id: 'inApp', label: 'In-App Alerts', key: 'inApp' },
            { id: 'email', label: 'Email Notices', key: 'email' },
        ].map((chan) => {
            const isChecked = formData.channels[chan.key];
            return (<button key={chan.id} type="button" onClick={() => setFormData((prev) => ({
                    ...prev,
                    channels: { ...prev.channels, [chan.key]: !isChecked },
                }))} className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${isChecked
                    ? 'bg-closr-forest text-white border-closr-forest shadow-2xs'
                    : 'bg-white border-closr-border text-closr-text-muted hover:bg-closr-sage/30'}`}>
                  <span className="text-xs font-semibold">{chan.label}</span>
                  <ShieldCheck className={`w-3.5 h-3.5 ${isChecked ? 'text-white' : 'text-transparent'}`}/>
                </button>);
        })}
          </div>
        </div>

        {/* Notification Event Toggles */}
        <div className="p-4 rounded-xl bg-white border border-closr-border/80 shadow-2xs space-y-4">
          <Switch checked={formData.confirmations} onChange={(val) => setFormData((prev) => ({ ...prev, confirmations: val }))} label="Instant Appointment Confirmation" description="Send immediate booking ID and timing recap when slot is confirmed."/>

          <div className="pt-3 border-t border-closr-border/50">
            <Switch checked={formData.upcomingReminders} onChange={(val) => setFormData((prev) => ({ ...prev, upcomingReminders: val }))} label="Upcoming Appointment Reminders" description="Notify patients prior to their scheduled slot with clinic directions."/>
          </div>

          <div className="pt-3 border-t border-closr-border/50">
            <Switch checked={formData.rescheduling} onChange={(val) => setFormData((prev) => ({ ...prev, rescheduling: val }))} label="Reschedule Confirmation Notices" description="Confirm updated appointment dates and release previous slot to waitlist."/>
          </div>

          <div className="pt-3 border-t border-closr-border/50">
            <Switch checked={formData.cancellations} onChange={(val) => setFormData((prev) => ({ ...prev, cancellations: val }))} label="Cancellation Receipts & Waitlist Broadcast" description="Acknowledge cancellations and alert next eligible waitlisted patient."/>
          </div>

          <div className="pt-3 border-t border-closr-border/50">
            <Switch checked={formData.escalationAlerts} onChange={(val) => setFormData((prev) => ({ ...prev, escalationAlerts: val }))} label="Urgent Escalation Staff Alerts" description="Notify doctor and clinic manager when critical triage symptoms occur."/>
          </div>

          <div className="pt-3 border-t border-closr-border/50">
            <Switch checked={formData.dailySummary} onChange={(val) => setFormData((prev) => ({ ...prev, dailySummary: val }))} label="End-of-Day Clinic Operations Digest" description="Send evening recap of total visits, revenue, and no-shows to clinic owner."/>
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
            Save Notification Rules
          </Button>
        </div>
      </form>
    </div>);
};
