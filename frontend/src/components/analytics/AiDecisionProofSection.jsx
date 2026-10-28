import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  GitBranch,
  RefreshCw,
  AlertTriangle,
  HeartPulse,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const AiDecisionProofSection = ({ className }) => {
  const navigate = useNavigate();

  const decisionProofs = [
    {
      id: 'proof-conflict',
      badge: 'Self-Healing Proof',
      badgeVariant: 'confirmed',
      title: 'Slot Conflict Auto-Recovery',
      icon: <RefreshCw className="w-4 h-4 text-closr-forest" />,
      trigger: 'Simultaneous calendar collision on 5:30 PM slot',
      decision:
        'AI detected slot contention, autonomously proposed next closest 6:00 PM opening, verified patient consent, and confirmed booking in 780ms with zero human intervention.',
      patient: 'Rohit V. (Fever consultation)',
      status: 'Recovered & Confirmed',
      metric: '780ms resolution',
    },
    {
      id: 'proof-waitlist',
      badge: 'Autonomous Fill',
      badgeVariant: 'amber',
      title: 'Waitlist Rapid Re-allocation',
      icon: <GitBranch className="w-4 h-4 text-closr-amber" />,
      trigger: 'Anil T. cancelled 5:00 PM slot due to travel conflict',
      decision:
        'AI intercepted cancellation, scanned clinic waitlist priority queue, dispatched automated offer to Imran S., and confirmed the slot within 45 seconds.',
      patient: 'Imran S. (Waitlist candidate)',
      status: 'Revenue Preserved',
      metric: '45s fill time',
    },
    {
      id: 'proof-emergency',
      badge: 'Safety Interception',
      badgeVariant: 'danger',
      title: 'Acute Emergency Triage Gate',
      icon: <HeartPulse className="w-4 h-4 text-closr-danger" />,
      trigger: 'Patient reported acute chest tightness and breathlessness',
      decision:
        'AI immediately halted regular booking flow, advised emergency 108 protocol, and triggered high-priority audio alert (ESC-310) for Dr. Sharma on clinic dashboard.',
      patient: 'Ramesh K. (Critical triage)',
      status: 'Escalated to Doctor',
      metric: 'Immediate halt',
    },
  ];

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* 1. Header with BREAK IT MODE CTA */}
      <div className="p-5 sm:p-6 rounded-2xl bg-closr-card border border-closr-border shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-base sm:text-lg text-closr-text">
              Autonomous Decision & Self-Healing Proof
            </span>
            <span className="text-[10px] font-bold text-closr-forest bg-closr-sage/60 px-2 py-0.5 rounded-full border border-closr-border uppercase tracking-wider">
              Live Evidence
            </span>
          </div>
          <p className="text-xs text-closr-text-muted max-w-2xl leading-relaxed">
            Real-time audit proof demonstrating how Closr's AI autonomously resolves booking conflicts, reclaims cancelled slots, and enforces clinical safety protocols.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          rightIcon={<ArrowRight className="w-4 h-4" />}
          onClick={() => navigate('/break-it')}
          className="shrink-0 self-start sm:self-auto"
        >
          Launch Failure Lab
        </Button>
      </div>

      {/* 2. Key Autonomous Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
        <div className="p-4 rounded-2xl bg-closr-card border border-closr-border shadow-soft">
          <div className="flex items-center justify-between text-closr-text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Autonomous Handling</span>
            <Zap className="w-4 h-4 text-closr-forest" />
          </div>
          <div className="text-2xl font-serif font-bold text-closr-forest">94.2%</div>
          <p className="text-[11px] text-closr-text-muted mt-1">18 of 19 patient queries resolved without staff</p>
        </div>

        <div className="p-4 rounded-2xl bg-closr-card border border-closr-border shadow-soft">
          <div className="flex items-center justify-between text-closr-text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Self-Healing Rate</span>
            <CheckCircle2 className="w-4 h-4 text-closr-forest" />
          </div>
          <div className="text-2xl font-serif font-bold text-closr-forest">100%</div>
          <p className="text-[11px] text-closr-text-muted mt-1">Zero failed bookings during slot clashes</p>
        </div>

        <div className="p-4 rounded-2xl bg-closr-card border border-closr-border shadow-soft">
          <div className="flex items-center justify-between text-closr-text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Decision Latency</span>
            <Clock className="w-4 h-4 text-closr-forest" />
          </div>
          <div className="text-2xl font-serif font-bold text-closr-forest">640ms</div>
          <p className="text-[11px] text-closr-text-muted mt-1">vs 4.2h average clinic desk callback</p>
        </div>

        <div className="p-4 rounded-2xl bg-closr-card border border-closr-border shadow-soft">
          <div className="flex items-center justify-between text-closr-text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Safety Interceptions</span>
            <ShieldAlert className="w-4 h-4 text-closr-danger" />
          </div>
          <div className="text-2xl font-serif font-bold text-closr-danger">1 Active</div>
          <p className="text-[11px] text-closr-text-muted mt-1">Immediate chest pain emergency triage (ESC-310)</p>
        </div>
      </div>

      {/* 3. Three Verifiable Proof Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-left">
        {decisionProofs.map((proof) => (
          <div
            key={proof.id}
            className="p-5 rounded-2xl bg-closr-card border border-closr-border shadow-soft flex flex-col justify-between space-y-4 hover:border-closr-forest/30 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant={proof.badgeVariant} size="sm">
                  {proof.badge}
                </Badge>
                <span className="text-[11px] font-mono font-semibold text-closr-forest bg-closr-sage/40 px-2 py-0.5 rounded border border-closr-border">
                  {proof.metric}
                </span>
              </div>

              <div>
                <h4 className="font-serif font-bold text-sm text-closr-text flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-closr-sage/30 flex items-center justify-center shrink-0">
                    {proof.icon}
                  </span>
                  <span>{proof.title}</span>
                </h4>
                <p className="text-[11px] font-medium text-closr-amber mt-1 bg-closr-amber-bg px-2 py-1 rounded border border-closr-amber/20">
                  <strong>Trigger:</strong> {proof.trigger}
                </p>
              </div>

              <p className="text-xs text-closr-text leading-relaxed">
                {proof.decision}
              </p>
            </div>

            <div className="pt-3 border-t border-closr-border flex items-center justify-between text-[11px]">
              <span className="text-closr-text-muted">
                Patient: <strong className="text-closr-text">{proof.patient}</strong>
              </span>
              <span className="font-semibold text-closr-forest">{proof.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
