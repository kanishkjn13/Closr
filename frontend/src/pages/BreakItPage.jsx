import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Trash2, 
  Zap, 
  Cpu, 
  Users, 
  ServerCrash, 
  Calendar, 
  ArrowRight,
  Info,
  Check,
  ChevronRight
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { breakItService, SCENARIO_TYPES } from '../services/breakItService';
import { cn } from '../lib/utils';

export const BreakItPage = () => {
  const { onOpenMobileMenu } = useOutletContext();
  const toast = useToast();

  const [activeScenario, setActiveScenario] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [proofOfAction, setProofOfAction] = useState(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Trigger Scenario Handler
  const handleTriggerScenario = async (type) => {
    if (isRunning) return;

    setIsRunning(true);
    setActiveScenario(type);
    setTimelineEvents([]);
    setProofOfAction(null);

    const appendEvent = (ev) => {
      setTimelineEvents((prev) => {
        const existingIdx = prev.findIndex((e) => e.id === ev.id);
        if (existingIdx !== -1) {
          const next = [...prev];
          next[existingIdx] = ev;
          return next;
        }
        return [...prev, ev];
      });
    };

    try {
      let outcome;
      if (type === SCENARIO_TYPES.SLOT_DISAPPEARS) {
        toast.info('Stress Test Started', 'Simulating disappearing slot conflict...');
        outcome = await breakItService.runSlotDisappears(appendEvent);
      } else if (type === SCENARIO_TYPES.BACKEND_FAILURE) {
        toast.info('Stress Test Started', 'Simulating backend 503 timeout failure...');
        outcome = await breakItService.runBackendFailure(appendEvent);
      } else if (type === SCENARIO_TYPES.BOOKING_CONFLICT) {
        toast.info('Stress Test Started', 'Simulating concurrent booking conflict race condition...');
        outcome = await breakItService.runBookingConflict(appendEvent);
      }

      setProofOfAction(outcome);
      toast.success('Simulation Completed', `${outcome.recoveryOutcome}`);
    } catch (err) {
      toast.error('Simulation Interrupted', err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleClearTimeline = () => {
    setTimelineEvents([]);
    setProofOfAction(null);
    setActiveScenario(null);
    toast.info('Timeline Cleared', 'Execution history has been reset.');
  };

  const handleConfirmReset = () => {
    setIsResetModalOpen(false);
    handleClearTimeline();
    toast.success('Demo Reset', 'All failure test states have been reset to factory defaults.');
  };

  return (
    <div className="w-full max-w-[1360px] mx-auto space-y-6 text-closr-text text-left pb-12 animate-in fade-in duration-200">
      
      {/* 1. Header with Control Room Metadata */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
        <PageHeader
          title="BREAK IT MODE — AI Failure & Recovery Lab"
          subtitle="Stress-test the AI receptionist and observe how it autonomously handles failures in real time."
          onOpenMobileMenu={onOpenMobileMenu}
        />

        {/* Global Controls & Status Pill */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-closr-card border border-closr-border text-xs font-semibold shadow-2xs">
            <span className={cn('w-2 h-2 rounded-full', isRunning ? 'bg-closr-amber animate-ping' : 'bg-closr-forest')} />
            <span className="text-closr-text">
              {isRunning ? 'Stress Test Running...' : activeScenario ? 'Scenario Completed' : 'System Idle'}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Trash2 className="w-3.5 h-3.5 text-closr-text-muted" />}
            onClick={handleClearTimeline}
            disabled={isRunning || timelineEvents.length === 0}
          >
            Clear Timeline
          </Button>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={() => setIsResetModalOpen(true)}
            disabled={isRunning}
          >
            Reset Demo
          </Button>
        </div>
      </div>

      {/* 2. Top Banner: Environment & Safety Rules */}
      <div className="p-4 sm:p-5 rounded-2xl bg-closr-card border border-closr-border shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-closr-amber-bg text-closr-amber flex items-center justify-center shrink-0 border border-closr-amber/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-sm text-closr-text">
                Live Operations Failure Simulation
              </h3>
              <span className="text-[10px] font-bold text-closr-amber bg-closr-amber-bg px-2 py-0.5 rounded border border-closr-amber/30 uppercase tracking-wider">
                Simulated Demo Tests
              </span>
            </div>
            <p className="text-xs text-closr-text-muted mt-1 leading-relaxed">
              Inject intentional runtime faults into the booking flow to inspect race condition handling, graceful degradation, and autonomous failover without risking real clinical schedules.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs shrink-0 bg-closr-bg px-3.5 py-2 rounded-xl border border-closr-border">
          <span className="text-closr-text-muted">Target Service:</span>
          <span className="font-semibold text-closr-forest">Dr. Sharma EHR / AI Receptionist</span>
        </div>
      </div>

      {/* 3. Three Scenario Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Scenario A: Slot Disappears */}
        <div
          className={cn(
            'bg-closr-card rounded-3xl p-5 sm:p-6 border shadow-soft flex flex-col justify-between transition-all space-y-4 text-left',
            activeScenario === SCENARIO_TYPES.SLOT_DISAPPEARS
              ? 'border-closr-forest ring-2 ring-closr-forest/20'
              : 'border-closr-border hover:border-closr-border-dark'
          )}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-closr-sage/60 text-closr-forest flex items-center justify-center font-bold text-xs">
                A
              </div>
              <span className="text-[10px] font-semibold text-closr-text-muted bg-closr-bg px-2 py-0.5 rounded border border-closr-border">
                Collision Test
              </span>
            </div>

            <div>
              <h3 className="font-serif font-bold text-base text-closr-text">
                Scenario A — Slot Disappears
              </h3>
              <p className="text-xs text-closr-text-muted mt-1 leading-relaxed">
                Simulate an appointment slot becoming unavailable while a patient booking is actively in progress.
              </p>
            </div>

            {/* Checklist of what is tested */}
            <div className="space-y-1.5 pt-2 border-t border-closr-border/60 text-[11px] text-closr-text-muted">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-closr-forest" />
                <span>Selected Slot: 5:30 PM consultation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-closr-amber" />
                <span>Offline walk-in snatches 5:30 PM slot</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-closr-forest" />
                <span>AI autonomously offers 6:15 PM alternative</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-closr-success" />
                <span>Verified booking confirmed in appointmentService</span>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            className="w-full justify-center mt-2"
            disabled={isRunning}
            onClick={() => handleTriggerScenario(SCENARIO_TYPES.SLOT_DISAPPEARS)}
            isLoading={isRunning && activeScenario === SCENARIO_TYPES.SLOT_DISAPPEARS}
          >
            Trigger Slot Conflict
          </Button>
        </div>

        {/* Scenario B: Backend Failure */}
        <div
          className={cn(
            'bg-closr-card rounded-3xl p-5 sm:p-6 border shadow-soft flex flex-col justify-between transition-all space-y-4 text-left',
            activeScenario === SCENARIO_TYPES.BACKEND_FAILURE
              ? 'border-closr-danger ring-2 ring-closr-danger/20'
              : 'border-closr-border hover:border-closr-border-dark'
          )}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-closr-danger-bg text-closr-danger flex items-center justify-center font-bold text-xs">
                B
              </div>
              <span className="text-[10px] font-semibold text-closr-danger bg-closr-danger-bg px-2 py-0.5 rounded border border-closr-danger/20">
                Resilience Test
              </span>
            </div>

            <div>
              <h3 className="font-serif font-bold text-base text-closr-text">
                Scenario B — Backend Failure
              </h3>
              <p className="text-xs text-closr-text-muted mt-1 leading-relaxed">
                Simulate a booking transaction failing due to database timeout and inspect graceful staff escalation.
              </p>
            </div>

            {/* Checklist of what is tested */}
            <div className="space-y-1.5 pt-2 border-t border-closr-border/60 text-[11px] text-closr-text-muted">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-closr-forest" />
                <span>Operation started for Anita M. (4:30 PM)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-closr-danger" />
                <span>HTTP 503 timeout detected (3000ms limit)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-closr-amber" />
                <span>Retry backoff attempts exhausted</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-closr-danger" />
                <span>Honest abort: zero fake ID, dispatched to human triage</span>
              </div>
            </div>
          </div>

          <Button
            variant="danger"
            size="md"
            className="w-full justify-center mt-2"
            disabled={isRunning}
            onClick={() => handleTriggerScenario(SCENARIO_TYPES.BACKEND_FAILURE)}
            isLoading={isRunning && activeScenario === SCENARIO_TYPES.BACKEND_FAILURE}
          >
            Trigger Backend Failure
          </Button>
        </div>

        {/* Scenario C: Booking Conflict */}
        <div
          className={cn(
            'bg-closr-card rounded-3xl p-5 sm:p-6 border shadow-soft flex flex-col justify-between transition-all space-y-4 text-left',
            activeScenario === SCENARIO_TYPES.BOOKING_CONFLICT
              ? 'border-closr-amber ring-2 ring-closr-amber/20'
              : 'border-closr-border hover:border-closr-border-dark'
          )}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-closr-amber-badge text-closr-amber flex items-center justify-center font-bold text-xs">
                C
              </div>
              <span className="text-[10px] font-semibold text-closr-amber bg-closr-amber-bg px-2 py-0.5 rounded border border-closr-amber/30">
                Concurrency Test
              </span>
            </div>

            <div>
              <h3 className="font-serif font-bold text-base text-closr-text">
                Scenario C — Booking Conflict
              </h3>
              <p className="text-xs text-closr-text-muted mt-1 leading-relaxed">
                Simulate two concurrent patient requests competing for the same 5:00 PM slot within 12ms.
              </p>
            </div>

            {/* Checklist of what is tested */}
            <div className="space-y-1.5 pt-2 border-t border-closr-border/60 text-[11px] text-closr-text-muted">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-closr-forest" />
                <span>Request A (Rohit V.) vs Request B (Imran S.)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-closr-forest" />
                <span>Distributed Mutex awarded to Request A</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-closr-amber" />
                <span>Request B double-booking safely repelled</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-closr-success" />
                <span>Imran S. auto-enrolled into Priority Waitlist</span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="md"
            className="w-full justify-center mt-2 border-closr-amber/50 text-closr-text hover:bg-closr-amber-bg"
            disabled={isRunning}
            onClick={() => handleTriggerScenario(SCENARIO_TYPES.BOOKING_CONFLICT)}
            isLoading={isRunning && activeScenario === SCENARIO_TYPES.BOOKING_CONFLICT}
          >
            Trigger Booking Conflict
          </Button>
        </div>
      </div>

      {/* 4. Proof-of-Action Panel (Verified Local Outcome) */}
      {proofOfAction && (
        <div className="bg-closr-card rounded-3xl p-6 border border-closr-forest/30 shadow-soft space-y-4 text-left animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-closr-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-closr-forest text-white flex items-center justify-center font-bold text-xs">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-closr-text">
                  Proof-of-Action Verification
                </h4>
                <p className="text-xs text-closr-text-muted">
                  Actual execution state captured from the shared clinic services layer.
                </p>
              </div>
            </div>

            <Badge
              variant={
                proofOfAction.status === 'VERIFIED_RECOVERED'
                  ? 'confirmed'
                  : proofOfAction.status === 'MUTEX_RESOLVED'
                  ? 'amber'
                  : 'danger'
              }
            >
              {proofOfAction.status}
            </Badge>
          </div>

          {/* Proof Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-closr-bg border border-closr-border space-y-1">
              <span className="text-[10px] text-closr-text-muted uppercase tracking-wider block">
                Booking ID (Real Store)
              </span>
              <p className="font-mono font-bold text-sm text-closr-forest">
                {proofOfAction.bookingId || 'None (Safely Aborted)'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-closr-bg border border-closr-border space-y-1">
              <span className="text-[10px] text-closr-text-muted uppercase tracking-wider block">
                Selected / Resolved Slot
              </span>
              <p className="font-semibold text-sm text-closr-text">
                {proofOfAction.selectedSlot}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-closr-bg border border-closr-border space-y-1">
              <span className="text-[10px] text-closr-text-muted uppercase tracking-wider block">
                Final Booking Status
              </span>
              <p className="font-semibold text-sm text-closr-text">
                {proofOfAction.finalStatus}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-closr-bg border border-closr-border space-y-1">
              <span className="text-[10px] text-closr-text-muted uppercase tracking-wider block">
                Recovery Engine Result
              </span>
              <p className="font-semibold text-sm text-closr-text truncate">
                {proofOfAction.recoveryOutcome}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F0EFEB] border border-closr-border/80 text-[11px] text-closr-text-muted flex items-start gap-2">
            <Info className="w-4 h-4 text-closr-forest shrink-0 mt-0.5" />
            <span>
              <strong>Integrity Verification:</strong> In Scenario A &amp; C, a verified booking record was persisted into <code className="font-mono text-closr-forest">appointmentService</code> and appears immediately on the Appointments page. In Scenario B, zero fake IDs were emitted; a genuine triage alert was logged to <code className="font-mono text-closr-forest">notificationService</code>.
            </span>
          </div>
        </div>
      )}

      {/* 5. Live Execution Timeline */}
      <div className="bg-closr-card rounded-3xl p-6 sm:p-7 border border-closr-border shadow-soft space-y-5 text-left">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-closr-border">
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-closr-forest" />
            <h3 className="font-serif font-bold text-base sm:text-lg text-closr-text">
              Live Execution Timeline
            </h3>
          </div>

          {timelineEvents.length > 0 && (
            <span className="text-xs text-closr-text-muted">
              {timelineEvents.length} events logged in sequence
            </span>
          )}
        </div>

        {/* Timeline Items */}
        {timelineEvents.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-3 bg-closr-bg/50 rounded-2xl border border-dashed border-closr-border">
            <div className="w-12 h-12 rounded-full bg-closr-sage/50 text-closr-forest flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-base text-closr-text">
                No active stress scenario
              </h4>
              <p className="text-xs text-closr-text-muted max-w-sm mx-auto">
                Trigger any of the three failure scenarios above to watch the AI recovery engine execute step-by-step in real time.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-closr-border">
            {timelineEvents.map((ev, index) => {
              const isSuccess = ev.status === 'Succeeded';
              const isFailed = ev.status === 'Failed';
              const isRunningStep = ev.status === 'Running';

              return (
                <div key={ev.id} className="relative group animate-in fade-in slide-in-from-left-2 duration-150">
                  {/* Timeline Node Dot */}
                  <div
                    className={cn(
                      'absolute -left-6 sm:-left-8 top-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shadow-xs',
                      isSuccess
                        ? 'bg-closr-success text-white border-white'
                        : isFailed
                        ? 'bg-closr-danger text-white border-white'
                        : isRunningStep
                        ? 'bg-closr-amber text-white border-white animate-pulse'
                        : 'bg-closr-sage text-closr-forest border-white'
                    )}
                  >
                    {isSuccess ? '✓' : isFailed ? '✕' : index + 1}
                  </div>

                  {/* Event Content Box */}
                  <div className="p-4 rounded-2xl bg-closr-bg/70 border border-closr-border hover:border-closr-border-dark transition-all space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-closr-text">
                          {ev.name}
                        </span>
                        {ev.recordId && (
                          <span className="font-mono text-[10px] font-semibold text-closr-forest bg-white px-1.5 py-0.5 rounded border border-closr-border">
                            {ev.recordId}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            isSuccess
                              ? 'confirmed'
                              : isFailed
                              ? 'danger'
                              : isRunningStep
                              ? 'amber'
                              : 'default'
                          }
                          size="sm"
                        >
                          {ev.status}
                        </Badge>
                        <span className="text-[11px] font-mono text-closr-text-muted">
                          {ev.timestamp}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-closr-text-muted leading-relaxed">
                      {ev.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Reset Demo Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset BREAK IT Lab?"
        description="Are you sure you want to reset all active stress scenarios, timeline events, and test states?"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsResetModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmReset}>
              Reset Demo
            </Button>
          </>
        }
      >
        <div className="p-3.5 rounded-xl bg-closr-bg border border-closr-border text-xs text-closr-text-muted space-y-1 text-left">
          <p className="font-semibold text-closr-text flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-closr-amber shrink-0" />
            Hackathon Presentation Notice
          </p>
          <p>
            Resetting clears the execution timeline and outcome cards so judges can observe a clean run from the beginning.
          </p>
        </div>
      </Modal>
    </div>
  );
};
