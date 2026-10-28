import { appointmentService } from './appointmentService';
import { notificationService } from './notificationService';

/**
 * Service to orchestrate the OPERA AI / Closr "BREAK IT MODE" Failure & Recovery Lab.
 * Manages simulation steps, timing, and integration with real local data stores.
 */

export const SCENARIO_TYPES = {
  SLOT_DISAPPEARS: 'SLOT_DISAPPEARS',
  BACKEND_FAILURE: 'BACKEND_FAILURE',
  BOOKING_CONFLICT: 'BOOKING_CONFLICT',
};

export const breakItService = {
  /**
   * Scenario A: Slot Disappears
   * Simulates an appointment slot becoming unavailable while a booking is in progress.
   */
  async runSlotDisappears(onEventUpdate) {
    const runId = `OP-SLOT-${Date.now().toString().slice(-4)}`;
    const now = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });

    // Step 1: Request Received
    onEventUpdate({
      id: `${runId}-1`,
      timestamp: now(),
      name: 'Request Received',
      explanation: 'Patient requested consultation with Dr. Sharma for Friday 5:30 PM slot.',
      status: 'Succeeded',
      recordId: runId,
    });
    await new Promise((r) => setTimeout(r, 650));

    // Step 2: Availability Checked
    onEventUpdate({
      id: `${runId}-2`,
      timestamp: now(),
      name: 'Availability Checked',
      explanation: 'Calendar lock initiated for 5:30 PM. Checking live clinic schedule...',
      status: 'Running',
      recordId: 'SLOT-530',
    });
    await new Promise((r) => setTimeout(r, 700));

    // Step 3: Failure Detected (Slot snatched by walk-in or phone desk)
    onEventUpdate({
      id: `${runId}-3`,
      timestamp: now(),
      name: 'Failure Detected: Slot Disappeared',
      explanation: 'Conflict detected: 5:30 PM slot was simultaneously booked by offline clinic reception.',
      status: 'Failed',
      recordId: 'ERR-CONFLICT-409',
    });
    await new Promise((r) => setTimeout(r, 750));

    // Step 4: Recovery Attempted (AI fallback engine)
    onEventUpdate({
      id: `${runId}-4`,
      timestamp: now(),
      name: 'Recovery Engine Engaged',
      explanation: 'AI Receptionist detected collision. Scanning adjacent doctor schedule for nearest open slot.',
      status: 'Running',
      recordId: 'REC-FALLBACK-AUTO',
    });
    await new Promise((r) => setTimeout(r, 650));

    // Step 5: Alternative Offered
    onEventUpdate({
      id: `${runId}-5`,
      timestamp: now(),
      name: 'Alternative Slot Offered',
      explanation: 'AI proposed next open consultation slot: Friday 6:15 PM with Dr. Sharma.',
      status: 'Simulated',
      recordId: 'OFFER-615',
    });
    await new Promise((r) => setTimeout(r, 700));

    // Step 6: Patient Confirmation
    onEventUpdate({
      id: `${runId}-6`,
      timestamp: now(),
      name: 'Patient Confirmation Received',
      explanation: 'Patient accepted proposed alternative slot (6:15 PM). Proceeding with verified reservation.',
      status: 'Succeeded',
      recordId: 'ACK-615',
    });
    await new Promise((r) => setTimeout(r, 700));

    // Step 7: Verified Final Outcome in Appointment Service
    const realAppointment = await appointmentService.createAppointment({
      patientId: 'pat-3',
      patientName: 'Rohit V.',
      doctorName: 'Dr. Sharma',
      date: '2026-10-30',
      time: '6:15 PM',
      service: 'Fever Consultation (Failover Re-route)',
      status: 'confirmed',
      reminderStatus: 'scheduled',
      notes: 'Recovered via BREAK IT Lab: original 5:30 PM conflict resolved to 6:15 PM',
    });

    onEventUpdate({
      id: `${runId}-7`,
      timestamp: now(),
      name: 'Verified Final Outcome',
      explanation: `Booking successfully secured and synchronized to clinic calendar. Booking ID: ${realAppointment.bookingCode}.`,
      status: 'Succeeded',
      recordId: realAppointment.bookingCode,
    });

    return {
      scenario: SCENARIO_TYPES.SLOT_DISAPPEARS,
      status: 'VERIFIED_RECOVERED',
      bookingId: realAppointment.bookingCode,
      selectedSlot: '6:15 PM (Alternative to 5:30 PM)',
      finalStatus: 'Confirmed',
      recoveryOutcome: 'Autonomous Slot Failover Succeeded',
      record: realAppointment,
    };
  },

  /**
   * Scenario B: Backend Failure
   * Simulates a booking operation failing, with retry exhaustion and automatic staff escalation.
   */
  async runBackendFailure(onEventUpdate) {
    const runId = `OP-BACKEND-${Date.now().toString().slice(-4)}`;
    const now = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });

    // Step 1: Operation Started
    onEventUpdate({
      id: `${runId}-1`,
      timestamp: now(),
      name: 'Booking Transaction Initiated',
      explanation: 'Attempting to commit transaction for patient Anita M. at 4:30 PM.',
      status: 'Running',
      recordId: runId,
    });
    await new Promise((r) => setTimeout(r, 650));

    // Step 2: Backend Failure Detected (503 Service Unavailable / Timeout)
    onEventUpdate({
      id: `${runId}-2`,
      timestamp: now(),
      name: 'Backend Failure Detected',
      explanation: 'HTTP 503 Gateway Timeout: Clinic EHR API failed to respond within 3000ms threshold.',
      status: 'Failed',
      recordId: 'ERR-NET-TIMEOUT',
    });
    await new Promise((r) => setTimeout(r, 750));

    // Step 3: Retry Policy Executed (Attempt 1 of 2)
    onEventUpdate({
      id: `${runId}-3`,
      timestamp: now(),
      name: 'Exponential Backoff Retry (1/2)',
      explanation: 'Executing retry policy. Re-verifying database connection pool...',
      status: 'Running',
      recordId: 'RETRY-1',
    });
    await new Promise((r) => setTimeout(r, 700));

    // Step 4: Retry Exhausted
    onEventUpdate({
      id: `${runId}-4`,
      timestamp: now(),
      name: 'Retry Exhausted: Secondary Error',
      explanation: 'Transaction rollback triggered. Database replica write lock unavailable.',
      status: 'Failed',
      recordId: 'ERR-ROLLBACK-FAIL',
    });
    await new Promise((r) => setTimeout(r, 700));

    // Step 5: Safe Recovery Fallback (Human Triage Escalation)
    const escId = `ESC-${Math.floor(320 + Math.random() * 50)}`;
    const notif = await notificationService.addNotification({
      category: 'escalations',
      priority: 'urgent',
      title: `Backend Booking Failure (${escId})`,
      description: `EHR database timed out for Anita M. Triage desk alerted for manual offline telephone confirmation.`,
      relatedPatientId: 'pat-1',
      relatedPatientName: 'Anita M.',
      relatedEscalationId: escId,
      destinationRoute: '/notifications',
      destinationLabel: 'View Alert',
      actionRequired: true,
    });

    onEventUpdate({
      id: `${runId}-5`,
      timestamp: now(),
      name: 'Staff Triage Escalation Logged',
      explanation: `AI safely halted automated booking and dispatched priority notification to human triage desk. Esc Ref: ${escId}.`,
      status: 'Succeeded',
      recordId: escId,
    });
    await new Promise((r) => setTimeout(r, 650));

    // Step 6: Verified Final Outcome
    onEventUpdate({
      id: `${runId}-6`,
      timestamp: now(),
      name: 'Verified Final Outcome: Graceful Degradation',
      explanation: 'Automated booking aborted safely with zero data corruption. Incident logged to clinic alert feed.',
      status: 'Failed',
      recordId: escId,
    });

    return {
      scenario: SCENARIO_TYPES.BACKEND_FAILURE,
      status: 'GRACEFUL_DEGRADATION',
      bookingId: null, // Honest: no booking created because backend failed!
      selectedSlot: '4:30 PM (Aborted)',
      finalStatus: 'Escalated to Staff Desk',
      recoveryOutcome: `Human Triage Alert Dispatched (${escId})`,
      record: notif,
    };
  },

  /**
   * Scenario C: Booking Conflict (Race Condition)
   * Simulates two requests competing for the same appointment slot.
   */
  async runBookingConflict(onEventUpdate) {
    const runId = `OP-RACE-${Date.now().toString().slice(-4)}`;
    const now = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });

    // Step 1: Request A & B Received Concurrently
    onEventUpdate({
      id: `${runId}-1`,
      timestamp: now(),
      name: 'Concurrent Requests Detected',
      explanation: 'Request A (Rohit V.) and Request B (Imran S.) both submitted booking for 5:00 PM slot within 12ms.',
      status: 'Running',
      recordId: runId,
    });
    await new Promise((r) => setTimeout(r, 700));

    // Step 2: Concurrency Lock Enforced
    onEventUpdate({
      id: `${runId}-2`,
      timestamp: now(),
      name: 'Distributed Concurrency Lock',
      explanation: 'Acquiring optimistic mutex on resource: DOCTOR_SHARMA_20261029_1700. First timestamp wins lock.',
      status: 'Running',
      recordId: 'MUTEX-LOCK-500',
    });
    await new Promise((r) => setTimeout(r, 750));

    // Step 3: Request A Awarded Slot
    const winningApt = await appointmentService.createAppointment({
      patientId: 'pat-3',
      patientName: 'Rohit V.',
      doctorName: 'Dr. Sharma',
      date: '2026-10-29',
      time: '5:00 PM',
      service: 'General Consultation (Race Winner)',
      status: 'confirmed',
      reminderStatus: 'scheduled',
      notes: 'Concurrency Lock Winner (12ms priority) in BREAK IT Lab',
    });

    onEventUpdate({
      id: `${runId}-3`,
      timestamp: now(),
      name: 'Request A Confirmed (Winner)',
      explanation: `Request A won mutex lock. Appointment confirmed for Rohit V. with Booking ID: ${winningApt.bookingCode}.`,
      status: 'Succeeded',
      recordId: winningApt.bookingCode,
    });
    await new Promise((r) => setTimeout(r, 700));

    // Step 4: Request B Safely Repelled & Re-routed
    onEventUpdate({
      id: `${runId}-4`,
      timestamp: now(),
      name: 'Request B Gracefully Handled',
      explanation: 'Request B (Imran S.) detected lock conflict. Double-booking prevented. Priority waitlist token generated.',
      status: 'Running',
      recordId: 'TOKEN-WAITLIST-42',
    });
    await new Promise((r) => setTimeout(r, 700));

    // Step 5: Auto Waitlist Notification for Request B
    await notificationService.addNotification({
      category: 'conversations',
      priority: 'normal',
      title: 'Waitlist Priority Reserved (Imran S.)',
      description: 'Concurrency conflict for 5:00 PM resolved. Imran S. granted 1st position on standby waitlist.',
      relatedPatientId: 'pat-2',
      relatedPatientName: 'Imran S.',
      destinationRoute: '/messages',
      destinationLabel: 'View Thread',
      actionRequired: false,
    });

    onEventUpdate({
      id: `${runId}-5`,
      timestamp: now(),
      name: 'Priority Waitlist Offer Dispatched',
      explanation: 'Alternative notification sent to Imran S. offering immediate standby on next available cancellation.',
      status: 'Simulated',
      recordId: 'NOTIF-WAITLIST',
    });
    await new Promise((r) => setTimeout(r, 650));

    // Step 6: Verified Final Outcome
    onEventUpdate({
      id: `${runId}-6`,
      timestamp: now(),
      name: 'Verified Final Outcome: Zero Double-Bookings',
      explanation: `Conflict cleanly resolved: 1 verified booking created (${winningApt.bookingCode}), 1 patient safely waitlisted without schedule corruption.`,
      status: 'Succeeded',
      recordId: winningApt.bookingCode,
    });

    return {
      scenario: SCENARIO_TYPES.BOOKING_CONFLICT,
      status: 'MUTEX_RESOLVED',
      bookingId: winningApt.bookingCode,
      selectedSlot: '5:00 PM',
      finalStatus: '1 Confirmed / 1 Waitlisted',
      recoveryOutcome: 'Double-Booking Prevented via Mutex',
      record: winningApt,
    };
  },
};
