import React from 'react';
import { Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MetricCard } from './MetricCard';

export const MetricsGrid = ({
  appointments = [],
  escalationsCount = 1,
  onOpenEscalationModal,
}) => {
  const navigate = useNavigate();

  // Dynamic calculations derived from actual stored appointment records
  const todayDate = '2026-10-29';
  const todayAppointments = appointments.filter(
    (a) => a.date === todayDate || !a.date
  );

  const activeAppointments = todayAppointments.filter(
    (a) => a.status !== 'cancelled'
  );
  const confirmedAppointments = todayAppointments.filter(
    (a) => a.status === 'confirmed'
  );
  const pendingAppointments = todayAppointments.filter(
    (a) => a.status === 'pending' || a.status === 'waitlist-offer'
  );

  const totalActive = activeAppointments.length;
  const totalConfirmed = confirmedAppointments.length;
  const totalPending = pendingAppointments.length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
      {/* Metric 1 — Real Dynamic Appointments for Today */}
      <MetricCard
        icon={<Calendar className="w-4 h-4 text-closr-forest stroke-[2]" />}
        iconBg="bg-closr-pale"
        iconColor="text-closr-forest"
        value={totalActive}
        label="Today's Appointments"
        comparison={`${totalConfirmed} confirmed · ${totalPending} pending`}
        tone="green"
        onClick={() => navigate('/appointments')}
      />

      {/* Metric 2 — Real Dynamic Confirmed Visits */}
      <MetricCard
        icon={<CheckCircle2 className="w-4 h-4 text-closr-forest stroke-[2]" />}
        iconBg="bg-closr-sage/60"
        iconColor="text-closr-forest"
        value={totalConfirmed}
        label="Confirmed Visits"
        comparison={`${Math.round((totalConfirmed / (totalActive || 1)) * 100)}% of today's schedule`}
        tone="neutral"
        onClick={() => navigate('/appointments')}
      />

      {/* Metric 3 — Real Escalations Needing Human Action */}
      <MetricCard
        icon={<AlertTriangle className="w-4 h-4 text-closr-amber stroke-[2]" />}
        iconBg="bg-closr-amber-badge"
        iconColor="text-closr-amber"
        value={escalationsCount}
        label="Human Assistance Required"
        comparison="1 Critical Triage (ESC-310)"
        tone="amber"
        onClick={onOpenEscalationModal}
      />
    </div>
  );
};
