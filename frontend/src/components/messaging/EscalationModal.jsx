import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ShieldAlert, User, Info } from 'lucide-react';
export const EscalationModal = ({ isOpen, conversation, initialReason = '', initialPriority = 'high', onClose, onConfirm, }) => {
    const [reason, setReason] = useState(initialReason || 'Patient requires immediate human medical staff review');
    const [priority, setPriority] = useState(initialPriority);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    if (!conversation)
        return null;
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason.trim())
            return;
        setIsSubmitting(true);
        try {
            await onConfirm(reason.trim(), priority, notes.trim());
            onClose();
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (<Modal isOpen={isOpen} onClose={onClose} title="Escalate Conversation to Clinic Staff" description="Transfer conversation to human triage desk with safety priority" size="md">
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* Patient / Thread Summary */}
        <div className="p-3 rounded-2xl bg-closr-sage/30 border border-closr-border text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-closr-text flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-closr-forest"/>
              {conversation.patientName} ({conversation.patientId})
            </span>
            {conversation.bookingId && (<span className="font-mono text-[10px] text-closr-forest font-bold bg-white px-1.5 py-0.5 rounded border border-closr-border">
                {conversation.bookingId}
              </span>)}
          </div>
          <p className="text-[11px] text-closr-text-muted italic truncate">
            Last message: "{conversation.lastMessage}"
          </p>
        </div>

        {/* Priority Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-closr-text flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-closr-forest"/> Triage Priority
          </label>
          <div className="grid grid-cols-4 gap-2">
            {['low', 'medium', 'high', 'critical'].map((p) => (<button key={p} type="button" onClick={() => setPriority(p)} className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all capitalize ${priority === p
                ? p === 'critical'
                    ? 'bg-closr-danger text-white border-closr-danger shadow-soft'
                    : p === 'high'
                        ? 'bg-closr-amber text-white border-closr-amber shadow-soft'
                        : 'bg-closr-forest text-white border-closr-forest shadow-soft'
                : 'bg-white border-closr-border text-closr-text hover:bg-closr-sage/30'}`}>
                {p}
              </button>))}
          </div>
        </div>

        {/* Reason Select / Input */}
        <div className="space-y-1.5">
          <label htmlFor="escalation-reason" className="text-xs font-semibold text-closr-text">
            Escalation Reason *
          </label>
          <select id="escalation-reason" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-closr-border text-closr-text focus:outline-hidden focus:ring-2 focus:ring-closr-forest/20">
            <option value="Severe clinical symptoms / Emergency triage required">
              Severe clinical symptoms / Emergency triage required
            </option>
            <option value="Patient explicitly requested human doctor / clinic manager">
              Patient explicitly requested human doctor / clinic manager
            </option>
            <option value="Complex scheduling conflict or reschedule dispute">
              Complex scheduling conflict or reschedule dispute
            </option>
            <option value="Pricing, billing or insurance clarification">
              Pricing, billing or insurance clarification
            </option>
            <option value="Unsatisfied with automated responses / Complaint">
              Unsatisfied with automated responses / Complaint
            </option>
            <option value="Other administrative triage">Other administrative triage</option>
          </select>
        </div>

        {/* Staff Handover Notes */}
        <div className="space-y-1.5">
          <label htmlFor="escalation-notes" className="text-xs font-semibold text-closr-text">
            Staff Handover Notes (Optional)
          </label>
          <textarea id="escalation-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add relevant context for Dr. Sharma or reception staff..." className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-closr-border text-closr-text placeholder:text-closr-text-muted focus:outline-hidden focus:ring-2 focus:ring-closr-forest/20 resize-none"/>
        </div>

        {/* Demo Disclaimer Alert */}
        <div className="p-3 rounded-xl bg-[#EDEBE3] border border-closr-border flex items-start gap-2 text-[11px] text-closr-text-muted">
          <Info className="w-4 h-4 text-closr-forest shrink-0 mt-0.5"/>
          <span>
            <strong>Demo Triage System:</strong> This action updates the local simulated clinic
            state and marks the conversation with an attention badge. No actual SMS or emergency
            dispatch is triggered.
          </span>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-closr-border">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant={priority === 'critical' ? 'danger' : 'primary'} size="sm" isLoading={isSubmitting}>
            Confirm Escalation
          </Button>
        </div>
      </form>
    </Modal>);
};
