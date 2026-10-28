import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Switch } from '../ui/Switch';
import { useToast } from '../ui/Toast';
import { settingsService } from '../../services/settingsService';
import { CalendarClock, Clock, Calendar, AlertCircle, Save, RotateCcw } from 'lucide-react';
const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const AppointmentRulesSection = ({ initialRules, onSaved, }) => {
    const toast = useToast();
    const [formData, setFormData] = useState({ ...initialRules });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toggleDay = (day) => {
        setFormData((prev) => {
            const exists = prev.availableDays.includes(day);
            const updated = exists
                ? prev.availableDays.filter((d) => d !== day)
                : [...prev.availableDays, day];
            return { ...prev, availableDays: updated };
        });
    };
    const validate = () => {
        const errs = {};
        if (formData.availableDays.length === 0) {
            errs.days = 'Select at least one active clinic day';
        }
        if (formData.defaultDurationMinutes <= 0) {
            errs.duration = 'Duration must be greater than zero';
        }
        if (formData.openingTime >= formData.closingTime) {
            errs.closingTime = 'Closing time must be later than opening time';
        }
        if (formData.breakStartTime >= formData.breakEndTime) {
            errs.breakTime = 'Break start time must be earlier than break end time';
        }
        if (formData.breakStartTime < formData.openingTime ||
            formData.breakEndTime > formData.closingTime) {
            errs.breakTime = 'Break interval must fall within clinic operating hours';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix schedule validation errors before saving');
            return;
        }
        setIsSubmitting(true);
        try {
            const saved = settingsService.updateAppointmentRules(formData);
            onSaved(saved);
            toast.success('Appointment rules and clinic schedule updated (demo)');
        }
        catch {
            toast.error('Failed to save appointment rules');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleReset = () => {
        setFormData({ ...initialRules });
        setErrors({});
        toast.info('Restored saved appointment rules');
    };
    return (<div className="p-6 rounded-2xl bg-closr-card border border-closr-border shadow-soft text-left space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-serif font-bold text-lg text-closr-text flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-closr-forest"/>
          Appointment Rules & Clinic Schedule
        </h3>
        <p className="text-xs text-closr-text-muted mt-1">
          Configure daily OPD consultation slots, break intervals, and patient advance booking limits.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Schedule Preview Card */}
        <div className="p-4 rounded-2xl bg-white border border-closr-border shadow-soft space-y-2.5">
          <span className="text-[10px] uppercase font-semibold text-closr-text-muted flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-closr-forest"/>
            Current Schedule Preview
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-closr-card border border-closr-border/80 space-y-1">
              <span className="text-[10px] text-closr-text-muted uppercase font-semibold">
                OPD Hours
              </span>
              <p className="font-serif font-bold text-base text-closr-text">
                {formData.openingTime} – {formData.closingTime}
              </p>
              <span className="text-[10px] text-closr-forest font-medium">Daily consultation</span>
            </div>

            <div className="p-3 rounded-xl bg-closr-card border border-closr-border/80 space-y-1">
              <span className="text-[10px] text-closr-text-muted uppercase font-semibold">
                Midday Recess / Break
              </span>
              <p className="font-serif font-bold text-base text-closr-text">
                {formData.breakStartTime} – {formData.breakEndTime}
              </p>
              <span className="text-[10px] text-closr-text-muted">Doctor ward rounds</span>
            </div>

            <div className="p-3 rounded-xl bg-closr-card border border-closr-border/80 space-y-1">
              <span className="text-[10px] text-closr-text-muted uppercase font-semibold">
                Slot Length
              </span>
              <p className="font-serif font-bold text-base text-closr-text">
                {formData.defaultDurationMinutes} min
              </p>
              <span className="text-[10px] text-closr-text-muted">
                {formData.availableDays.length} days active
              </span>
            </div>
          </div>
        </div>

        {/* Operating Days */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-closr-text flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-closr-forest"/>
            Active Clinic Days
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {ALL_DAYS.map((day) => {
            const isSelected = formData.availableDays.includes(day);
            return (<button key={day} type="button" onClick={() => toggleDay(day)} className={`py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all ${isSelected
                    ? 'bg-closr-forest text-white border-closr-forest shadow-2xs'
                    : 'bg-white border-closr-border text-closr-text-muted hover:bg-closr-sage/30'}`}>
                  {day}
                </button>);
        })}
          </div>
          {errors.days && (<p className="text-[11px] text-closr-danger flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3 shrink-0"/>
              <span>{errors.days}</span>
            </p>)}
        </div>

        {/* Hours & Break Times */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-closr-text">Opening Time</label>
            <input type="time" value={formData.openingTime} onChange={(e) => setFormData((prev) => ({ ...prev, openingTime: e.target.value }))} className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-closr-border text-closr-text focus:outline-hidden focus:ring-2 focus:ring-closr-forest/20"/>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-closr-text">Closing Time</label>
            <input type="time" value={formData.closingTime} onChange={(e) => setFormData((prev) => ({ ...prev, closingTime: e.target.value }))} className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-closr-border text-closr-text focus:outline-hidden focus:ring-2 focus:ring-closr-forest/20"/>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-closr-text">Break Start</label>
            <input type="time" value={formData.breakStartTime} onChange={(e) => setFormData((prev) => ({ ...prev, breakStartTime: e.target.value }))} className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-closr-border text-closr-text focus:outline-hidden focus:ring-2 focus:ring-closr-forest/20"/>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-closr-text">Break End</label>
            <input type="time" value={formData.breakEndTime} onChange={(e) => setFormData((prev) => ({ ...prev, breakEndTime: e.target.value }))} className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-closr-border text-closr-text focus:outline-hidden focus:ring-2 focus:ring-closr-forest/20"/>
          </div>
        </div>

        {(errors.closingTime || errors.breakTime) && (<div className="p-2.5 rounded-xl bg-closr-danger-bg text-closr-danger border border-closr-danger/30 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0"/>
            <span>{errors.closingTime || errors.breakTime}</span>
          </div>)}

        {/* Lead Times & Limits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-closr-text">Default Duration (min)</label>
            <input type="number" min={5} max={120} step={5} value={formData.defaultDurationMinutes} onChange={(e) => setFormData((prev) => ({
            ...prev,
            defaultDurationMinutes: Number(e.target.value),
        }))} className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-closr-border text-closr-text focus:outline-hidden focus:ring-2 focus:ring-closr-forest/20"/>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-closr-text">Min Advance Time (hours)</label>
            <input type="number" min={0} max={48} value={formData.minAdvanceBookingHours} onChange={(e) => setFormData((prev) => ({
            ...prev,
            minAdvanceBookingHours: Number(e.target.value),
        }))} className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-closr-border text-closr-text focus:outline-hidden focus:ring-2 focus:ring-closr-forest/20"/>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-closr-text">Max Booking Horizon (days)</label>
            <input type="number" min={1} max={90} value={formData.maxAdvanceBookingDays} onChange={(e) => setFormData((prev) => ({
            ...prev,
            maxAdvanceBookingDays: Number(e.target.value),
        }))} className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-closr-border text-closr-text focus:outline-hidden focus:ring-2 focus:ring-closr-forest/20"/>
          </div>
        </div>

        {/* Booking Toggles */}
        <div className="p-4 rounded-xl bg-white border border-closr-border/80 shadow-2xs space-y-4">
          <Switch checked={formData.allowSameDayBooking} onChange={(val) => setFormData((prev) => ({ ...prev, allowSameDayBooking: val }))} label="Allow Same-Day Bookings" description="Patients can book open slots today if requested within minimum lead time."/>

          <div className="pt-3 border-t border-closr-border/50">
            <Switch checked={formData.allowOffHoursRequests} onChange={(val) => setFormData((prev) => ({ ...prev, allowOffHoursRequests: val }))} label="Allow Receptionist Requests Outside Clinic Hours" description="Saathi can accept evening booking requests for the next open clinic day."/>
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
            Save Appointment Rules
          </Button>
        </div>
      </form>
    </div>);
};
