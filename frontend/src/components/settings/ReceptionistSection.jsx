import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Switch } from '../ui/Switch';
import { useToast } from '../ui/Toast';
import { settingsService } from '../../services/settingsService';
import { Bot, Sparkles, Save, RotateCcw } from 'lucide-react';
export const ReceptionistSection = ({ initialSettings, onSaved, }) => {
    const toast = useToast();
    const [formData, setFormData] = useState({ ...initialSettings });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const saved = settingsService.updateReceptionist(formData);
            onSaved(saved);
            toast.success('AI receptionist preferences updated (demo)');
        }
        catch {
            toast.error('Failed to save receptionist preferences');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleReset = () => {
        setFormData({ ...initialSettings });
        toast.info('Restored receptionist preferences');
    };
    return (<div className="p-6 rounded-2xl bg-closr-card border border-closr-border shadow-soft text-left space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-serif font-bold text-lg text-closr-text flex items-center gap-2">
          <Bot className="w-5 h-5 text-closr-forest"/>
          Receptionist Preferences
        </h3>
        <p className="text-xs text-closr-text-muted mt-1">
          Customize how Closr Saathi communicates with patients, schedules slots, and confirms visits.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Live Greeting Preview Card */}
        <div className="p-4 rounded-2xl bg-white border border-closr-border shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-closr-text-muted flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-closr-forest"/>
              Live Patient Greeting Preview
            </span>
            <span className="text-[10px] text-closr-forest font-semibold bg-closr-sage/40 px-2 py-0.5 rounded-full border border-closr-border">
              Tone: {formData.tone}
            </span>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-closr-card border border-closr-border/80">
            <div className="w-8 h-8 rounded-full bg-closr-forest text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="w-4 h-4 text-[#BDE3C3]"/>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-closr-text">{formData.displayName}</span>
                <span className="text-[10px] text-closr-text-muted">· AI Assistant</span>
              </div>
              <p className="text-closr-text leading-relaxed font-sans">
                {formData.greetingMessage ||
            `Hello! Welcome to our clinic. I'm ${formData.displayName}, your AI receptionist. How may I help you today?`}
              </p>
            </div>
          </div>
        </div>

        {/* Identity & Personality */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-closr-text">Receptionist Display Name</label>
            <Input value={formData.displayName} onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))} placeholder="e.g. Saathi (Closr Assistant)"/>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-closr-text">Primary Language Dialect</label>
            <select value={formData.language} onChange={(e) => setFormData((prev) => ({
            ...prev,
            language: e.target.value,
        }))} className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-closr-border text-closr-text focus:outline-hidden focus:ring-2 focus:ring-closr-forest/20">
              <option value="english">Professional English</option>
              <option value="friendly-english">Casual & Friendly English</option>
              <option value="concise-english">Concise English</option>
            </select>
          </div>
        </div>

        {/* Greeting Message */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-closr-text">First Greeting Message</label>
          <textarea rows={2} value={formData.greetingMessage} onChange={(e) => setFormData((prev) => ({ ...prev, greetingMessage: e.target.value }))} placeholder="Custom welcome greeting..." className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-closr-border text-closr-text placeholder:text-closr-text-muted focus:outline-hidden focus:ring-2 focus:ring-closr-forest/20 resize-none"/>
        </div>

        {/* Tone Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-closr-text">Conversation Tone</label>
          <div className="grid grid-cols-3 gap-3">
            {[
            { id: 'friendly', label: 'Friendly & Warm', desc: 'Approachable, polite clinic tone' },
            { id: 'professional', label: 'Professional', desc: 'Formal healthcare consultation style' },
            { id: 'concise', label: 'Concise & Fast', desc: 'Direct, brief time-saving replies' },
        ].map((tone) => (<button key={tone.id} type="button" onClick={() => setFormData((prev) => ({
                ...prev,
                tone: tone.id,
            }))} className={`p-3 rounded-xl border text-left transition-all ${formData.tone === tone.id
                ? 'bg-closr-forest text-white border-closr-forest shadow-soft'
                : 'bg-white border-closr-border text-closr-text hover:bg-closr-sage/30'}`}>
                <span className="font-semibold text-xs block">{tone.label}</span>
                <span className={`text-[10px] block mt-1 leading-snug ${formData.tone === tone.id ? 'text-white/80' : 'text-closr-text-muted'}`}>
                  {tone.desc}
                </span>
              </button>))}
          </div>
        </div>

        {/* Capability Toggles */}
        <div className="space-y-3 pt-2 border-t border-closr-border">
          <h4 className="text-xs font-semibold text-closr-text uppercase tracking-wider text-closr-text-muted">
            Simulated Conversation Capabilities
          </h4>

          <div className="p-4 rounded-xl bg-white border border-closr-border/80 shadow-2xs space-y-4">
            <Switch checked={formData.enabled} onChange={(val) => setFormData((prev) => ({ ...prev, enabled: val }))} label="Enable AI Receptionist Simulation" description="Allow patients to converse with Saathi across chat and mobile receptionist."/>

            <div className="pt-3 border-t border-closr-border/50">
              <Switch checked={formData.allowBooking} onChange={(val) => setFormData((prev) => ({ ...prev, allowBooking: val }))} label="Simulate In-Chat Appointment Booking" description="Allow Saathi to recommend available slots and confirm appointment bookings."/>
            </div>

            <div className="pt-3 border-t border-closr-border/50">
              <Switch checked={formData.allowRescheduling} onChange={(val) => setFormData((prev) => ({ ...prev, allowRescheduling: val }))} label="Simulate Rescheduling Workflows" description="Allow patients to reschedule their existing appointments within the conversation."/>
            </div>

            <div className="pt-3 border-t border-closr-border/50">
              <Switch checked={formData.allowCancellation} onChange={(val) => setFormData((prev) => ({ ...prev, allowCancellation: val }))} label="Simulate Appointment Cancellations" description="Allow patients to cancel slots and automatically offer openings to waitlist patients."/>
            </div>

            <div className="pt-3 border-t border-closr-border/50">
              <Switch checked={formData.allowVoiceNotes} onChange={(val) => setFormData((prev) => ({ ...prev, allowVoiceNotes: val }))} label="Enable Voice-Message & Audio Note Simulation" description="Provide simulated microphone recording and audio playback in chat interfaces."/>
            </div>

            <div className="pt-3 border-t border-closr-border/50">
              <Switch checked={formData.showBookingPreview} onChange={(val) => setFormData((prev) => ({ ...prev, showBookingPreview: val }))} label="Show Embedded Booking Confirmation Cards" description="Render rich appointment summary cards directly inside the conversation thread."/>
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
            Save Receptionist Preferences
          </Button>
        </div>
      </form>
    </div>);
};
